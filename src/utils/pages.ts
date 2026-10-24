import type { PageId } from '@/models/atlas';

/** Pagine di lettura, nell'ordine del menu. */
export const PAGE_IDS: PageId[] = ['indice', 'fonti', 'informazioni'];

export const PAGE_TITLES: Record<PageId, string> = { indice: 'Indice', fonti: 'Fonti', informazioni: 'Informazioni' };
