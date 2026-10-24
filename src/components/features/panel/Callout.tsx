import { useEffect, useRef } from 'react';
import { useAtlas } from '@/hooks/useAtlas';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { registerCallout } from '@/utils/calloutPath';

/** Livello SVG della linea di richiamo; la posizione la scrive la scena (vedi utils/calloutPath.ts). */
export function Callout() {
  const { state } = useAtlas();
  const reducedMotion = useReducedMotion();
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    registerCallout(svg.current);
    return () => registerCallout(null);
  }, []);

  // A ogni nuova selezione la linea si traccia dalla struttura verso il pannello,
  // mentre il pannello entra: mostra da dove viene il nome che si sta leggendo.
  useEffect(() => {
    if (!state.selection || reducedMotion) return;
    const line = svg.current?.querySelector('polyline');
    const dot = svg.current?.querySelector('circle');
    const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';
    dot?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing });
    line?.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
      duration: 520,
      delay: 120,
      easing,
      fill: 'backwards',
    });
  }, [state.selection, reducedMotion]);

  return (
    <svg ref={svg} className="callout" data-visible="no" aria-hidden="true">
      <polyline pathLength={1} strokeDasharray="1 1" />
      <circle r={4} />
    </svg>
  );
}
