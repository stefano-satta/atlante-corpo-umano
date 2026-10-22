// @vitest-environment jsdom
import '../../test/ambiente-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProviderAtlante } from '../app/stato';
import { BarraComandi } from './BarraComandi';

const barra = () =>
  render(
    <ProviderAtlante>
      <BarraComandi />
    </ProviderAtlante>,
  );

describe('barra dei comandi', () => {
  it('mostra i tre strati come scelta esclusiva, con Scheletro e organi attivo', () => {
    barra();
    const strati = screen.getAllByRole('radio');
    expect(strati.map((s) => s.getAttribute('aria-label'))).toEqual(['Muscoli', 'Scheletro e organi', 'Scheletro']);
    expect(screen.getByRole('radio', { name: 'Scheletro e organi' }).getAttribute('aria-checked')).toBe('true');
  });

  it('cambia strato al clic', () => {
    barra();
    fireEvent.click(screen.getByRole('radio', { name: 'Muscoli' }));
    expect(screen.getByRole('radio', { name: 'Muscoli' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('radio', { name: 'Scheletro e organi' }).getAttribute('aria-checked')).toBe('false');
  });

  it('accende e spegne la sagoma della pelle', () => {
    barra();
    const sagoma = screen.getByRole('button', { name: 'Sagoma' });
    expect(sagoma.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(sagoma);
    expect(sagoma.getAttribute('aria-pressed')).toBe('false');
  });
});
