import { type FigurePart, PartLabel } from '@/components/features/panel/AnatomyFigure';

// Spaccato dell'orecchio destro visto dal davanti, disegnato per l'atlante: a sinistra l'esterno
// della testa, a destra il suo centro. Le parti indicate sono quelle descritte dalle fonti della
// scheda degli orecchi (OpenStax 14.1, NIDCD); forme, proporzioni e giri della coclea sono
// semplificati e non in scala.

export const EAR_PARTS: FigurePart[] = [
  {
    term: 'padiglione-auricolare',
    name: 'Padiglione auricolare',
    lines: ['Padiglione', 'auricolare'],
    target: [214, 140],
    side: 'left',
    y: 120,
  },
  { term: 'condotto-uditivo', name: 'Condotto uditivo', target: [330, 226], side: 'left', y: 380, x: 330 },
  { term: 'timpano', name: 'Timpano', target: [407, 218], side: 'left', y: 420, x: 420 },
  { term: 'ossicini', name: 'Martello', target: [432, 166], side: 'left', y: 74, x: 390 },
  { term: 'ossicini', name: 'Incudine', target: [452, 160], side: 'right', y: 64, x: 470 },
  { term: 'ossicini', name: 'Staffa', target: [476, 208], side: 'left', y: 330, x: 440 },
  { term: 'tuba-uditiva', name: 'Tuba uditiva', target: [560, 372], side: 'right', y: 384 },
  { term: 'vestibolo', name: 'Vestibolo', target: [512, 212], side: 'right', y: 200 },
  {
    term: 'canali-semicircolari',
    name: 'Canali semicircolari',
    lines: ['Canali', 'semicircolari'],
    target: [548, 112],
    side: 'right',
    y: 112,
  },
  { term: 'coclea', name: 'Coclea', target: [572, 272], side: 'right', y: 306 },
  {
    term: 'nervo-vestibolococleare',
    name: 'Nervo vestibolococleare',
    lines: ['Nervo', 'vestibolococleare'],
    target: [600, 236],
    side: 'right',
    y: 252,
  },
];

const COLUMNS = { left: 170, right: 625 };

/** Spirale della coclea: dal vestibolo verso il centro, in due giri e mezzo. */
function cochleaPath(cx: number, cy: number) {
  const start = Math.atan2(-36, -28);
  const points: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const angle = start + t * 5 * Math.PI;
    const r = 40 - 33 * t;
    points.push(`${(cx + r * Math.cos(angle)).toFixed(1)} ${(cy + r * Math.sin(angle)).toFixed(1)}`);
  }
  return `M${points.join(' L ')}`;
}

export function EarDiagram() {
  return (
    <svg className="anatomy-diagram ear-diagram" viewBox="0 0 780 460" aria-hidden="true">
      <text className="orientation" x="110" y="452" textAnchor="middle">
        Verso l'esterno
      </text>
      <text className="orientation" x="776" y="452" textAnchor="end">
        Verso il centro della testa
      </text>

      {/* Le tre parti dell'orecchio, dal padiglione al nervo. */}
      <g className="divisions">
        <path d="M200 40 L 200 34 L 404 34 L 404 40" />
        <path d="M410 40 L 410 34 L 486 34 L 486 40" />
        <path d="M492 40 L 492 34 L 604 34 L 604 40" />
      </g>
      <text className="region" x="302" y="24" textAnchor="middle">
        orecchio esterno
      </text>
      <text className="region" x="448" y="24" textAnchor="middle">
        orecchio medio
      </text>
      <text className="region" x="548" y="24" textAnchor="middle">
        orecchio interno
      </text>

      {/* Lato della testa: la pelle e, dentro, l'osso temporale che contiene orecchio medio e interno. */}
      <path className="skin-line" d="M290 56 C 282 160 282 300 290 420" />
      <path
        className="bone"
        d="M300 80 C 420 56 600 66 680 120 C 720 200 712 330 660 400 C 560 436 400 436 300 404 Z"
      />
      <path
        className="auricle"
        d="M285 160 C 260 120 240 70 222 66 C 200 64 192 110 198 170 C 204 230 196 290 212 322 C 224 344 250 336 262 312 C 272 292 280 270 285 250 Z"
      />

      {/* Spazi pieni d'aria: condotto uditivo, cassa dell'orecchio medio, tuba uditiva. */}
      <path className="air" d="M266 202 C 320 198 370 196 404 192 L 410 244 C 370 238 320 236 266 232 Z" />
      <path className="air" d="M410 150 C 440 140 476 142 488 160 L 488 254 C 476 270 440 272 412 262 Z" />
      <path className="tube-wall" d="M470 262 C 500 300 540 350 590 410" />
      <path className="tube" d="M470 262 C 500 300 540 350 590 410" />
      <text className="region" x="596" y="430" textAnchor="middle">
        verso la faringe
      </text>

      <path className="tympanum" d="M402 188 L 412 246" />

      {/* Ossicini: martello attaccato al timpano, incudine, staffa sulla finestra ovale. */}
      <g className="ossicle">
        <path className="limb" d="M430 172 L 408 222" />
        <circle cx="432" cy="166" r="9" />
        <ellipse cx="450" cy="164" rx="10" ry="8" />
        <path className="limb" d="M452 170 L 462 204" />
        <path className="stirrup" d="M464 208 L 486 197 M464 208 L 486 219" />
        <path className="limb" d="M488 195 L 488 221" />
      </g>

      {/* Orecchio interno e nervo vestibolococleare verso il tronco encefalico. */}
      <path className="nerve" d="M528 214 C 556 222 580 230 600 236 M560 262 C 576 250 588 240 600 236" />
      <path className="labyrinth-duct" d={cochleaPath(552, 270)} />
      <g className="labyrinth-duct">
        <path d="M500 192 C 470 150 480 104 510 104 C 540 104 548 150 522 190" />
        <path d="M526 198 C 560 196 596 170 586 140 C 576 112 540 122 530 160 L 528 190" />
        <path d="M530 206 C 560 216 592 206 590 192 C 588 178 556 178 530 198" />
      </g>
      <ellipse className="vestibule" cx="510" cy="205" rx="22" ry="17" />

      {EAR_PARTS.map((p, i) => (
        <PartLabel key={p.name} part={p} n={i + 1} columns={COLUMNS} />
      ))}
    </svg>
  );
}
