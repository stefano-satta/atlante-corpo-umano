import type { UrlState } from '@/models/atlas';
import { READING_PAGE_IDS } from './pages';

// Indirizzi (D11): / (soglia), /esplora (atlante senza selezione), /esplora/<id>, /organo/<id>, /percorsi (elenco),
// /percorsi/<id>/<passo>, /indice, /glossario, /fonti, /informazioni.
// Nell'indirizzo il passo si conta da 1.

export function readUrl(pathname: string): UrlState {
  const page = READING_PAGE_IDS.find((p) => pathname === `/${p}`) ?? null;
  const p = /^\/percorsi\/([a-z0-9-]+)(?:\/(\d+))?\/?$/.exec(pathname);
  const guidedPath = p ? { id: p[1], step: Math.max(0, Number(p[2] ?? 1) - 1) } : null;
  const m = /^\/(esplora|organo)\/([^/]+)/.exec(pathname);
  // La soglia sta solo su `/`, anche sotto una pagina di lettura aperta da lì.
  const home = pathname === '/';
  if (!m) return { selection: null, sheet: false, page, guidedPath, home };
  return { selection: decodeURIComponent(m[2]), sheet: m[1] === 'organo', page, guidedPath, home };
}

export function urlFor(s: UrlState) {
  if (s.page) return `/${s.page}`;
  if (s.selection) return `/${s.sheet ? 'organo' : 'esplora'}/${encodeURIComponent(s.selection)}`;
  if (s.guidedPath) return `/percorsi/${s.guidedPath.id}/${s.guidedPath.step + 1}`;
  return s.home ? '/' : '/esplora';
}

/** Indirizzo verso cui portare il router perché rispecchi lo stato, oppure null se è già quello. */
export function urlChange(s: UrlState, pathname: string) {
  const next = urlFor(s);
  if (next === pathname) return null;
  // Passare da un passo all'altro dello stesso percorso non crea una voce di cronologia per passo:
  // "Indietro" esce dal percorso invece di ripercorrerlo all'indietro.
  const samePath = !!s.guidedPath && !s.selection && !s.page && pathname.startsWith(`/percorsi/${s.guidedPath.id}/`);
  return { pathname: next, replace: samePath };
}

/** Parametri dell'indirizzo da portare sul nuovo indirizzo: la ricerca (`?q=`) resta alla pagina che l'ha scritta. */
export function searchFor(search: string) {
  const params = new URLSearchParams(search);
  params.delete('q');
  const rest = params.toString();
  return rest ? `?${rest}` : '';
}
