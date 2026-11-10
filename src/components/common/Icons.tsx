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

export const CloseIcon = () => (
  <svg {...base} aria-hidden="true">
    <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
  </svg>
);

export const MenuIcon = () => (
  <svg {...base} aria-hidden="true">
    <path d="M2.5 4h11M2.5 8h11M2.5 12h11" />
  </svg>
);

export const SlidersIcon = () => (
  <svg {...base} aria-hidden="true">
    <path d="M2 5h6M12 5h2M2 11h2M8 11h6" />
    <circle cx="10" cy="5" r="2" />
    <circle cx="6" cy="11" r="2" />
  </svg>
);

export const ResetViewIcon = () => (
  <svg {...base} aria-hidden="true">
    <path d="M3 8a5 5 0 1 0 1.5-3.5L2.5 6.5" />
    <path d="M2.5 2.5v4h4" />
  </svg>
);

export const UserOutlineIcon = () => (
  <svg {...base} aria-hidden="true">
    <circle cx="8" cy="5" r="2.75" />
    <path d="M2.75 14c0-2.9 2.35-4.75 5.25-4.75s5.25 1.85 5.25 4.75" />
  </svg>
);

export const HelpIcon = () => (
  <svg {...base} aria-hidden="true">
    <path d="M5.25 5.75a2.75 2.75 0 1 1 4.3 2.27C8.6 8.68 8 9.3 8 10.25" />
    <path d="M8 13.1v.01" />
  </svg>
);

export const ForwardIcon = () => (
  <svg {...base} aria-hidden="true">
    <path d="M2.5 8h11M9 3.5L13.5 8 9 12.5" />
  </svg>
);

export const BackIcon = () => (
  <svg {...base} aria-hidden="true">
    <path d="M13.5 8h-11M7 3.5L2.5 8 7 12.5" />
  </svg>
);

export const PlayIcon = () => (
  <svg {...base} aria-hidden="true">
    <path d="M4.5 3v10l8.5-5z" fill="currentColor" />
  </svg>
);

export const PauseIcon = () => (
  <svg {...base} aria-hidden="true">
    <path d="M5 3.5v9M11 3.5v9" strokeWidth={2.25} />
  </svg>
);

export const SoundIcon = () => (
  <svg {...base} aria-hidden="true">
    <path d="M2.5 6h2.5L8.5 3v10L5 10H2.5z" />
    <path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.5a6 6 0 0 1 0 9" />
  </svg>
);

export const SoundOffIcon = () => (
  <svg {...base} aria-hidden="true">
    <path d="M2.5 6h2.5L8.5 3v10L5 10H2.5z" />
    <path d="M11 6l3.5 4M14.5 6L11 10" />
  </svg>
);

export const PreviousIcon = () => (
  <svg {...base} aria-hidden="true">
    <path d="M10 3.5L5.5 8 10 12.5" />
  </svg>
);

export const NextIcon = () => (
  <svg {...base} aria-hidden="true">
    <path d="M6 3.5L10.5 8 6 12.5" />
  </svg>
);
