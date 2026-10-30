import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShortSourceList } from '@/components/common/ShortSourceList';
import { Highlight } from '@/components/features/atlas-index/Highlight';
import { SearchField } from '@/components/features/atlas-index/SearchField';
import { PartOfLink } from '@/components/features/glossary/PartOfLink';
import { RichText } from '@/components/features/glossary/RichText';
import { ReadingLayout } from '@/components/features/layout/ReadingLayout';
import { useGlossary } from '@/hooks/useContent';
import { useSearchQuery } from '@/hooks/useSearchQuery';
import type { GlossaryDefinition } from '@/models/content';
import { GLOSSARY } from '@/utils/content';
import { alphabet, areaOf, byInitial, glossaryAreas } from '@/utils/glossaryGroups';
import {
  GLOSSARY_REQUEST_EVENT,
  takeRequestedGlossaryEntry,
  takeRequestedGlossarySearch,
} from '@/utils/glossaryRequest';
import { scrollBelowSearch } from '@/utils/scroll';
import { matches } from '@/utils/search';

// Con pochi risultati le definizioni si aprono da sole: si leggono senza un altro tocco.
const OPEN_RESULTS = 3;

/**
 * Glossario: pagina a sé (prima era una sezione dell'Indice, D26), con ricerca, lettere e filtri
 * per apparato. Le definizioni sono chiuse e si aprono dal termine; una voce richiesta da una
 * definizione sul posto, o da /glossario#glossario-<voce>, si apre e prende il fuoco.
 */
