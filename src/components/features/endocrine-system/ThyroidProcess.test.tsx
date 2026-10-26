// @vitest-environment jsdom
import '../../../../test/dom-setup';
import { caricaStruttura } from 'virtual:contenuti';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import type { ThyroidProcess as Process } from '@/models/content';
import ThyroidProcess from './ThyroidProcess';

let thyroid: Process;
beforeAll(async () => {
  thyroid = (await caricaStruttura.tiroide()).default.processi.find((p) => p.schema === 'tiroide') as Process;
});

const organ = (id: string) => document.querySelector(`[data-organ="${id}"]`) as SVGGElement;
const diagram = () => document.querySelector('.thyroid-diagram') as SVGElement;

describe('schema animato della regolazione della tiroide', () => {
  it('parte dall’ipotalamo e segna l’organo della scheda', () => {
    render(<ThyroidProcess process={thyroid} current="tiroide" />);
    expect(diagram().dataset.phase).toBe('trh');
    expect(organ('ipotalamo').dataset.active).toBe('true');
    expect(organ('tiroide').dataset).toMatchObject({ current: 'true', active: 'false' });
  });

  it('nella retroazione gli ormoni tiroidei frenano ipofisi e ipotalamo', () => {
    render(<ThyroidProcess process={thyroid} current="ipofisi" />);
    fireEvent.click(screen.getByRole('button', { name: /Passo 5/ }));
    expect(diagram().dataset.phase).toBe('retroazione');
    expect(organ('ipotalamo').dataset.active).toBe('true');
    expect(organ('ipofisi').dataset).toMatchObject({ active: 'true', current: 'true' });
    expect(organ('tiroide').dataset.active).toBe('false');
  });
});
