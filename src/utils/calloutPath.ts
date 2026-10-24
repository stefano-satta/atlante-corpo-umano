// Richiamo da atlante (D16): una linea sottile con un punto collega la struttura
// selezionata al nome nel pannello. La scena chiama `updateCallout` a ogni
// fotogramma con la posizione della struttura sullo schermo; qui si scrive
// direttamente nel DOM, senza passare per React.

import { NARROW_WIDTH } from './layout';

const elements = {
  svg: null as SVGSVGElement | null,
  line: null as SVGPolylineElement | null,
  dot: null as SVGCircleElement | null,
  /** Titolo nel pannello a cui arriva la linea. */
  target: null as HTMLElement | null,
};

export function registerCallout(svg: SVGSVGElement | null) {
  elements.svg = svg;
  elements.line = svg?.querySelector('polyline') ?? null;
  elements.dot = svg?.querySelector('circle') ?? null;
}

export function registerCalloutTarget(title: HTMLElement | null) {
  elements.target = title;
}

// Distanza minima tra la struttura e il pannello perché la linea abbia senso.
const MIN_GAP = 32;

/**
 * Punti della linea: dal punto sulla struttura sale o scende in diagonale a 45°, poi prosegue
 * in orizzontale fino al bordo del pannello. Se lo spazio non basta per la diagonale, la linea
 * va dritta al titolo.
 */
export function calloutPoints(px: number, py: number, edge: number, ty: number): string | null {
  const dx = edge - px;
  if (dx < MIN_GAP) return null;
  const dy = Math.abs(ty - py);
  if (dy > dx - MIN_GAP / 2) return `${px},${py} ${edge},${ty}`;
  return `${px},${py} ${px + dy},${ty} ${edge},${ty}`;
}

/** Aggiorna la linea; `null` la nasconde (nessuna selezione, struttura dietro la telecamera). */
export function updateCallout(point: { x: number; y: number } | null) {
  const { svg, line, dot, target } = elements;
  if (!svg || !line || !dot) return;
  const panel = target?.closest('.panel');
  const points =
    point && target && panel && innerWidth > NARROW_WIDTH
      ? (() => {
          const title = target.getBoundingClientRect();
          // Se il titolo è scorso fuori dalla vista, la linea non ha dove arrivare.
          if (title.bottom < 0 || title.top > innerHeight) return null;
          const edge = panel.getBoundingClientRect().left;
          return calloutPoints(point.x, point.y, edge, title.top + title.height / 2);
        })()
      : null;
  if (!points || !point) {
    svg.dataset.visible = 'no';
    return;
  }
  svg.dataset.visible = 'yes';
  line.setAttribute('points', points);
  dot.setAttribute('cx', String(point.x));
  dot.setAttribute('cy', String(point.y));
}
