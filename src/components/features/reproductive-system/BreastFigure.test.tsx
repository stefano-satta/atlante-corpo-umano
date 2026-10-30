// @vitest-environment jsdom
import '../../../../test/dom-setup';
import { caricaStruttura } from 'virtual:contenuti';
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import type { Figure } from '@/models/content';
import BreastFigure from './BreastFigure';

let figure: Figure;
beforeAll(async () => {
  figure = (await caricaStruttura.mammelle()).default.figura as Figure;
});

describe('figura dell’interno della mammella', () => {
  it('sta in "Come è fatto" e numera le nove parti, dal capezzolo al muscolo', () => {
    expect(figure).toMatchObject({ schema: 'mammella', sezione: 'Come è fatto' });
    render(<BreastFigure figure={figure} />);
    expect(screen.getByRole('figure', { name: "L'interno della mammella" })).toBeTruthy();
    expect(document.querySelectorAll('.breast-diagram .part-label')).toHaveLength(9);
    expect([...document.querySelectorAll('.figure-parts li')].map((li) => li.textContent)).toEqual([
      'Capezzolo',
      'Areola',
      'Seno galattoforo',
      'Dotto galattoforo',
      'Lobulo',
      'Lobo',
      'Tessuto adiposo',
      'Legamento sospensore',
      'Muscolo grande pettorale',
    ]);
  });

  it('ogni nome apre la sua voce del glossario', () => {
    render(<BreastFigure figure={figure} />);
    const items = [...document.querySelectorAll<HTMLLIElement>('.figure-parts li')];
    const term = (name: string) => items.find((li) => li.textContent === name)?.querySelector('a')?.dataset.term;
    expect(term('Capezzolo')).toBe('capezzolo');
    expect(term('Legamento sospensore')).toBe('legamenti-sospensori');
    expect(term('Muscolo grande pettorale')).toBe('muscolo-grande-pettorale');
  });
});
