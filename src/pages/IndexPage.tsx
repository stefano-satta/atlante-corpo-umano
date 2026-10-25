import { useEffect, useId, useMemo, useState } from 'react';
import { ShortSourceList } from '@/components/common/ShortSourceList';
import { StructureEntry } from '@/components/features/atlas-index/StructureEntry';
import { RichText } from '@/components/features/glossary/RichText';
import { ReadingLayout } from '@/components/features/layout/ReadingLayout';
import { useAtlas } from '@/hooks/useAtlas';
import { useGlossary } from '@/hooks/useContent';
import { useTextOnly } from '@/hooks/useTextOnly';
import type { IndexEntry } from '@/models/atlasIndex';
import { GLOSSARY, GUIDED_PATHS, PROCESSES, STRUCTURES } from '@/utils/content';
import { takeRequestedGlossaryEntry } from '@/utils/glossaryRequest';
import { groupBySystem } from '@/utils/indexGroups';
import { matches } from '@/utils/search';

/**
 * Indice dell'atlante (D26): alternativa testuale alla scena, con ricerca. Elenca percorsi,
 * processi, organi e strutture con testo per apparato, e il glossario. Nella versione testuale
 * le voci aprono il testo invece di mostrare la struttura nel corpo.
 */
export function IndexPage() {
  const { dispatch } = useAtlas();
  const textOnly = useTextOnly();
  const [query, setQuery] = useState('');
  const fieldId = useId();
  const groups = useMemo(() => groupBySystem(), []);
  const { data: definitions, error: glossaryError } = useGlossary(GLOSSARY.length > 0);

  // Arrivando da una definizione sul posto, o da /indice#glossario-<voce>, si va a quella voce.
  // Si aspetta un fotogramma: all'apertura la pagina torna in cima e mette il fuoco sul titolo.
  useEffect(() => {
    if (!definitions) return;
    const id = requestAnimationFrame(() => {
      const entry = takeRequestedGlossaryEntry();
      const element = entry ? document.getElementById(`glossario-${entry}`) : null;
      element?.scrollIntoView({ block: 'start' });
      element?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [definitions]);

  const close = () => dispatch({ type: 'setPage', page: null });
  const show = (e: IndexEntry) => {
    if (textOnly) {
      if (e.content) dispatch({ type: 'select', id: e.content.id });
    } else if (e.unit) dispatch({ type: 'select', id: e.unit });
    close();
  };
  const openSheet = (unit: string) => {
    dispatch({ type: 'select', id: unit });
    dispatch({ type: 'setSheet', open: true });
    close();
  };

  // Una parte senza modello 3D porta alla sua voce del glossario, più in basso nella pagina.
  const showDefinition = (term: string) => {
    setQuery('');
    requestAnimationFrame(() => {
      const element = document.getElementById(`glossario-${term}`);
      element?.scrollIntoView({ block: 'start' });
      element?.focus({ preventScroll: true });
    });
  };

  const filteredGroups = groups
    .map((g) => ({ ...g, entries: g.entries.filter((e) => matches(query, [e.name, e.latinTerm, ...e.searchTexts])) }))
    .filter((g) => g.entries.length);
  const paths = GUIDED_PATHS.filter((p) => matches(query, [p.titolo, 'percorso']));
  const processes = PROCESSES.flatMap((p) => {
    const structure = STRUCTURES.find((s) => s.id === p.struttura);
    return structure && matches(query, [p.titolo, structure.nome, 'processo']) ? [{ ...p, structure }] : [];
  });
  const glossary = (definitions ?? []).filter((d) => matches(query, [d.termine, ...d.varianti]));
  const total =
    filteredGroups.reduce((n, g) => n + g.entries.length, 0) + paths.length + processes.length + glossary.length;
  const searching = query.trim() !== '';

  return (
    <ReadingLayout title="Indice">
      <div className="atlas-index">
        <p className="intro">
          {textOnly
            ? 'Tutto ciò che l’atlante contiene, in ordine di apparato. Scegli un nome per leggerne il testo.'
            : 'Tutto ciò che l’atlante contiene, in ordine di apparato. Scegli un nome per vederlo nel corpo.'}
        </p>

        <search className="search">
          <label htmlFor={fieldId} className="label">
            Cerca nell'atlante
          </label>
          <input
            id={fieldId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Un organo, un termine latino, un apparato…"
            autoComplete="off"
            spellCheck={false}
          />
          <p className="search-result" role="status">
            {searching ? (total === 1 ? '1 risultato' : `${total} risultati`) : ''}
          </p>
        </search>

        {searching && total === 0 && (
          <p className="no-results">
            Nessun risultato per «{query.trim()}». Prova con il nome italiano, con il termine latino o con il nome di un
            apparato.
          </p>
        )}

        {paths.length > 0 && (
          <section aria-labelledby="index-paths">
            <h2 id="index-paths">Percorsi guidati</h2>
            <ul className="index-entries">
              {paths.map((p) => (
                <li key={p.id} className="index-entry">
                  <button
                    type="button"
                    className="entry-name"
                    aria-label={`${p.titolo}: inizia il percorso`}
                    onClick={() => {
                      dispatch({ type: 'setGuidedPath', guidedPath: { id: p.id, step: 0 } });
                      close();
                    }}
                  >
                    {p.titolo}
                  </button>
                  <span className="entry-detail">Percorso in {p.passi} passi</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {processes.length > 0 && (
          <section aria-labelledby="index-processes">
            <h2 id="index-processes">Processi</h2>
            <ul className="index-entries">
              {processes.map((p) => (
                <li key={p.id} className="index-entry">
                  <button
                    type="button"
                    className="entry-name"
                    aria-label={`${p.titolo}: ${textOnly ? 'leggi il testo' : 'apri la scheda'}`}
                    onClick={() => {
                      if (textOnly) {
                        dispatch({ type: 'select', id: p.structure.id });
                        close();
                      } else if (p.structure.unita) openSheet(p.structure.unita);
                    }}
                  >
                    {p.titolo}
                  </button>
                  <span className="entry-detail">Animazione nella scheda: {p.structure.nome}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {filteredGroups.length > 0 && (
          <section aria-labelledby="index-structures">
            <h2 id="index-structures">Organi e strutture</h2>
            {filteredGroups.map((g) => (
              <section key={g.system} className="index-group" aria-labelledby={`index-${g.system}`}>
                <h3 id={`index-${g.system}`} className="label">
                  {g.name}
                </h3>
                <ul className="index-entries">
                  {g.entries.map((e) => (
                    <StructureEntry
                      key={e.key}
                      entry={e}
                      textOnly={textOnly}
                      onShow={show}
                      onOpenSheet={openSheet}
                      onShowDefinition={showDefinition}
                    />
                  ))}
                </ul>
              </section>
            ))}
            <p className="note">
              Le ossa e i muscoli senza testo non sono nell'Indice: per ora hanno solo il nome inglese del modello 3D.
              Le parti indicate "Non nel modello 3D" sono descritte nella scheda dell'organo e nel glossario.
              {!textOnly && ' Si possono scegliere direttamente nel corpo.'}
            </p>
          </section>
        )}

        {GLOSSARY.length > 0 && (!searching || glossary.length > 0) && (
          <section aria-labelledby="index-glossary" id="glossario">
            <h2 id="index-glossary">Glossario</h2>
            {glossaryError ? (
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
                <dl className="glossary">
                  {glossary.map((d) => (
                    <div key={d.id} id={`glossario-${d.id}`} tabIndex={-1} className="glossary-entry">
                      <dt>
                        {d.termine}
                        {d.latino && (
                          <>
                            {' '}
                            <span className="entry-term" lang="la">
                              {d.latino}
                            </span>
                          </>
                        )}
                      </dt>
                      <dd>
                        <RichText className="definition" html={d.html} />
                        <ShortSourceList sources={d.fonti} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </section>
        )}
      </div>
    </ReadingLayout>
  );
}
