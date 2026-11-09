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

  // Un file a parte si scarica quando lo strato, la selezione o una struttura evidenziata (passo di percorso,
  // domanda del quiz) mostrano una sua unità. Una volta scaricato resta: tornarci non fa attendere.
  const [wanted, setWanted] = useState<readonly LazyModelLayer[]>([]);
  const wantedNow = LAZY_MODEL_LAYERS.filter(
    (l) => fullLayers.has(l) || dimmedLayers.has(l) || needsModelLayer(l, state.layer, state.selection),
  ).join();
  useEffect(() => {
    if (!wantedNow) return;
    const now = wantedNow.split(',') as LazyModelLayer[];
    setWanted((w) => (now.every((l) => w.includes(l)) ? w : [...new Set([...w, ...now])]));
  }, [wantedNow]);

  const skin = geometries.pelle;
  return (
    <group>
      {(['ossa', 'organi', 'organi-donna'] as const).map((f) => {
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
