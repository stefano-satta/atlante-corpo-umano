import type { Layer, QuizTheme, UrlRead, UrlState } from '@/models/atlas';
import { LEGACY_PAGE_PATHS, PAGE_PATHS, READING_PAGE_IDS } from './pages';

// Indirizzi (D11, D47): / (soglia), /esplora/<apparato> (atlante senza selezione),
// /esplora/<apparato>/<struttura> (cartellino), /esplora/<apparato>/<struttura>/scheda (scheda),
// /percorsi (elenco), /percorsi/<id>/<passo>, /quiz e /quiz/<apparato> o /quiz/completa (D53), /indice, /glossario, /fonti,
// /informazioni, /come-circola-il-sangue (prima /circolazione).
// L'apparato è lo strato scelto nella barra laterale. Nell'indirizzo il passo si conta da 1.
// Gli indirizzi di prima, /esplora, /esplora/<struttura> e /organo/<struttura>, si leggono ancora
// e si riscrivono nella forma nuova.

/** Nome dello strato nell'indirizzo: quello mostrato nella barra laterale. */
export const LAYER_SLUGS: Record<Layer, string> = {
  organi: 'organi',
  scheletro: 'scheletro',
  muscoli: 'muscoli',
  vasi: 'cardiocircolatorio',
  nervi: 'nervoso',
  digerente: 'digerente',
  respiratorio: 'respiratorio',
  urinario: 'urinario',
  riproduttivo: 'riproduttivo',
};

const LAYER_OF_SLUG = new Map(Object.entries(LAYER_SLUGS).map(([layer, slug]) => [slug, layer as Layer]));

/** Indirizzo del quiz: la scelta del tema, oppure il tema scelto. */
export function quizUrl(theme: QuizTheme | null) {
  if (!theme) return '/quiz';
  return `/quiz/${theme === 'completa' ? 'completa' : LAYER_SLUGS[theme]}`;
}

/** Indirizzo di una struttura (o della sua scheda) nello strato indicato. */
export function exploreUrl(layer: Layer, selection: string | null, sheet = false) {
  const base = `/esplora/${LAYER_SLUGS[layer]}`;
  if (!selection) return base;
  return `${base}/${encodeURIComponent(selection)}${sheet ? '/scheda' : ''}`;
}

export function readUrl(pathname: string): UrlRead {
  const path = pathname.replace(/(.)\/$/, '$1');
  const page = READING_PAGE_IDS.find((p) => path === PAGE_PATHS[p]) ?? LEGACY_PAGE_PATHS[path] ?? null;
  const p = /^\/percorsi\/([a-z0-9-]+)(?:\/(\d+))?\/?$/.exec(pathname);
  const guidedPath = p ? { id: p[1], step: Math.max(0, Number(p[2] ?? 1) - 1) } : null;
  // La soglia sta solo su `/`, anche sotto una pagina di lettura aperta da lì.
  const home = pathname === '/';
  const none = { layer: null, selection: null, sheet: false, page, guidedPath, home, quiz: null };

  const q = /^\/quiz(?:\/([a-z]+))?\/?$/.exec(pathname);
  if (q) {
    // Un tema sconosciuto apre la scelta del tema.
    const layer = q[1] ? (LAYER_OF_SLUG.get(q[1]) ?? null) : null;
    const theme: QuizTheme | null = q[1] === 'completa' ? 'completa' : layer;
    return { ...none, layer, quiz: { theme } };
  }

  const legacy = /^\/organo\/([^/]+)/.exec(pathname);
  if (legacy) return { ...none, selection: decodeURIComponent(legacy[1]), sheet: true };

  const e = /^\/esplora(?:\/([^/]+))?(?:\/([^/]+))?(?:\/(scheda))?\/?$/.exec(pathname);
  if (!e) return none;
  const [, first, second, sheet] = e;
  const layer = first ? (LAYER_OF_SLUG.get(first) ?? null) : null;
  // `/esplora/<struttura>`: il primo segmento non è un apparato, quindi è la struttura (indirizzo di prima).
  const selection = layer ? (second ?? null) : (first ?? null);
  if (!layer && second) return none;
  return { ...none, layer, selection: selection && decodeURIComponent(selection), sheet: !!sheet && !!selection };
}

export function urlFor(s: UrlState) {
  if (s.page) return PAGE_PATHS[s.page];
  if (s.quiz) return quizUrl(s.quiz.theme);
  if (s.selection) return exploreUrl(s.layer, s.selection, s.sheet);
  if (s.guidedPath) return `/percorsi/${s.guidedPath.id}/${s.guidedPath.step + 1}`;
  return s.home ? '/' : exploreUrl(s.layer, null);
}

/** Indirizzo verso cui portare il router perché rispecchi lo stato, oppure null se è già quello. */
export function urlChange(s: UrlState, pathname: string) {
  const next = urlFor(s);
  if (next === pathname) return null;
  // Passare da un passo all'altro dello stesso percorso non crea una voce di cronologia per passo:
  // "Indietro" esce dal percorso invece di ripercorrerlo all'indietro.
  // Nel quiz cambiare tema non crea voci di cronologia: "Indietro" esce dal quiz.
  if (s.quiz && !s.page && pathname.startsWith('/quiz')) return { pathname: next, replace: true };
  const samePath = !!s.guidedPath && !s.selection && !s.page && pathname.startsWith(`/percorsi/${s.guidedPath.id}/`);
  // Nemmeno cambiare apparato a parità di struttura e di scheda: lo strato scelto nella barra, quello
  // mostrato per la struttura aperta da un indirizzo diretto, un indirizzo di prima riscritto.
  const now = readUrl(pathname);
  const sameView =
    !s.page &&
    !s.quiz &&
    !now.page &&
    !now.home &&
    (pathname.startsWith('/esplora') || pathname.startsWith('/organo/')) &&
    now.selection === s.selection &&
    now.sheet === s.sheet;
  return { pathname: next, replace: samePath || sameView };
}

/** Parametri dell'indirizzo da portare sul nuovo indirizzo: la ricerca (`?q=`) resta alla pagina che l'ha scritta. */
export function searchFor(search: string) {
  const params = new URLSearchParams(search);
  params.delete('q');
  const rest = params.toString();
  return rest ? `?${rest}` : '';
}
