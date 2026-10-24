// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { calloutPoints } from './calloutPath';

describe('tracciato della linea di richiamo', () => {
  it('sale a 45° e poi prosegue in orizzontale fino al pannello', () => {
    expect(calloutPoints(100, 300, 600, 200)).toBe('100,300 200,200 600,200');
  });

  it('va dritta al titolo quando lo spazio non basta per la diagonale', () => {
    expect(calloutPoints(500, 600, 600, 100)).toBe('500,600 600,100');
  });

  it('sparisce quando la struttura è troppo vicina al pannello o dietro di esso', () => {
    expect(calloutPoints(590, 300, 600, 200)).toBeNull();
    expect(calloutPoints(700, 300, 600, 200)).toBeNull();
  });
});
