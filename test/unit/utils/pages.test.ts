import { describe, expect, it } from 'vitest';
import { canonicalFor, SITE_TITLE, SITE_URL, titleFor } from '@/utils/pages';

const base = { page: null, selection: null, quiz: null, home: false };

describe('titleFor', () => {
  it('nella soglia e nell’atlante senza selezione dà solo il nome del sito', () => {
    expect(titleFor({ ...base, home: true }, {})).toBe(SITE_TITLE);
    expect(titleFor(base, {})).toBe(SITE_TITLE);
  });

  it('mette davanti la pagina di lettura, anche sopra una struttura', () => {
    expect(titleFor({ ...base, page: 'glossario', selection: 'cuore' }, { structure: 'Cuore' })).toBe(
      `Glossario · ${SITE_TITLE}`,
    );
  });

  it('mette davanti la struttura aperta, anche durante un percorso', () => {
    expect(titleFor({ ...base, selection: 'cuore' }, { structure: 'Cuore', guidedPath: 'Un respiro' })).toBe(
      `Cuore · ${SITE_TITLE}`,
    );
  });

  it('mette davanti il percorso e il quiz', () => {
    expect(titleFor(base, { guidedPath: 'Un respiro' })).toBe(`Percorso: Un respiro · ${SITE_TITLE}`);
    expect(titleFor({ ...base, quiz: { theme: null } }, {})).toBe(`Quiz · ${SITE_TITLE}`);
  });

  it('senza il nome della struttura, ancora sconosciuto, dà il nome del sito', () => {
    expect(titleFor({ ...base, selection: 'FJ1234' }, { structure: null })).toBe(SITE_TITLE);
  });
});

describe('canonicalFor', () => {
  it('unisce il dominio pubblico e il percorso', () => {
    expect(canonicalFor('/')).toBe(`${SITE_URL}/`);
    expect(canonicalFor('/esplora/organi/cuore/scheda')).toBe(`${SITE_URL}/esplora/organi/cuore/scheda`);
  });

  it('toglie la barra finale, tranne sulla soglia', () => {
    expect(canonicalFor('/glossario/')).toBe(`${SITE_URL}/glossario`);
    expect(canonicalFor('/')).toBe(`${SITE_URL}/`);
  });
});
