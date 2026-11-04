import { Suspense, useEffect, useMemo, useState } from 'react';
import { useAtlas } from '@/hooks/useAtlas';
import { type ModelFile, useBodyModel } from '@/hooks/useBodyModel';
import { useHeartbeatAnimation } from '@/hooks/useHeartbeatAnimation';
import { useUnitPicking } from '@/hooks/useUnitPicking';
import { useUnitVisibility } from '@/hooks/useUnitVisibility';
import type { ModelLayer } from '@/models/scene';
import { needsVessels } from '@/utils/atlasReducer';
import { dimmedMaterial, fullMaterial, PICKING_LAYER, skinMaterial } from '@/utils/sceneMaterials';
import { Vessels } from './Vessels';

/** Strato del modello di ogni file: gli organi femminili si mostrano con gli altri organi. */
const LAYER_OF_FILE: Record<Exclude<ModelFile, 'pelle'>, ModelLayer> = {
  ossa: 'ossa',
  muscoli: 'muscoli',
  organi: 'organi',
  'organi-donna': 'organi',
};

/** Il corpo 3D: carica i modelli e disegna gli strati. */
export function Body({ onVesselsLoaded }: { onVesselsLoaded: () => void }) {
  const { state } = useAtlas();
  const { units, byId, byIndex, geometries } = useBodyModel();
  const materials = useMemo(() => ({ full: fullMaterial(), dimmed: dimmedMaterial(), skin: skinMaterial() }), []);
  const { fullLayers, dimmedLayers } = useUnitVisibility(units);
  useHeartbeatAnimation();
  useUnitPicking(byIndex);

  // Una volta scaricati, i vasi restano: tornare allo strato non fa attendere.
  const [vesselsWanted, setVesselsWanted] = useState(false);
  const wantsVessels = needsVessels(state.layer, state.selection);
  useEffect(() => {
    if (wantsVessels) setVesselsWanted(true);
  }, [wantsVessels]);

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
      {vesselsWanted && (
        <Suspense fallback={null}>
          <Vessels
            elements={byId}
            units={units}
            materials={materials}
            showFull={fullLayers.has('vasi')}
            showDimmed={dimmedLayers.has('vasi')}
            onLoaded={onVesselsLoaded}
          />
        </Suspense>
      )}
      {/* La pelle del modello è maschile: nel corpo femminile la sagoma non si mostra (D29). */}
      {skin && (
        <mesh geometry={skin} material={materials.skin} renderOrder={3} visible={state.skin && state.body === 'uomo'} />
      )}
    </group>
  );
}
