import { Flow, Organ } from '@/components/features/reproductive-system/DiagramParts';
import type { ThyroidPhase } from '@/models/content';

// Schema dell'asse ipotalamo-ipofisi-tiroide, disegnato per l'atlante: l'encefalo con ipotalamo e
// ipofisi in alto, la tiroide davanti alla trachea in basso, il sangue che li collega a destra e
// gli organi del corpo in fondo. Forme, distanze e proporzioni sono semplificate e non in scala.

/** Organi al lavoro in ogni fase: si colorano nel disegno. */
const ACTIVE: Record<ThyroidPhase, string[]> = {
  trh: ['ipotalamo'],
  tsh: ['ipofisi'],
  ormoni: ['tiroide'],
  organi: ['organi-bersaglio'],
  retroazione: ['ipotalamo', 'ipofisi'],
};

/** Il sangue: dall'ipofisi scende lungo il lato destro del disegno fino agli organi. */
const VESSEL_X = 400;

export function ThyroidDiagram({ phase, current }: { phase: ThyroidPhase; current: string }) {
  const active = new Set(ACTIVE[phase]);
  const organ = (id: string) => ({ id, active: active.has(id), current: current === id });

  return (
    <svg className="apparatus-diagram thyroid-diagram" viewBox="0 0 520 470" aria-hidden="true" data-phase={phase}>
      <defs>
        <marker id="thyroid-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" className="arrowhead" />
        </marker>
      </defs>

      {/* Contesto: profilo dell'encefalo, trachea, vaso sanguigno. */}
      <ellipse className="context" cx="260" cy="104" rx="128" ry="86" />
      <path className="context-line" d="M246 262 V 404 M274 262 V 404" />
      <path className="context-line vessel" d={`M278 184 H ${VESSEL_X} V 404`} />
      <path className="context-line vessel" d={`M320 318 H ${VESSEL_X}`} />

      <Organ {...organ('ipotalamo')}>
        <ellipse cx="260" cy="128" rx="28" ry="15" />
      </Organ>
      {/* L'infundibolo collega l'ipotalamo all'ipofisi. */}
      <path className="context-line stalk" d="M260 143 V 170" />
      <Organ {...organ('ipofisi')}>
        <ellipse cx="260" cy="182" rx="19" ry="13" />
      </Organ>
      {/* Tiroide a farfalla: due lobi uniti dall'istmo, davanti alla trachea. */}
      <Organ {...organ('tiroide')}>
        <ellipse cx="224" cy="318" rx="22" ry="40" />
        <ellipse cx="296" cy="318" rx="22" ry="40" />
        <rect x="232" y="322" width="56" height="16" rx="7" />
      </Organ>
      <Organ {...organ('organi-bersaglio')}>
        <circle cx="358" cy="424" r="11" />
        <circle cx="386" cy="418" r="9" />
        <circle cx="414" cy="426" r="12" />
        <circle cx="442" cy="418" r="9" />
      </Organ>

      {/* Iodio prelevato dal sangue mentre la tiroide produce gli ormoni. */}
      <g className="cells" data-visible={phase === 'ormoni'}>
        <circle cx="370" cy="318" r="4" />
        <circle cx="352" cy="318" r="4" />
        <circle cx="388" cy="300" r="4" />
      </g>

      <g className="flows">
        <Flow marker="thyroid-arrow" on={phase === 'trh'} d="M268 146 V 162" />
        <Flow marker="thyroid-arrow" on={phase === 'tsh'} d={`M282 192 H ${VESSEL_X - 8} V 306 H 328`} />
        <Flow marker="thyroid-arrow" on={phase === 'ormoni'} d={`M${VESSEL_X - 8} 330 H 328`} />
        <Flow marker="thyroid-arrow" on={phase === 'organi'} d={`M320 306 H ${VESSEL_X - 8} V 400`} />
        {/* Retroazione: gli ormoni nel sangue frenano ipofisi e ipotalamo. */}
        <Flow marker="thyroid-arrow" on={phase === 'retroazione'} d="M206 284 C 186 244 196 204 236 188" />
        <Flow marker="thyroid-arrow" on={phase === 'retroazione'} d="M200 290 C 150 236 168 152 228 134" />
      </g>

      {/* Il messaggero di ogni passo, scritto accanto alla sua freccia. */}
      <g className="messengers">
        <text data-on={phase === 'trh'} x="276" y="160">
          TRH
        </text>
        <text data-on={phase === 'tsh'} x={VESSEL_X + 8} y="250">
          TSH
        </text>
        <text data-on={phase === 'ormoni'} x={VESSEL_X + 8} y="334">
          Iodio
        </text>
        <text data-on={phase === 'organi'} x={VESSEL_X + 8} y="390">
          T4 e T3
        </text>
        <text data-on={phase === 'retroazione'} x="150" y="200" textAnchor="end">
          meno TSH
        </text>
        <text data-on={phase === 'retroazione'} x="150" y="150" textAnchor="end">
          meno TRH
        </text>
      </g>

      <g className="labels">
        <text className="minor" x="260" y="38" textAnchor="middle">
          Encefalo
        </text>
        <line className="leader" x1="232" y1="124" x2="118" y2="96" />
        <text x="114" y="100" textAnchor="end">
          Ipotalamo
        </text>
        <line className="leader" x1="241" y1="186" x2="118" y2="240" />
        <text x="114" y="244" textAnchor="end">
          Ipofisi
        </text>
        <line className="leader" x1="202" y1="330" x2="118" y2="352" />
        <text x="114" y="356" textAnchor="end">
          Tiroide
        </text>
        <text className="minor" x="260" y="420" textAnchor="middle">
          Trachea
        </text>
        <text className="minor" x={VESSEL_X + 8} y="178">
          Sangue
        </text>
        <text className="minor" x="400" y="456" textAnchor="middle">
          Organi del corpo
        </text>
      </g>
    </svg>
  );
}
