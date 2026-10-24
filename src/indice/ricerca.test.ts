import { describe, expect, it } from 'vitest';
import { corrisponde, normalizza } from './ricerca';

describe("ricerca dell'Indice", () => {
  it('ignora maiuscole, accenti e apostrofi', () => {
    expect(normalizza("  Osso dell'ANCA  ")).toBe('osso dell anca');
    expect(normalizza('Vescica urinaria è')).toBe('vescica urinaria e');
  });

  it("trova l'inizio di ogni parola, in qualunque testo della voce", () => {
    expect(corrisponde('card', ['Cuore', 'cor', 'Apparato cardiovascolare'])).toBe(true);
    expect(corrisponde('pulm', ['Polmoni', 'pulmones'])).toBe(true);
    expect(corrisponde('apparato resp', ['Polmoni', 'Apparato respiratorio'])).toBe(true);
  });

  it('non trova parti interne di una parola e richiede tutte le parole', () => {
    expect(corrisponde('ore', ['Cuore'])).toBe(false);
    expect(corrisponde('cuore polm', ['Cuore', 'cor'])).toBe(false);
  });

  it('una ricerca vuota mostra tutto', () => {
    expect(corrisponde('   ', ['Cuore'])).toBe(true);
  });
});
