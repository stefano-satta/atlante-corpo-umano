import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { FileLoader } from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { ModelElement, SceneUnit } from '@/models/scene';
import { modelUrl } from '@/utils/layout';
import { sceneApi } from '@/utils/sceneApi';
import { bodyUniforms } from '@/utils/sceneMaterials';
import { createUnits, prepareLayer } from '@/utils/sceneModel';

// Muscoli, vasi e nervi (D55, D44, D46) non sono fra questi file: pesano più degli organi e si scaricano
// solo quando servono (`LazyLayer`). Le ossa sì, perché quasi ogni apparato le mostra in trasparenza.
// Gli organi del solo corpo femminile (D29) stanno in un file a parte, piccolo: si caricano sempre,
// così cambiare corpo non fa attendere e le loro unità hanno subito ingombro e ancoraggio.
const MODEL_FILES = ['ossa', 'organi', 'pelle', 'organi-donna'] as const;
export type ModelFile = (typeof MODEL_FILES)[number];

export const configureLoader = (loader: GLTFLoader) => {
  loader.setMeshoptDecoder(MeshoptDecoder);
};

/** Scarica i modelli e ne ricava unità, geometrie per file e centri delle camere del cuore. */
export function useBodyModel() {
  const json = useLoader(FileLoader, modelUrl('strutture.json')) as string;
  const gltf = useLoader(
    GLTFLoader,
    MODEL_FILES.map((f) => modelUrl(`${f}.glb`)),
    configureLoader,
  );

  const model = useMemo(() => {
    const elements: ModelElement[] = JSON.parse(json);
    const units = createUnits(elements);
    const byId = new Map(elements.map((e) => [e.id, e]));
    // Camere del cuore che batte: atrio sinistro, atrio destro, ventricoli (heartbeat.ts).
    const chambers = [new THREE.Box3(), new THREE.Box3(), new THREE.Box3()];
    const geometries = Object.fromEntries(
      MODEL_FILES.map((f, i) => [f, prepareLayer(gltf[i].scene, byId, units, chambers)]),
    ) as Record<ModelFile, THREE.BufferGeometry | null>;
    chambers.forEach((c, i) => {
      if (!c.isEmpty()) c.getCenter(bodyUniforms.uBeatPivots.value[i]);
    });
    const byIndex = new Map<number, SceneUnit>([...units.values()].map((u) => [u.index, u]));
    return { units, byId, byIndex, geometries };
  }, [json, gltf]);

  useEffect(() => {
    sceneApi.units = model.units;
  }, [model.units]);

  return model;
}
