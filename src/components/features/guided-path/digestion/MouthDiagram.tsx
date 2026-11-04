import { Arrowhead, at, type DiagramProps } from './diagramParts';

/* 2 · La bocca, vista di lato. */

// Pezzi di cibo: posizione e grandezza nella masticazione, con la saliva e raccolti nel bolo.
const CRUMBS: { chew: [number, number, number]; saliva: [number, number, number]; bolus: [number, number] }[] = [
  { chew: [76, 128, 2], saliva: [72, 127, 1], bolus: [194, 126] },
  { chew: [102, 128, 1.8], saliva: [88, 130, 1.1], bolus: [202, 124] },
  { chew: [128, 128, 2.2], saliva: [104, 126, 1], bolus: [208, 129] },
  { chew: [154, 128, 1.9], saliva: [118, 130, 1.1], bolus: [198, 133] },
  { chew: [76, 128, 0], saliva: [132, 127, 1], bolus: [206, 134] },
  { chew: [102, 128, 0], saliva: [146, 130, 1], bolus: [212, 127] },
  { chew: [128, 128, 0], saliva: [158, 127, 0.9], bolus: [201, 129] },
  { chew: [154, 128, 0], saliva: [166, 130, 0.9], bolus: [192, 131] },
];

// Denti di un'arcata vista di lato, dagli incisivi ai molari: la corona superiore scende fino a 124,
// quella inferiore sale fino a 132; nel mezzo si mastica il cibo.
const TOOTH_X = [60, 74, 88, 103, 119, 136, 154];
function Teeth({ lower }: { lower?: boolean }) {
  return (
    <g className="teeth">
      {TOOTH_X.map((x, i) => {
        const h = i > 3 ? 12 : 14;
        return <rect key={x} x={x} y={lower ? 132 : 124 - h} width={i > 3 ? 15 : 12} height={h} rx="3" />;
      })}
    </g>
  );
}

export function MouthDiagram({ phase, playing }: DiagramProps) {
  const crumb = (c: (typeof CRUMBS)[number]) => {
    if (phase === 'masticazione') return at(c.chew[0], c.chew[1], c.chew[2], c.chew[2] ? 1 : 0);
    if (phase === 'saliva') return at(c.saliva[0], c.saliva[1], c.saliva[2], c.saliva[2] ? 1 : 0);
    return at(c.bolus[0], c.bolus[1], 1.5);
  };
  return (
    <svg
      className="digestion-diagram mouth-diagram"
      viewBox="0 0 360 280"
      aria-hidden="true"
      data-phase={phase}
      data-moving={playing}
    >
      <defs>
        <Arrowhead id="arrow-saliva" className="arrowhead saliva-head" />
      </defs>
      <text className="orientation" x="8" y="16">
        Davanti
      </text>
      <text className="orientation" x="352" y="16" textAnchor="end">
        Dietro
      </text>
      <path className="silhouette" d="M100 10 C74 14 58 32 56 54 L52 72 L40 92 L50 98 L50 102" />
      <path className="silhouette" d="M56 160 C58 178 68 188 84 194 C120 204 150 210 178 216" />
      <path className="pharynx-wall" d="M254 58 C258 120 260 190 258 272" />
      <path className="bone" d="M58 106 C100 96 150 94 198 100" />
      <g className="soft-palate">
        <path className="muscle" d="M198 100 C212 104 222 114 228 128" />
        <circle className="uvula" cx="229" cy="132" r="4" />
      </g>
      <path className="lip" d="M50 104 C45 112 47 120 54 124" />
      <ellipse className="gland" cx="294" cy="122" rx="22" ry="32" />
      <path className="duct" d="M274 120 C236 124 196 122 158 118" markerEnd="url(#arrow-saliva)" />
      <Teeth />

      {/* Mandibola, lingua e pavimento della bocca si muovono insieme masticando. */}
      <g className="jaw">
        <ellipse className="gland" cx="122" cy="180" rx="16" ry="6" />
        <ellipse className="gland" cx="180" cy="206" rx="22" ry="11" />
        <path className="duct" d="M164 200 C138 188 112 174 94 160" markerEnd="url(#arrow-saliva)" />
        <path className="duct" d="M122 174 L121 166" markerEnd="url(#arrow-saliva)" />
        <g className="tongue">
          <path d="M80 146 C92 136 128 132 162 133 C196 135 216 150 222 170 C224 180 220 188 212 190 C190 188 160 182 130 176 C108 170 90 160 80 146 Z" />
        </g>
        <path className="bone" d="M56 146 C56 166 62 180 76 186 L200 192 C212 192 220 182 222 166 L228 100" />
        <Teeth lower />
        <path className="lip" d="M54 132 C47 138 47 146 54 152" />
      </g>

      <g className="saliva-drops">
        <circle cx="80" cy="134" r="2.5" />
        <circle cx="110" cy="122" r="2" />
        <circle cx="126" cy="134" r="2.5" />
        <circle cx="152" cy="122" r="2" />
        <circle cx="96" cy="124" r="2" />
      </g>
      <g className="food">
        {CRUMBS.map((c) => (
          <g key={`${c.bolus[0]}-${c.bolus[1]}`} className="moving" style={crumb(c)}>
            <circle r="3" />
          </g>
        ))}
      </g>

      <g className="labels">
        <text x="66" y="88" className="minor">
          Palato duro
        </text>
        <text x="176" y="88" className="minor">
          Palato molle
        </text>
        <text x="150" y="166" className="on-organ">
          Lingua
        </text>
        <text x="96" y="58" className="minor">
          Denti
        </text>
        <text x="294" y="172" textAnchor="middle">
          Parotide
        </text>
        <text x="180" y="236" textAnchor="middle" className="minor">
          Sottomandibolare
        </text>
        <text x="20" y="232" className="minor">
          Sottolinguale
        </text>
        <text x="266" y="262" className="minor">
          Faringe
        </text>
      </g>
      <path className="leader" d="M108 62 L108 108" />
      <path className="leader" d="M60 222 C80 210 100 196 112 184" />
    </svg>
  );
}
