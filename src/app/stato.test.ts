import { describe, expect, it } from 'vitest';
import { indirizzo, leggiUrl, riduttore, type StatoAtlante } from './stato';

const base: StatoAtlante = {
  strato: 'organi',
  pelle: true,
  selezione: null,
  scheda: false,
  pagina: null,
  percorso: null,
  hover: null,
  soglia: false,
  tour: null,
};

describe("soglia d'ingresso", () => {
  const aperta = { ...base, soglia: true };

  it('si chiude scegliendo una struttura o un percorso', () => {
    expect(riduttore(aperta, { tipo: 'seleziona', id: 'cuore' }).soglia).toBe(false);
    expect(riduttore(aperta, { tipo: 'percorso', percorso: { id: 'respirazione', passo: 0 } }).soglia).toBe(false);
  });

  it('resta aperta sotto una pagina di lettura e tornando indietro su /', () => {
    const conIndice = riduttore(aperta, { tipo: 'pagina', pagina: 'indice' });
    expect(conIndice.soglia).toBe(true);
    const indietro = riduttore(conIndice, {
      tipo: 'da-url',
      selezione: null,
      scheda: false,
      pagina: null,
      percorso: null,
    });
    expect(indietro).toMatchObject({ soglia: true, pagina: null });
  });

  it('una volta chiusa non si riapre tornando su /', () => {
    const s = riduttore(base, { tipo: 'da-url', selezione: null, scheda: false, pagina: null, percorso: null });
    expect(s.soglia).toBe(false);
  });

  it("l'Indice ha il suo indirizzo", () => {
    expect(leggiUrl('/indice').pagina).toBe('indice');
    expect(indirizzo({ selezione: null, scheda: false, pagina: 'indice', percorso: null })).toBe('/indice');
  });
});

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
    expect(
      riduttore(base, { tipo: 'da-url', percorso: null, selezione: 'cuore', scheda: true, pagina: null }),
    ).toMatchObject({
      selezione: 'cuore',
      scheda: true,
    });
  });

  it('una pagina aperta dall’indirizzo conserva la selezione; tornando indietro si richiude', () => {
    const conCuore = { ...base, selezione: 'cuore' };
    const conFonti = riduttore(conCuore, {
      tipo: 'da-url',
      percorso: null,
      selezione: null,
      scheda: false,
      pagina: 'fonti',
    });
    expect(conFonti).toMatchObject({ pagina: 'fonti', selezione: 'cuore' });
    expect(
      riduttore(conFonti, { tipo: 'da-url', percorso: null, selezione: 'cuore', scheda: false, pagina: null }),
    ).toMatchObject({
      pagina: null,
      selezione: 'cuore',
    });
  });

  it('un indirizzo diretto mostra lo strato della struttura senza perdere la selezione', () => {
    const s = riduttore({ ...base, selezione: 'FJ3131' }, { tipo: 'mostra-strato', strato: 'muscoli' });
    expect(s).toMatchObject({ strato: 'muscoli', selezione: 'FJ3131' });
  });

  it('scegliere un passo di percorso chiude la struttura; selezionarne una lascia attivo il percorso', () => {
    const conCuore = { ...base, selezione: 'cuore', scheda: true };
    const inPercorso = riduttore(conCuore, { tipo: 'percorso', percorso: { id: 'respirazione', passo: 3 } });
    expect(inPercorso).toMatchObject({ selezione: null, scheda: false, percorso: { id: 'respirazione', passo: 3 } });
    const esplora = riduttore(inPercorso, { tipo: 'seleziona', id: 'polmoni' });
    expect(esplora).toMatchObject({ selezione: 'polmoni', percorso: { passo: 3 } });
    // Dall'indirizzo di una struttura il percorso resta; tornando alla vista iniziale si chiude.
    expect(riduttore(esplora, { tipo: 'da-url', ...leggiUrl('/esplora/cuore') }).percorso).toEqual({
      id: 'respirazione',
      passo: 3,
    });
    expect(riduttore(esplora, { tipo: 'da-url', ...leggiUrl('/') }).percorso).toBeNull();
  });
});

describe('indirizzi', () => {
  it('leggono e scrivono il passo di un percorso contando da 1', () => {
    expect(leggiUrl('/percorsi/respirazione/4').percorso).toEqual({ id: 'respirazione', passo: 3 });
    expect(leggiUrl('/percorsi/respirazione').percorso).toEqual({ id: 'respirazione', passo: 0 });
    const stato = { selezione: null, scheda: false, pagina: null, percorso: { id: 'respirazione', passo: 3 } };
    expect(indirizzo(stato)).toBe('/percorsi/respirazione/4');
    // La struttura esplorata durante il percorso ha il suo indirizzo.
    expect(indirizzo({ ...stato, selezione: 'polmoni' })).toBe('/esplora/polmoni');
  });
});
