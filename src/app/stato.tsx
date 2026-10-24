import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

export type Strato = 'muscoli' | 'organi' | 'scheletro';
export type IdPagina = 'fonti' | 'informazioni';

export interface StatoAtlante {
  strato: Strato;
  pelle: boolean;
  /** Unità selezionata: id di un organo o di un elemento (osso, muscolo). */
  selezione: string | null;
  scheda: boolean;
  /** Pagina di lettura aperta sopra l'atlante (Fonti, Informazioni). */
  pagina: IdPagina | null;
  /**
   * Percorso guidato in corso (D24), con il passo contato da 0. Resta attivo mentre si
   * esplora una struttura, così si può tornare al passo da cui si era partiti.
   */
  percorso: PercorsoAttivo | null;
  hover: string | null;
}

export interface PercorsoAttivo {
  id: string;
  passo: number;
}

export type Azione =
  | { tipo: 'strato'; strato: Strato }
  /** Mostra lo strato che contiene la struttura selezionata, senza perdere la selezione (indirizzo diretto). */
  | { tipo: 'mostra-strato'; strato: Strato }
  | { tipo: 'pelle' }
  | { tipo: 'seleziona'; id: string | null }
  | { tipo: 'scheda'; aperta: boolean }
  | { tipo: 'pagina'; pagina: IdPagina | null }
  | { tipo: 'percorso'; percorso: PercorsoAttivo | null }
  | { tipo: 'hover'; id: string | null }
  | ({ tipo: 'da-url' } & DaUrl);

type DaUrl = Pick<StatoAtlante, 'selezione' | 'scheda' | 'pagina' | 'percorso'>;

export function riduttore(s: StatoAtlante, a: Azione): StatoAtlante {
  switch (a.tipo) {
    case 'strato':
      return { ...s, strato: a.strato, selezione: null, scheda: false };
    case 'mostra-strato':
      return { ...s, strato: a.strato };
    case 'pelle':
      return { ...s, pelle: !s.pelle };
    case 'seleziona':
      return { ...s, selezione: a.id, scheda: false };
    case 'scheda':
      return { ...s, scheda: a.aperta && s.selezione !== null };
    case 'pagina':
      return { ...s, pagina: a.pagina };
    case 'percorso':
      // Scegliere un passo chiude la struttura che si stava esplorando.
      return { ...s, percorso: a.percorso, selezione: null, scheda: false };
    case 'hover':
      return s.hover === a.id ? s : { ...s, hover: a.id };
    case 'da-url':
      // Aprendo una pagina dall'indirizzo la selezione resta quella che c'era.
      if (a.pagina) return { ...s, pagina: a.pagina };
      // Un indirizzo di struttura lascia attivo il percorso in corso; uno di percorso lo imposta.
      return {
        ...s,
        selezione: a.selezione,
        scheda: a.scheda,
        pagina: null,
        percorso: a.percorso ?? (a.selezione ? s.percorso : null),
      };
  }
}

// Indirizzi (D11): /esplora/<id>, /organo/<id>, /percorsi/<id>/<passo>, /fonti, /informazioni.
// Nell'indirizzo il passo si conta da 1.
const PAGINE: IdPagina[] = ['fonti', 'informazioni'];

export function leggiUrl(pathname = location.pathname): DaUrl {
  const pagina = PAGINE.find((p) => pathname === `/${p}`) ?? null;
  const p = /^\/percorsi\/([a-z0-9-]+)(?:\/(\d+))?\/?$/.exec(pathname);
  const percorso = p ? { id: p[1], passo: Math.max(0, Number(p[2] ?? 1) - 1) } : null;
  const m = /^\/(esplora|organo)\/([^/]+)/.exec(pathname);
  if (!m) return { selezione: null, scheda: false, pagina, percorso };
  return { selezione: decodeURIComponent(m[2]), scheda: m[1] === 'organo', pagina, percorso };
}

export function indirizzo(s: DaUrl) {
  if (s.pagina) return `/${s.pagina}`;
  if (s.selezione) return `/${s.scheda ? 'organo' : 'esplora'}/${encodeURIComponent(s.selezione)}`;
  if (s.percorso) return `/percorsi/${s.percorso.id}/${s.percorso.passo + 1}`;
  return '/';
}

function scriviUrl(s: DaUrl) {
  const nuovo = indirizzo(s);
  if (nuovo === location.pathname) return;
  // Passare da un passo all'altro dello stesso percorso non crea una voce di cronologia per passo:
  // "Indietro" esce dal percorso invece di ripercorrerlo all'indietro.
  const stessoPercorso =
    s.percorso && !s.selezione && !s.pagina && location.pathname.startsWith(`/percorsi/${s.percorso.id}/`);
  history[stessoPercorso ? 'replaceState' : 'pushState'](null, '', nuovo + location.search);
}

const Contesto = createContext<{ stato: StatoAtlante; invia: (a: Azione) => void } | null>(null);

export function ProviderAtlante({ children }: { children: ReactNode }) {
  const [stato, invia] = useReducer(riduttore, undefined, () => ({
    strato: 'organi' as Strato,
    pelle: true,
    hover: null,
    ...leggiUrl(),
  }));

  const { selezione, scheda, pagina, percorso } = stato;
  useEffect(() => scriviUrl({ selezione, scheda, pagina, percorso }), [selezione, scheda, pagina, percorso]);
  useEffect(() => {
    const suPopstate = () => invia({ tipo: 'da-url', ...leggiUrl() });
    addEventListener('popstate', suPopstate);
    return () => removeEventListener('popstate', suPopstate);
  }, []);

  const valore = useMemo(() => ({ stato, invia }), [stato]);
  return <Contesto.Provider value={valore}>{children}</Contesto.Provider>;
}

export function useAtlante() {
  const c = useContext(Contesto);
  if (!c) throw new Error('useAtlante fuori da ProviderAtlante');
  return c;
}

export function useMovimentoRidotto() {
  const query = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)'), []);
  const [ridotto, aggiorna] = useReducer(() => query.matches, query.matches);
  useEffect(() => {
    query.addEventListener('change', aggiorna);
    return () => query.removeEventListener('change', aggiorna);
  }, [query]);
  return ridotto;
}

/** Strati del modello visibili per ciascun preset. */
export const STRATI_VISIBILI: Record<Strato, Array<'ossa' | 'muscoli' | 'organi'>> = {
  muscoli: ['muscoli'],
  organi: ['ossa', 'organi'],
  scheletro: ['ossa'],
};

export const useInvia = () => useAtlante().invia;
export const useSelezione = () => {
  const { stato, invia } = useAtlante();
  const seleziona = useCallback((id: string | null) => invia({ tipo: 'seleziona', id }), [invia]);
  return [stato.selezione, seleziona] as const;
};
