// @vitest-environment jsdom
import '../../../../test/dom-setup';
import { caricaStruttura } from 'virtual:contenuti';
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import type { Figure } from '@/models/content';
import TeethFigure from './TeethFigure';

let figure: Figure;
beforeAll(async () => {
  figure = (await caricaStruttura.denti()).default.figura as Figure;
});

describe('figura dei denti', () => {
  it('sta in "Come è fatto": 16 denti nell’arcata superiore e una sezione di molare', () => {
    expect(figure).toMatchObject({ schema: 'denti', sezione: 'Come è fatto' });
    render(<TeethFigure figure={figure} />);
    expect(screen.getByRole('figure', { name: 'Tipi di denti e struttura di un dente' })).toBeTruthy();
    expect(document.querySelectorAll('.teeth-diagram .tooth')).toHaveLength(16);
    expect(document.querySelectorAll('.teeth-diagram .tooth.molar')).toHaveLength(6);
    expect(document.querySelectorAll('.teeth-diagram .part-label')).toHaveLength(19);
  });

  it('numera gli otto denti dal centro verso il fondo, poi le parti del dente', () => {
    render(<TeethFigure figure={figure} />);
    const names = [...document.querySelectorAll('.figure-parts li')].map((li) => li.textContent);
    expect(names.slice(0, 8)).toEqual([
      'Incisivo centrale (7-8 anni)',
      'Incisivo laterale (8-9 anni)',
      'Canino (11-12 anni)',
      'Primo premolare (9-10 anni)',
      'Secondo premolare (10-12 anni)',
      'Primo molare (6-7 anni)',
      'Secondo molare (12-13 anni)',
      'Terzo molare, o dente del giudizio',
    ]);
    expect(names.slice(8)).toEqual([
      'Corona',
      'Colletto',
      'Radice',
      'Smalto',
      'Dentina',
      'Cavità della polpa, con vasi e nervi',
      'Gengiva',
      'Cemento',
      'Legamento periodontale',
      'Canale radicolare',
      'Osso',
    ]);
  });
});
