import type { NumberedSource } from '@/models/content';
import { SourceReference } from './SourceReference';

/** Elenco numerato delle fonti di un testo; i numeri corrispondono ai rimandi nel testo. */
export function SourceList({ sources }: { sources: NumberedSource[] }) {
  return (
    <ol className="source-list">
      {sources.map((s) => (
        <li key={s.id} id={`fonte-${s.n}`} value={s.n}>
          <SourceReference source={s} />
        </li>
      ))}
    </ol>
  );
}
