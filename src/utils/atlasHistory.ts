import type { ActiveGuidedPath, AtlasState, Layer, QuizTheme, UrlState } from '@/models/atlas';
import { bodyFor } from './atlasReducer';
import { LAYER_SLUGS, readUrl } from './url';

// L'indirizzo è la fonte della parte navigabile dello stato (D11, D47): strato, struttura, scheda, pagina,
// percorso, soglia e tema del quiz. Quello che l'indirizzo non dice sta nello stato della voce di
// cronologia (`location.state`): lo strato di un percorso o del quiz completo, il percorso che resta attivo
// esplorando una struttura, l'atlante che resta sotto una pagina di lettura. Così Indietro e Avanti, e
// anche un ricaricamento, ritrovano la vista di quella voce.

/** Parte navigabile dello stato: quella che si legge dall'indirizzo e dalla voce di cronologia. */
export type AtlasView = Omit<UrlState, 'quiz'> & { quiz: { theme: QuizTheme | null } | null };

/** Stato della voce di cronologia scritto dall'atlante. */
export interface AtlasHistoryState {
  atlas: true;
  layer: Layer;
  guidedPath: ActiveGuidedPath | null;
  /** Atlante sotto la pagina di lettura aperta, soglia compresa; null fuori dalle pagine. */
  behind: AtlasView | null;
}

/** Vista di chi arriva da un indirizzo senza altre indicazioni: l'atlante degli organi, senza selezione. */
export const DEFAULT_VIEW: AtlasView = {
  layer: 'organi',
  selection: null,
  sheet: false,
  page: null,
  guidedPath: null,
  home: false,
  quiz: null,
};

export function viewOf(s: AtlasView): AtlasView {
  return {
    layer: s.layer,
    selection: s.selection,
    sheet: s.sheet,
    page: s.page,
    guidedPath: s.guidedPath && { id: s.guidedPath.id, step: s.guidedPath.step },
    home: s.home,
    quiz: s.quiz && { theme: s.quiz.theme },
  };
}

export const sameView = (a: AtlasView, b: AtlasView) => JSON.stringify(viewOf(a)) === JSON.stringify(viewOf(b));

/** Stato della voce di cronologia per una vista. */
export function historyOf(s: AtlasView): AtlasHistoryState {
  const view = viewOf(s);
  return {
    atlas: true,
    layer: view.layer,
    guidedPath: view.guidedPath,
    behind: view.page ? { ...view, page: null } : null,
  };
}

export const sameHistory = (a: unknown, b: AtlasHistoryState) => JSON.stringify(a) === JSON.stringify(b);

const isLayer = (x: unknown): x is Layer => typeof x === 'string' && x in LAYER_SLUGS;

/** Stato della voce di cronologia, se l'ha scritto l'atlante (con uno strato valido); altrimenti null. */
function atlasHistory(x: unknown): AtlasHistoryState | null {
  if (!x || typeof x !== 'object') return null;
  const h = x as Partial<AtlasHistoryState>;
  return h.atlas === true && isLayer(h.layer) && (!h.behind || isLayer(h.behind.layer))
    ? (h as AtlasHistoryState)
    : null;
}

/**
 * Vista per un indirizzo. Quello che l'indirizzo non dice viene dalla voce di cronologia; se la voce non
 * l'ha scritta l'atlante (un collegamento, la ricerca `?q=`, un indirizzo aperto direttamente) resta quello
 * della vista di prima: l'atlante sotto una pagina, lo strato, il percorso in corso dietro una struttura.
 */
export function viewFromLocation(pathname: string, historyState: unknown, previous: AtlasView): AtlasView {
  const url = readUrl(pathname);
  const history = atlasHistory(historyState);
  // Aprendo una pagina l'atlante resta quello che c'era sotto.
  if (url.page) return { ...viewOf(history?.behind ?? { ...previous, page: null }), page: url.page };
  const kept = history ?? previous;
  return {
    layer: url.layer ?? kept.layer,
    selection: url.selection,
    sheet: url.sheet,
    page: null,
    // Un indirizzo di struttura lascia attivo il percorso in corso; uno di percorso lo imposta.
    guidedPath: url.guidedPath ?? (url.selection ? kept.guidedPath : null),
    // Tornando su `/` si torna alla soglia, su `/esplora` all'atlante.
    home: url.home,
    quiz: url.quiz ? { theme: url.quiz.theme } : null,
  };
}

/** Stato completo: la vista dall'indirizzo, il resto (corpo, pelle, battito, guida, domanda del quiz) dallo stato effimero. */
export function withView(ui: AtlasState, view: AtlasView): AtlasState {
  const focus = view.quiz && ui.quiz?.theme === view.quiz.theme ? ui.quiz.focus : null;
  return { ...ui, ...viewOf(view), quiz: view.quiz && { theme: view.quiz.theme, focus } };
}

/** Stato all'arrivo su un indirizzo: la vista è quella dell'indirizzo, e il corpo segue la struttura aperta (D29). */
export function arrive(s: AtlasState, view: AtlasView): AtlasState {
  const next = withView(s, view);
  const body = bodyFor(s.body, next.selection);
  // Il suono del battito (D42) c'è solo mentre il cuore selezionato batte.
  const heartSound = next.heartSound && next.selection === 'cuore' && next.heartbeat;
  return body === next.body && heartSound === next.heartSound ? next : { ...next, body, heartSound };
}

/** Stato dopo una navigazione del browser verso `pathname` (Indietro, Avanti, un collegamento). */
export const arriveAt = (s: AtlasState, pathname: string, historyState: unknown = null) =>
  arrive(s, viewFromLocation(pathname, historyState, s));
