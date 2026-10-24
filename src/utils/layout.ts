export const modelUrl = (file: string) => `/modelli/${file}`;

/** Sotto questa larghezza il cartellino diventa un foglio dal basso e la scheda va a tutto schermo. */
export const NARROW_WIDTH = 760;

/**
 * Larghezza del pannello ancorato a destra, in pixel. Deve restare uguale alle regole
 * di `.panel` in styles/panel.css: serve alla telecamera per centrare la struttura nello spazio libero.
 */
export function panelWidth(viewportWidth: number, sheet: boolean) {
  if (viewportWidth <= NARROW_WIDTH) return 0;
  return sheet ? Math.min(viewportWidth * 0.52, 760) : Math.min(Math.max(viewportWidth * 0.3, 320), 400);
}
