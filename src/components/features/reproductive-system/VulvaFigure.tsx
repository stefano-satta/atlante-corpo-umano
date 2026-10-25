import { RichText } from '@/components/features/glossary/RichText';
import type { Figure } from '@/models/content';
import { GLOSSARY } from '@/utils/content';
import { VULVA_PARTS, VulvaDiagram } from './VulvaDiagram';

const published = new Set(GLOSSARY.map((g) => g.id));

/** Elenco numerato delle parti: ogni nome apre la sua definizione, se la voce è pubblicata. */
const partsHtml = `<ol class="figure-parts">${VULVA_PARTS.map(
  ({ term, name }) =>
    `<li>${published.has(term) ? `<a class="glossary-term" href="/indice#glossario-${term}" data-term="${term}">${name}</a>` : name}</li>`,
).join('')}</ol>`;

/**
 * Figura dei genitali esterni nella scheda della vagina: lo schema con le parti numerate,
 * l'elenco dei nomi (che è anche l'alternativa testuale al disegno) e la didascalia con le fonti.
 */
export default function VulvaFigure({ figure }: { figure: Figure }) {
  return (
    <figure className="cycle anatomy-figure" aria-label={figure.titolo}>
      <p className="cycle-title">{figure.titolo}</p>
      <div className="cycle-diagram">
        <VulvaDiagram />
      </div>
      <RichText className="text" html={partsHtml} />
      <figcaption>
        <RichText className="text cycle-disclaimer" html={figure.html} />
      </figcaption>
    </figure>
  );
}
