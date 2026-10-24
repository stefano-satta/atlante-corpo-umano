import type { Source } from '@/models/content';
import { formatLongDate, sourceAuthor } from '@/utils/format';

/** Riferimento bibliografico completo: titolo con collegamento, autore, edizione e date. */
export function SourceReference({ source: s }: { source: Source }) {
  const edition = [s.editore, s.anno].filter(Boolean).join(', ');
  return (
    <>
      <a href={s.url} target="_blank" rel="noopener noreferrer" className="source-title">
        {s.titolo}
      </a>
      <span className="source-author">
        {sourceAuthor(s)}
        {edition && `. ${edition}`}.
      </span>
      <span className="source-dates">
        {s.aggiornata && `Aggiornata il ${formatLongDate(s.aggiornata)}. `}Consultata il {formatLongDate(s.consultata)}.
      </span>
      {s.nota && <span className="source-note">{s.nota}</span>}
    </>
  );
}
