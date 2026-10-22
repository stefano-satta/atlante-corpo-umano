// Parametri leggibili dall'indirizzo:
//   ?misure=1   mostra il pannello delle misure di prestazione
const parametri = new URLSearchParams(location.search);

export const CONFIG = {
  misure: parametri.get('misure') === '1',
};

export const percorsoModelli = (file: string) => `/modelli/${file}`;

/** Sotto questa larghezza il cartellino diventa un foglio dal basso e la scheda va a tutto schermo. */
export const LARGHEZZA_STRETTA = 760;

/**
 * Larghezza del pannello ancorato a destra, in pixel. Deve restare uguale alle regole
 * di `.pannello` in stile.css: serve alla telecamera per centrare la struttura nello spazio libero.
 */
export function larghezzaPannello(finestra: number, scheda: boolean) {
  if (finestra <= LARGHEZZA_STRETTA) return 0;
  return scheda ? Math.min(finestra * 0.52, 760) : Math.min(Math.max(finestra * 0.3, 320), 400);
}
