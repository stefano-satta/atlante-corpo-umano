import type { ReproductivePhase } from '@/models/content';
import { Flow, Organ } from './DiagramParts';

// Schema frontale dell'apparato genitale maschile, disegnato per l'atlante. Come negli altri
// schemi, il lato destro del corpo è a sinistra di chi guarda. Forme e proporzioni sono
// semplificate e non in scala; il dotto deferente, che in realtà passa dietro la vescica,
// è disegnato davanti per restare visibile.

/** Organi al lavoro in ogni fase: si colorano nel disegno. */
const ACTIVE: Record<string, string[]> = {
  spermatogenesi: ['testicoli'],
  maturazione: ['epididimi'],
  trasporto: ['dotti-deferenti'],
  liquidi: ['vescichette-seminali', 'prostata'],
  eiaculazione: ['uretra', 'pene'],
};

/** Disegna una forma e la sua speculare rispetto all'asse del corpo (x = 260). */
const mirror = (x: number) => 520 - x;

const EPIDIDYMIS = 'M160 292 C 136 298 130 340 150 372';
const VAS =
  'M150 372 C 120 332 122 252 136 214 C 146 186 134 120 160 92 C 182 68 198 104 204 140 C 208 160 214 172 226 182 L 252 200';
const mirrored = (d: string) => d.replace(/(\d+) (\d+)/g, (_, x, y) => `${mirror(Number(x))} ${y}`);

export function MaleDiagram({ phase, current }: { phase: ReproductivePhase; current: string }) {
  const active = new Set(ACTIVE[phase]);
  const organ = (id: string) => ({ id, active: active.has(id), current: current === id });

  return (
    <svg className="apparatus-diagram" viewBox="0 0 520 470" aria-hidden="true" data-phase={phase}>
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

      {/* Contesto: vescica urinaria e scroto, non colorati. */}
      <ellipse className="context" cx="260" cy="100" rx="78" ry="58" />
      <path className="context" d="M150 282 C 116 300 120 404 186 400 Q 260 418 334 400 C 400 404 404 300 370 282 Z" />

      <Organ {...organ('vescichette-seminali')}>
        <ellipse cx="188" cy="160" rx="12" ry="30" transform="rotate(-50 188 160)" />
        <ellipse cx={mirror(188)} cy="160" rx="12" ry="30" transform={`rotate(50 ${mirror(188)} 160)`} />
      </Organ>
      <Organ {...organ('testicoli')}>
        <ellipse cx="180" cy="334" rx="30" ry="40" />
        <ellipse cx={mirror(180)} cy="334" rx="30" ry="40" />
      </Organ>
      <Organ {...organ('epididimi')} duct>
        <path d={EPIDIDYMIS} />
        <path d={mirrored(EPIDIDYMIS)} />
      </Organ>
      <Organ {...organ('dotti-deferenti')} duct>
        <path d={VAS} />
        <path d={mirrored(VAS)} />
      </Organ>
      <Organ {...organ('prostata')}>
        <ellipse cx="260" cy="194" rx="34" ry="24" />
      </Organ>
      <Organ {...organ('pene')}>
        <rect x="238" y="226" width="44" height="174" rx="18" />
        <ellipse cx="260" cy="404" rx="26" ry="22" />
      </Organ>
      <Organ {...organ('uretra')} duct thin>
        <path d="M260 156 V424" />
      </Organ>

      {/* Spermatozoi nei tubuli dei testicoli. */}
      <g className="cells" data-visible={phase === 'spermatogenesi'}>
        {[
          [168, 320],
          [190, 312],
          [182, 340],
          [166, 352],
          [196, 358],
        ].flatMap(([x, y]) => [
          <circle key={`d${x}-${y}`} cx={x} cy={y} r="3.5" />,
          <circle key={`s${x}-${y}`} cx={mirror(x)} cy={y} r="3.5" />,
        ])}
      </g>

      {/* Il cammino in ogni fase: a sinistra di chi guarda, uguale dall'altro lato. */}
      <g className="flows">
        <Flow on={phase === 'maturazione'} d="M162 302 C 142 310 140 340 154 362" />
        <Flow
          on={phase === 'trasporto'}
          d="M144 360 C 124 326 126 252 138 220 C 148 188 136 124 160 98 C 180 76 196 108 202 140 C 206 160 212 170 222 178"
        />
        <Flow on={phase === 'liquidi'} d="M196 170 L 244 198" />
        <Flow on={phase === 'liquidi'} d="M324 170 L 276 198" />
        <Flow on={phase === 'eiaculazione'} d="M260 206 V 414" />
      </g>

      <g className="labels">
        <text className="minor" x="260" y="92" textAnchor="middle">
          Vescica
        </text>
        <text x="260" y="104" textAnchor="middle" className="minor small">
          (urinaria)
        </text>
        <line className="leader" x1="346" y1="146" x2="392" y2="128" />
        <text x="396" y="124">
          <tspan x="396">Vescichetta</tspan>
          <tspan x="396" dy="14">
            seminale
          </tspan>
        </text>
        <line className="leader" x1="292" y1="200" x2="404" y2="200" />
        <text x="408" y="204">
          Prostata
        </text>
        <line className="leader" x1="262" y1="250" x2="404" y2="250" />
        <text x="408" y="254">
          Uretra
        </text>
        <line className="leader" x1="128" y1="250" x2="104" y2="250" />
        <text x="100" y="246" textAnchor="end">
          <tspan x="100">Dotto</tspan>
          <tspan x="100" dy="14">
            deferente
          </tspan>
        </text>
        <line className="leader" x1="384" y1="320" x2="420" y2="304" />
        <text x="424" y="304">
          Epididimo
        </text>
        <line className="leader" x1="372" y1="352" x2="420" y2="364" />
        <text x="424" y="368">
          Testicolo
        </text>
        <line className="leader" x1="284" y1="410" x2="404" y2="440" />
        <text x="408" y="444">
          Pene
        </text>
        <text className="minor" x="124" y="432" textAnchor="end">
          Scroto
        </text>
      </g>
    </svg>
  );
}
