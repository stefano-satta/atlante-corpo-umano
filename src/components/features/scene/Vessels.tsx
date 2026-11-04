import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import type * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { configureLoader } from '@/hooks/useBodyModel';
import type { ModelElement, SceneUnit } from '@/models/scene';
import { modelUrl } from '@/utils/layout';
import { PICKING_LAYER } from '@/utils/sceneMaterials';
import { prepareLayer } from '@/utils/sceneModel';

interface VesselsProps {
  elements: Map<string, ModelElement>;
  units: Map<string, SceneUnit>;
  materials: { full: THREE.Material; dimmed: THREE.Material };
  showFull: boolean;
  showDimmed: boolean;
  onLoaded: () => void;
}

/** Strato dei vasi, caricato la prima volta che serve. Ingombri e ancoraggi delle unità si riempiono qui. */
export function Vessels({ elements, units, materials, showFull, showDimmed, onLoaded }: VesselsProps) {
  const gltf = useLoader(GLTFLoader, modelUrl('vasi.glb'), configureLoader);
  const geometry = useMemo(() => prepareLayer(gltf.scene, elements, units), [gltf, elements, units]);
  useEffect(onLoaded, [onLoaded]);
  if (!geometry) return null;
  return (
    <>
      <mesh
        geometry={geometry}
        material={materials.full}
        visible={showFull}
        onUpdate={(m) => m.layers.enable(PICKING_LAYER)}
      />
      <mesh geometry={geometry} material={materials.dimmed} renderOrder={2} visible={showDimmed} />
    </>
  );
}
