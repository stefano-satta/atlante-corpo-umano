import { lazy, Suspense, useEffect, useRef } from 'react';
import { DraftNotice } from '@/components/common/DraftNotice';
import { BackIcon } from '@/components/common/Icons';
import { LatinTerm } from '@/components/common/LatinTerm';
import { PageLink } from '@/components/common/PageLink';
import { SourceList } from '@/components/common/SourceList';
import { RichText } from '@/components/features/glossary/RichText';
import { useAtlas } from '@/hooks/useAtlas';
import { useStructure } from '@/hooks/useContent';
import { useTextOnly } from '@/hooks/useTextOnly';
import type { Process, Relation, StructureSummary } from '@/models/content';
import { registerCalloutTarget } from '@/utils/calloutPath';
import { hasPage } from '@/utils/content';
import { formatLongDate } from '@/utils/format';
import { RelatedNames } from './Relations';

const RELATION_TYPES: { type: Relation['tipo']; label: string }[] = [
  { type: 'fa-parte-di', label: 'Fa parte di' },
  { type: 'collegato-a', label: 'Collegato a' },
];

// Le animazioni si scaricano solo quando si apre la scheda che le contiene.
const CardiacCycle = lazy(() => import('@/components/features/cardiac-cycle/CardiacCycle'));
const ReproductiveProcess = lazy(() => import('@/components/features/reproductive-system/ReproductiveProcess'));

/** Animazione di un processo, con l'avviso se il suo testo non è ancora approvato. */
function ProcessFigure({ process, structure }: { process: Process; structure: string }) {
  return (
    <Suspense fallback={<p role="status">Caricamento dell'animazione…</p>}>
      <DraftNotice status={process.stato} />
      {process.schema === 'cuore' ? (
        <CardiacCycle process={process} />
      ) : (
        <ReproductiveProcess process={process} current={structure} />
      )}
    </Suspense>
  );
}

/** Contenuto del pannello allargato: la scheda completa di un organo (sezioni di D11). */
export function DetailSheet({ entry }: { entry: StructureSummary }) {
  const { dispatch } = useAtlas();
  const textOnly = useTextOnly();
  const { data: s } = useStructure(entry.id);
  const title = useRef<HTMLHeadingElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a ogni nuova struttura la lettura torna in cima
  useEffect(() => {
    const container = title.current?.closest('.panel, .reading-page');
    if (container) container.scrollTop = 0;
    title.current?.focus({ preventScroll: true });
  }, [entry.id]);

  // Gli schemi di un intero apparato hanno una sezione propria, dopo il testo dell'organo.
  const apparatus = s?.processi.filter((p) => p.schema !== 'cuore') ?? [];
  const toc = [
    ...(s?.sezioni.map((x) => ({ anchor: x.ancora, title: x.chiave })) ?? []),
    ...(apparatus.length ? [{ anchor: 'apparato', title: "L'apparato" }] : []),
    { anchor: 'collegamenti', title: 'Collegamenti' },
    { anchor: 'fonti', title: 'Fonti' },
  ];

  return (
    <article className="detail-sheet" aria-labelledby="sheet-title">
      <header className="sheet-header">
        <div className="panel-header">
          {textOnly ? (
            <button type="button" className="back" onClick={() => dispatch({ type: 'select', id: null })}>
              <BackIcon /> Torna all'indice
            </button>
          ) : (
            <button type="button" className="back" onClick={() => dispatch({ type: 'setSheet', open: false })}>
              <BackIcon /> Torna al cartellino
            </button>
          )}
        </div>
        <span className="label">{entry.nomeApparato}</span>
        <h1
          id="sheet-title"
          className="name"
          tabIndex={-1}
          ref={(el) => {
            title.current = el;
            if (!textOnly) registerCalloutTarget(el);
          }}
        >
          {entry.nome}
        </h1>
        <LatinTerm term={entry.termine} ta2={entry.ta2} />
      </header>
      {/* Solo l'indice resta fermo in alto mentre si legge: il titolo scorre via con il testo. */}
      <nav className="sheet-toc" aria-label="Sezioni della scheda">
        {toc.map((x) => (
          <a key={x.anchor} href={`#sez-${x.anchor}`}>
            {x.title}
          </a>
        ))}
      </nav>
      <div className="sheet-body">
        <DraftNotice status={entry.stato} />
        {!s && (
          <p className="notice" role="status">
            Caricamento del testo…
          </p>
        )}
        {s?.sezioni.map((x) => (
          <section key={x.ancora} id={`sez-${x.ancora}`} aria-labelledby={`h-${x.ancora}`}>
            <h2 id={`h-${x.ancora}`}>{x.titolo}</h2>
            <RichText className="text" html={x.html} />
            {x.chiave === 'Il processo' &&
              s.processi
                .filter((p) => p.schema === 'cuore')
                .map((p) => <ProcessFigure key={p.id} process={p} structure={s.id} />)}
          </section>
        ))}
        {apparatus.length > 0 && (
          <section id="sez-apparato" aria-labelledby="h-apparato">
            <h2 id="h-apparato">L'apparato al lavoro</h2>
            {apparatus.map((p) => (
              <ProcessFigure key={p.id} process={p} structure={entry.id} />
            ))}
          </section>
        )}
        {s && (
          <>
            <section id="sez-collegamenti" aria-labelledby="h-collegamenti">
              <h2 id="h-collegamenti">Collegamenti</h2>
              <ul className="links">
                {/* Un'etichetta per tipo, seguita dall'elenco delle strutture. */}
                {RELATION_TYPES.map(({ type, label }) => {
                  const list = s.relazioni.filter((r) => r.tipo === type);
                  return (
                    list.length > 0 && (
                      <li key={type}>
                        <span className="label">{label}</span>
                        <span>
                          <RelatedNames relations={list} />
                        </span>
                      </li>
                    )
                  );
                })}
              </ul>
            </section>
            <section id="sez-fonti" aria-labelledby="h-fonti">
              <h2 id="h-fonti">Fonti</h2>
              <SourceList sources={s.fonti} />
              {s.limiti && (
                <>
                  <h3>Note sulle fonti</h3>
                  <p className="notes">{s.limiti}</p>
                </>
              )}
              <p className="revision">
                Ultima revisione del testo: {formatLongDate(s.revisione)}. I testi non sono stati rivisti da un medico
                {hasPage('informazioni') ? (
                  <>
                    : <PageLink page="informazioni">come sono scritti</PageLink>.
                  </>
                ) : (
                  '.'
                )}
              </p>
            </section>
          </>
        )}
      </div>
    </article>
  );
}
