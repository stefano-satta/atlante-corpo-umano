import type { IndexEntry } from '@/models/atlasIndex';

/** Riga dell'Indice per un organo o una struttura: mostra nel corpo, o apre il testo senza 3D. */
export function StructureEntry({
  entry: e,
  textOnly,
  onShow,
  onOpenSheet,
}: {
  entry: IndexEntry;
  textOnly: boolean;
  onShow: (e: IndexEntry) => void;
  onOpenSheet: (unit: string) => void;
}) {
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
