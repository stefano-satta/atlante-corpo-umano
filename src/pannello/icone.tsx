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

export const IconaRiproduci = () => (
  <svg {...base} aria-hidden="true">
    <path d="M4.5 3v10l8.5-5z" fill="currentColor" />
  </svg>
);

export const IconaPausa = () => (
  <svg {...base} aria-hidden="true">
    <path d="M5 3.5v9M11 3.5v9" strokeWidth={2.25} />
  </svg>
);

export const IconaPrecedente = () => (
  <svg {...base} aria-hidden="true">
    <path d="M10 3.5L5.5 8 10 12.5" />
  </svg>
);

export const IconaSuccessivo = () => (
  <svg {...base} aria-hidden="true">
    <path d="M6 3.5L10.5 8 6 12.5" />
  </svg>
);
