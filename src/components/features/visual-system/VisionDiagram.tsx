import { Flow, Organ } from '@/components/features/reproductive-system/DiagramParts';
import type { VisionPhase } from '@/models/content';

// Schema della vista, disegnato per l'atlante, in due pannelli. A sinistra un occhio visto di lato:
// la luce di un oggetto (la freccia) attraversa cornea, pupilla e cristallino e arriva capovolta
// sulla retina. A destra le vie ottiche viste dall'alto, con il davanti in alto: le fibre della metà
// della retina verso il naso si incrociano nel chiasma, e ogni metà del campo visivo arriva
// all'emisfero opposto. Forme, distanze e proporzioni sono semplificate e non in scala.

const PHASES: VisionPhase[] = ['cornea', 'pupilla', 'cristallino', 'retina', 'chiasma', 'corteccia'];

/** Parti al lavoro in ogni fase: si colorano nel disegno. */
const ACTIVE: Record<VisionPhase, string[]> = {
  cornea: ['cornea'],
  pupilla: ['iride'],
  cristallino: ['cristallino', 'corpo-ciliare'],
  retina: ['retina'],
  chiasma: ['chiasma'],
  corteccia: ['genicolato', 'corteccia'],
};

/**
 * Parti che rappresentano ciascuna scheda: hanno il contorno chiaro nella scheda aperta. Dell'occhio
 * basta la sclera, che lo racchiude: contornare anche le parti interne confonderebbe il disegno.
 */
const CARD: Record<string, string> = {
  sclera: 'occhi',
  nervo: 'nervo-ottico',
  chiasma: 'nervo-ottico',
  genicolato: 'nervo-ottico',
};

/**
 * Raggi di luce dalla punta e dalla base della freccia: si piegano sulla cornea (x 92) e sul
 * cristallino (x 146) e si riuniscono sulla retina, capovolti. Passano tutti dalla pupilla.
 */
const RAYS = [
  [
    [40, 170],
    [92, 188],
    [146, 192],
    [259, 245],
  ],
  [
    [40, 170],
    [92, 206],
    [146, 206],
    [259, 245],
  ],
  [
    [40, 230],
    [92, 212],
    [146, 208],
    [259, 155],
  ],
  [
    [40, 230],
    [92, 194],
    [146, 194],
    [259, 155],
  ],
];
/** Fino a quale tratto dei raggi arriva la luce in ogni fase (1 cornea, 2 cristallino, 3 retina). */
const RAY_STAGE: Record<VisionPhase, number> = {
  cornea: 2,
  pupilla: 2,
  cristallino: 3,
  retina: 3,
  chiasma: 3,
  corteccia: 3,
};

/**
 * Fibre delle vie ottiche, dall'occhio al corpo genicolato laterale: `field` è la metà del campo
 * visivo che portano. Le fibre della metà verso la tempia restano dal loro lato; quelle della metà
 * verso il naso passano dall'altra parte nel chiasma (435, 140).
 */
const FIBERS = [
  { field: 'right', d: 'M380 76 L429 140 L392 215' }, // occhio sinistro, metà verso la tempia
  { field: 'left', d: 'M400 76 L437 140 L478 215' }, // occhio sinistro, metà verso il naso
  { field: 'right', d: 'M470 76 L433 140 L392 215' }, // occhio destro, metà verso il naso
  { field: 'left', d: 'M490 76 L441 140 L478 215' }, // occhio destro, metà verso la tempia
];
/** Dal corpo genicolato laterale alla corteccia visiva: l'emisfero sinistro riceve la metà destra. */
const RADIATIONS = [
  { field: 'right', d: 'M392 215 Q392 290 405 330' },
  { field: 'left', d: 'M478 215 Q478 290 465 330' },
];

const segment = (ray: number[][], i: number) => `M${ray[i][0]} ${ray[i][1]} L${ray[i + 1][0]} ${ray[i + 1][1]}`;

