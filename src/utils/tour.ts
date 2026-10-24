import type { AtlasDispatch } from '@/models/atlas';

const KEY = 'atlante.tour';

/** Vero se il tour è già stato visto in questo browser. Senza memoria disponibile si mostra di nuovo. */
export function hasSeenTour() {
  try {
    return localStorage.getItem(KEY) === 'visto';
  } catch {
    return false;
  }
}

function rememberTour() {
  try {
    localStorage.setItem(KEY, 'visto');
  } catch {
    // Memoria del browser non disponibile (navigazione privata, dati bloccati): il tour tornerà.
  }
}

/** Chiude la guida e la segna come vista; il fuoco va al pulsante che la riapre, così si sa dove ritrovarla. */
export function closeTour(dispatch: AtlasDispatch) {
  rememberTour();
  dispatch({ type: 'setTour', step: null });
  requestAnimationFrame(() => document.querySelector<HTMLElement>('.command-help')?.focus());
}
