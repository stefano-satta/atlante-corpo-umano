import { describe, expect, it } from 'vitest';
import { riduttore, type StatoAtlante } from './stato';

const base: StatoAtlante = { strato: 'organi', pelle: true, selezione: null, scheda: false, hover: null };

describe('riduttore dello stato', () => {
  it('cambiando strato annulla selezione e scheda', () => {
    const s = riduttore({ ...base, selezione: 'cuore', scheda: true }, { tipo: 'strato', strato: 'muscoli' });
    expect(s).toMatchObject({ strato: 'muscoli', selezione: null, scheda: false });
  });

  it('una nuova selezione chiude la scheda aperta', () => {
    const s = riduttore({ ...base, selezione: 'cuore', scheda: true }, { tipo: 'seleziona', id: 'fegato' });
    expect(s).toMatchObject({ selezione: 'fegato', scheda: false });
  });

  it('la scheda si apre solo con una struttura selezionata', () => {
    expect(riduttore(base, { tipo: 'scheda', aperta: true }).scheda).toBe(false);
    expect(riduttore({ ...base, selezione: 'cuore' }, { tipo: 'scheda', aperta: true }).scheda).toBe(true);
  });

  it('un hover invariato restituisce lo stesso oggetto (nessun nuovo render)', () => {
    const s = { ...base, hover: 'cuore' };
    expect(riduttore(s, { tipo: 'hover', id: 'cuore' })).toBe(s);
  });

  it('la navigazione del browser imposta selezione e scheda', () => {
    expect(riduttore(base, { tipo: 'da-url', selezione: 'cuore', scheda: true })).toMatchObject({
      selezione: 'cuore',
      scheda: true,
    });
  });
});
