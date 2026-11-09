import { describe, expect, it } from 'vitest';
import type { UrlState } from '@/models/atlas';
import { readUrl, urlChange, urlFor } from '@/utils/url';

const explore: UrlState = { layer: 'organi', selection: null, sheet: false, page: null, guidedPath: null, home: false };

describe('indirizzi di esplorazione (D47)', () => {
  it('mettono apparato, struttura e scheda nel percorso', () => {
    expect(urlFor({ ...explore, layer: 'scheletro' })).toBe('/esplora/scheletro');
    expect(urlFor({ ...explore, selection: 'stomaco' })).toBe('/esplora/organi/stomaco');
    expect(urlFor({ ...explore, selection: 'stomaco', sheet: true })).toBe('/esplora/organi/stomaco/scheda');
    expect(urlFor({ ...explore, layer: 'vasi', selection: 'aorta' })).toBe('/esplora/cardiocircolatorio/aorta');
    expect(urlFor({ ...explore, layer: 'nervi', selection: 'midollo-spinale' })).toBe(
      '/esplora/nervoso/midollo-spinale',
    );
    expect(urlFor({ ...explore, layer: 'digerente', selection: 'fegato' })).toBe('/esplora/digerente/fegato');
    expect(urlFor({ ...explore, layer: 'respiratorio', selection: 'polmoni' })).toBe('/esplora/respiratorio/polmoni');
    expect(urlFor({ ...explore, layer: 'urinario', selection: 'reni' })).toBe('/esplora/urinario/reni');
    expect(urlFor({ ...explore, layer: 'riproduttivo', selection: 'utero' })).toBe('/esplora/riproduttivo/utero');
  });

  it("si leggono nell'altro verso", () => {
    expect(readUrl('/esplora/muscoli')).toMatchObject({ layer: 'muscoli', selection: null, sheet: false });
    expect(readUrl('/esplora/cardiocircolatorio/aorta')).toMatchObject({
      layer: 'vasi',
      selection: 'aorta',
      sheet: false,
    });
    expect(readUrl('/esplora/organi/cuore/scheda')).toMatchObject({ layer: 'organi', selection: 'cuore', sheet: true });
    expect(readUrl('/esplora/nervoso/encefalo/')).toMatchObject({ layer: 'nervi', selection: 'encefalo' });
    expect(readUrl('/esplora/digerente/stomaco/scheda')).toMatchObject({
      layer: 'digerente',
      selection: 'stomaco',
      sheet: true,
    });
    expect(readUrl('/esplora/riproduttivo/uretra')).toMatchObject({ layer: 'riproduttivo', selection: 'uretra' });
    expect(readUrl('/esplora/muscoli/vaso%20x')).toMatchObject({ selection: 'vaso x' });
  });

  it('leggono ancora gli indirizzi di prima, senza apparato', () => {
    expect(readUrl('/esplora')).toMatchObject({ layer: null, selection: null });
    expect(readUrl('/esplora/cuore')).toMatchObject({ layer: null, selection: 'cuore', sheet: false });
    expect(readUrl('/organo/cuore')).toMatchObject({ layer: null, selection: 'cuore', sheet: true });
  });

  it('ignorano gli indirizzi malformati', () => {
    expect(readUrl('/esplora/cuore/aorta')).toMatchObject({ selection: null });
    expect(readUrl('/esplora/organi/cuore/altro')).toMatchObject({ selection: null });
  });

  it("riscrivono senza nuova voce di cronologia quando cambia solo l'apparato", () => {
    // Cambio di strato senza selezione, strato rivelato per una struttura, indirizzi di prima.
    expect(urlChange({ ...explore, layer: 'muscoli' }, '/esplora/organi')).toEqual({
      pathname: '/esplora/muscoli',
      replace: true,
    });
    expect(urlChange({ ...explore, selection: 'cuore' }, '/esplora/scheletro/cuore')?.replace).toBe(true);
    expect(urlChange({ ...explore, selection: 'cuore', sheet: true }, '/organo/cuore')).toEqual({
      pathname: '/esplora/organi/cuore/scheda',
      replace: true,
    });
    expect(urlChange(explore, '/esplora')?.replace).toBe(true);
  });

  it('creano una voce di cronologia aprendo struttura o scheda', () => {
    expect(urlChange({ ...explore, selection: 'cuore' }, '/esplora/organi')?.replace).toBe(false);
    expect(urlChange({ ...explore, selection: 'cuore', sheet: true }, '/esplora/organi/cuore')?.replace).toBe(false);
    expect(urlChange(explore, '/esplora/organi/cuore')?.replace).toBe(false);
    expect(urlChange({ ...explore, selection: 'cuore' }, '/indice')?.replace).toBe(false);
  });
});

describe('indirizzi del quiz (D53)', () => {
  it('mettono il tema nel percorso', () => {
    expect(urlFor({ ...explore, quiz: { theme: null } })).toBe('/quiz');
    expect(urlFor({ ...explore, quiz: { theme: 'vasi' } })).toBe('/quiz/cardiocircolatorio');
    expect(urlFor({ ...explore, quiz: { theme: 'completa' } })).toBe('/quiz/completa');
    expect(urlFor({ ...explore, quiz: { theme: 'organi' }, page: 'fonti' })).toBe('/fonti');
  });

  it("si leggono nell'altro verso, con l'apparato come strato", () => {
    expect(readUrl('/quiz')).toMatchObject({ quiz: { theme: null }, layer: null });
    expect(readUrl('/quiz/nervoso')).toMatchObject({ quiz: { theme: 'nervi' }, layer: 'nervi' });
    expect(readUrl('/quiz/completa/')).toMatchObject({ quiz: { theme: 'completa' }, layer: null });
    expect(readUrl('/quiz/pelle')).toMatchObject({ quiz: { theme: null } });
    expect(readUrl('/esplora/organi').quiz).toBeNull();
  });

  it('cambiare tema non crea voci di cronologia; entrare nel quiz sì', () => {
    expect(urlChange({ ...explore, quiz: { theme: 'muscoli' } }, '/quiz')).toEqual({
      pathname: '/quiz/muscoli',
      replace: true,
    });
    expect(urlChange({ ...explore, quiz: { theme: null } }, '/esplora/organi')).toEqual({
      pathname: '/quiz',
      replace: false,
    });
  });
});
