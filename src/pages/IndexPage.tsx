import { useMemo } from 'react';
import { ForwardIcon } from '@/components/common/Icons';
import { Highlight } from '@/components/features/atlas-index/Highlight';
import { SearchField } from '@/components/features/atlas-index/SearchField';
import { StructureEntry } from '@/components/features/atlas-index/StructureEntry';
import { ReadingLayout } from '@/components/features/layout/ReadingLayout';
import { useAtlas } from '@/hooks/useAtlas';
import { useSearchQuery } from '@/hooks/useSearchQuery';
import { useTextOnly } from '@/hooks/useTextOnly';
import type { IndexEntry, SystemGroup } from '@/models/atlasIndex';
import { GLOSSARY, GUIDED_PATHS, PROCESSES, STRUCTURES } from '@/utils/content';
import { requestGlossaryEntry, requestGlossarySearch } from '@/utils/glossaryRequest';
import { groupBySystem } from '@/utils/indexGroups';
import { matches } from '@/utils/search';

// Termini del glossario mostrati tra i risultati; gli altri si vedono nel Glossario con la stessa ricerca.
const GLOSSARY_RESULTS = 6;

/**
 * Indice dell'atlante (D26): alternativa testuale alla scena, con ricerca. In cima percorsi e
 * processi, poi gli apparati, chiusi finché non si sceglie quale aprire; cercando, si vedono solo
 * i risultati, con i termini del glossario che corrispondono. Il glossario ha una pagina sua.
 * Nella versione testuale le voci aprono il testo invece di mostrare la struttura nel corpo.
 */
