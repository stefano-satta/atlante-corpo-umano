// @vitest-environment jsdom
import '../../../../test/dom-setup';
import { caricaStruttura } from 'virtual:contenuti';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import type { UrinaryProcess as Process } from '@/models/content';
import UrinaryProcess from './UrinaryProcess';

let urinary: Process;
beforeAll(async () => {
  urinary = (await caricaStruttura.vescica()).default.processi.find((p) => p.schema === 'urinario') as Process;
});

const organ = (id: string) => document.querySelector(`[data-organ="${id}"]`) as SVGGElement | null;
const diagram = () => document.querySelector('.urinary-diagram') as SVGElement;

describe('schema animato dell’apparato urinario', () => {
  it('segue l’urina dai reni all’uretra e segna l’organo della scheda', () => {
    render(<UrinaryProcess process={urinary} current="vescica" body="uomo" />);
    expect(organ('reni')?.dataset.active).toBe('true');
    expect(organ('vescica')?.dataset).toMatchObject({ current: 'true', active: 'false' });
    fireEvent.click(screen.getByRole('button', { name: /Passo 5/ }));
    expect(diagram().dataset.phase).toBe('minzione');
    expect(organ('uretra')?.dataset.active).toBe('true');
    expect(document.querySelector('.sphincters')?.getAttribute('data-open')).toBe('true');
  });

  it('mostra solo il corpo scelto nell’atlante', () => {
    const { unmount } = render(<UrinaryProcess process={urinary} current="vescica" body="uomo" />);
    expect(organ('prostata')).toBeTruthy();
    expect(organ('vagina')).toBeNull();
    unmount();
    render(<UrinaryProcess process={urinary} current="vescica" body="donna" />);
    expect(diagram().dataset.body).toBe('donna');
    expect(organ('prostata')).toBeNull();
    expect(organ('vagina')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Donna' })).toBeNull();
  });
});
