// @vitest-environment jsdom
import '../../../../test/dom-setup';
import { caricaStruttura } from 'virtual:contenuti';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import type { VisionProcess as Process } from '@/models/content';
import VisionProcess from './VisionProcess';

let vision: Process;
beforeAll(async () => {
  vision = (await caricaStruttura.occhi()).default.processi.find((p) => p.schema === 'vista') as Process;
});

const organ = (id: string) => document.querySelector(`[data-organ="${id}"]`) as SVGGElement;
const diagram = () => document.querySelector('.vision-diagram') as SVGElement;

describe('schema animato della vista', () => {
  it('parte dalla cornea e segna le parti dell’occhio nella sua scheda', () => {
    render(<VisionProcess process={vision} current="occhi" />);
    expect(diagram().dataset.phase).toBe('cornea');
    expect(organ('cornea').dataset.active).toBe('true');
    expect(organ('sclera').dataset.current).toBe('true');
    expect(organ('chiasma').dataset.current).toBe('false');
  });

  it('nel chiasma le fibre si accendono e il nervo ottico è l’organo della scheda', () => {
    render(<VisionProcess process={vision} current="nervo-ottico" />);
    fireEvent.click(screen.getByRole('button', { name: /Passo 5/ }));
    expect(diagram().dataset.phase).toBe('chiasma');
    expect(organ('chiasma').dataset).toMatchObject({ active: 'true', current: 'true' });
    expect(document.querySelectorAll('.fibers path[data-on="true"]')).toHaveLength(4);
  });
});
