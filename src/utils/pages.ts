import type { PageId } from '@/models/atlas';

/** Pagine di lettura, nell'ordine del menu. */
export const PAGE_IDS: PageId[] = ['indice', 'glossario', 'fonti', 'informazioni'];

export const PAGE_TITLES: Record<PageId, string> = {
  indice: 'Indice',
  glossario: 'Glossario',
  fonti: 'Fonti',
  informazioni: 'Informazioni',
};

/** Titoli brevi per il menu su smartphone, dove cinque voci non stanno in una riga. */
export const PAGE_SHORT_TITLES: Partial<Record<PageId, string>> = { informazioni: 'Info' };
