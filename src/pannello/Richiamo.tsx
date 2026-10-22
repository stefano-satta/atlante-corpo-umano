import { useEffect, useRef } from 'react';
import { useAtlante, useMovimentoRidotto } from '../app/stato';
import { registraRichiamo } from './tracciato-richiamo';

/** Livello SVG della linea di richiamo; la posizione la scrive la scena (vedi tracciato-richiamo.ts). */
export function Richiamo() {
  const { stato } = useAtlante();
  const ridotto = useMovimentoRidotto();
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    registraRichiamo(svg.current);
    return () => registraRichiamo(null);
  }, []);

  // A ogni nuova selezione la linea si traccia dalla struttura verso il pannello,
  // mentre il pannello entra: mostra da dove viene il nome che si sta leggendo.
  useEffect(() => {
    if (!stato.selezione || ridotto) return;
    const linea = svg.current?.querySelector('polyline');
    const punto = svg.current?.querySelector('circle');
    const curva = 'cubic-bezier(0.16, 1, 0.3, 1)';
    punto?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: curva });
    linea?.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
      duration: 520,
      delay: 120,
      easing: curva,
      fill: 'backwards',
    });
  }, [stato.selezione, ridotto]);

  return (
    <svg ref={svg} className="richiamo" data-visibile="no" aria-hidden="true">
      <polyline pathLength={1} strokeDasharray="1 1" />
      <circle r={4} />
    </svg>
  );
}
