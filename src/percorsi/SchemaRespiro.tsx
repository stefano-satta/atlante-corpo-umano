import { useEffect, useState } from 'react';
import type { SchemaPercorso } from '../contenuti/tipi';

// Schemi del percorso "Un respiro" (D24), disegnati per l'atlante: il torace visto di fronte, con
// polmoni, costole e diaframma, e un alveolo con il suo capillare. Seguono la convenzione anatomica
// (il lato destro del corpo è a sinistra di chi guarda); forme e proporzioni non sono in scala, e lo
// dichiara l'avvertenza sotto il disegno. Il movimento è affidato al CSS, che legge data-fase.

export type Fase = 'riposo' | 'inspirazione' | 'espirazione';

/** Durata di una fase nella riproduzione continua: un tempo di lettura, non quello di un respiro reale. */
export const DURATA_FASE_MS = 2600;

/**
 * Fase da mostrare: quella del passo, oppure, in riproduzione, inspirazione ed espirazione
 * alternate. Entrando in un passo il disegno parte dalla fase precedente e si muove verso
 * quella del passo; con il movimento ridotto la mostra subito.
 */
export function useFase(schema: SchemaPercorso, inRiproduzione: boolean, ridotto: boolean): Fase {
  const meta: Fase = schema === 'inspirazione' ? 'inspirazione' : schema === 'espirazione' ? 'espirazione' : 'riposo';
  const partenza: Fase = ridotto
    ? meta
    : meta === 'inspirazione'
      ? 'riposo'
      : meta === 'espirazione'
        ? 'inspirazione'
        : meta;
  const [fase, impostaFase] = useState<Fase>(partenza);

  useEffect(() => {
    if (inRiproduzione) {
      impostaFase('inspirazione');
      const t = setInterval(
        () => impostaFase((f) => (f === 'inspirazione' ? 'espirazione' : 'inspirazione')),
        DURATA_FASE_MS,
      );
      return () => clearInterval(t);
    }
    // Due fotogrammi: il primo disegna la fase di partenza, il secondo avvia la transizione.
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => impostaFase(meta));
    });
    return () => cancelAnimationFrame(id);
  }, [meta, inRiproduzione]);

  return fase;
}

function Costole({ lato }: { lato: 'destra' | 'sinistra' }) {
  const verso = lato === 'destra' ? -1 : 1;
  const x0 = 180 + verso * 8;
  return (
    <g className={`costole costole-${lato}`}>
      {[84, 114, 144, 174, 204].map((y) => (
        <path key={y} d={`M${x0} ${y} Q${180 + verso * 70} ${y - 14} ${180 + verso * 98} ${y + 34}`} />
      ))}
    </g>
  );
}

export function SchemaTorace({ fase }: { fase: Fase }) {
  return (
    <svg className="schema-respiro schema-torace" viewBox="0 0 360 304" aria-hidden="true" data-fase={fase}>
      <defs>
        <marker id="punta-respiro" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" className="punta" />
        </marker>
      </defs>

      <text className="orientamento" x="8" y="16">
        Destra del corpo
      </text>
      <text className="orientamento" x="352" y="16" textAnchor="end">
        Sinistra del corpo
      </text>

      <g className="polmoni">
        <path
          className="polmone"
          d="M150 64 C128 66 108 94 98 132 C88 170 82 206 84 232 C110 222 140 220 160 226 C164 190 164 150 160 112 C158 88 156 72 150 64 Z"
        />
        <path
          className="polmone"
          d="M210 64 C232 66 252 94 262 132 C272 170 278 206 276 232 C252 222 226 220 206 226 C202 210 214 196 210 180 C204 166 204 150 204 122 C204 94 206 74 210 64 Z"
        />
      </g>
      <g className="vie-aeree">
        <path d="M180 22 V92" />
        <path className="bronchi" d="M180 90 L152 118 M180 90 L208 120" />
      </g>
      <Costole lato="destra" />
      <Costole lato="sinistra" />
      <path className="diaframma" d="M66 254 C98 200 150 212 180 226 C210 212 262 200 294 254" />

      {/* Frecce: l'aria nella trachea, il diaframma, la parete del torace. */}
      <g className="frecce frecce-inspirazione">
        <path d="M198 16 V70" markerEnd="url(#punta-respiro)" />
        <path d="M180 240 V272" markerEnd="url(#punta-respiro)" />
        <path d="M70 148 H46" markerEnd="url(#punta-respiro)" />
        <path d="M290 148 H314" markerEnd="url(#punta-respiro)" />
      </g>
      <g className="frecce frecce-espirazione">
        <path d="M198 70 V16" markerEnd="url(#punta-respiro)" />
        <path d="M180 272 V240" markerEnd="url(#punta-respiro)" />
        <path d="M46 148 H70" markerEnd="url(#punta-respiro)" />
        <path d="M314 148 H290" markerEnd="url(#punta-respiro)" />
      </g>

      <g className="etichette">
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
        <text className="minore" x="8" y="104">
          Costole
        </text>
        <text x="180" y="296" textAnchor="middle">
          Diaframma
        </text>
      </g>
    </svg>
  );
}

export function SchemaAlveolo() {
  return (
    <svg className="schema-respiro schema-alveolo" viewBox="0 0 360 262" aria-hidden="true">
      <defs>
        <linearGradient id="sangue-capillare" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0.3" className="stop-povero" />
          <stop offset="0.7" className="stop-ricco" />
        </linearGradient>
        <marker id="punta-alveolo" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" className="punta" />
        </marker>
        <marker
          id="punta-ossigeno"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 Z" className="punta-ossigeno" />
        </marker>
        <marker
          id="punta-anidride"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 Z" className="punta-anidride" />
        </marker>
      </defs>

      <path className="bronchiolo" d="M180 0 V54" />
      <circle className="alveolo" cx="180" cy="112" r="62" />
      <path
        className="capillare"
        d="M14 204 C76 204 104 194 126 168 C150 182 210 182 234 168 C256 194 284 204 346 204"
      />
      <path
        className="corrente"
        d="M24 204 C76 204 104 194 126 168 C150 182 210 182 234 168 C256 194 284 204 336 204"
        markerEnd="url(#punta-alveolo)"
      />

      {/* I due gas si distinguono per colore; i nomi sono nella legenda sotto il disegno. */}
      <path className="gas ossigeno" d="M164 112 V176" markerEnd="url(#punta-ossigeno)" />
      <path className="gas anidride" d="M196 182 V118" markerEnd="url(#punta-anidride)" />

      <g className="etichette">
        <text x="180" y="82" textAnchor="middle">
          Alveolo
        </text>
        <text x="180" y="216" textAnchor="middle">
          Capillare
        </text>
        <text className="minore" x="14" y="234">
          <tspan x="14">Dall'arteria</tspan>
          <tspan x="14" dy="14">
            polmonare
          </tspan>
        </text>
        <text className="minore" x="346" y="234" textAnchor="end">
          <tspan x="346">Verso le vene</tspan>
          <tspan x="346" dy="14">
            polmonari
          </tspan>
        </text>
      </g>
    </svg>
  );
}
