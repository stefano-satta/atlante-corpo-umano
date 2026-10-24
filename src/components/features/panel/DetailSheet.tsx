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
import type { StructureSummary } from '@/models/content';
import { registerCalloutTarget } from '@/utils/calloutPath';
import { hasPage } from '@/utils/content';
import { formatLongDate } from '@/utils/format';
import { RelatedName } from './Relations';

// L'animazione si scarica solo quando si apre la scheda che la contiene.
const CardiacCycle = lazy(() => import('@/components/features/cardiac-cycle/CardiacCycle'));

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

  const toc = [
    ...(s?.sezioni.map((x) => ({ anchor: x.ancora, title: x.chiave })) ?? []),
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
              s.processi.map((p) => (
                <Suspense key={p.id} fallback={<p role="status">Caricamento dell'animazione…</p>}>
                  <DraftNotice status={p.stato} />
                  <CardiacCycle process={p} />
                </Suspense>
              ))}
          </section>
        ))}
        {s && (
          <>
            <section id="sez-collegamenti" aria-labelledby="h-collegamenti">
              <h2 id="h-collegamenti">Collegamenti</h2>
              <ul className="links">
                {s.relazioni.map((r) => (
                  <li key={`${r.tipo}-${r.id}`}>
                    <span className="label">{r.tipo === 'fa-parte-di' ? 'Fa parte di' : 'Collegato a'}</span>
                    <RelatedName relation={r} />
                  </li>
                ))}
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
