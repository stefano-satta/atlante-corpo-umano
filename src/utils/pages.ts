import type { PageId } from '@/models/atlas';

/** Pagine di lettura del menu, nell'ordine. La voce Percorsi, che le precede, la disegna la barra a parte. */
export const PAGE_IDS: PageId[] = ['indice', 'glossario', 'fonti', 'informazioni'];

/** Tutte le pagine di lettura, con la pagina dei percorsi: hanno una rotta ciascuna. */
export const READING_PAGE_IDS: PageId[] = ['percorsi', ...PAGE_IDS];

export const PAGE_TITLES: Record<PageId, string> = {
  percorsi: 'Percorsi',
  indice: 'Indice',
  glossario: 'Glossario',
  fonti: 'Fonti',
  informazioni: 'Informazioni',
};

/** Titoli brevi per il menu su smartphone, dove cinque voci non stanno in una riga. */
export const PAGE_SHORT_TITLES: Partial<Record<PageId, string>> = { informazioni: 'Info' };
