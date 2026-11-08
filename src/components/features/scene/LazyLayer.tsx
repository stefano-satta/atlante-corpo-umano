import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import type * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { configureLoader } from '@/hooks/useBodyModel';
import type { LazyModelLayer, ModelElement, SceneUnit } from '@/models/scene';
import { modelUrl } from '@/utils/layout';
import { PICKING_LAYER } from '@/utils/sceneMaterials';
import { prepareLayer } from '@/utils/sceneModel';

interface LazyLayerProps {
  layer: LazyModelLayer;
  elements: Map<string, ModelElement>;
  units: Map<string, SceneUnit>;
  materials: { full: THREE.Material; dimmed: THREE.Material };
  showFull: boolean;
  showDimmed: boolean;
  onLoaded: (layer: LazyModelLayer) => void;
}

/**
 * Strato dei vasi o dei nervi (`vasi.glb`, `nervi.glb`), caricato la prima volta che serve. Ingombri e
 * ancoraggi delle unità si riempiono qui.
 */
export function LazyLayer({ layer, elements, units, materials, showFull, showDimmed, onLoaded }: LazyLayerProps) {
  const gltf = useLoader(GLTFLoader, modelUrl(`${layer}.glb`), configureLoader);
  const geometry = useMemo(() => prepareLayer(gltf.scene, elements, units), [gltf, elements, units]);
  useEffect(() => onLoaded(layer), [onLoaded, layer]);
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
