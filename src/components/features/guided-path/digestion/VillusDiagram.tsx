import { at, type DiagramProps } from './diagramParts';

/* 6 · Un villo dell'intestino tenue, in sezione. */

type Particle = { kind: 'sugar' | 'amino' | 'fat'; pos: Record<string, [number, number]> };
// Posizioni nelle tre fasi: sull'orletto a spazzola, nei capillari (zuccheri e amminoacidi) o
// nel vaso chilifero (grassi). Le catene si separano sull'orletto.
const PARTICLES: Particle[] = [
  { kind: 'sugar', pos: { orletto: [146, 70], capillari: [146, 150], chilifero: [140, 236] } },
  { kind: 'sugar', pos: { orletto: [156, 62], capillari: [212, 180], chilifero: [218, 240] } },
  { kind: 'sugar', pos: { orletto: [166, 56], capillari: [216, 214], chilifero: [222, 270] } },
  { kind: 'amino', pos: { orletto: [196, 56], capillari: [204, 128], chilifero: [220, 252] } },
  { kind: 'amino', pos: { orletto: [206, 62], capillari: [214, 158], chilifero: [218, 228] } },
  { kind: 'amino', pos: { orletto: [216, 70], capillari: [154, 194], chilifero: [148, 262] } },
  { kind: 'fat', pos: { orletto: [104, 40], capillari: [170, 70], chilifero: [180, 150] } },
  { kind: 'fat', pos: { orletto: [256, 40], capillari: [190, 70], chilifero: [180, 200] } },
  { kind: 'fat', pos: { orletto: [180, 30], capillari: [180, 60], chilifero: [180, 246] } },
];

export function VillusDiagram({ phase }: DiagramProps) {
  const villus = 'M120 266 C118 180 124 110 148 92 C166 78 194 78 212 92 C236 110 242 180 240 266';
  return (
    <svg className="digestion-diagram villus-diagram" viewBox="0 0 360 320" aria-hidden="true" data-phase={phase}>
      <defs>
        <linearGradient id="villus-blood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" className="stop-rich" />
          <stop offset="1" className="stop-poor" />
        </linearGradient>
      </defs>
      <rect className="lumen" x="0" y="0" width="360" height="300" />
      <path className="wall" d="M0 266 L360 266 L360 300 L0 300 Z" />
      <path className="villus side" d="M30 266 C28 200 36 150 60 150 C84 150 92 200 90 266" />
      <path className="villus side" d="M270 266 C268 200 276 150 300 150 C324 150 332 200 330 266" />
      <path className="villus" d={villus} />
      <path className="brush" d={villus} />
      <path
        className="capillary"
        d="M140 268 C138 200 140 140 156 110 C168 96 192 96 204 110 C220 140 222 200 220 268"
      />
      <path className="capillary thin" d="M146 230 C170 220 194 220 216 230 M144 170 C170 160 194 160 218 170" />
      <path className="lacteal" d="M180 280 L180 132" />
      <path className="lymph-vessel" d="M100 284 L260 284" />
      <path className="vein" d="M220 270 C240 286 280 292 360 292" />

      <g className="flow-dash" data-visible={phase === 'capillari'}>
        <path d="M204 110 C220 140 222 200 220 268" />
      </g>
      <g className="flow-dash lymph" data-visible={phase === 'chilifero'}>
        <path d="M180 132 L180 280" />
      </g>

      {PARTICLES.map((p, i) => {
        const [x, y] = p.pos[phase] ?? p.pos.orletto;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: le particelle sono fisse e non cambiano ordine
          <g key={i} className={`moving particle ${p.kind}`} style={at(x, y)}>
            {p.kind === 'fat' ? (
              <circle r="5" />
            ) : (
              <rect x="-3.5" y="-3.5" width="7" height="7" rx={p.kind === 'amino' ? 3.5 : 1} />
            )}
          </g>
        );
      })}

      <g className="labels">
        <text x="10" y="22" className="minor">
          Lume dell'intestino
        </text>
        <text x="250" y="96">
          Villo
        </text>
        <text x="246" y="116" className="minor">
          microvilli
        </text>
        <text x="96" y="132" className="minor" textAnchor="end">
          capillari
        </text>
        <text x="250" y="138" className="minor">
          vaso chilifero
        </text>
        <text x="8" y="314" className="minor">
          verso i vasi linfatici
        </text>
        <text x="352" y="314" className="minor" textAnchor="end">
          verso la vena porta
        </text>
      </g>
    </svg>
  );
}
