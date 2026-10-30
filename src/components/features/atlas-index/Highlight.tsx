import { highlight } from '@/utils/search';

/** Testo con gli inizi di parola trovati dalla ricerca evidenziati. */
export function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  return (
    <>
      {highlight(text, query).map((p, i) =>
        p.match ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: i pezzi di un testo fisso non cambiano ordine
          <mark key={i}>{p.text}</mark>
        ) : (
          p.text
        ),
      )}
    </>
  );
}
