import type { IndexEntry } from '@/models/atlasIndex';

/**
 * Riga dell'Indice per un organo o una struttura: mostra nel corpo, o apre il testo senza 3D.
 * Una parte che il modello non ha apre la scheda che la descrive e porta alla sua definizione.
 */
export function StructureEntry({
  entry: e,
  textOnly,
  onShow,
  onOpenSheet,
  onShowDefinition,
}: {
  entry: IndexEntry;
  textOnly: boolean;
  onShow: (e: IndexEntry) => void;
  onOpenSheet: (unit: string) => void;
  onShowDefinition: (term: string) => void;
}) {
  if (e.partOf)
    return (
      <PartEntry
        entry={e}
        textOnly={textOnly}
        onOpenSheet={onOpenSheet}
        onShow={onShow}
        onShowDefinition={onShowDefinition}
      />
    );
  const c = e.content;
  const kind = c ? (c.scheda ? 'Testo e scheda' : 'Testo') : 'Solo nel modello 3D';
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
          {e.name}
        </button>
      ) : (
        <span className="entry-name">{e.name}</span>
      )}
      <span className="entry-term" lang="la">
        {e.latinTerm}
      </span>
      <span className="entry-detail">{kind}</span>
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
  textOnly,
  onShow,
  onOpenSheet,
  onShowDefinition,
}: {
  entry: IndexEntry;
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
          {e.name}
        </button>
      ) : (
        <span className="entry-name">{e.name}</span>
      )}
      <span className="entry-term" lang="la">
        {e.latinTerm}
      </span>
      <span className="entry-detail">Non nel modello 3D · scheda {parent.nome}</span>
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
