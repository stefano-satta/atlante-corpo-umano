// Richiamo da atlante (D16): una linea sottile con un punto collega la struttura
// selezionata al nome nel pannello. La scena chiama `aggiornaRichiamo` a ogni
// fotogramma con la posizione della struttura sullo schermo; qui si scrive
// direttamente nel DOM, senza passare per React.

import { LARGHEZZA_STRETTA } from '../app/config';

const elementi = {
  svg: null as SVGSVGElement | null,
  linea: null as SVGPolylineElement | null,
  punto: null as SVGCircleElement | null,
  /** Titolo nel pannello a cui arriva la linea. */
  bersaglio: null as HTMLElement | null,
};

export function registraRichiamo(svg: SVGSVGElement | null) {
  elementi.svg = svg;
  elementi.linea = svg?.querySelector('polyline') ?? null;
  elementi.punto = svg?.querySelector('circle') ?? null;
}

export function registraBersaglio(titolo: HTMLElement | null) {
  elementi.bersaglio = titolo;
}

// Distanza minima tra la struttura e il pannello perché la linea abbia senso.
const SPAZIO_MINIMO = 32;

/**
 * Punti della linea: dal punto sulla struttura sale o scende in diagonale a 45°, poi prosegue
 * in orizzontale fino al bordo del pannello. Se lo spazio non basta per la diagonale, la linea
 * va dritta al titolo.
 */
export function tracciato(px: number, py: number, bordo: number, ty: number): string | null {
  const dx = bordo - px;
  if (dx < SPAZIO_MINIMO) return null;
  const dy = Math.abs(ty - py);
  if (dy > dx - SPAZIO_MINIMO / 2) return `${px},${py} ${bordo},${ty}`;
  return `${px},${py} ${px + dy},${ty} ${bordo},${ty}`;
}

/** Aggiorna la linea; `null` la nasconde (nessuna selezione, struttura dietro la telecamera). */
export function aggiornaRichiamo(punto: { x: number; y: number } | null) {
  const { svg, linea, punto: cerchio, bersaglio } = elementi;
  if (!svg || !linea || !cerchio) return;
  const pannello = bersaglio?.closest('.pannello');
  const punti =
    punto && bersaglio && pannello && innerWidth > LARGHEZZA_STRETTA
      ? (() => {
          const titolo = bersaglio.getBoundingClientRect();
          // Se il titolo è scorso fuori dalla vista, la linea non ha dove arrivare.
          if (titolo.bottom < 0 || titolo.top > innerHeight) return null;
          const bordo = pannello.getBoundingClientRect().left;
          return tracciato(punto.x, punto.y, bordo, titolo.top + titolo.height / 2);
        })()
      : null;
  if (!punti || !punto) {
    svg.dataset.visibile = 'no';
    return;
  }
  svg.dataset.visibile = 'si';
  linea.setAttribute('points', punti);
  cerchio.setAttribute('cx', String(punto.x));
  cerchio.setAttribute('cy', String(punto.y));
}
