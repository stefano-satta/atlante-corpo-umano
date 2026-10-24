import { describe, expect, it } from 'vitest';
import type { AtlasState } from '@/models/atlas';
import { atlasReducer } from './atlasReducer';
import { readUrl, urlFor } from './url';

const base: AtlasState = {
  layer: 'organi',
  skin: true,
  selection: null,
  sheet: false,
  page: null,
  guidedPath: null,
  hover: null,
  home: false,
  tour: null,
};
const noUrl = { selection: null, sheet: false, page: null, guidedPath: null, home: false };

describe("soglia d'ingresso", () => {
  const open = { ...base, home: true };

  it('si chiude scegliendo una struttura o un percorso', () => {
    expect(atlasReducer(open, { type: 'select', id: 'cuore' }).home).toBe(false);
    expect(atlasReducer(open, { type: 'setGuidedPath', guidedPath: { id: 'respirazione', step: 0 } }).home).toBe(false);
  });

  it('resta aperta sotto una pagina di lettura e tornando indietro su /', () => {
    const withIndex = atlasReducer(open, { type: 'setPage', page: 'indice' });
    expect(withIndex.home).toBe(true);
    expect(urlFor({ ...noUrl, home: true })).toBe('/');
    const back = atlasReducer(withIndex, { type: 'fromUrl', ...readUrl('/') });
    expect(back).toMatchObject({ home: true, page: null });
  });

  it("ha un indirizzo diverso dall'atlante: / è la soglia, /esplora l'atlante", () => {
    expect(readUrl('/').home).toBe(true);
    expect(readUrl('/esplora')).toMatchObject({ home: false, selection: null });
    expect(urlFor(noUrl)).toBe('/esplora');
    expect(atlasReducer(open, { type: 'setHome', open: false }).home).toBe(false);
  });

  it('tornando su / si riapre, tornando su /esplora si richiude', () => {
    expect(atlasReducer(base, { type: 'fromUrl', ...readUrl('/') }).home).toBe(true);
    expect(atlasReducer(open, { type: 'fromUrl', ...readUrl('/esplora') }).home).toBe(false);
  });

  it("l'Indice ha il suo indirizzo", () => {
    expect(readUrl('/indice').page).toBe('indice');
    expect(urlFor({ ...noUrl, page: 'indice' })).toBe('/indice');
  });
});

describe('riduttore dello stato', () => {
  it('cambiando strato annulla selezione e scheda', () => {
    const s = atlasReducer({ ...base, selection: 'cuore', sheet: true }, { type: 'setLayer', layer: 'muscoli' });
    expect(s).toMatchObject({ layer: 'muscoli', selection: null, sheet: false });
  });

  it('una nuova selezione chiude la scheda aperta', () => {
    const s = atlasReducer({ ...base, selection: 'cuore', sheet: true }, { type: 'select', id: 'fegato' });
    expect(s).toMatchObject({ selection: 'fegato', sheet: false });
  });

  it('la scheda si apre solo con una struttura selezionata', () => {
    expect(atlasReducer(base, { type: 'setSheet', open: true }).sheet).toBe(false);
    expect(atlasReducer({ ...base, selection: 'cuore' }, { type: 'setSheet', open: true }).sheet).toBe(true);
  });

  it('un hover invariato restituisce lo stesso oggetto (nessun nuovo render)', () => {
    const s = { ...base, hover: 'cuore' };
    expect(atlasReducer(s, { type: 'hover', id: 'cuore' })).toBe(s);
  });

  it('la navigazione del browser imposta selezione e scheda', () => {
    expect(atlasReducer(base, { type: 'fromUrl', ...noUrl, selection: 'cuore', sheet: true })).toMatchObject({
      selection: 'cuore',
      sheet: true,
    });
  });

  it('una pagina aperta dall’indirizzo conserva la selezione; tornando indietro si richiude', () => {
    const withHeart = { ...base, selection: 'cuore' };
    const withSources = atlasReducer(withHeart, { type: 'fromUrl', ...noUrl, page: 'fonti' });
    expect(withSources).toMatchObject({ page: 'fonti', selection: 'cuore' });
    expect(atlasReducer(withSources, { type: 'fromUrl', ...noUrl, selection: 'cuore' })).toMatchObject({
      page: null,
      selection: 'cuore',
    });
  });

  it('un indirizzo diretto mostra lo strato della struttura senza perdere la selezione', () => {
    const s = atlasReducer({ ...base, selection: 'FJ3131' }, { type: 'revealLayer', layer: 'muscoli' });
    expect(s).toMatchObject({ layer: 'muscoli', selection: 'FJ3131' });
  });

  it('scegliere un passo di percorso chiude la struttura; selezionarne una lascia attivo il percorso', () => {
    const withHeart = { ...base, selection: 'cuore', sheet: true };
    const inPath = atlasReducer(withHeart, { type: 'setGuidedPath', guidedPath: { id: 'respirazione', step: 3 } });
    expect(inPath).toMatchObject({ selection: null, sheet: false, guidedPath: { id: 'respirazione', step: 3 } });
    const exploring = atlasReducer(inPath, { type: 'select', id: 'polmoni' });
    expect(exploring).toMatchObject({ selection: 'polmoni', guidedPath: { step: 3 } });
    // Dall'indirizzo di una struttura il percorso resta; tornando alla vista iniziale si chiude.
    expect(atlasReducer(exploring, { type: 'fromUrl', ...readUrl('/esplora/cuore') }).guidedPath).toEqual({
      id: 'respirazione',
      step: 3,
    });
    expect(atlasReducer(exploring, { type: 'fromUrl', ...readUrl('/') }).guidedPath).toBeNull();
  });
});

describe('indirizzi', () => {
  it('leggono e scrivono il passo di un percorso contando da 1', () => {
    expect(readUrl('/percorsi/respirazione/4').guidedPath).toEqual({ id: 'respirazione', step: 3 });
    expect(readUrl('/percorsi/respirazione').guidedPath).toEqual({ id: 'respirazione', step: 0 });
    const state = { ...noUrl, guidedPath: { id: 'respirazione', step: 3 } };
    expect(urlFor(state)).toBe('/percorsi/respirazione/4');
    // La struttura esplorata durante il percorso ha il suo indirizzo.
    expect(urlFor({ ...state, selection: 'polmoni' })).toBe('/esplora/polmoni');
  });
});
