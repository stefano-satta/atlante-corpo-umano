import type { CirculationDiagramId } from '@/models/circulation';
import type { PhasedDiagramProps } from '../PhasedFigure';

// Schema dei due circuiti del sangue, disegnato per l'atlante e visto di fronte: il lato destro del
// corpo è a sinistra di chi guarda. In alto i polmoni, al centro il cuore con le quattro cavità, in
// basso un rene come esempio di tutti gli organi. Forme e proporzioni non sono in scala, e lo dichiara
// l'avvertenza sotto il disegno. Ogni passo del percorso usa lo stesso disegno e ne accende i tratti
// percorsi dal sangue nella fase mostrata; gli altri restano attenuati.

type Blood = 'poor' | 'rich';
type Part =
  | 'svc'
  | 'ivc'
  | 'renal-vein'
  | 'renal-artery'
  | 'ascending'
  | 'arch'
  | 'descending'
  | 'trunk'
  | 'pulmonary-arteries'
  | 'pulmonary-veins'
  | 'lung-bed'
  | 'kidney-bed'
  | 'flow-right'
  | 'flow-left'
  | 'ra'
  | 'rv'
  | 'la'
  | 'lv'
  | 'tricuspid'
  | 'mitral'
  | 'pulmonary-valve'
  | 'aortic-valve'
  | 'coronaries'
  | 'sinus';

/** Vasi disegnati: percorso, sangue che portano e se sono vasi sottili (coronarie). */
const VESSELS: Array<{ id: Part; d: string; blood: Blood; thin?: boolean }> = [
  { id: 'svc', d: 'M130 96 V154', blood: 'poor' },
  { id: 'ivc', d: 'M82 372 V190 H110', blood: 'poor' },
  { id: 'renal-vein', d: 'M120 342 H82', blood: 'poor' },
  { id: 'trunk', d: 'M163 206 V128', blood: 'poor' },
  { id: 'pulmonary-arteries', d: 'M163 128 C163 104 128 102 128 84 M163 128 C163 104 178 102 178 84', blood: 'poor' },
  { id: 'pulmonary-veins', d: 'M207 84 V154', blood: 'rich' },
  { id: 'ascending', d: 'M177 206 V128', blood: 'rich' },
  { id: 'arch', d: 'M177 128 C177 102 262 102 262 132 M198 110 L194 94 M220 106 V90 M242 110 L247 94', blood: 'rich' },
  { id: 'descending', d: 'M262 132 V372', blood: 'rich' },
  { id: 'renal-artery', d: 'M262 342 H220', blood: 'rich' },
  { id: 'flow-right', d: 'M147 172 V234', blood: 'poor', thin: true },
  { id: 'flow-left', d: 'M195 172 V234', blood: 'rich', thin: true },
  {
    id: 'coronaries',
    d: 'M174 210 C150 202 110 214 110 256 M180 210 C204 202 230 214 230 256',
    blood: 'rich',
    thin: true,
  },
  { id: 'sinus', d: 'M214 266 C182 276 132 274 124 210', blood: 'poor', thin: true },
];

/** Cavità del cuore: posizione, sangue e sigla (spiegata dalla legenda). */
const CHAMBERS: Array<{ id: Part; x: number; y: number; w: number; h: number; blood: Blood; tag: string }> = [
  { id: 'ra', x: 110, y: 154, w: 45, h: 46, blood: 'poor', tag: 'AD' },
  { id: 'la', x: 185, y: 154, w: 45, h: 46, blood: 'rich', tag: 'AS' },
  { id: 'rv', x: 110, y: 204, w: 58, h: 56, blood: 'poor', tag: 'VD' },
  { id: 'lv', x: 172, y: 204, w: 58, h: 56, blood: 'rich', tag: 'VS' },
];

const VALVES: Array<{ id: Part; d: string }> = [
  { id: 'tricuspid', d: 'M118 202 H150' },
  { id: 'mitral', d: 'M190 202 H222' },
  { id: 'pulmonary-valve', d: 'M157 200 H169' },
  { id: 'aortic-valve', d: 'M171 200 H183' },
];

/** Tratti accesi in ogni fase di ogni schema. */
const ACTIVE: Record<CirculationDiagramId, Record<string, Part[]>> = {
  circuiti: {
    polmonare: ['rv', 'trunk', 'pulmonary-arteries', 'lung-bed', 'pulmonary-veins', 'la'],
    sistemico: [
      'lv',
      'ascending',
      'arch',
      'descending',
      'renal-artery',
      'kidney-bed',
      'renal-vein',
      'ivc',
      'svc',
      'ra',
    ],
  },
  'vene-cave': {
    superiore: ['svc'],
    inferiore: ['ivc'],
    atrio: ['svc', 'ivc', 'ra'],
  },
  'cuore-destro': {
    tricuspide: ['ra', 'flow-right', 'tricuspid', 'rv'],
    polmonare: ['rv', 'pulmonary-valve', 'trunk'],
    arterie: ['trunk', 'pulmonary-arteries'],
  },
  'cuore-sinistro': {
    vene: ['lung-bed', 'pulmonary-veins', 'la'],
    mitrale: ['la', 'flow-left', 'mitral', 'lv'],
  },
  aorta: {
    aortica: ['lv', 'aortic-valve', 'ascending'],
    arco: ['arch'],
    discendente: ['descending'],
  },
  rene: {
    arteria: ['descending', 'renal-artery'],
    capillari: ['kidney-bed'],
    vena: ['renal-vein'],
    ritorno: ['ivc', 'ra'],
  },
  coronarie: {
    arterie: ['ascending', 'coronaries'],
    seno: ['sinus', 'ra'],
  },
};