export function VisionDiagram({ phase, current }: { phase: VisionPhase; current: string }) {
  const active = new Set(ACTIVE[phase]);
  const organ = (id: string) => ({ id, active: active.has(id), current: CARD[id] === current });
  const stage = RAY_STAGE[phase];
  const brain = PHASES.indexOf(phase) >= PHASES.indexOf('chiasma');

  return (
    <svg className="apparatus-diagram vision-diagram" viewBox="0 0 640 400" aria-hidden="true" data-phase={phase}>
      <defs>
        <marker id="vision-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" className="arrowhead" />
        </marker>
        <marker id="vision-object" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" className="object-head" />
        </marker>
      </defs>

      {/* Pannello di sinistra: l'occhio di lato, con il davanti a sinistra. */}
      <text className="orientation" x="160" y="30" textAnchor="middle">
        Occhio, di lato
      </text>
      <line className="object" x1="40" y1="230" x2="40" y2="174" markerEnd="url(#vision-object)" />

      {/* Corpo vitreo: il contenuto dell'occhio dietro il cristallino. */}
      <circle className="vitreous" cx="190" cy="200" r="84" />
      <Organ {...organ('sclera')} duct>
        <path d="M116 149 A90 90 0 1 1 116 251" />
      </Organ>
      <Organ {...organ('retina')} duct thin>
        <path d="M211 121 A82 82 0 0 1 211 279" />
      </Organ>
      <Organ {...organ('cornea')} duct thin>
        <path d="M116 150 A60 60 0 0 0 116 250" />
      </Organ>
      {/* L'iride, in due metà attorno alla pupilla: in luce intensa la restringe. */}
      <g className="iris" data-narrow={phase === 'pupilla'}>
        <Organ {...organ('iride')}>
          <rect className="iris-top" x="124" y="156" width="8" height="30" rx="2" />
          <rect className="iris-bottom" x="124" y="214" width="8" height="30" rx="2" />
        </Organ>
      </g>
      <Organ {...organ('corpo-ciliare')}>
        <ellipse cx="150" cy="150" rx="6" ry="9" />
        <ellipse cx="150" cy="250" rx="6" ry="9" />
      </Organ>
      <path className="zonule" d="M150 159 L147 171 M150 241 L147 229" />
      <Organ {...organ('cristallino')}>
        <ellipse cx="146" cy="200" rx="12" ry="30" />
      </Organ>
      <Organ {...organ('nervo')} duct>
        <path d="M279 200 H 312" />
      </Organ>

      <g className="rays">
        {RAYS.map((ray) =>
          [0, 1, 2].map((i) => <path key={`${ray[0]}-${ray[1]}-${i}`} data-on={i < stage} d={segment(ray, i)} />),
        )}
      </g>
      {/* L'immagine capovolta sulla retina. */}
      <line
        className="image"
        data-on={phase === 'retina' || phase === 'cristallino'}
        x1="252"
        y1="160"
        x2="252"
        y2="236"
        markerEnd="url(#vision-object)"
      />

      <g className="flows">
        <Flow marker="vision-arrow" on={phase === 'retina'} d="M282 192 H 312" />
      </g>

      {/* Pannello di destra: le vie ottiche dall'alto, con il davanti in alto. */}
      <text className="orientation" x="460" y="30" textAnchor="middle">
        Vie ottiche, dall'alto
      </text>
      <ellipse className="context" cx="435" cy="225" rx="100" ry="130" />
      <circle className="small-eye" cx="390" cy="62" r="18" />
      <circle className="small-eye" cx="480" cy="62" r="18" />
      {/* Metà della retina di ogni occhio, colorate con la metà del campo visivo che ricevono. */}
      <path className="hemiretina" data-field="right" d="M372 62 A18 18 0 0 0 390 80" />
      <path className="hemiretina" data-field="left" d="M390 80 A18 18 0 0 0 408 62" />
      <path className="hemiretina" data-field="right" d="M462 62 A18 18 0 0 0 480 80" />
      <path className="hemiretina" data-field="left" d="M480 80 A18 18 0 0 0 498 62" />

      <g className="fibers">
        {FIBERS.map((f) => (
          <path key={f.d} data-field={f.field} data-on={phase === 'chiasma'} data-visible={brain} d={f.d} />
        ))}
        {RADIATIONS.map((f) => (
          <path key={f.d} data-field={f.field} data-on={phase === 'corteccia'} data-visible={brain} d={f.d} />
        ))}
      </g>
      <Organ {...organ('chiasma')}>
        <ellipse cx="435" cy="140" rx="11" ry="6" />
      </Organ>
      <Organ {...organ('genicolato')}>
        <ellipse cx="392" cy="215" rx="9" ry="6" />
        <ellipse cx="478" cy="215" rx="9" ry="6" />
      </Organ>
      <Organ {...organ('corteccia')}>
        <path d="M380 334 Q405 316 430 334 Q405 352 380 334 Z" />
        <path d="M440 334 Q465 316 490 334 Q465 352 440 334 Z" />
      </Organ>

      <g className="labels">
        <text className="minor" x="40" y="252" textAnchor="middle">
          Oggetto
        </text>
        <line className="leader" x1="92" y1="168" x2="72" y2="104" />
        <text x="72" y="98" textAnchor="middle">
          Cornea
        </text>
        <line className="leader" x1="128" y1="158" x2="138" y2="84" />
        <text x="144" y="78" textAnchor="middle">
          Iride
        </text>
        <line className="leader" x1="248" y1="140" x2="232" y2="84" />
        <text x="232" y="78" textAnchor="middle">
          Retina
        </text>
        <line className="leader" x1="146" y1="258" x2="104" y2="320" />
        <text x="100" y="336" textAnchor="middle">
          Corpo ciliare
        </text>
        <line className="leader" x1="150" y1="226" x2="186" y2="320" />
        <text x="196" y="336" textAnchor="middle">
          Cristallino
        </text>
        <line className="leader" x1="300" y1="204" x2="296" y2="300" />
        <text x="296" y="316" textAnchor="middle">
          Nervo ottico
        </text>
        <text className="minor" x="244" y="306" textAnchor="middle" data-on={phase === 'retina'}>
          Immagine capovolta
        </text>

        <text className="field-label" data-field="left" x="364" y="56" textAnchor="end">
          Metà sinistra
        </text>
        <text className="field-label" data-field="left" x="364" y="70" textAnchor="end">
          del campo visivo
        </text>
        <text className="field-label" data-field="right" x="506" y="56">
          Metà destra
        </text>
        <text className="field-label" data-field="right" x="506" y="70">
          del campo visivo
        </text>
        <line className="leader" x1="447" y1="140" x2="508" y2="140" />
        <text x="512" y="144">
          Chiasma ottico
        </text>
        <text className="minor" x="512" y="180">
          Tratto ottico
        </text>
        <line className="leader" x1="488" y1="215" x2="508" y2="215" />
        <text x="512" y="212">
          Corpo genicolato
        </text>
        <text x="512" y="226">
          laterale
        </text>
        <text x="435" y="378" textAnchor="middle">
          Corteccia visiva
        </text>
        <text className="minor" x="435" y="394" textAnchor="middle">
          Lobo occipitale
        </text>
      </g>
    </svg>
  );
}