export function IndexPage() {
  const { dispatch } = useAtlas();
  const textOnly = useTextOnly();
  const [query, setQuery] = useSearchQuery();
  const groups = useMemo(() => groupBySystem(), []);

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
  const showDefinition = (term: string) => {
    requestGlossaryEntry(term);
    dispatch({ type: 'setPage', page: 'glossario' });
  };

  const filteredGroups = groups
    .map((g) => ({ ...g, entries: g.entries.filter((e) => matches(query, [e.name, e.latinTerm, ...e.searchTexts])) }))
    .filter((g) => g.entries.length);
  const paths = GUIDED_PATHS.filter((p) => matches(query, [p.titolo, 'percorso']));
  const processes = PROCESSES.flatMap((p) => {
    const structure = STRUCTURES.find((s) => s.id === p.struttura);
    return structure && matches(query, [p.titolo, structure.nome, 'processo']) ? [{ ...p, structure }] : [];
  });
  const searching = query.trim() !== '';
  const glossary = searching
    ? GLOSSARY.filter((g) => matches(query, [g.termine, ...g.varianti, ...(g.latino ? [g.latino] : [])]))
    : [];
  const total = filteredGroups.reduce((n, g) => n + g.entries.length, 0) + paths.length + processes.length;
  const status = !searching
    ? ''
    : `${total === 1 ? '1 risultato' : `${total} risultati`}${glossary.length ? ` · ${glossary.length} nel glossario` : ''}`;

  const entries = (g: SystemGroup) => (
    <ul className="index-entries">
      {g.entries.map((e) => (
        <StructureEntry
          key={e.key}
          entry={e}
          query={query}
          textOnly={textOnly}
          onShow={show}
          onOpenSheet={openSheet}
          onShowDefinition={showDefinition}
        />
      ))}
    </ul>
  );

  return (
    <ReadingLayout title="Indice">
      <div className="atlas-index">
        <p className="intro">
          {textOnly
            ? 'Tutto ciò che l’atlante contiene, per apparato. Cerca un nome, oppure apri un apparato e scegli una voce per leggerne il testo.'
            : 'Tutto ciò che l’atlante contiene, per apparato. Cerca un nome, oppure apri un apparato e scegli una voce per vederla nel corpo.'}
        </p>

        <SearchField
          label="Cerca nell'atlante"
          placeholder="Un organo, un muscolo, un termine latino…"
          query={query}
          onChange={setQuery}
          status={status}
        />

        {searching && total === 0 && glossary.length === 0 && (
          <p className="no-results">
            Nessun risultato per «{query.trim()}». Prova con il nome italiano, con il termine latino o con il nome di un
            apparato.
          </p>
        )}

        {(paths.length > 0 || processes.length > 0) && (
          <section aria-labelledby="index-follow">
            <h2 id="index-follow">Percorsi e processi</h2>
            <ul className="index-cards">
              {paths.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="index-card"
                    onClick={() => {
                      dispatch({ type: 'setGuidedPath', guidedPath: { id: p.id, step: 0 } });
                      close();
                    }}
                  >
                    <span className="card-title">
                      <Highlight text={p.titolo} query={query} />
                    </span>
                    <span className="entry-detail">Percorso in {p.passi} passi</span>
                    <span className="visually-hidden">: inizia il percorso</span>
                  </button>
                </li>
              ))}
              {processes.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="index-card"
                    onClick={() => {
                      if (textOnly) {
                        dispatch({ type: 'select', id: p.structure.id });
                        close();
                      } else if (p.structure.unita) openSheet(p.structure.unita);
                    }}
                  >
                    <span className="card-title">
                      <Highlight text={p.titolo} query={query} />
                    </span>
                    <span className="entry-detail">Animazione nella scheda: {p.structure.nome}</span>
                    <span className="visually-hidden">: {textOnly ? 'leggi il testo' : 'apri la scheda'}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {filteredGroups.length > 0 && (
          <section aria-labelledby="index-structures">
            <h2 id="index-structures">Organi e strutture</h2>
            {searching
              ? filteredGroups.map((g) => (
                  <section key={g.system} className="index-group" aria-labelledby={`index-${g.system}`}>
                    <h3 id={`index-${g.system}`} className="label">
                      {g.name}
                    </h3>
                    {entries(g)}
                  </section>
                ))
              : filteredGroups.map((g) => (
                  <details key={g.system} className="index-system">
                    <summary>
                      <span className="system-name">{g.name}</span>
                      <span className="system-count">
                        {g.entries.length === 1 ? '1 voce' : `${g.entries.length} voci`}
                      </span>
                    </summary>
                    {entries(g)}
                  </details>
                ))}
            <p className="note">
              Le ossa e i muscoli senza testo non sono nell'Indice: per ora hanno solo il nome inglese del modello 3D.
              Le parti indicate "Non nel modello 3D" sono descritte nella scheda dell'organo e nel glossario.
              {!textOnly && ' Si possono scegliere direttamente nel corpo.'}
            </p>
          </section>
        )}

        {glossary.length > 0 && (
          <section aria-labelledby="index-glossary">
            <h2 id="index-glossary">Nel glossario</h2>
            <ul className="index-terms">
              {glossary.slice(0, GLOSSARY_RESULTS).map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    className="term-link"
                    aria-label={`${g.termine}: leggi la definizione`}
                    onClick={() => showDefinition(g.id)}
                  >
                    <Highlight text={g.termine} query={query} />
                  </button>
                </li>
              ))}
            </ul>
            {glossary.length > GLOSSARY_RESULTS && (
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  requestGlossarySearch(query.trim());
                  dispatch({ type: 'setPage', page: 'glossario' });
                }}
              >
                Tutti i {glossary.length} termini nel Glossario <ForwardIcon />
              </button>
            )}
          </section>
        )}

        {!searching && GLOSSARY.length > 0 && (
          <p className="index-glossary-link">
            <button
              type="button"
              className="text-button"
              onClick={() => dispatch({ type: 'setPage', page: 'glossario' })}
            >
              Glossario: {GLOSSARY.length} termini con la loro definizione <ForwardIcon />
            </button>
          </p>
        )}
      </div>
    </ReadingLayout>
  );
}
