// @vitest-environment jsdom
import '../../../../test/dom-setup';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { AtlasProvider } from '@/contexts/AtlasContext';
import { BodySwitch } from './BodySwitch';
import { LayerSwitch } from './LayerSwitch';
import { Toolbar } from './Toolbar';

const renderToolbar = () =>
  render(
    <MemoryRouter>
      <AtlasProvider>
        <BodySwitch />
        <LayerSwitch />
        <Toolbar />
      </AtlasProvider>
    </MemoryRouter>,
  );

describe('barra dei comandi', () => {
  it('mostra gli apparati come scelta esclusiva, con Organi attivo', () => {
    renderToolbar();
    const layers = within(screen.getByRole('radiogroup', { name: 'Apparati' })).getAllByRole('radio');
    expect(layers.map((l) => l.textContent)).toEqual([
      'Organi',
      'Scheletro',
      'Muscoli',
      'Cardiocircolatorio',
      'Nervoso',
    ]);
    expect(screen.getByRole('radio', { name: 'Organi' }).getAttribute('aria-checked')).toBe('true');
    expect(within(screen.getByRole('toolbar')).queryByRole('radiogroup', { name: 'Apparati' })).toBeNull();
  });

  it('le frecce cambiano voce e spostano il fuoco; Tab entra solo sulla voce attiva', () => {
    renderToolbar();
    const organs = screen.getByRole('radio', { name: 'Organi' });
    const skeleton = screen.getByRole('radio', { name: 'Scheletro' });
    expect(organs.tabIndex).toBe(0);
    expect(skeleton.tabIndex).toBe(-1);
    organs.focus();
    fireEvent.keyDown(organs, { key: 'ArrowDown' });
    expect(skeleton.getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(skeleton);
    fireEvent.keyDown(skeleton, { key: 'ArrowUp' });
    fireEvent.keyDown(organs, { key: 'ArrowUp' });
    expect(screen.getByRole('radio', { name: 'Nervoso' }).getAttribute('aria-checked')).toBe('true');
  });

  it('cambia apparato al clic', () => {
    renderToolbar();
    fireEvent.click(screen.getByRole('radio', { name: 'Muscoli' }));
    expect(screen.getByRole('radio', { name: 'Muscoli' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('radio', { name: 'Organi' }).getAttribute('aria-checked')).toBe('false');
  });

  it('i comandi sono a icona, con nome e suggerimento uguali, nell’ordine richiesto', () => {
    renderToolbar();
    const commands = within(screen.getByRole('toolbar')).getAllByRole('button');
    expect(commands.map((c) => c.getAttribute('aria-label'))).toEqual(['Vista iniziale', 'Sagoma', 'Aiuto']);
    expect(commands.map((c) => c.textContent)).toEqual(['Vista iniziale', 'Sagoma', 'Aiuto']);
  });

  it('accende e spegne la sagoma della pelle', () => {
    renderToolbar();
    const skin = screen.getByRole('button', { name: 'Sagoma' });
    expect(skin.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(skin);
    expect(skin.getAttribute('aria-pressed')).toBe('false');
  });

  it('sceglie il genere fuori dalla barra; nel corpo femminile la sagoma non è disponibile', () => {
    renderToolbar();
    expect(within(screen.getByRole('toolbar')).queryByRole('radiogroup', { name: 'Genere' })).toBeNull();
    expect(screen.getByRole('radio', { name: 'Uomo' }).getAttribute('aria-checked')).toBe('true');
    fireEvent.click(screen.getByRole('radio', { name: 'Donna' }));
    expect(screen.getByRole('radio', { name: 'Donna' }).getAttribute('aria-checked')).toBe('true');
    const skin = screen.getByRole('button', { name: 'Sagoma' });
    expect(skin.hasAttribute('disabled')).toBe(true);
    expect(skin.getAttribute('aria-pressed')).toBe('false');
  });
});
