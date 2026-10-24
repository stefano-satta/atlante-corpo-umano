import { useCallback, useEffect, useState } from 'react';
import { wrapStep } from '@/utils/steps';

/** Durata di ogni passo in riproduzione. È un tempo di lettura, non la durata reale della fase. */
export const STEP_DURATION_MS = 3200;

/**
 * Stato della riproduzione di un processo a passi. Parte fermo (WCAG 2.2.2): avanza da solo
 * soltanto dopo Riproduci, e qualsiasi scelta manuale di un passo mette in pausa.
 */
export function usePlayback(total: number) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setStep((s) => wrapStep(s, total, 1)), STEP_DURATION_MS);
    return () => clearInterval(t);
  }, [playing, total]);

  const goTo = useCallback((n: number) => {
    setPlaying(false);
    setStep(n);
  }, []);
  const move = useCallback(
    (direction: 1 | -1) => {
      setPlaying(false);
      setStep((s) => wrapStep(s, total, direction));
    },
    [total],
  );

  return {
    step,
    playing,
    goTo,
    next: () => move(1),
    previous: () => move(-1),
    toggle: () => setPlaying((p) => !p),
  };
}
