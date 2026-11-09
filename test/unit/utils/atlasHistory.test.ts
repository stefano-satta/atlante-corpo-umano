import { describe, expect, it } from 'vitest';
import { arriveAt, DEFAULT_VIEW, historyOf, viewFromLocation } from '@/utils/atlasHistory';
import { initialAtlasState } from '@/utils/atlasReducer';
import { urlFor } from '@/utils/url';

const path = { id: 'respirazione', step: 2 };

describe('vista dall’indirizzo e dalla voce di cronologia', () => {
  it('una pagina mostra sotto l’atlante della sua voce, anche con un altro atlante aperto ora', () => {
    const behind = { ...DEFAULT_VIEW, layer: 'muscoli' as const, selection: 'FJ3131' };
    const view = viewFromLocation('/glossario', historyOf({ ...behind, page: 'glossario' }), DEFAULT_VIEW);
    expect(view).toMatchObject({ page: 'glossario', layer: 'muscoli', selection: 'FJ3131' });
  });

  it('una pagina aperta da un collegamento (senza voce dell’atlante) tiene l’atlante di prima', () => {
    const previous = { ...DEFAULT_VIEW, selection: 'cuore', sheet: true };
    expect(viewFromLocation('/fonti', null, previous)).toMatchObject({
      page: 'fonti',
      selection: 'cuore',
      sheet: true,
    });
  });

  it('la soglia resta sotto una pagina aperta da lì', () => {
    const view = viewFromLocation('/indice', historyOf({ ...DEFAULT_VIEW, home: true, page: 'indice' }), DEFAULT_VIEW);
    expect(view).toMatchObject({ page: 'indice', home: true });
  });

  it('il percorso della voce resta attivo dietro una struttura, ma non nell’atlante senza selezione', () => {
    const history = historyOf({ ...DEFAULT_VIEW, selection: 'polmoni', guidedPath: path });
    expect(viewFromLocation('/esplora/organi/polmoni', history, DEFAULT_VIEW).guidedPath).toEqual(path);
    expect(viewFromLocation('/esplora/organi', history, DEFAULT_VIEW).guidedPath).toBeNull();
  });

  it('lo strato che l’indirizzo non dice (percorso, quiz completo) viene dalla voce', () => {
    const quiz = historyOf({ ...DEFAULT_VIEW, layer: 'nervi', quiz: { theme: 'completa' } });
    expect(viewFromLocation('/quiz/completa', quiz, DEFAULT_VIEW)).toMatchObject({
      layer: 'nervi',
      quiz: { theme: 'completa' },
    });
    // Lo strato dell'indirizzo vince su quello della voce.
    expect(viewFromLocation('/esplora/scheletro', quiz, DEFAULT_VIEW).layer).toBe('scheletro');
  });

  it('un indirizzo aperto direttamente parte dall’atlante degli organi', () => {
    expect(viewFromLocation('/percorsi/respirazione/3', null, DEFAULT_VIEW)).toMatchObject({
      layer: 'organi',
      guidedPath: path,
      page: null,
    });
  });

  it('una voce che non ha scritto l’atlante non conta', () => {
    const previous = { ...DEFAULT_VIEW, layer: 'vasi' as const };
    expect(viewFromLocation('/quiz/completa', { layer: 'nervi' }, previous).layer).toBe('vasi');
    expect(viewFromLocation('/quiz/completa', { atlas: true, layer: 'boh' }, previous).layer).toBe('vasi');
  });

  it('ogni vista ha un indirizzo che la rilegge uguale', () => {
    const views = [
      { ...DEFAULT_VIEW, home: true },
      { ...DEFAULT_VIEW, layer: 'vasi' as const, selection: 'cuore', sheet: true },
      { ...DEFAULT_VIEW, guidedPath: path, layer: 'muscoli' as const },
      { ...DEFAULT_VIEW, selection: 'polmoni', guidedPath: path },
      { ...DEFAULT_VIEW, quiz: { theme: 'completa' as const }, layer: 'nervi' as const },
      { ...DEFAULT_VIEW, selection: 'cuore', page: 'glossario' as const },
    ];
    for (const v of views) expect(viewFromLocation(urlFor(v), historyOf(v), DEFAULT_VIEW)).toEqual(v);
  });
});

describe('arrivo su un indirizzo', () => {
  it('un organo di un solo corpo porta a quel corpo (D29)', () => {
    expect(arriveAt(initialAtlasState('/esplora'), '/esplora/riproduttivo/utero').body).toBe('donna');
  });

  it('lasciando il cuore il suono del battito si spegne (D42)', () => {
    const s = { ...initialAtlasState('/esplora/vasi/cuore'), heartSound: true };
    expect(arriveAt(s, '/esplora/cardiocircolatorio/cuore').heartSound).toBe(true);
    expect(arriveAt(s, '/esplora/cardiocircolatorio').heartSound).toBe(false);
  });

  it('tornando allo stesso tema del quiz resta la domanda in corso; uscendo si chiude', () => {
    const focus = { gruppi: ['cuore'], fma: [] };
    const s = { ...initialAtlasState('/quiz/organi'), quiz: { theme: 'organi' as const, focus } };
    expect(arriveAt(s, '/quiz/organi').quiz?.focus).toEqual(focus);
    expect(arriveAt(s, '/quiz/muscoli').quiz?.focus).toBeNull();
    expect(arriveAt(s, '/esplora/organi').quiz).toBeNull();
  });
});
