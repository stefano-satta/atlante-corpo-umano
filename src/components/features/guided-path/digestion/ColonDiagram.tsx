import { Arrowhead, type DiagramProps } from './diagramParts';

/* 7 · L'intestino crasso, visto di fronte. */

const COLON =
  'M70 262 L70 92 C70 70 84 60 104 60 L256 60 C278 60 290 72 290 94 L290 214 C290 244 272 252 246 254 C214 256 190 262 184 280 L184 318';
// Tratto riempito: [lunghezza, inizio] in centesimi del percorso, dal cieco all'ano.
const COLON_CONTENT: Record<string, [number, number]> = {
  ingresso: [18, 0],
  acqua: [44, 0],
  flora: [52, 4],
  massa: [26, 72],
};

export function ColonDiagram({ phase }: DiagramProps) {
  const [length, start] = COLON_CONTENT[phase] ?? COLON_CONTENT.ingresso;
  return (
    <svg className="digestion-diagram colon-diagram" viewBox="0 0 360 330" aria-hidden="true" data-phase={phase}>
      <defs>
        <Arrowhead id="arrow-colon" className="arrowhead water-head" />
      </defs>
      <text className="orientation" x="8" y="22">
        Destra del corpo
      </text>
      <text className="orientation" x="352" y="22" textAnchor="end">
        Sinistra del corpo
      </text>
      <path className="ileum" d="M170 236 C130 240 104 250 92 260" />
      <ellipse className="cecum" cx="70" cy="266" rx="22" ry="20" />
      <path className="appendix" d="M62 284 C58 300 48 308 40 302" />
      <path className="colon" d={COLON} />
      <path className="haustra" d={COLON} />
      <path
        className="colon-content"
        data-phase={phase}
        d={COLON}
        pathLength="100"
        style={{ strokeDasharray: `${length} 100`, strokeDashoffset: -start }}
      />
      <g className="water" data-visible={phase === 'acqua'}>
        <path d="M70 200 L40 200" markerEnd="url(#arrow-colon)" />
        <path d="M70 140 L40 140" markerEnd="url(#arrow-colon)" />
        <path d="M130 60 L130 30" markerEnd="url(#arrow-colon)" />
        <path d="M200 60 L200 30" markerEnd="url(#arrow-colon)" />
      </g>
      <g className="bacteria" data-visible={phase === 'flora'}>
        {[
          [100, 62, 20],
          [128, 58, -30],
          [152, 64, 10],
          [176, 58, 60],
          [76, 120, 80],
          [66, 170, -70],
          [200, 62, -20],
        ].map(([x, y, r]) => (
          <rect
            key={`${x}-${y}`}
            x={x - 4}
            y={y - 1.5}
            width="8"
            height="3"
            rx="1.5"
            transform={`rotate(${r} ${x} ${y})`}
          />
        ))}
        <circle className="gas" cx="230" cy="58" r="4" />
        <circle className="gas" cx="244" cy="64" r="3" />
        <circle className="gas" cx="286" cy="110" r="3.5" />
      </g>
      <path
        className="mass-arrow"
        data-visible={phase === 'massa'}
        d="M236 86 C270 92 270 120 270 200"
        markerEnd="url(#arrow-colon)"
      />

      <g className="labels">
        <text x="104" y="112">
          Colon
        </text>
        <text x="104" y="128" className="minor">
          ascendente
        </text>
        <text x="152" y="100" className="minor">
          trasverso
        </text>
        <text x="268" y="150" className="minor" textAnchor="end">
          discendente
        </text>
        <text x="214" y="302" className="minor">
          sigmoideo
        </text>
        <text x="96" y="296" className="minor">
          Cieco
        </text>
        <text x="8" y="318" className="minor">
          Appendice
        </text>
        <text x="160" y="314" className="minor" textAnchor="end">
          Retto
        </text>
        <text x="142" y="226" className="minor">
          Ileo
        </text>
        <text className="phase-note" data-visible={phase === 'flora'} x="120" y="40">
          vitamina K
        </text>
      </g>
    </svg>
  );
}
