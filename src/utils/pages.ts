import type { PageId } from '@/models/atlas';

/** Pagine di lettura del menu, nell'ordine. Le voci Esplora e Percorsi, che le precedono, le disegna la barra a parte. */
export const PAGE_IDS: PageId[] = ['indice', 'glossario', 'fonti', 'informazioni'];

/** Tutte le pagine di lettura, con quella dei percorsi e la panoramica aperta dal cartellino dei vasi: hanno una rotta ciascuna. */
export const READING_PAGE_IDS: PageId[] = ['percorsi', ...PAGE_IDS, 'circolazione'];

export const PAGE_TITLES: Record<PageId, string> = {
  percorsi: 'Percorsi',
  indice: 'Indice',
  glossario: 'Glossario',
  fonti: 'Fonti',
  informazioni: 'Informazioni',
  circolazione: 'Come circola il sangue',
};

/** Titoli brevi per il menu su smartphone, dove sei voci non stanno in una riga. */
export const PAGE_SHORT_TITLES: Partial<Record<PageId, string>> = { informazioni: 'Info' };
