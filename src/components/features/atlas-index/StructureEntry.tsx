import type { IndexEntry } from '@/models/atlasIndex';
import { Highlight } from './Highlight';

/**
 * Riga dell'Indice per un organo o una struttura: mostra nel corpo, o apre il testo senza 3D.
 * Una parte che il modello non ha apre la scheda che la descrive e porta alla sua definizione.
 * L'etichetta a destra compare solo per le eccezioni: le voci con testo sono la regola.
 */
export function StructureEntry({
  entry: e,
  query,
  textOnly,
  onShow,
  onOpenSheet,
  onShowDefinition,
}: {
  entry: IndexEntry;
  query: string;
  textOnly: boolean;
  onShow: (e: IndexEntry) => void;
  onOpenSheet: (unit: string) => void;
  onShowDefinition: (term: string) => void;
}) {
  if (e.partOf)
    return (
      <PartEntry
        entry={e}
        query={query}
        textOnly={textOnly}
        onOpenSheet={onOpenSheet}
        onShow={onShow}
        onShowDefinition={onShowDefinition}
      />
    );
  const c = e.content;
  const enabled = textOnly ? !!c : !!e.unit;
  return (
    <li className="index-entry">
      {enabled ? (
        <button
          type="button"
          className="entry-name"
          aria-label={`${e.name}: ${textOnly ? 'leggi il testo' : 'mostra nel corpo'}`}
          onClick={() => onShow(e)}
        >
          <Highlight text={e.name} query={query} />
        </button>
      ) : (
        <span className="entry-name">
          <Highlight text={e.name} query={query} />
        </span>
      )}
      <span className="entry-term" lang="la">
        <Highlight text={e.latinTerm} query={query} />
      </span>
      {!c && <span className="entry-detail">Solo nel modello 3D</span>}
      {c?.scheda && !textOnly && e.unit && (
        <button
          type="button"
          className="entry-open"
          aria-label={`Apri la scheda: ${e.name}`}
          onClick={() => e.unit && onOpenSheet(e.unit)}
        >
          Scheda
        </button>
      )}
    </li>
  );
}

function PartEntry({
  entry: e,
  query,
  textOnly,
  onShow,
  onOpenSheet,
  onShowDefinition,
}: {
  entry: IndexEntry;
  query: string;
  textOnly: boolean;
  onShow: (e: IndexEntry) => void;
  onOpenSheet: (unit: string) => void;
  onShowDefinition: (term: string) => void;
}) {
  const parent = e.partOf;
  if (!parent) return null;
  const unit = parent.unita;
  const enabled = textOnly || !!unit;
  return (
    <li className="index-entry">
      {enabled ? (
        <button
          type="button"
          className="entry-name"
          aria-label={`${e.name}: ${textOnly ? 'leggi il testo' : 'apri la scheda'} ${parent.nome}`}
          onClick={() => (textOnly ? onShow({ ...e, content: parent }) : unit && onOpenSheet(unit))}
        >
          <Highlight text={e.name} query={query} />
        </button>
      ) : (
        <span className="entry-name">
          <Highlight text={e.name} query={query} />
        </span>
      )}
      <span className="entry-term" lang="la">
        <Highlight text={e.latinTerm} query={query} />
      </span>
      <span className="entry-detail">
        {e.inModel ? 'Nel modello 3D con' : 'Non nel modello 3D · scheda'} {parent.nome}
      </span>
      {e.glossaryTerm && (
        <button
          type="button"
          className="entry-open"
          aria-label={`Definizione: ${e.name}`}
          onClick={() => e.glossaryTerm && onShowDefinition(e.glossaryTerm)}
        >
          Definizione
        </button>
      )}
    </li>
  );
}
