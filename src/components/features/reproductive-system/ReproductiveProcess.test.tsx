// @vitest-environment jsdom
import '../../../../test/dom-setup';
import { caricaStruttura } from 'virtual:contenuti';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import type { ReproductiveProcess as Process } from '@/models/content';
import ReproductiveProcess from './ReproductiveProcess';

let male: Process;
let female: Process;
beforeAll(async () => {
  male = (await caricaStruttura.prostata()).default.processi[0] as Process;
  female = (await caricaStruttura.utero()).default.processi[0] as Process;
});

const organ = (id: string) => document.querySelector(`[data-organ="${id}"]`) as SVGGElement;

describe('schema animato dell’apparato genitale', () => {
  it('segna l’organo della scheda e colora quelli al lavoro nel passo', () => {
    render(<ReproductiveProcess process={male} current="prostata" />);
    expect(organ('prostata').dataset).toMatchObject({ current: 'true', active: 'false' });
    expect(organ('testicoli').dataset.active).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: /Passo 4/ }));
    expect(organ('prostata').dataset.active).toBe('true');
    expect(organ('vescichette-seminali').dataset.active).toBe('true');
    expect(organ('testicoli').dataset.active).toBe('false');
    expect(document.querySelectorAll('.cycle-caption .citation a').length).toBeGreaterThan(0);
  });

  it('nel corpo femminile segue l’ovocita fino alle mestruazioni', () => {
    render(<ReproductiveProcess process={female} current="utero" />);
    const svg = document.querySelector('.apparatus-diagram') as SVGElement;
    expect(svg.dataset.phase).toBe('follicolo');
    fireEvent.click(screen.getByRole('button', { name: /Passo 5/ }));
    expect(svg.dataset.phase).toBe('mestruazioni');
    expect(organ('vagina').dataset.active).toBe('true');
    expect(screen.getByText('Ovocita')).toBeTruthy();
  });
});