export function GlossaryPage() {
  const { data: definitions, error } = useGlossary(GLOSSARY.length > 0);
  const [query, setQuery] = useSearchQuery(takeRequestedGlossarySearch);
  const [area, setArea] = useState<string | null>(null);
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const areas = useMemo(() => glossaryAreas(), []);
  const letters = useMemo(() => alphabet(), []);

  const visible = useCallback(
    (q: string, a: string | null) =>
      (definitions ?? []).filter(
        (d) => (!a || areaOf(d) === a) && matches(q, [d.termine, ...d.varianti, ...(d.latino ? [d.latino] : [])]),
      ),
    [definitions],
  );
  const results = visible(query, area);
  const groups = byInitial(results);
  const searching = query.trim() !== '';

  const refine = (q: string, a: string | null) => {
    setQuery(q);
    setArea(a);
    const found = visible(q, a);
    setOpen(new Set(q.trim() && found.length <= OPEN_RESULTS ? found.map((d) => d.id) : []));
  };

  // Una voce richiesta (all'apertura o con la pagina già aperta) si mostra da sola, aperta.
  useEffect(() => {
    if (!definitions) return;
    let frame = 0;
    const show = () => {
      const entry = takeRequestedGlossaryEntry();
      if (!entry || !definitions.some((d) => d.id === entry)) return;
      setQuery('');
      setArea(null);
      setOpen(new Set([entry]));
      // Si aspetta un fotogramma: all'apertura la pagina torna in cima e mette il fuoco sul titolo.
      frame = requestAnimationFrame(() => {
        const element = document.getElementById(`glossario-${entry}`);
        if (element) scrollBelowSearch(element);
      });
    };
    show();
    addEventListener(GLOSSARY_REQUEST_EVENT, show);
    return () => {
      removeEventListener(GLOSSARY_REQUEST_EVENT, show);
      cancelAnimationFrame(frame);
    };
  }, [definitions, setQuery]);

  const toggle = (id: string, isOpen: boolean) =>
    setOpen((current) => {
      if (current.has(id) === isOpen) return current;
      const next = new Set(current);
      if (isOpen) next.add(id);
      else next.delete(id);
      return next;
    });
  const allOpen = results.length > 0 && results.every((d) => open.has(d.id));
  const present = new Set(groups.map((g) => g.letter));

  return (
    <ReadingLayout title="Glossario">
      <div className="atlas-index glossary-page">
        <p className="intro">
          Le parole dei testi dell'atlante, ciascuna con una definizione breve e le sue fonti. Scegli un termine per
          leggerla.
        </p>

        <SearchField
          label="Cerca nel glossario"
          placeholder="Un termine, anche in latino…"
          query={query}
          onChange={(q) => refine(q, area)}
          status={searching || area ? (results.length === 1 ? '1 termine' : `${results.length} termini`) : ''}
        >
          <nav className="letters" aria-label="Lettere">
            {letters.map((l) =>
              present.has(l) ? (
                <button
                  type="button"
                  key={l}
                  aria-label={`Lettera ${l}`}
                  onClick={() => {
                    const heading = document.getElementById(`lettera-${l}`);
                    if (heading) scrollBelowSearch(heading);
                  }}
                >
                  {l}
                </button>
              ) : (
                <span key={l} aria-hidden="true">
                  {l}
                </span>
              ),
            )}
          </nav>
        </SearchField>

        {areas.length > 1 && (
          <fieldset className="filters">
            <legend className="visually-hidden">Filtra per apparato</legend>
            <button type="button" aria-pressed={area === null} onClick={() => refine(query, null)}>
              Tutti
            </button>
            {areas.map((a) => (
              <button
                type="button"
                key={a.id}
                aria-pressed={area === a.id}
                onClick={() => refine(query, area === a.id ? null : a.id)}
              >
                {a.name} <span className="count">{a.count}</span>
              </button>
            ))}
          </fieldset>
        )}

        {error ? (
          <p className="notice">Non è stato possibile caricare il glossario.</p>
        ) : !definitions ? (
          <p>Caricamento del glossario…</p>
        ) : (
          <>
            {definitions.some((d) => d.stato !== 'approvato') && (
              <p className="draft-notice">
                Bozza: alcune definizioni non sono ancora approvate e sono visibili solo in sviluppo.
              </p>
            )}
            {results.length === 0 ? (
              <p className="no-results">
                Nessun termine per «{query.trim()}»{area ? ' in questo apparato' : ''}. Prova con il nome italiano, con
                il termine latino{area ? ' o con tutti gli apparati' : ''}.
              </p>
            ) : (
              <div className="glossary-tools">
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setOpen(new Set(allOpen ? [] : results.map((d) => d.id)))}
                >
                  {allOpen ? 'Chiudi tutte le definizioni' : 'Apri tutte le definizioni'}
                </button>
              </div>
            )}
            {groups.map((g) => (
              <section key={g.letter} className="glossary-letter" aria-labelledby={`lettera-${g.letter}`}>
                <h2 id={`lettera-${g.letter}`} tabIndex={-1}>
                  {g.letter}
                </h2>
                <ul className="glossary">
                  {g.entries.map((d) => (
                    <GlossaryItem
                      key={d.id}
                      definition={d}
                      query={query}
                      open={open.has(d.id)}
                      onToggle={(isOpen) => toggle(d.id, isOpen)}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </div>
    </ReadingLayout>
  );
}

function GlossaryItem({
  definition: d,
  query,
  open,
  onToggle,
}: {
  definition: GlossaryDefinition;
  query: string;
  open: boolean;
  onToggle: (open: boolean) => void;
}) {
  return (
    <li>
      <details
        id={`glossario-${d.id}`}
        tabIndex={-1}
        className="glossary-entry"
        open={open}
        onToggle={(e) => onToggle(e.currentTarget.open)}
      >
        <summary>
          <span className="entry-name">
            <Highlight text={d.termine} query={query} />
          </span>
          {d.latino && (
            <span className="entry-term" lang="la">
              <Highlight text={d.latino} query={query} />
            </span>
          )}
        </summary>
        <div className="glossary-body">
          <RichText className="definition" html={d.html} />
          <ShortSourceList sources={d.fonti} />
          <PartOfLink partOf={d.parteDi} />
        </div>
      </details>
    </li>
  );
}
