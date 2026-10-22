// Icone disegnate per l'atlante: tratto unico di 1,5 px, colore del testo.

const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  focusable: false,
} as const;

export const IconaChiudi = () => (
  <svg {...base} aria-hidden="true">
    <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
  </svg>
);

export const IconaAvanti = () => (
  <svg {...base} aria-hidden="true">
    <path d="M2.5 8h11M9 3.5L13.5 8 9 12.5" />
  </svg>
);

export const IconaIndietro = () => (
  <svg {...base} aria-hidden="true">
    <path d="M13.5 8h-11M7 3.5L2.5 8 7 12.5" />
  </svg>
);
