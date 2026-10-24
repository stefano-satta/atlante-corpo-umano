import { useEffect, useState } from 'react';
import type { BreathPhase } from '@/models/breathing';
import type { PathDiagram } from '@/models/content';

/** Durata di una fase nella riproduzione continua: un tempo di lettura, non quello di un respiro reale. */
const PHASE_DURATION_MS = 2600;

/**
 * Fase da mostrare: quella del passo, oppure, in riproduzione, inspirazione ed espirazione
 * alternate. Entrando in un passo il disegno parte dalla fase precedente e si muove verso
 * quella del passo; con il movimento ridotto la mostra subito.
 */
export function useBreathPhase(diagram: PathDiagram, playing: boolean, reducedMotion: boolean): BreathPhase {
  const goal: BreathPhase = diagram === 'inspirazione' ? 'inhale' : diagram === 'espirazione' ? 'exhale' : 'rest';
  const start: BreathPhase = reducedMotion ? goal : goal === 'inhale' ? 'rest' : goal === 'exhale' ? 'inhale' : goal;
  const [phase, setPhase] = useState<BreathPhase>(start);

  useEffect(() => {
    if (playing) {
      setPhase('inhale');
      const t = setInterval(() => setPhase((p) => (p === 'inhale' ? 'exhale' : 'inhale')), PHASE_DURATION_MS);
      return () => clearInterval(t);
    }
    // Due fotogrammi: il primo disegna la fase di partenza, il secondo avvia la transizione.
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setPhase(goal));
    });
    return () => cancelAnimationFrame(id);
  }, [goal, playing]);

  return phase;
}
