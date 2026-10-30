import { describe, expect, it } from 'vitest';
import { highlight, matches, normalize } from './search';

describe("ricerca dell'Indice", () => {
  it('ignora maiuscole, accenti e apostrofi', () => {
    expect(normalize("  Osso dell'ANCA  ")).toBe('osso dell anca');
    expect(normalize('Vescica urinaria è')).toBe('vescica urinaria e');
  });

  it("trova l'inizio di ogni parola, in qualunque testo della voce", () => {
    expect(matches('card', ['Cuore', 'cor', 'Apparato cardiovascolare'])).toBe(true);
    expect(matches('pulm', ['Polmoni', 'pulmones'])).toBe(true);
    expect(matches('apparato resp', ['Polmoni', 'Apparato respiratorio'])).toBe(true);
  });

  it('non trova parti interne di una parola e richiede tutte le parole', () => {
    expect(matches('ore', ['Cuore'])).toBe(false);
    expect(matches('cuore polm', ['Cuore', 'cor'])).toBe(false);
  });

  it('una ricerca vuota mostra tutto', () => {
    expect(matches('   ', ['Cuore'])).toBe(true);
  });
});

describe('evidenza dei risultati', () => {
  it("segna l'inizio delle parole trovate, anche con accenti e maiuscole", () => {
    expect(highlight('Retto femorale', 'ret')).toEqual([
      { text: 'Ret', match: true },
      { text: 'to femorale', match: false },
    ]);
    expect(highlight("Umor acqueo dell'occhio", 'occ ÙMOR')).toEqual([
      { text: 'Umor', match: true },
      { text: " acqueo dell'", match: false },
      { text: 'occ', match: true },
      { text: 'hio', match: false },
    ]);
  });

  it('non segna parti interne di una parola e lascia intero il testo senza ricerca', () => {
    expect(highlight('Cuore', 'ore')).toEqual([{ text: 'Cuore', match: false }]);
    expect(highlight('Cuore', '')).toEqual([{ text: 'Cuore', match: false }]);
  });
});
