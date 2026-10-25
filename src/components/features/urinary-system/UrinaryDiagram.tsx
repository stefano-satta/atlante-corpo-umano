import { Flow, Organ } from '@/components/features/reproductive-system/DiagramParts';
import type { BodyKind } from '@/models/atlas';
import type { UrinaryPhase } from '@/models/content';

// Schema frontale dell'apparato urinario, disegnato per l'atlante. Come negli altri schemi, il
// lato destro del corpo è a sinistra di chi guarda: lì il rene è un po' più in basso, perché il
// fegato lo spinge giù (SEER). Forme e proporzioni sono semplificate e non in scala. Gli ureteri,
// che il modello 3D non contiene, esistono solo qui.

/** Organi al lavoro in ogni fase: si colorano nel disegno. */
const ACTIVE: Record<UrinaryPhase, string[]> = {
  filtrazione: ['reni'],
  riassorbimento: ['reni'],
  ureteri: ['ureteri'],
  riempimento: ['vescica'],
  minzione: ['vescica', 'uretra'],
};

/** Livello dell'urina nella vescica in ogni fase: frazione dell'altezza, dal fondo. */
const FILL: Record<UrinaryPhase, number> = {
  filtrazione: 0.15,
  riassorbimento: 0.15,
  ureteri: 0.4,
  riempimento: 0.85,
  minzione: 0.15,
};

const mirror = (x: number) => 520 - x;
const mirrored = (d: string) => d.replace(/(\d+) (\d+)/g, (_, x, y) => `${mirror(Number(x))} ${y}`);

/** Rene destro del corpo (a sinistra di chi guarda), con l'ilo rivolto verso la colonna. */
const KIDNEY =
  'M140 66 C 104 68 98 116 104 146 C 110 176 134 188 154 180 C 168 174 168 158 160 148 C 154 140 156 124 164 116 C 176 102 174 64 140 66 Z';
// Il rene sinistro del corpo sta un po' più in alto.
const KIDNEY_LEFT = mirrored(KIDNEY).replace(/(\d+) (\d+)/g, (_, x, y) => `${x} ${Number(y) - 12}`);
const URETER = 'M162 132 C 196 150 206 200 212 228 C 218 256 224 270 236 280';
const URETER_LEFT = mirrored(URETER).replace(
  /(\d+) (\d+)/g,
  (_, x, y) => `${x} ${Number(y) - (Number(y) < 200 ? 12 : 0)}`,
);

const BLADDER = { cx: 260, cy: 288, rx: 64, ry: 46 };

