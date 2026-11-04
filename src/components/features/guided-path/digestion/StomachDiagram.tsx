import { Arrowhead, at, type DiagramProps } from './diagramParts';

/* 4 · Lo stomaco, visto di fronte. */

const STOMACH_SHAPE =
  'M190 62 C186 40 214 26 240 30 C276 34 298 64 296 104 C294 168 254 226 190 236 C150 242 118 232 100 214 L80 206 L80 184 L100 188 C126 196 158 190 176 168 C190 150 194 110 190 62 Z';
const CHUNKS: [number, number, number][] = [
  [236, 86, 9],
  [262, 120, 7],
  [218, 140, 8],
  [250, 168, 6],
  [200, 196, 7],
  [160, 214, 6],
];

export function StomachDiagram({ phase }: DiagramProps) {
  const chyme = phase !== 'succo';
  return (
    <svg className="digestion-diagram stomach-diagram" viewBox="0 0 360 290" aria-hidden="true" data-phase={phase}>
      <defs>
        <Arrowhead id="arrow-stomach" className="arrowhead" />
        <clipPath id="stomach-clip">
          <path d={STOMACH_SHAPE} />
        </clipPath>
      </defs>
      <text className="orientation" x="46" y="284">
        Destra del corpo
      </text>
      <text className="orientation" x="352" y="284" textAnchor="end">
        Sinistra del corpo
      </text>
      <path className="esophagus" d="M198 4 L198 66" />
      <path className="duodenum" d="M84 195 L50 195 C36 195 28 208 28 226 L28 286" />
      <path className="organ-fill" d={STOMACH_SHAPE} />
      <g clipPath="url(#stomach-clip)">
        <path className="chyme-fill" data-visible={chyme} d={STOMACH_SHAPE} />
        <g className="rugae">
          <path d="M214 60 C230 90 236 130 226 170" />
          <path d="M244 52 C266 96 268 140 246 190" />
          <path d="M150 210 C170 206 190 200 206 190" />
        </g>
        <g className="chunks" data-visible={!chyme}>
          {CHUNKS.map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
        <g className="acid" data-visible={phase === 'succo'}>
          {[
            [206, 76],
            [284, 96],
            [276, 150],
            [228, 210],
            [140, 222],
            [184, 170],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" />
          ))}
        </g>
        <g className="waves" data-visible={phase === 'onde'}>
          <path d="M196 100 Q246 120 296 108" />
          <path d="M180 160 Q226 184 268 194" />
          <path d="M140 190 Q150 216 156 240" />
          <path d="M106 184 Q110 204 112 224" />
        </g>
      </g>
      <path className="mucus" d={STOMACH_SHAPE} />
      <path
        className="wave-direction"
        data-visible={phase === 'onde'}
        d="M262 92 C260 170 200 214 120 210"
        markerEnd="url(#arrow-stomach)"
      />
      <g className="sphincter pyloric" data-open={phase === 'svuotamento'}>
        <path d="M84 180 L84 188" />
        <path d="M84 202 L84 210" />
      </g>
      <g className="moving squirt" style={phase === 'svuotamento' ? at(38, 236, 1, 1) : at(104, 198, 0.6, 0)}>
        <circle r="6" />
      </g>
      <path
        className="return-arrow"
        data-visible={phase === 'svuotamento'}
        d="M110 214 C140 232 176 226 200 206"
        markerEnd="url(#arrow-stomach)"
      />

      <g className="labels">
        <text x="210" y="20" className="minor">
          Esofago
        </text>
        <text x="300" y="54" className="minor">
          Fondo
        </text>
        <text x="300" y="170">
          Corpo
        </text>
        <text x="100" y="262">
          Piloro
        </text>
        <text x="6" y="180" className="minor">
          Duodeno
        </text>
        <text className="phase-note" data-visible={phase === 'succo'} x="138" y="116">
          HCl · pH 1,5–3,5
        </text>
        <text className="phase-note" data-visible={phase === 'succo'} x="138" y="134">
          pepsina
        </text>
        <text className="phase-note" data-visible={phase === 'svuotamento'} x="36" y="276">
          ≈ 3 mL
        </text>
      </g>
    </svg>
  );
}
