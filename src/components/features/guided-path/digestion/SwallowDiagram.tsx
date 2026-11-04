import { Arrowhead, at, type DiagramProps } from './diagramParts';

/* 3 · La deglutizione, vista di lato. */

const SWALLOW_BOLUS: Record<string, [number, number]> = {
  volontaria: [232, 148],
  faringea: [248, 214],
  esofagea: [258, 304],
  sfintere: [300, 386],
};

export function SwallowDiagram({ phase }: DiagramProps) {
  const [x, y] = SWALLOW_BOLUS[phase] ?? SWALLOW_BOLUS.volontaria;
  const ring = phase === 'esofagea' || phase === 'sfintere';
  return (
    <svg className="digestion-diagram swallow-diagram" viewBox="0 0 360 420" aria-hidden="true" data-phase={phase}>
      <defs>
        <Arrowhead id="arrow-air" className="arrowhead" />
      </defs>
      <text className="orientation" x="8" y="16">
        Davanti
      </text>
      <text className="orientation" x="352" y="16" textAnchor="end">
        Dietro
      </text>
      <path className="nasal" d="M40 50 C80 34 180 34 212 50 L216 92 L40 96 Z" />
      <path
        className="air-flow"
        d="M60 70 C120 66 190 66 236 80 C246 100 220 230 206 260"
        markerEnd="url(#arrow-air)"
      />
      <path className="pharynx-wall" d="M252 44 C256 110 258 180 258 236" />
      <path className="bone" d="M50 100 C100 92 150 90 196 96" />
      <g className="soft-palate">
        <path className="muscle" d="M196 96 C212 100 222 110 226 124" />
        <circle className="uvula" cx="227" cy="128" r="4" />
      </g>
      <path className="silhouette" d="M70 20 C52 30 44 50 42 66 L30 84 L40 90 L40 96" />
      <path className="silhouette" d="M46 156 C48 174 60 184 76 188 C110 196 150 202 180 206" />
      <path className="lip" d="M40 98 C35 106 37 112 44 116" />
      <rect className="tooth" x="48" y="102" width="11" height="13" rx="3" />
      <g className="tongue">
        <path d="M60 142 C90 118 150 110 186 118 C214 126 226 150 224 180 C222 192 216 198 206 200 C170 194 120 184 96 172 C78 162 66 154 60 142 Z" />
      </g>
      <rect className="tooth" x="48" y="122" width="11" height="13" rx="3" />
      <path className="lip" d="M44 122 C37 128 37 136 44 142" />
      <path className="bone" d="M46 136 C46 156 52 170 66 176 L190 182 C204 182 212 174 214 160 L222 98" />

      <g className="larynx">
        <path className="cartilage" d="M196 226 L196 264 M226 222 L226 264" />
        <path className="epiglottis" d="M220 220 C222 204 228 192 236 184" />
      </g>
      <path className="trachea" d="M211 262 L211 412" />
      <g className="trachea-rings">
        {[280, 300, 320, 340, 360, 380, 400].map((ry) => (
          <path key={ry} d={`M201 ${ry} L221 ${ry}`} />
        ))}
      </g>

      <path className="esophagus" d="M255 236 C258 280 260 320 262 356" />
      <path className="diaphragm" d="M120 352 C180 334 300 334 352 352" />
      <path
        className="organ-fill"
        d="M248 358 C250 384 270 408 310 408 C346 408 358 378 348 358 C336 342 296 344 270 352 C262 354 254 356 248 358 Z"
      />
      <g className="sphincter upper" data-open={phase === 'faringea'}>
        <path d="M242 238 L248 238" />
        <path d="M262 238 L268 238" />
      </g>
      <g className="sphincter lower" data-open={phase === 'sfintere'}>
        <path d="M248 352 L254 352" />
        <path d="M268 352 L274 352" />
      </g>

      <g className="moving" style={at(x, y)}>
        <g className="peristalsis" data-visible={ring}>
          <path d="M-13 -40 Q-4 -28 -13 -16 M13 -40 Q4 -28 13 -16" />
          <path className="push" d="M0 14 L0 28" markerEnd="url(#arrow-air)" />
        </g>
        <circle className="bolus" r="9" />
      </g>

      <g className="labels">
        <text x="60" y="84" className="minor">
          Cavità nasale
        </text>
        <text x="100" y="160">
          Lingua
        </text>
        <text x="270" y="130" className="minor">
          Palato molle
        </text>
        <text x="270" y="190">
          Faringe
        </text>
        <text x="130" y="232" className="minor">
          Epiglottide
        </text>
        <text x="148" y="300">
          Trachea
        </text>
        <text x="274" y="296">
          Esofago
        </text>
        <text x="130" y="374" className="minor">
          Diaframma
        </text>
        <text x="300" y="400" textAnchor="middle" className="minor">
          Stomaco
        </text>
        <text className="breath-stop" x="160" y="84">
          Respiro fermo
        </text>
      </g>
    </svg>
  );
}
