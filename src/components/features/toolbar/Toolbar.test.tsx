// @vitest-environment jsdom
import '../../../../test/dom-setup';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AtlasProvider } from '@/contexts/AtlasContext';
import { Toolbar } from './Toolbar';

const renderToolbar = () =>
  render(
    <AtlasProvider>
      <Toolbar />
    </AtlasProvider>,
  );

describe('barra dei comandi', () => {
  it('mostra i tre strati come scelta esclusiva, con Organi attivo', () => {
    renderToolbar();
    const layers = within(screen.getByRole('radiogroup', { name: 'Strato visibile' })).getAllByRole('radio');
    expect(layers.map((l) => l.getAttribute('aria-label'))).toEqual(['Scheletro', 'Organi', 'Muscoli']);
    expect(screen.getByRole('radio', { name: 'Organi' }).getAttribute('aria-checked')).toBe('true');
  });

  it('cambia strato al clic', () => {
    renderToolbar();
    fireEvent.click(screen.getByRole('radio', { name: 'Muscoli' }));
    expect(screen.getByRole('radio', { name: 'Muscoli' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('radio', { name: 'Organi' }).getAttribute('aria-checked')).toBe('false');
  });

  it('accende e spegne la sagoma della pelle', () => {
    renderToolbar();
    const skin = screen.getByRole('button', { name: 'Sagoma' });
    expect(skin.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(skin);
    expect(skin.getAttribute('aria-pressed')).toBe('false');
  });

  it('sceglie il corpo; in quello femminile la sagoma non è disponibile', () => {
    renderToolbar();
    expect(screen.getByRole('radio', { name: 'Uomo' }).getAttribute('aria-checked')).toBe('true');
    fireEvent.click(screen.getByRole('radio', { name: 'Donna' }));
    expect(screen.getByRole('radio', { name: 'Donna' }).getAttribute('aria-checked')).toBe('true');
    const skin = screen.getByRole('button', { name: 'Sagoma' });
    expect(skin.hasAttribute('disabled')).toBe(true);
    expect(skin.getAttribute('aria-pressed')).toBe('false');
  });
});
