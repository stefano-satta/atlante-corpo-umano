import type { AtlasAction, AtlasState, Layer } from '@/models/atlas';
import type { ModelLayer } from '@/models/scene';
import { readUrl } from './url';

export function atlasReducer(s: AtlasState, a: AtlasAction): AtlasState {
  switch (a.type) {
    case 'setLayer':
      return { ...s, layer: a.layer, selection: null, sheet: false };
    case 'revealLayer':
      return { ...s, layer: a.layer };
    case 'toggleSkin':
      return { ...s, skin: !s.skin };
    case 'select':
      return { ...s, selection: a.id, sheet: false, home: s.home && !a.id };
    case 'setSheet':
      return { ...s, sheet: a.open && s.selection !== null };
    case 'setPage':
      return { ...s, page: a.page };
    case 'setGuidedPath':
      // Scegliere un passo chiude la struttura che si stava esplorando.
      return { ...s, guidedPath: a.guidedPath, selection: null, sheet: false, home: s.home && !a.guidedPath };
    case 'hover':
      return s.hover === a.id ? s : { ...s, hover: a.id };
    case 'setHome':
      return { ...s, home: a.open };
    case 'setTour':
      return { ...s, tour: a.step };
    case 'fromUrl':
      // Aprendo una pagina dall'indirizzo la selezione resta quella che c'era.
      if (a.page) return { ...s, page: a.page };
      // Un indirizzo di struttura lascia attivo il percorso in corso; uno di percorso lo imposta.
      // Tornando indietro su `/` la soglia resta com'era: chiusa, se si era già entrati.
      return {
        ...s,
        home: s.home && !a.selection && !a.guidedPath,
        selection: a.selection,
        sheet: a.sheet,
        page: null,
        guidedPath: a.guidedPath ?? (a.selection ? s.guidedPath : null),
      };
  }
}

/** Stato all'apertura: dall'indirizzo, con la soglia aperta solo arrivando su `/`. */
export function initialAtlasState(): AtlasState {
  return {
    layer: 'organi',
    skin: true,
    hover: null,
    home: location.pathname === '/',
    tour: null,
    ...readUrl(),
  };
}

/** Strati del modello visibili per ciascuno strato della barra dei comandi. */
export const VISIBLE_MODEL_LAYERS: Record<Layer, ModelLayer[]> = {
  muscoli: ['muscoli'],
  organi: ['ossa', 'organi'],
  scheletro: ['ossa'],
};
