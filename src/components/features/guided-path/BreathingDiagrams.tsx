import type { BreathPhase } from '@/models/breathing';

// Schemi del percorso "Un respiro" (D24), disegnati per l'atlante: il torace visto di fronte, con
// polmoni, costole e diaframma, e un alveolo con il suo capillare. Seguono la convenzione anatomica
// (il lato destro del corpo è a sinistra di chi guarda); forme e proporzioni non sono in scala, e lo
// dichiara l'avvertenza sotto il disegno. Il movimento è affidato al CSS, che legge data-phase.

function Ribs({ side }: { side: 'right' | 'left' }) {
  const direction = side === 'right' ? -1 : 1;
  const x0 = 180 + direction * 8;
  return (
    <g className={`ribs ribs-${side}`}>
      {[84, 114, 144, 174, 204].map((y) => (
        <path key={y} d={`M${x0} ${y} Q${180 + direction * 70} ${y - 14} ${180 + direction * 98} ${y + 34}`} />
      ))}
    </g>
  );
}

export function ChestDiagram({ phase }: { phase: BreathPhase }) {
  return (
    <svg className="breathing-diagram chest-diagram" viewBox="0 0 360 304" aria-hidden="true" data-phase={phase}>
      <defs>
        <marker
          id="arrowhead-breath"
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

      <text className="orientation" x="8" y="16">
        Destra del corpo
      </text>
      <text className="orientation" x="352" y="16" textAnchor="end">
        Sinistra del corpo
      </text>

      <g className="lungs">
        <path
          className="lung"
          d="M150 64 C128 66 108 94 98 132 C88 170 82 206 84 232 C110 222 140 220 160 226 C164 190 164 150 160 112 C158 88 156 72 150 64 Z"
        />
        <path
          className="lung"
          d="M210 64 C232 66 252 94 262 132 C272 170 278 206 276 232 C252 222 226 220 206 226 C202 210 214 196 210 180 C204 166 204 150 204 122 C204 94 206 74 210 64 Z"
        />
      </g>
      <g className="airways">
        <path d="M180 22 V92" />
        <path className="bronchi" d="M180 90 L152 118 M180 90 L208 120" />
      </g>
      <Ribs side="right" />
      <Ribs side="left" />
      <path className="diaphragm" d="M66 254 C98 200 150 212 180 226 C210 212 262 200 294 254" />

      {/* Frecce: l'aria nella trachea, il diaframma, la parete del torace. */}
      <g className="arrows arrows-inhale">
        <path d="M198 16 V70" markerEnd="url(#arrowhead-breath)" />
        <path d="M180 240 V272" markerEnd="url(#arrowhead-breath)" />
        <path d="M70 148 H46" markerEnd="url(#arrowhead-breath)" />
        <path d="M290 148 H314" markerEnd="url(#arrowhead-breath)" />
      </g>
      <g className="arrows arrows-exhale">
        <path d="M198 70 V16" markerEnd="url(#arrowhead-breath)" />
        <path d="M180 272 V240" markerEnd="url(#arrowhead-breath)" />
        <path d="M46 148 H70" markerEnd="url(#arrowhead-breath)" />
        <path d="M314 148 H290" markerEnd="url(#arrowhead-breath)" />
      </g>

      <g className="labels">
        <text x="172" y="40" textAnchor="end">
          Trachea
        </text>
        <text x="124" y="176" textAnchor="middle">
          <tspan x="124">Polmone</tspan>
          <tspan x="124" dy="15">
            destro
          </tspan>
        </text>
        <text x="240" y="176" textAnchor="middle">
          <tspan x="240">Polmone</tspan>
          <tspan x="240" dy="15">
            sinistro
          </tspan>
        </text>
        <text className="minor" x="8" y="104">
          Costole
        </text>
        <text x="180" y="296" textAnchor="middle">
          Diaframma
        </text>
      </g>
    </svg>
  );
}

export function AlveolusDiagram() {
  return (
    <svg className="breathing-diagram alveolus-diagram" viewBox="0 0 360 262" aria-hidden="true">
      <defs>
        <linearGradient id="capillary-blood" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0.3" className="stop-poor" />
          <stop offset="0.7" className="stop-rich" />
        </linearGradient>
        <marker
          id="arrowhead-alveolus"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 Z" className="arrowhead" />
        </marker>
        <marker
          id="arrowhead-oxygen"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 Z" className="arrowhead-oxygen" />
        </marker>
        <marker id="arrowhead-co2" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" className="arrowhead-co2" />
        </marker>
      </defs>

      <path className="bronchiole" d="M180 0 V54" />
      <circle className="alveolus" cx="180" cy="112" r="62" />
      <path
        className="capillary"
        d="M14 204 C76 204 104 194 126 168 C150 182 210 182 234 168 C256 194 284 204 346 204"
      />
      <path
        className="current"
        d="M24 204 C76 204 104 194 126 168 C150 182 210 182 234 168 C256 194 284 204 336 204"
        markerEnd="url(#arrowhead-alveolus)"
      />

      {/* I due gas si distinguono per colore; i nomi sono nella legenda sotto il disegno. */}
      <path className="gas oxygen" d="M164 112 V176" markerEnd="url(#arrowhead-oxygen)" />
      <path className="gas co2" d="M196 182 V118" markerEnd="url(#arrowhead-co2)" />

      <g className="labels">
        <text x="180" y="82" textAnchor="middle">
          Alveolo
        </text>
        <text x="180" y="216" textAnchor="middle">
          Capillare
        </text>
        <text className="minor" x="14" y="234">
          <tspan x="14">Dall'arteria</tspan>
          <tspan x="14" dy="14">
            polmonare
          </tspan>
        </text>
        <text className="minor" x="346" y="234" textAnchor="end">
          <tspan x="346">Verso le vene</tspan>
          <tspan x="346" dy="14">
            polmonari
          </tspan>
        </text>
      </g>
    </svg>
  );
}
