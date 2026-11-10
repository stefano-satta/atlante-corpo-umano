// @vitest-environment jsdom
import '../../../dom-setup';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { SecondaryMenuButton } from '@/components/common/SecondaryMenuButton';
import { AtlasProvider } from '@/contexts/AtlasContext';

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
});

function renderMenu(path = '/esplora/organi') {
  window.history.replaceState(null, '', path);
  return render(
    <BrowserRouter>
      <AtlasProvider>
        <SecondaryMenuButton />
        <p>Fuori dal menu</p>
      </AtlasProvider>
    </BrowserRouter>,
  );
}

const menuButton = () => screen.getByRole('button', { name: 'Altre sezioni' });

describe('SecondaryMenuButton', () => {
  it('apre e chiude il riquadro con Fonti e Informazioni', () => {
    renderMenu();
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('button', { name: /Fonti/ })).toBeNull();

    fireEvent.click(menuButton());
    expect(menuButton().getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: /Fonti/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Informazioni/ })).toBeTruthy();

    fireEvent.click(menuButton());
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
  });

  it('con Esc si chiude e il fuoco torna al pulsante', () => {
    renderMenu();
    fireEvent.click(menuButton());
    screen.getByRole('button', { name: /Fonti/ }).focus();
    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' });
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(menuButton());
  });

  it('si chiude toccando fuori', () => {
    renderMenu();
    fireEvent.click(menuButton());
    fireEvent.pointerDown(screen.getByText('Fuori dal menu'));
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
  });

  it('una voce apre la sua pagina e chiude il menu', () => {
    renderMenu();
    fireEvent.click(menuButton());
    fireEvent.click(screen.getByRole('button', { name: /Fonti/ }));
    expect(window.location.pathname).toBe('/fonti');
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    // Il pulsante resta segnato mentre è aperta una delle sue pagine.
    expect(menuButton().getAttribute('aria-current')).toBe('true');
  });
});
