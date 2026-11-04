export const modelUrl = (file: string) => `/modelli/${file}`;

/** Sotto questa larghezza il cartellino diventa un foglio dal basso e la scheda va a tutto schermo. */
export const NARROW_WIDTH = 760;

/** Da questa larghezza genere e apparati sono una barra laterale fissa; sotto, un menu a comparsa. Vale anche in styles/toolbar.css. */
export const SIDEBAR_WIDTH = 1024;

/**
 * Spazio occupato a sinistra dalla barra laterale, in pixel (margine e larghezza di `.selector-panel`
 * in styles/toolbar.css). Con la scheda aperta la barra non c'è.
 */
export function sidebarInset(viewportWidth: number, sheet: boolean) {
  return viewportWidth >= SIDEBAR_WIDTH && !sheet ? 28 + 288 : 0;
}

/**
 * Larghezza del pannello ancorato a destra, in pixel. Deve restare uguale alle regole
 * di `.panel` in styles/panel.css: serve alla telecamera per centrare la struttura nello spazio libero.
 */
export function panelWidth(viewportWidth: number, sheet: boolean) {
  if (viewportWidth <= NARROW_WIDTH) return 0;
  return sheet ? Math.min(viewportWidth * 0.52, 760) : Math.min(Math.max(viewportWidth / 3, 300), 640);
}
