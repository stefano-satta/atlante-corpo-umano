import type { PageId } from '@/models/atlas';

/** Pagine di lettura nella barra, a destra. Le voci Esplora, Percorsi e Quiz, a sinistra, le disegna la barra a parte. */
export const NAV_PAGE_IDS: PageId[] = ['indice', 'glossario'];

/** Pagine di lettura nel menu secondario della barra (`SecondaryMenuButton`), dopo Glossario. */
export const MENU_PAGE_IDS: PageId[] = ['fonti', 'informazioni', 'credits'];

/** Pagine di lettura del menu, nell'ordine: prima quelle della barra, poi quelle del menu secondario. */
export const PAGE_IDS: PageId[] = [...NAV_PAGE_IDS, ...MENU_PAGE_IDS];

/** Tutte le pagine di lettura, con quella dei percorsi e la panoramica aperta dal cartellino dei vasi: hanno una rotta ciascuna. */
export const READING_PAGE_IDS: PageId[] = ['percorsi', ...PAGE_IDS, 'circolazione'];

/** Indirizzo di ogni pagina di lettura: l'id, salvo la panoramica della circolazione. */
export const PAGE_PATHS: Record<PageId, string> = {
  percorsi: '/percorsi',
  indice: '/indice',
  glossario: '/glossario',
  fonti: '/fonti',
  informazioni: '/informazioni',
  credits: '/credits',
  circolazione: '/come-circola-il-sangue',
};

/** Indirizzi di prima delle pagine di lettura, che si leggono ancora e si riscrivono. */
export const LEGACY_PAGE_PATHS: Record<string, PageId> = { '/circolazione': 'circolazione' };

export const PAGE_TITLES: Record<PageId, string> = {
  percorsi: 'Percorsi',
  indice: 'Indice',
  glossario: 'Glossario',
  fonti: 'Fonti',
  informazioni: 'Informazioni',
  credits: 'Credits',
  circolazione: 'Come circola il sangue',
};

/** Nome del sito, in fondo al titolo di ogni pagina del browser. */
export const SITE_TITLE = 'Atlante del corpo umano';

/** Indirizzo pubblico del sito, per il link canonico (gli stessi URL assoluti stanno in index.html e nella sitemap). */
export const SITE_URL = 'https://atlante-corpo-umano.netlify.app';

/** Link canonico di un indirizzo: dominio pubblico e percorso, senza query né barra finale. */
export function canonicalFor(pathname: string) {
  return `${SITE_URL}${pathname.replace(/(.)\/+$/, '$1')}`;
}

/**
 * Titolo della scheda del browser per lo stato mostrato: la pagina di lettura, la struttura aperta, il
 * percorso o il quiz, seguiti dal nome del sito. Sulla soglia e nell'atlante senza selezione c'è solo il nome.
 */
export function titleFor(
  s: { page: PageId | null; selection: string | null; quiz: unknown; home: boolean },
  names: { structure?: string | null; guidedPath?: string | null },
) {
  const lead = s.page
    ? PAGE_TITLES[s.page]
    : s.quiz
      ? 'Quiz'
      : s.selection
        ? names.structure
        : names.guidedPath && !s.home
          ? `Percorso: ${names.guidedPath}`
          : null;
  return lead ? `${lead} · ${SITE_TITLE}` : SITE_TITLE;
}