export function UrinaryDiagram({ phase, current, body }: { phase: UrinaryPhase; current: string; body: BodyKind }) {
  const active = new Set(ACTIVE[phase]);
  const organ = (id: string) => ({ id, active: active.has(id), current: current === id });
  const male = body === 'uomo';
  // L'uretra parte dal fondo della vescica; nell'uomo attraversa prostata e pene, nella donna è breve.
  const urethraEnd = male ? 456 : 384;
  const floor = male ? 366 : 360;
  const top = BLADDER.cy - BLADDER.ry;
  const height = BLADDER.ry * 2;
  const level = top + height * (1 - FILL[phase]);

  return (
    <svg
      className="apparatus-diagram urinary-diagram"
      viewBox="0 0 520 470"
      aria-hidden="true"
      data-phase={phase}
      data-body={body}
    >
      <defs>
        <marker id="urinary-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" className="arrowhead" />
        </marker>
        <clipPath id="urinary-bladder-clip">
          <ellipse cx={BLADDER.cx} cy={BLADDER.cy} rx={BLADDER.rx - 4} ry={BLADDER.ry - 4} />
        </clipPath>
      </defs>
      <text className="orientation" x="10" y="16">
        Destra del corpo
      </text>
      <text className="orientation" x="510" y="16" textAnchor="end">
        Sinistra del corpo
      </text>

      {/* Contesto: aorta e arterie renali, pavimento pelvico. */}
      <path className="context-line aorta" d="M260 30 V 250" />
      <path className="context-line" d="M260 116 L 168 124 M260 104 L 352 112" />
      <path className="context pelvic-floor" d={`M196 ${floor} H 324`} />

      <Organ {...organ('reni')}>
        <path d={KIDNEY} />
        <path d={KIDNEY_LEFT} />
      </Organ>
      <Organ {...organ('ureteri')} duct thin>
        <path d={URETER} />
        <path d={URETER_LEFT} />
      </Organ>
      {male && (
        <Organ {...organ('pene')}>
          <rect x="240" y="374" width="40" height="88" rx="18" />
        </Organ>
      )}
      {!male && (
        <Organ {...organ('vagina')}>
          <ellipse cx="260" cy="406" rx="16" ry="12" />
        </Organ>
      )}
      <Organ {...organ('vescica')}>
        <ellipse {...BLADDER} />
      </Organ>
      <rect
        className="urine"
        x={BLADDER.cx - BLADDER.rx}
        y={level}
        width={BLADDER.rx * 2}
        height={BLADDER.cy + BLADDER.ry - level}
        clipPath="url(#urinary-bladder-clip)"
      />
      {male && (
        <Organ {...organ('prostata')}>
          <ellipse cx="260" cy="348" rx="28" ry="15" />
        </Organ>
      )}
      <Organ {...organ('uretra')} duct thin>
        <path d={`M260 ${BLADDER.cy + BLADDER.ry - 2} V ${urethraEnd}`} />
      </Organ>

      {/* Sfinteri: interno all'uscita dalla vescica, esterno nel pavimento pelvico. Si aprono per urinare. */}
      <g className="sphincters" data-open={phase === 'minzione'}>
        <path d={`M248 ${BLADDER.cy + BLADDER.ry + 4} h 8 M264 ${BLADDER.cy + BLADDER.ry + 4} h 8`} />
        <path d={`M248 ${floor} h 8 M264 ${floor} h 8`} />
      </g>

      {/* Urina raccolta nelle pelvi renali dopo il riassorbimento. */}
      <g className="cells" data-visible={phase === 'riassorbimento'}>
        <circle cx="152" cy="132" r="4" />
        <circle cx={mirror(152)} cy="120" r="4" />
      </g>

      <g className="flows">
        <Flow marker="urinary-arrow" on={phase === 'filtrazione'} d="M254 118 L 178 124" />
        <Flow marker="urinary-arrow" on={phase === 'filtrazione'} d="M266 106 L 342 112" />
        <Flow marker="urinary-arrow" on={phase === 'riassorbimento'} d="M120 100 C 126 120 136 128 146 132" />
        <Flow marker="urinary-arrow" on={phase === 'riassorbimento'} d="M400 88 C 394 108 384 116 374 120" />
        <Flow marker="urinary-arrow" on={phase === 'ureteri'} d="M176 150 C 200 178 206 222 218 256" />
        <Flow marker="urinary-arrow" on={phase === 'ureteri'} d="M344 138 C 320 166 314 222 302 256" />
        <Flow marker="urinary-arrow" on={phase === 'riempimento'} d="M326 266 C 376 244 416 220 436 186" />
        <Flow
          marker="urinary-arrow"
          on={phase === 'minzione'}
          d={`M260 ${BLADDER.cy + BLADDER.ry + 10} V ${urethraEnd - 6}`}
        />
      </g>

      <g className="labels">
        <line className="leader" x1="104" y1="150" x2="66" y2="178" />
        <text x="62" y="192" textAnchor="end">
          Rene
        </text>
        <line className="leader" x1="210" y1="214" x2="110" y2="214" />
        <text x="106" y="218" textAnchor="end">
          Uretere
        </text>
        <text className="minor" x="268" y="44">
          Aorta
        </text>
        <line className="leader" x1="324" y1="288" x2="404" y2="288" />
        <text x="408" y="292">
          Vescica
        </text>
        <text className="minor signal-label" x="436" y="176" textAnchor="middle">
          Al cervello
        </text>
        {male && (
          <>
            <line className="leader" x1="288" y1="348" x2="404" y2="340" />
            <text x="408" y="344">
              Prostata
            </text>
            <line className="leader" x1="280" y1="436" x2="404" y2="440" />
            <text x="408" y="444">
              Pene
            </text>
          </>
        )}
        <line className="leader" x1="262" y1={male ? 400 : 374} x2="404" y2={male ? 392 : 374} />
        <text x="408" y={male ? 396 : 378}>
          Uretra
        </text>
        <line className="leader" x1="196" y1={floor} x2="150" y2={floor} />
        <text className="minor" x="146" y={floor - 4} textAnchor="end">
          <tspan x="146">Pavimento</tspan>
          <tspan x="146" dy="13">
            pelvico
          </tspan>
        </text>
        {!male && (
          <text className="minor" x="282" y="410">
            Apertura della vagina
          </text>
        )}
      </g>
    </svg>
  );
}
