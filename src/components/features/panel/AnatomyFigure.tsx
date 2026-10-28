import type { ReactNode } from 'react';
import { RichText } from '@/components/features/glossary/RichText';
import type { Figure } from '@/models/content';
import { GLOSSARY } from '@/utils/content';

// Figure disegnate delle schede (genitali esterni, orecchio): schema con le parti numerate,
// elenco dei nomi collegato al glossario e didascalia con le fonti.

/** Una parte indicata: punto sul disegno, lato e posizione dell'etichetta, voce del glossario. */
export interface FigurePart {
  /** Voce del glossario; vuota per le parti che non ne hanno una. */
  term: string;
  name: string;
  /** Righe dell'etichetta nel disegno, se il nome è troppo lungo per una sola. */
  lines?: string[];
  target: [number, number];
  side: 'left' | 'right';
  y: number;
  /** Ascissa del numero, se diversa da quella della colonna del suo lato. */
  x?: number;
}

/** Numero, linea di richiamo e nome di una parte; `columns` dà l'ascissa delle due colonne. */
export function PartLabel({
  part,
  n,
  columns,
}: {
  part: FigurePart;
  n: number;
  columns: { left: number; right: number };
}) {
  const left = part.side === 'left';
  const x = part.x ?? columns[part.side];
  const lines = part.lines ?? [part.name];
  return (
    <g className="part-label">
      <line className="leader" x1={x} y1={part.y} x2={part.target[0]} y2={part.target[1]} />
      <circle className="target" cx={part.target[0]} cy={part.target[1]} r="2.5" />
      <circle className="number-badge" cx={x} cy={part.y} r="11" />
      <text className="number" x={x} y={part.y} dy="0.35em" textAnchor="middle">
        {n}
      </text>
      <text className="part-text" x={left ? x - 16 : x + 16} y={part.y} textAnchor={left ? 'end' : 'start'}>
        {lines.map((line, i) => (
          <tspan key={line} x={left ? x - 16 : x + 16} dy={i === 0 ? `${0.35 - (lines.length - 1) * 0.55}em` : '1.1em'}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

const published = new Set(GLOSSARY.map((g) => g.id));

/** Elenco numerato delle parti: ogni nome apre la sua definizione, se la voce è pubblicata. */
const partsHtml = (parts: FigurePart[]) =>
  `<ol class="figure-parts">${parts
    .map(
      ({ term, name }) =>
        `<li>${published.has(term) ? `<a class="glossary-term" href="/indice#glossario-${term}" data-term="${term}">${name}</a>` : name}</li>`,
    )
    .join('')}</ol>`;

/** Lo schema, l'elenco dei nomi (che è anche l'alternativa testuale al disegno) e la didascalia. */
export function AnatomyFigure({
  figure,
  parts,
  children,
}: {
  figure: Figure;
  parts: FigurePart[];
  children: ReactNode;
}) {
  return (
    <figure className="cycle anatomy-figure" aria-label={figure.titolo}>
      <p className="cycle-title">{figure.titolo}</p>
      <div className="cycle-diagram">{children}</div>
      <RichText className="text" html={partsHtml(parts)} />
      <figcaption>
        <RichText className="text cycle-disclaimer" html={figure.html} />
      </figcaption>
    </figure>
  );
}
