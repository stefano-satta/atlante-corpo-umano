import type { ReproductivePhase } from '@/models/content';
import { Flow, Organ } from './DiagramParts';

// Schema frontale dell'apparato genitale femminile, disegnato per l'atlante. Il lato destro
// del corpo è a sinistra di chi guarda; l'ovulazione è mostrata in un solo ovaio. Forme e
// proporzioni sono semplificate e non in scala.

const ACTIVE: Record<string, string[]> = {
  follicolo: ['ovaie'],
  ovulazione: ['ovaie', 'tube-uterine'],
  tuba: ['tube-uterine'],
  endometrio: ['utero'],
  mestruazioni: ['utero', 'vagina'],
};

/** Dove si trova l'ovocita in ogni fase (spostamento rispetto al follicolo); null se non c'è. */
const OOCYTE: Record<string, [number, number] | null> = {
  follicolo: [0, 0],
  ovulazione: [-26, -26],
  tuba: [64, -78],
  endometrio: null,
  mestruazioni: null,
};

const mirror = (x: number) => 520 - x;
const TUBE = 'M206 100 C 172 90 140 84 112 94 C 86 104 76 126 78 150';
const FIMBRIAE = 'M78 150 L 62 166 M78 150 L 70 174 M78 150 L 82 176 M78 150 L 94 170';
const mirrored = (d: string) => d.replace(/(\d+) (\d+)/g, (_, x, y) => `${mirror(Number(x))} ${y}`);

export function FemaleDiagram({ phase, current }: { phase: ReproductivePhase; current: string }) {
  const active = new Set(ACTIVE[phase]);
  const organ = (id: string) => ({ id, active: active.has(id), current: current === id });
  const oocyte = OOCYTE[phase];

  return (
    <svg className="apparatus-diagram" viewBox="0 0 520 400" aria-hidden="true" data-phase={phase}>
      <defs>
        <marker
          id="apparatus-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 Z" className="arrowhead" />
        </marker>
      </defs>
      <text className="orientation" x="10" y="16">
        Destra del corpo
      </text>
      <text className="orientation" x="510" y="16" textAnchor="end">
        Sinistra del corpo
      </text>

      {/* Contesto: legamenti ovarici tra ovaie e utero. */}
      <path className="context-line" d={`M144 172 L 210 140 M${mirror(144)} 172 L ${mirror(210)} 140`} />

      <Organ {...organ('tube-uterine')} duct>
        <path d={TUBE} />
        <path d={mirrored(TUBE)} />
        <path className="fimbriae" d={FIMBRIAE} />
        <path className="fimbriae" d={mirrored(FIMBRIAE)} />
      </Organ>
      <Organ {...organ('ovaie')}>
        <ellipse cx="116" cy="180" rx="32" ry="20" />
        <ellipse cx={mirror(116)} cy="180" rx="32" ry="20" />
      </Organ>
      <Organ {...organ('vagina')}>
        <path d="M240 260 L 236 372 Q 260 380 284 372 L 280 260 Z" />
      </Organ>
      <Organ {...organ('utero')}>
        <path d="M206 108 Q 206 66 260 66 Q 314 66 314 108 Q 312 170 290 214 Q 284 226 284 240 L 284 262 L 236 262 L 236 240 Q 236 226 230 214 Q 208 170 206 108 Z" />
      </Organ>

      {/* Endometrio: il rivestimento della cavità, che si ispessisce e poi si sfalda. */}
      <g className="endometrium">
        <path d="M226 104 L 294 104 L 262 204 L 258 204 Z" />
      </g>

      {/* Follicolo e corpo luteo nell'ovaio di sinistra di chi guarda. */}
      <circle className="follicle" cx="106" cy="176" r="9" />
      <circle className="corpus-luteum" cx="106" cy="176" r="9" />

      <g
        className="oocyte"
        data-visible={oocyte !== null}
        style={oocyte ? { transform: `translate(${oocyte[0]}px, ${oocyte[1]}px)` } : undefined}
      >
        <circle cx="106" cy="176" r="5.5" />
      </g>

      <g className="flows">
        <Flow on={phase === 'ovulazione'} d="M98 166 L 82 156" />
        <Flow on={phase === 'tuba'} d="M86 138 C 96 108 120 94 150 92 C 172 92 186 94 198 98" />
        <Flow on={phase === 'mestruazioni'} d="M260 196 V 374" />
      </g>

      <g className="labels">
        <line className="leader" x1="62" y1="170" x2="46" y2="214" />
        <text x="46" y="230" textAnchor="middle">
          Fimbrie
        </text>
        <line className="leader" x1="380" y1="94" x2="404" y2="58" />
        <text x="408" y="54">
          Tuba uterina
        </text>
        <line className="leader" x1="434" y1="196" x2="444" y2="220" />
        <text x="448" y="234" textAnchor="middle">
          Ovaio
        </text>
        <line className="leader" x1="300" y1="150" x2="404" y2="150" />
        <text x="408" y="154">
          Utero
        </text>
        <line className="leader" x1="270" y1="150" x2="270" y2="124" />
        <text className="inside" x="260" y="92" textAnchor="middle">
          Endometrio
        </text>
        <line className="leader" x1="284" y1="248" x2="404" y2="248" />
        <text x="408" y="252">
          Cervice
        </text>
        <line className="leader" x1="284" y1="320" x2="404" y2="320" />
        <text x="408" y="324">
          Vagina
        </text>
        <text className="minor luteum-label" x="106" y="226" textAnchor="middle">
          Corpo luteo
        </text>
        <text className="minor follicle-label" x="106" y="226" textAnchor="middle">
          Follicolo
        </text>
      </g>
    </svg>
  );
}
