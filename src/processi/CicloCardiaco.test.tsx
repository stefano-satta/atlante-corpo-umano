// @vitest-environment jsdom
import '../../test/ambiente-dom';
import { caricaStruttura } from 'virtual:contenuti';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Processo } from '../contenuti/tipi';
import CicloCardiaco from './CicloCardiaco';
import { DURATA_PASSO_MS, passoVicino } from './riproduzione';

let processo: Processo;
beforeAll(async () => {
  processo = (await caricaStruttura.cuore()).default.processi[0];
});
afterEach(() => vi.useRealTimers());

const passoAttuale = () => screen.getByRole('button', { current: 'step' }).textContent;
const schema = () => document.querySelector('.schema-cuore') as SVGElement;

describe('passi del ciclo', () => {
  it('dopo l’ultimo passo ricomincia dal primo, e viceversa', () => {
    expect(passoVicino(4, 5, 1)).toBe(0);
    expect(passoVicino(0, 5, -1)).toBe(4);
    expect(passoVicino(2, 5, 1)).toBe(3);
  });
});

describe('animazione del ciclo cardiaco', () => {
  it('parte ferma sul primo passo, con didascalia e fonti', () => {
    vi.useFakeTimers();
    render(<CicloCardiaco processo={processo} />);
    expect(passoAttuale()).toBe('1');
    expect(screen.getByRole('heading', { name: 'Le cavità si riempiono' })).toBeTruthy();
    act(() => vi.advanceTimersByTime(DURATA_PASSO_MS * 3));
    expect(passoAttuale()).toBe('1');
    expect(document.querySelectorAll('.ciclo-didascalia .rimando a').length).toBeGreaterThan(0);
  });

  it('con Riproduci avanza da solo; scegliendo un passo si mette in pausa', () => {
    vi.useFakeTimers();
    render(<CicloCardiaco processo={processo} />);
    fireEvent.click(screen.getByRole('button', { name: 'Riproduci' }));
    act(() => vi.advanceTimersByTime(DURATA_PASSO_MS));
    expect(passoAttuale()).toBe('2');
    expect(screen.getByRole('button', { name: 'Pausa' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: /Passo 4/ }));
    act(() => vi.advanceTimersByTime(DURATA_PASSO_MS * 2));
    expect(passoAttuale()).toBe('4');
    expect(screen.getByRole('button', { name: 'Riproduci' })).toBeTruthy();
  });

  it('il disegno segue lo stato del passo: ventricoli contratti, valvole e primo tono', () => {
    render(<CicloCardiaco processo={processo} />);
    fireEvent.click(screen.getByRole('button', { name: /Passo 4/ }));
    expect(schema().dataset).toMatchObject({
      ventricoli: 'contratti',
      av: 'chiuse',
      semilunari: 'aperte',
      segnale: 'ventricoli',
    });
    expect(screen.getByText('Primo tono')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Passo successivo' }));
    expect(schema().dataset.semilunari).toBe('chiuse');
    expect(screen.getByText('Secondo tono')).toBeTruthy();
  });

  it('annuncia la didascalia solo quando non è in riproduzione', () => {
    render(<CicloCardiaco processo={processo} />);
    const didascalia = document.querySelector('.ciclo-didascalia') as HTMLElement;
    expect(didascalia.getAttribute('aria-live')).toBe('polite');
    fireEvent.click(screen.getByRole('button', { name: 'Riproduci' }));
    expect(didascalia.getAttribute('aria-live')).toBe('off');
  });

  it('con il movimento ridotto non offre la riproduzione continua', () => {
    const originale = window.matchMedia;
    window.matchMedia = ((q: string) => ({
      ...originale(q),
      matches: q.includes('reduce'),
    })) as typeof window.matchMedia;
    render(<CicloCardiaco processo={processo} />);
    expect(screen.queryByRole('button', { name: 'Riproduci' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Passo successivo' })).toBeTruthy();
    window.matchMedia = originale;
  });
});
