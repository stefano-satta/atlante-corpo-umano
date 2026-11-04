import { useEffect, useMemo } from 'react';
import type { ModelLayer, SceneUnit } from '@/models/scene';
import { GHOST_MODEL_LAYERS, LAYER_OF_MODEL_LAYER, VISIBLE_MODEL_LAYERS, VISIBLE_UNITS } from '@/utils/atlasReducer';
import { bodyUniforms, setUnitStates } from '@/utils/sceneMaterials';
import { UNIT_DIMMED, UNIT_FULL, UNIT_GHOST, unitStates, unitsForElements } from '@/utils/sceneModel';
import { useActiveStep } from './useActiveStep';
import { useAtlas } from './useAtlas';

/** Come appare ogni unità nello stato attuale: aggiorna gli shader e dice quali passate disegnare per strato. */
export function useUnitVisibility(units: Map<string, SceneUnit>) {
  const { state, dispatch } = useAtlas();

  // Fuoco della vista: la struttura selezionata, altrimenti le strutture evidenziate dal passo
  // di percorso in corso (D24), che possono stare anche in uno strato nascosto.
  const selected = state.selection ? units.get(state.selection) : undefined;
  const { step } = useActiveStep();
  const highlighted = useMemo(() => new Set(step ? unitsForElements(step.evidenzia, units) : []), [step, units]);
  const visible = VISIBLE_MODEL_LAYERS[state.layer];
  const ghost = GHOST_MODEL_LAYERS[state.layer];
  const focus = useMemo(() => (selected ? new Set([selected.id]) : highlighted), [selected, highlighted]);
  const alsoVisible = VISIBLE_UNITS[state.layer];
  const states = useMemo(
    () => unitStates(units, visible, focus, ghost, state.body, alsoVisible),
    [units, visible, focus, ghost, state.body, alsoVisible],
  );

  // Per ogni strato si disegnano solo le passate che servono: quella piena se ha unità piene,
  // quella semitrasparente se ne ha di attenuate o fantasma. Il resto verrebbe solo scartato dallo shader.
  const passes = useMemo(() => {
    const fullLayers = new Set<ModelLayer>();
    const dimmedLayers = new Set<ModelLayer>();
    for (const u of units.values()) {
      const s = states[u.index];
      if (s === UNIT_FULL) fullLayers.add(u.layer);
      else if (s === UNIT_DIMMED || s === UNIT_GHOST) dimmedLayers.add(u.layer);
    }
    return { fullLayers, dimmedLayers };
  }, [units, states]);

  useEffect(() => setUnitStates(states), [states]);
  useEffect(() => {
    bodyUniforms.uHover.value = state.hover ? (units.get(state.hover)?.index ?? 0) : 0;
  }, [state.hover, units]);

  useEffect(() => {
    // Una struttura aperta da un indirizzo diretto può stare in uno strato nascosto: lo si mostra.
    // Non serve per una struttura evidenziata da un passo, che si vede già.
    if (
      selected &&
      selected.layer !== 'pelle' &&
      !visible.includes(selected.layer) &&
      !alsoVisible.includes(selected.id) &&
      !highlighted.has(selected.id)
    )
      dispatch({ type: 'revealLayer', layer: LAYER_OF_MODEL_LAYER[selected.layer] });
  }, [selected, visible, alsoVisible, highlighted, dispatch]);

  return passes;
}