/** Letti di capillari: anse che passano dal blu al rosso (polmoni) o dal rosso al blu (rene). */
const LUNG_BED = 'M128 80 C126 40 148 34 156 54 C164 74 176 30 186 50 C194 66 206 34 207 80';
const KIDNEY_BED = 'M220 342 C212 322 200 362 188 340 C178 322 166 362 154 340 C144 322 132 362 120 342';

export function CirculationDiagram({ schema, phase, playing }: PhasedDiagramProps & { schema: CirculationDiagramId }) {
  const active = new Set(ACTIVE[schema][phase] ?? []);
  const on = (id: Part) => active.has(id) || undefined;
  const coronary = schema === 'coronarie';

  return (
    <svg
      className="circulation-diagram"
      viewBox="0 0 340 384"
      aria-hidden="true"
      data-schema={schema}
      data-phase={phase}
      data-playing={playing || undefined}
    >
      <defs>
        <linearGradient id="circulation-lung-bed" x1="0" x2="1">
          <stop offset="0" className="stop-poor" />
          <stop offset="1" className="stop-rich" />
        </linearGradient>
        <linearGradient id="circulation-kidney-bed" x1="1" x2="0">
          <stop offset="0" className="stop-rich" />
          <stop offset="1" className="stop-poor" />
        </linearGradient>
        <marker
          id="circulation-arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="2.2"
          markerHeight="2.2"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 Z" className="arrowhead" />
        </marker>
      </defs>

      <line className="diaphragm" x1="60" y1="296" x2="290" y2="296" />
      <text className="note" x="94" y="292">
        diaframma
      </text>

      <g className="organ" data-active={on('lung-bed')}>
        <rect x="104" y="20" width="132" height="64" rx="24" />
        <path className="bed" d={LUNG_BED} stroke="url(#circulation-lung-bed)" />
        <text x="170" y="36" textAnchor="middle">
          Polmoni
        </text>
      </g>
      <g className="organ" data-active={on('kidney-bed')}>
        <rect x="116" y="318" width="108" height="50" rx="22" />
        <path className="bed" d={KIDNEY_BED} stroke="url(#circulation-kidney-bed)" />
        <text x="170" y="364" textAnchor="middle">
          Rene
        </text>
      </g>

      <rect className="heart" x="104" y="148" width="132" height="118" rx="26" />
      {CHAMBERS.map((c) => (
        <g key={c.id} className={`chamber ${c.blood}`} data-active={on(c.id)}>
          <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="10" />
          <text x={c.x + c.w / 2} y={c.y + c.h / 2 + 5} textAnchor="middle">
            {c.tag}
          </text>
        </g>
      ))}

      {VESSELS.map((v) => {
        const hidden = (v.id === 'coronaries' || v.id === 'sinus') && !coronary;
        if (hidden) return null;
        const lit = active.has(v.id);
        return (
          <g key={v.id} className={`vessel ${v.blood}${v.thin ? ' thin' : ''}`} data-active={lit || undefined}>
            <path d={v.d} markerEnd={lit ? 'url(#circulation-arrow)' : undefined} />
            {lit && <path className="flow" d={v.d} />}
          </g>
        );
      })}

      {VALVES.map((v) => (
        <path key={v.id} className="valve" d={v.d} data-active={on(v.id)} />
      ))}

      <g className="labels">
        <text x="100" y="98" textAnchor="end">
          arterie
        </text>
        <text x="100" y="110" textAnchor="end">
          polmonari
        </text>
        <text x="268" y="76">
          vene
        </text>
        <text x="268" y="88">
          polmonari
        </text>
        <text x="124" y="126" textAnchor="end">
          vena cava
        </text>
        <text x="124" y="138" textAnchor="end">
          superiore
        </text>
        <text x="76" y="250" textAnchor="end">
          vena cava
        </text>
        <text x="76" y="262" textAnchor="end">
          inferiore
        </text>
        <text x="268" y="214">
          aorta
        </text>
      </g>
      <text className="orientation" x="8" y="380">
        destra
      </text>
      <text className="orientation" x="332" y="380" textAnchor="end">
        sinistra
      </text>
    </svg>
  );
}
