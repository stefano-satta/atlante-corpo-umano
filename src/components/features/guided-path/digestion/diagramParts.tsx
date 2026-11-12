import type { CSSProperties } from 'react';

// Pezzi comuni agli schemi del percorso "Il viaggio del cibo".

export type { PhasedDiagramProps as DiagramProps } from '../PhasedFigure';

/** Spostamento di un elemento disegnato nell'origine, animato dal CSS (`.moving`). */
export const at = (x: number, y: number, scale = 1, opacity = 1): CSSProperties => ({
  transform: `translate(${x}px, ${y}px) scale(${scale})`,
  opacity,
});

export function Arrowhead({ id, className }: { id: string; className: string }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0 0 L10 5 L0 10 Z" className={className} />
    </marker>
  );
}
