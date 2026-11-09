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

/** Nome del sito, in fondo al titolo di ogni pagina del browser. */
export const SITE_TITLE = 'Atlante del corpo umano';

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
