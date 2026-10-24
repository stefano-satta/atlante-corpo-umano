import type { Source } from '@/models/content';
import { sourceAuthor } from '@/utils/format';

/** Fonti di una voce del glossario, in una riga: titolo con collegamento e autore. */
export function ShortSourceList({ sources }: { sources: Source[] }) {
  return (
    <p className="entry-sources">
      {sources.length > 1 ? 'Fonti: ' : 'Fonte: '}
      {sources.map((s, i) => (
        <span key={s.id}>
          {i > 0 && '; '}
          <a href={s.url} target="_blank" rel="noopener noreferrer">
            {s.titolo}
          </a>{' '}
          ({sourceAuthor(s)})
        </span>
      ))}
      .
    </p>
  );
}
