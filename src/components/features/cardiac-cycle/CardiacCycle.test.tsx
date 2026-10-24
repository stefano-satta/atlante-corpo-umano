// @vitest-environment jsdom
import '../../../../test/dom-setup';
import { caricaStruttura } from 'virtual:contenuti';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { STEP_DURATION_MS } from '@/hooks/usePlayback';
import type { Process } from '@/models/content';
import { wrapStep } from '@/utils/steps';
import CardiacCycle from './CardiacCycle';

let heartCycle: Process;
beforeAll(async () => {
  heartCycle = (await caricaStruttura.cuore()).default.processi[0];
});
afterEach(() => vi.useRealTimers());

const currentStep = () => screen.getByRole('button', { current: 'step' }).textContent;
const diagram = () => document.querySelector('.heart-diagram') as SVGElement;

describe('passi del ciclo', () => {
  it('dopo l’ultimo passo ricomincia dal primo, e viceversa', () => {
    expect(wrapStep(4, 5, 1)).toBe(0);
    expect(wrapStep(0, 5, -1)).toBe(4);
    expect(wrapStep(2, 5, 1)).toBe(3);
  });
});

describe('animazione del ciclo cardiaco', () => {
  it('parte ferma sul primo passo, con didascalia e fonti', () => {
    vi.useFakeTimers();
    render(<CardiacCycle process={heartCycle} />);
    expect(currentStep()).toBe('1');
    expect(screen.getByRole('heading', { name: 'Le cavità si riempiono' })).toBeTruthy();
    act(() => vi.advanceTimersByTime(STEP_DURATION_MS * 3));
    expect(currentStep()).toBe('1');
    expect(document.querySelectorAll('.cycle-caption .citation a').length).toBeGreaterThan(0);
  });

  it('con Riproduci avanza da solo; scegliendo un passo si mette in pausa', () => {
    vi.useFakeTimers();
    render(<CardiacCycle process={heartCycle} />);
    fireEvent.click(screen.getByRole('button', { name: 'Riproduci' }));
    act(() => vi.advanceTimersByTime(STEP_DURATION_MS));
    expect(currentStep()).toBe('2');
    expect(screen.getByRole('button', { name: 'Pausa' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: /Passo 4/ }));
    act(() => vi.advanceTimersByTime(STEP_DURATION_MS * 2));
    expect(currentStep()).toBe('4');
    expect(screen.getByRole('button', { name: 'Riproduci' })).toBeTruthy();
  });

  it('il disegno segue lo stato del passo: ventricoli contratti, valvole e primo tono', () => {
    render(<CardiacCycle process={heartCycle} />);
    fireEvent.click(screen.getByRole('button', { name: /Passo 4/ }));
    expect(diagram().dataset).toMatchObject({
      ventricles: 'contratti',
      av: 'chiuse',
      semilunar: 'aperte',
      signal: 'ventricoli',
    });
    expect(screen.getByText('Primo tono')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Passo successivo' }));
    expect(diagram().dataset.semilunar).toBe('chiuse');
    expect(screen.getByText('Secondo tono')).toBeTruthy();
  });

  it('annuncia la didascalia solo quando non è in riproduzione', () => {
    render(<CardiacCycle process={heartCycle} />);
    const caption = document.querySelector('.cycle-caption') as HTMLElement;
    expect(caption.getAttribute('aria-live')).toBe('polite');
    fireEvent.click(screen.getByRole('button', { name: 'Riproduci' }));
    expect(caption.getAttribute('aria-live')).toBe('off');
  });

  it('con il movimento ridotto non offre la riproduzione continua', () => {
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({
      ...original(q),
      matches: q.includes('reduce'),
    })) as typeof window.matchMedia;
    render(<CardiacCycle process={heartCycle} />);
    expect(screen.queryByRole('button', { name: 'Riproduci' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Passo successivo' })).toBeTruthy();
    window.matchMedia = original;
  });
});
