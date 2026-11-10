/**
 * Logo dell'atlante (D56): il viso di Globo, la mascotte, nel campo di un vetrino. È lo stesso
 * disegno di `public/favicon.svg`; i colori sono quelli dei token, fissi perché il logo ha un
 * fondo proprio e si legge su ogni sfondo. Decorativo: accanto c'è sempre il nome dell'atlante.
 */
export function Logo({ className = 'logo' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="48" fill="#16131f" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#ef8fac" strokeWidth="2.5" />
      <ellipse cx="50" cy="56" rx="26" ry="32" fill="#b8434b" />
      <circle cx="42" cy="48" r="8" fill="#fff" />
      <circle cx="58" cy="48" r="8" fill="#fff" />
      <circle cx="43.5" cy="49.5" r="4" fill="#221a33" />
      <circle cx="59.5" cy="49.5" r="4" fill="#221a33" />
      <path d="M43 65 Q50 71 57 65" fill="none" stroke="#3a1420" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
