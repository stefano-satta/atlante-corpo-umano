// Preparazione comune ai test dei componenti in jsdom.
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom non implementa matchMedia: per i test il movimento non è ridotto.
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;

afterEach(() => {
  cleanup();
  history.replaceState(null, '', '/');
});
