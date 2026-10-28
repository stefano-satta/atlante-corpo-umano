// @vitest-environment jsdom
import '../../../../test/dom-setup';
import { caricaStruttura } from 'virtual:contenuti';
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import type { Figure } from '@/models/content';
import EarFigure from './EarFigure';

let figure: Figure;
beforeAll(async () => {
  figure = (await caricaStruttura.orecchi()).default.figura as Figure;
});

describe('figura dell’interno dell’orecchio', () => {
  it('sta in "Come è fatto" e numera le undici parti, dal padiglione al nervo', () => {
    expect(figure).toMatchObject({ schema: 'orecchio', sezione: 'Come è fatto' });
    render(<EarFigure figure={figure} />);
    expect(screen.getByRole('figure', { name: "L'interno dell'orecchio" })).toBeTruthy();
    expect(document.querySelectorAll('.ear-diagram .part-label')).toHaveLength(11);
    expect([...document.querySelectorAll('.figure-parts li')].map((li) => li.textContent)).toEqual([
      'Padiglione auricolare',
      'Condotto uditivo',
      'Timpano',
      'Martello',
      'Incudine',
      'Staffa',
      'Tuba uditiva',
      'Vestibolo',
      'Canali semicircolari',
      'Coclea',
      'Nervo vestibolococleare',
    ]);
  });

  it('ogni nome apre la sua voce del glossario, nervo compreso', () => {
    render(<EarFigure figure={figure} />);
    const items = [...document.querySelectorAll<HTMLLIElement>('.figure-parts li')];
    const term = (name: string) => items.find((li) => li.textContent === name)?.querySelector('a')?.dataset.term;
    expect(term('Timpano')).toBe('timpano');
    expect(term('Staffa')).toBe('ossicini');
    expect(term('Nervo vestibolococleare')).toBe('nervo-vestibolococleare');
  });
});
