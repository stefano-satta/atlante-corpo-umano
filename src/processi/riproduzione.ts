import { useCallback, useEffect, useState } from 'react';

/** Durata di ogni passo in riproduzione. È un tempo di lettura, non la durata reale della fase. */
export const DURATA_PASSO_MS = 3200;

/** Passo successivo o precedente, ricominciando dall'inizio dopo l'ultimo (il ciclo si ripete). */
export function passoVicino(attuale: number, totale: number, verso: 1 | -1) {
  return (attuale + verso + totale) % totale;
}

/**
 * Stato della riproduzione di un processo a passi. Parte fermo (WCAG 2.2.2): avanza da solo
 * soltanto dopo Riproduci, e qualsiasi scelta manuale di un passo mette in pausa.
 */
export function useRiproduzione(totale: number) {
  const [passo, impostaPasso] = useState(0);
  const [inRiproduzione, impostaRiproduzione] = useState(false);

  useEffect(() => {
    if (!inRiproduzione) return;
    const t = setInterval(() => impostaPasso((p) => passoVicino(p, totale, 1)), DURATA_PASSO_MS);
    return () => clearInterval(t);
  }, [inRiproduzione, totale]);

  const vai = useCallback((n: number) => {
    impostaRiproduzione(false);
    impostaPasso(n);
  }, []);
  const sposta = useCallback(
    (verso: 1 | -1) => {
      impostaRiproduzione(false);
      impostaPasso((p) => passoVicino(p, totale, verso));
    },
    [totale],
  );

  return {
    passo,
    inRiproduzione,
    vai,
    avanti: () => sposta(1),
    indietro: () => sposta(-1),
    alterna: () => impostaRiproduzione((r) => !r),
    ferma: () => impostaRiproduzione(false),
  };
}
