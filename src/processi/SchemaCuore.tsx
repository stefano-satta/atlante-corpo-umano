import type { Passo } from '../contenuti/tipi';

// Schema del cuore in sezione frontale, disegnato per l'atlante. Segue la convenzione
// anatomica: il lato destro del corpo è a sinistra di chi guarda. Forme e proporzioni
// sono semplificate e non in scala; lo dichiara la didascalia sotto il disegno.
//
// Il disegno non ha logica propria: legge lo stato del passo dagli attributi data-* della
// radice e lo traduce in forma con il CSS (cavità contratte, valvole chiuse, segnale, flussi).

/** Lembo di una valvola: ruota attorno al punto di attacco alla parete. */
function Lembo({
  x,
  y,
  verso,
  aperta,
  lunghezza = 32,
}: {
  x: number;
  y: number;
  verso: 1 | -1;
  aperta: 'su' | 'giu';
  lunghezza?: number;
}) {
  // Chiusa: il lembo è orizzontale e incontra quello opposto. Aperta: si piega nella direzione del flusso.
  return (
    <line
      className={`lembo lembo-${aperta}`}
      style={{ transformOrigin: `${x}px ${y}px`, ['--verso' as string]: verso }}
      x1={x}
      y1={y}
      x2={x + verso * lunghezza}
      y2={y}
    />
  );
}

/** Freccia di flusso: un tratteggio che scorre lungo il percorso del sangue. */
function Flusso({ d, gruppo }: { d: string; gruppo: Passo['flussi'][number] }) {
  return <path className="flusso" data-flusso={gruppo} d={d} markerEnd="url(#punta)" />;
}

export function SchemaCuore({ passo }: { passo: Passo }) {
  const flussi = new Set(passo.flussi);
  return (
    <svg
      className="schema-cuore"
      viewBox="0 0 520 450"
      aria-hidden="true"
      data-atri={passo.atri}
      data-ventricoli={passo.ventricoli}
      data-av={passo.av}
      data-semilunari={passo.semilunari}
      data-segnale={passo.segnale}
    >
      <defs>
        <marker id="punta" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" className="punta" />
        </marker>
      </defs>

      <text className="orientamento" x="10" y="16">
        Destra del corpo
      </text>
      <text className="orientamento" x="510" y="16" textAnchor="end">
        Sinistra del corpo
      </text>

      {/* Vasi: povero di ossigeno (vene cave, arteria polmonare), ricco (vene polmonari, aorta). */}
      <path className="vaso povero" d="M110 40 V152" />
      <path className="vaso povero" d="M40 412 V206 Q40 192 72 192" />
      <path className="vaso ricco" d="M500 176 H408 M500 214 H408" />
      <path className="vaso povero" d="M220 250 V58" />
      <path className="vaso ricco" d="M260 250 V70 Q260 34 300 34 H430 Q456 34 456 60 V116" />

      {/* Cavità */}
      <g className="cavita atrio povero">
        <rect x="70" y="150" width="130" height="86" rx="26" />
      </g>
      <g className="cavita atrio ricco">
        <rect x="280" y="150" width="130" height="86" rx="26" />
      </g>
      <g className="cavita ventricolo povero">
        <path d="M70 250 H236 V372 Q200 404 150 384 Q78 352 70 250 Z" />
      </g>
      <g className="cavita ventricolo ricco">
        <path d="M244 250 H410 Q410 344 352 384 Q296 414 244 392 Z" />
      </g>

      {/* Valvole tra atri e ventricoli: tricuspide (destra) e mitrale (sinistra) */}
      <g className="valvole av">
        <Lembo x={100} y={243} verso={1} aperta="giu" />
        <Lembo x={170} y={243} verso={-1} aperta="giu" />
        <Lembo x={310} y={243} verso={1} aperta="giu" />
        <Lembo x={380} y={243} verso={-1} aperta="giu" />
      </g>
      {/* Valvole polmonare e aortica, alla base delle due arterie */}
      <g className="valvole semilunari">
        <Lembo x={207} y={254} verso={1} aperta="su" lunghezza={13} />
        <Lembo x={233} y={254} verso={-1} aperta="su" lunghezza={13} />
        <Lembo x={247} y={254} verso={1} aperta="su" lunghezza={13} />
        <Lembo x={273} y={254} verso={-1} aperta="su" lunghezza={13} />
      </g>

      {/* Flussi del sangue */}
      <g className="flussi" data-attivi={[...flussi].join(' ')}>
        <Flusso gruppo="vene-atri" d="M110 50 V140" />
        <Flusso gruppo="vene-atri" d="M40 400 V212 Q40 196 62 194" />
        <Flusso gruppo="vene-atri" d="M496 176 H418" />
        <Flusso gruppo="vene-atri" d="M496 214 H418" />
        <Flusso gruppo="atri-ventricoli" d="M135 210 V300" />
        <Flusso gruppo="atri-ventricoli" d="M345 210 V300" />
        <Flusso gruppo="ventricoli-arterie" d="M220 330 V70" />
        <Flusso gruppo="ventricoli-arterie" d="M260 330 V80 Q260 46 300 46 H420" />
      </g>

      {/* Sistema di conduzione: nodo senoatriale e nodo atrioventricolare */}
      <g className="segnale">
        <circle className="alone-nodo nodo-sa" cx="162" cy="167" r="5" />
        <circle className="nodo nodo-sa" cx="162" cy="167" r="5" />
        <circle className="alone-nodo nodo-av" cx="190" cy="224" r="5" />
        <circle className="nodo nodo-av" cx="190" cy="224" r="5" />
      </g>

      {/* Etichette */}
      <g className="etichette">
        <text x="135" y="201" textAnchor="middle">
          Atrio destro
        </text>
        <text x="345" y="201" textAnchor="middle">
          Atrio sinistro
        </text>
        <text x="150" y="322" textAnchor="middle">
          Ventricolo destro
        </text>
        <text x="330" y="322" textAnchor="middle">
          Ventricolo sinistro
        </text>
        <text className="minore" x="96" y="62" textAnchor="end">
          <tspan x="96">Vena cava</tspan>
          <tspan x="96" dy="14">
            superiore
          </tspan>
        </text>
        <text className="minore" x="54" y="424">
          <tspan x="54">Vena cava inferiore</tspan>
        </text>
        <text className="minore" x="198" y="104" textAnchor="end">
          <tspan x="198">Arteria</tspan>
          <tspan x="198" dy="14">
            polmonare
          </tspan>
        </text>
        <text className="minore" x="282" y="110">
          Aorta
        </text>
        <text className="minore" x="500" y="158" textAnchor="end">
          Vene polmonari
        </text>
        <text className="testo-nodo" x="154" y="170" textAnchor="end">
          Nodo senoatriale
        </text>
        <text className="testo-nodo" x="182" y="227" textAnchor="end">
          Nodo atrioventricolare
        </text>
      </g>
    </svg>
  );
}
