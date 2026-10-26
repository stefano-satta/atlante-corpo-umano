import type { AtlasAction, AtlasState, BodyKind, Layer } from '@/models/atlas';
import type { ModelLayer } from '@/models/scene';
import { ORGANS_BY_ID } from './organs';
import { readUrl } from './url';

/** Corpo in cui si vede una struttura: quello attuale, salvo gli organi di un solo corpo (D29). */
export function bodyFor(current: BodyKind, selection: string | null): BodyKind {
  return (selection && ORGANS_BY_ID.get(selection)?.body) || current;
}

export function atlasReducer(s: AtlasState, a: AtlasAction): AtlasState {
  switch (a.type) {
    case 'setLayer':
      return { ...s, layer: a.layer, selection: null, sheet: false };
    case 'revealLayer':
      return { ...s, layer: a.layer };
    case 'toggleSkin':
      return { ...s, skin: !s.skin };
    case 'setBody': {
      // Un organo dell'altro corpo non si vede più: la selezione si chiude.
      const keep = bodyFor(a.body, s.selection) === a.body;
      return { ...s, body: a.body, selection: keep ? s.selection : null, sheet: keep && s.sheet };
    }
    case 'select':
      // Scegliere un organo di un solo corpo, dall'Indice o da un collegamento, porta a quel corpo.
      return { ...s, selection: a.id, sheet: false, home: s.home && !a.id, body: bodyFor(s.body, a.id) };
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
      // Tornando indietro su `/` si torna alla soglia, su `/esplora` all'atlante.
      return {
        ...s,
        home: a.home,
        selection: a.selection,
        body: bodyFor(s.body, a.selection),
        sheet: a.sheet,
        page: null,
        guidedPath: a.guidedPath ?? (a.selection ? s.guidedPath : null),
      };
  }
}

/** Stato all'apertura, dall'indirizzo: su `/` la soglia è aperta. */
export function initialAtlasState(pathname: string): AtlasState {
  const url = readUrl(pathname);
  return {
    layer: 'organi',
    body: bodyFor('uomo', url.selection),
    skin: true,
    hover: null,
    tour: null,
    ...url,
  };
}

/** Strati del modello visibili per ciascuno strato della barra dei comandi. */
export const VISIBLE_MODEL_LAYERS: Record<Layer, ModelLayer[]> = {
  scheletro: ['ossa'],
  organi: ['organi'],
  muscoli: ['muscoli'],
};

/** Strati del modello mostrati solo come contesto (fantasma, non selezionabili). */
export const GHOST_MODEL_LAYERS: Record<Layer, ModelLayer[]> = {
  scheletro: [],
  organi: ['ossa'],
  muscoli: [],
};

/** Strato della barra in cui una struttura del modello è piena e selezionabile. */
export const LAYER_OF_MODEL_LAYER: Record<Exclude<ModelLayer, 'pelle'>, Layer> = {
  ossa: 'scheletro',
  organi: 'organi',
  muscoli: 'muscoli',
};
