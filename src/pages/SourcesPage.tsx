import type { ReactNode } from 'react';
import { SourceReference } from '@/components/common/SourceReference';
import { ReadingLayout } from '@/components/features/layout/ReadingLayout';
import { useSources } from '@/hooks/useContent';
import type { CitedSource } from '@/models/content';
import { GLOSSARY, GUIDED_PATHS, STRUCTURES } from '@/utils/content';

const GROUPS: Array<{ type: CitedSource['tipo']; title: string; description: string }> = [
  {
    type: 'istituzionale',
    title: 'Enti di sanità pubblica',
    description: 'Pagine divulgative di istituti dei National Institutes of Health statunitensi.',
  },
  {
    type: 'manuale',
    title: 'Manuali universitari',
    description: 'Capitoli di manuali usati nei corsi di anatomia e fisiologia.',
  },
  {
    type: 'terminologia',
    title: 'Terminologia',
    description: 'Standard internazionale usato per verificare i termini latini.',
  },
];

/** Bibliografia completa dell'atlante, divisa per tipo di fonte. */
export function SourcesPage() {
  const { data: sources, error } = useSources();
  const published = new Set([
    ...STRUCTURES.map((s) => s.id),
    ...GUIDED_PATHS.map((p) => `percorsi/${p.id}`),
    ...GLOSSARY.map((g) => `glossario/${g.id}`),
  ]);

  let content: ReactNode;
  if (error) content = <p className="notice">Non è stato possibile caricare l'elenco delle fonti.</p>;
  else if (!sources) content = <p role="status">Caricamento delle fonti…</p>;
  else
    content = (
      <>
        <p className="intro">
          Tutte le fonti usate per scrivere e verificare i testi dell'atlante, con la data in cui sono state consultate.
          Nei testi ogni rimando numerato porta alla fonte corrispondente.
        </p>
        {GROUPS.map((g) => {
          const list = sources.filter((s) => s.tipo === g.type);
          if (!list.length) return null;
          return (
            <section key={g.type} aria-labelledby={`group-${g.type}`}>
              <h2 id={`group-${g.type}`}>{g.title}</h2>
              <p className="group-description">{g.description}</p>
              <ul className="bibliography">
                {list.map((s) => {
                  // Più voci del glossario citano la stessa fonte: il nome "glossario" compare una volta sola.
                  const citedBy = [...new Set(s.citataDa.filter((c) => published.has(c.id)).map((c) => c.nome))];
                  return (
                    <li key={s.id}>
                      <SourceReference source={s} />
                      {citedBy.length > 0 && <span className="cited-by">Citata per: {citedBy.join(', ')}.</span>}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </>
    );

  return <ReadingLayout title="Fonti">{content}</ReadingLayout>;
}
