import { Arrowhead, type DiagramProps } from './diagramParts';

/* 5 · Duodeno, fegato, colecisti e pancreas, visti di fronte. */

const DUODENUM =
  'M236 168 C210 168 186 164 172 176 C164 186 168 220 170 246 C172 268 190 276 214 276 C240 276 262 268 272 250 C276 240 276 228 274 218';
const CHYME_REACH: Record<string, number> = { chimo: 30, bile: 55, pancreas: 75, miscela: 100 };

export function DuodenumDiagram({ phase }: DiagramProps) {
  const bile = phase === 'bile' || phase === 'miscela';
  const juice = phase === 'pancreas' || phase === 'miscela';
  return (
    <svg className="digestion-diagram duodenum-diagram" viewBox="0 0 360 320" aria-hidden="true" data-phase={phase}>
      <defs>
        <Arrowhead id="arrow-hormone" className="arrowhead hormone-head" />
      </defs>
      <text className="orientation" x="8" y="310">
        Destra del corpo
      </text>
      <text className="orientation" x="352" y="310" textAnchor="end">
        Sinistra del corpo
      </text>
      <path
        className="liver"
        d="M14 40 C40 14 200 10 262 30 C286 38 290 56 270 70 C226 100 150 116 90 120 C40 122 10 92 14 40 Z"
      />
      <path
        className="organ-fill"
        d="M360 118 C320 110 280 118 262 138 C254 148 248 156 238 160 L238 178 C254 178 270 172 286 162 C312 150 340 150 360 152 Z"
      />
      <path
        className="pancreas"
        d="M190 196 C202 184 226 184 240 192 C262 196 300 190 336 182 C350 180 354 194 342 200 C312 212 270 216 246 222 C242 238 236 256 220 262 C204 266 188 256 186 240 C184 224 184 208 190 196 Z"
      />
      <path className="duodenum" d={DUODENUM} />
      <path className="jejunum" d="M274 218 C272 208 286 200 300 204" />
      <path
        className="chyme-line"
        data-neutral={phase === 'miscela'}
        d={DUODENUM}
        pathLength="100"
        style={{ strokeDasharray: `${CHYME_REACH[phase] ?? 30} 100` }}
      />
      <g className="sphincter pyloric" data-open="true">
        <path d="M238 156 L244 156" />
        <path d="M238 180 L244 180" />
      </g>

      <g className="ducts">
        <path className="duct" d="M150 96 L164 122 M184 96 L168 122 M166 122 L170 146" />
        <path className="duct" d="M136 134 C150 140 160 144 170 146 C172 176 178 196 182 214" />
        <path className="duct" d="M340 190 C300 200 260 208 234 214 C214 218 196 216 184 216" />
      </g>
      <path
        className="flow bile-flow"
        data-visible={bile}
        d="M136 134 C150 140 160 144 170 146 C172 176 178 196 182 214"
      />
      <path className="flow bile-flow" data-visible={bile} d="M150 96 L164 122 M184 96 L168 122 M166 122 L170 146" />
      <path
        className="flow juice-flow"
        data-visible={juice}
        d="M340 190 C300 200 260 208 234 214 C214 218 196 216 184 216"
      />
      <g className="gallbladder-wrap" data-contracted={bile}>
        <path
          className="gallbladder"
          d="M116 118 C108 134 112 156 128 160 C144 162 150 146 142 128 C138 120 128 114 116 118 Z"
        />
      </g>

      <path
        className="hormone"
        data-visible={phase === 'bile'}
        d="M160 200 C130 196 116 184 122 166"
        markerEnd="url(#arrow-hormone)"
      />
      <path
        className="hormone"
        data-visible={phase === 'pancreas'}
        d="M226 282 C276 290 312 258 306 222"
        markerEnd="url(#arrow-hormone)"
      />

      <g className="fat" data-split={phase === 'miscela'}>
        <g className="drops-big">
          <circle cx="198" cy="270" r="5" />
          <circle cx="232" cy="270" r="5" />
        </g>
        <g className="drops-small">
          {[190, 198, 206, 222, 230, 238].map((cx, i) => (
            <circle key={cx} cx={cx} cy={i % 2 ? 266 : 273} r="2" />
          ))}
        </g>
      </g>

      <g className="labels">
        <text x="90" y="64">
          Fegato
        </text>
        <text x="64" y="150" className="minor">
          Colecisti
        </text>
        <text x="300" y="104" className="minor">
          Stomaco
        </text>
        <text x="96" y="240">
          Duodeno
        </text>
        <text x="282" y="236">
          Pancreas
        </text>
        <text className="phase-note" data-visible={phase === 'bile'} x="10" y="204">
          colecistochinina
        </text>
        <text className="phase-note" data-visible={phase === 'pancreas'} x="250" y="300">
          secretina
        </text>
        <text className="phase-note" data-visible={phase === 'chimo'} x="190" y="154">
          chimo acido
        </text>
      </g>
    </svg>
  );
}
