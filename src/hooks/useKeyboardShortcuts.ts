import { useEffect } from 'react';
import type { Layer } from '@/models/atlas';
import { resetView, sceneApi } from '@/utils/sceneApi';
import { closeTour } from '@/utils/tour';
import { useAtlas } from './useAtlas';
import { useReducedMotion } from './useReducedMotion';

const LAYER_KEYS: Record<string, Layer> = { '1': 'muscoli', '2': 'organi', '3': 'scheletro' };

/**
 * Comandi da tastiera (D11): frecce per ruotare, + e − per lo zoom, 1–3 per gli strati,
 * 0 per la vista iniziale, Esc per chiudere scheda o cartellino, ? per la guida.
 */
export function useKeyboardShortcuts() {
  const { state, dispatch } = useAtlas();
  const reducedMotion = useReducedMotion();
  const { sheet, page, selection, guidedPath, home, tour } = state;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof Element && e.target.closest('input, textarea')) return;
      // Con una pagina di lettura aperta i tasti servono solo a chiuderla.
      if (page) {
        if (e.key === 'Escape') dispatch({ type: 'setPage', page: null });
        return;
      }
      // Sulla soglia il corpo gira da solo: i comandi della vista arrivano dopo l'ingresso.
      if (home) return;
      if (e.key === 'Escape' && tour !== null) {
        closeTour(dispatch);
        return;
      }
      if (e.key === '?') {
        dispatch({ type: 'setTour', step: 0 });
        e.preventDefault();
        return;
      }
      const c = sceneApi.controls;
      const animated = !reducedMotion;
      switch (e.key) {
        case 'Escape':
          if (sheet) dispatch({ type: 'setSheet', open: false });
          else if (selection || !guidedPath) dispatch({ type: 'select', id: null });
          else dispatch({ type: 'setGuidedPath', guidedPath: null });
          return;
        case 'ArrowLeft':
          c?.rotate(-0.3, 0, animated);
          break;
        case 'ArrowRight':
          c?.rotate(0.3, 0, animated);
          break;
        case 'ArrowUp':
          c?.rotate(0, -0.2, animated);
          break;
        case 'ArrowDown':
          c?.rotate(0, 0.2, animated);
          break;
        case '+':
        case '=':
          c?.dolly(0.3, animated);
          break;
        case '-':
          c?.dolly(-0.3, animated);
          break;
        case '0':
          dispatch({ type: 'select', id: null });
          resetView(animated);
          break;
        default:
          if (LAYER_KEYS[e.key]) dispatch({ type: 'setLayer', layer: LAYER_KEYS[e.key] });
          else return;
      }
      e.preventDefault();
    };
    addEventListener('keydown', onKeyDown);
    return () => removeEventListener('keydown', onKeyDown);
  }, [sheet, page, selection, guidedPath, home, tour, dispatch, reducedMotion]);
}
