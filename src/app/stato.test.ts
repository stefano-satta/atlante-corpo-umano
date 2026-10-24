import { describe, expect, it } from 'vitest';
import { riduttore, type StatoAtlante } from './stato';

const base: StatoAtlante = { strato: 'organi', pelle: true, selezione: null, scheda: false, pagina: null, hover: null };

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
    expect(riduttore(base, { tipo: 'da-url', selezione: 'cuore', scheda: true, pagina: null })).toMatchObject({
      selezione: 'cuore',
      scheda: true,
    });
  });

  it('una pagina aperta dall’indirizzo conserva la selezione; tornando indietro si richiude', () => {
    const conCuore = { ...base, selezione: 'cuore' };
    const conFonti = riduttore(conCuore, { tipo: 'da-url', selezione: null, scheda: false, pagina: 'fonti' });
    expect(conFonti).toMatchObject({ pagina: 'fonti', selezione: 'cuore' });
    expect(riduttore(conFonti, { tipo: 'da-url', selezione: 'cuore', scheda: false, pagina: null })).toMatchObject({
      pagina: null,
      selezione: 'cuore',
    });
  });

  it('un indirizzo diretto mostra lo strato della struttura senza perdere la selezione', () => {
    const s = riduttore({ ...base, selezione: 'FJ3131' }, { tipo: 'mostra-strato', strato: 'muscoli' });
    expect(s).toMatchObject({ strato: 'muscoli', selezione: 'FJ3131' });
  });
});
