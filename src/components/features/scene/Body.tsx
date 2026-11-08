import { Suspense, useEffect, useMemo, useState } from 'react';
import { useAtlas } from '@/hooks/useAtlas';
import { type ModelFile, useBodyModel } from '@/hooks/useBodyModel';
import { useHeartbeatAnimation } from '@/hooks/useHeartbeatAnimation';
import { useUnitPicking } from '@/hooks/useUnitPicking';
import { useUnitVisibility } from '@/hooks/useUnitVisibility';
import type { LazyModelLayer, ModelLayer } from '@/models/scene';
import { LAZY_MODEL_LAYERS, needsModelLayer } from '@/utils/atlasReducer';
import { dimmedMaterial, fullMaterial, PICKING_LAYER, skinMaterial } from '@/utils/sceneMaterials';
import { LazyLayer } from './LazyLayer';

/** Strato del modello di ogni file: gli organi femminili si mostrano con gli altri organi. */
const LAYER_OF_FILE: Record<Exclude<ModelFile, 'pelle'>, ModelLayer> = {
  ossa: 'ossa',
  muscoli: 'muscoli',
  organi: 'organi',
  'organi-donna': 'organi',
};

/** Il corpo 3D: carica i modelli e disegna gli strati. */
export function Body({ onLazyLayerLoaded }: { onLazyLayerLoaded: (layer: LazyModelLayer) => void }) {
  const { state } = useAtlas();
  const { units, byId, byIndex, geometries } = useBodyModel();
  const materials = useMemo(() => ({ full: fullMaterial(), dimmed: dimmedMaterial(), skin: skinMaterial() }), []);
  const { fullLayers, dimmedLayers } = useUnitVisibility(units);
  useHeartbeatAnimation();
  useUnitPicking(byIndex);

  // Una volta scaricati, vasi e nervi restano: tornare allo strato non fa attendere.
  const [wanted, setWanted] = useState<readonly LazyModelLayer[]>([]);
  const wantedNow = LAZY_MODEL_LAYERS.find((l) => needsModelLayer(l, state.layer, state.selection));
  useEffect(() => {
    if (wantedNow) setWanted((w) => (w.includes(wantedNow) ? w : [...w, wantedNow]));
  }, [wantedNow]);

  const skin = geometries.pelle;
  return (
    <group>
      {(['ossa', 'muscoli', 'organi', 'organi-donna'] as const).map((f) => {
        const g = geometries[f];
        if (!g) return null;
        return (
          <group key={f} visible={f !== 'organi-donna' || state.body === 'donna'}>
            <mesh
              geometry={g}
              material={materials.full}
              visible={fullLayers.has(LAYER_OF_FILE[f])}
              onUpdate={(m) => m.layers.enable(PICKING_LAYER)}
            />
            <mesh
              geometry={g}
              material={materials.dimmed}
              renderOrder={2}
              visible={dimmedLayers.has(LAYER_OF_FILE[f])}
            />
          </group>
        );
      })}
      {LAZY_MODEL_LAYERS.filter((l) => wanted.includes(l)).map((l) => (
        <Suspense key={l} fallback={null}>
          <LazyLayer
            layer={l}
            elements={byId}
            units={units}
            materials={materials}
            showFull={fullLayers.has(l)}
            showDimmed={dimmedLayers.has(l)}
            onLoaded={onLazyLayerLoaded}
          />
        </Suspense>
      ))}
      {/* La pelle del modello è maschile: nel corpo femminile la sagoma non si mostra (D29). */}
      {skin && (
        <mesh geometry={skin} material={materials.skin} renderOrder={3} visible={state.skin && state.body === 'uomo'} />
      )}
    </group>
  );
}
