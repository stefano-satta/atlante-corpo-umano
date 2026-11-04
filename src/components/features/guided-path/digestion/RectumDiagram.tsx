import { Arrowhead, at, type DiagramProps } from './diagramParts';

/* 8 · Retto e canale anale, in sezione. */

const STOOL: Record<string, [number, number, number, number]> = {
  riempimento: [180, 134, 1, 1],
  riflesso: [180, 168, 0.95, 1],
  volonta: [180, 176, 0.92, 1],
  evacuazione: [180, 300, 0.7, 0],
};

export function RectumDiagram({ phase }: DiagramProps) {
  const [x, y, s, o] = STOOL[phase] ?? STOOL.riempimento;
  const internalOpen = phase !== 'riempimento';
  const externalOpen = phase === 'evacuazione';
  const externalHeld = phase === 'riflesso' || phase === 'volonta';
  return (
    <svg className="digestion-diagram rectum-diagram" viewBox="0 0 360 300" aria-hidden="true" data-phase={phase}>
      <defs>
        <Arrowhead id="arrow-rectum" className="arrowhead" />
      </defs>
      <path className="colon" d="M320 6 C320 50 270 58 226 62" />
      <path
        className="rectum-lumen"
        d="M150 66 L210 66 C222 108 222 168 200 196 L188 212 L188 280 L172 280 L172 212 L160 196 C138 168 138 108 150 66 Z"
      />
      <g className="rectum-walls" data-contracted={phase === 'riflesso'}>
        <path d="M150 66 C138 108 138 168 160 196 L172 212 L172 280" />
        <path d="M210 66 C222 108 222 168 200 196 L188 212 L188 280" />
      </g>
      <g className="squeeze" data-visible={phase === 'riflesso'}>
        <path d="M114 130 L134 130" markerEnd="url(#arrow-rectum)" />
        <path d="M246 130 L226 130" markerEnd="url(#arrow-rectum)" />
      </g>
      <g className="sphincter-internal" data-open={internalOpen}>
        <rect className="left" x="162" y="204" width="8" height="38" rx="2" />
        <rect className="right" x="190" y="204" width="8" height="38" rx="2" />
      </g>
      <g className="sphincter-external" data-open={externalOpen} data-held={externalHeld}>
        <rect className="left" x="146" y="230" width="14" height="44" rx="3" />
        <rect className="right" x="200" y="230" width="14" height="44" rx="3" />
      </g>
      <g className="moving stool" style={at(x, y, s, o)}>
        <ellipse rx="22" ry="30" />
      </g>

      <g className="labels">
        <text x="240" y="96" className="minor">
          Colon sigmoideo
        </text>
        <text x="250" y="178">
          Retto
        </text>
        <text x="30" y="210" className="minor">
          Sfintere interno
        </text>
        <text x="30" y="224" className="minor sub">
          involontario
        </text>
        <text x="226" y="252" className="minor">
          Sfintere esterno
        </text>
        <text x="226" y="266" className="minor sub">
          volontario
        </text>
        <text x="196" y="296" className="minor">
          Ano
        </text>
      </g>
      <path className="leader" d="M112 214 L160 222" />
      <path className="leader" d="M224 250 L214 250" />
    </svg>
  );
}
