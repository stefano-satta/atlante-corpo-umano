import { describe, expect, it } from 'vitest';
import { soundsBetween } from './heartSound';

describe('istanti dei toni del battito', () => {
  it("suona il primo tono quando il ciclo passa per l'inizio della contrazione dei ventricoli", () => {
    expect(soundsBetween(0.1, 0.2)).toEqual(['primo']);
    expect(soundsBetween(0.4, 0.5)).toEqual(['secondo']);
    expect(soundsBetween(0.2, 0.4)).toEqual([]);
  });

  it('non ripete un tono già suonato', () => {
    expect(soundsBetween(0.16, 0.2)).toEqual([]);
  });

  it("riconosce i toni a cavallo dell'inizio di un nuovo ciclo", () => {
    expect(soundsBetween(0.9, 0.17)).toEqual(['primo']);
    expect(soundsBetween(0.9, 0.05)).toEqual([]);
  });

  it('con un fotogramma lento suona entrambi i toni', () => {
    expect(soundsBetween(0.1, 0.5)).toEqual(['primo', 'secondo']);
  });
});
