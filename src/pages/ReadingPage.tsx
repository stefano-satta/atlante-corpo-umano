import { lazy, Suspense } from 'react';
import type { PageId } from '@/models/atlas';
import { PAGE_TITLES } from '@/utils/pages';

// Ogni pagina di lettura si scarica solo quando la si apre (come il quiz, D53): l'atlante non le porta con sé.
const PathsPage = lazy(() => import('./PathsPage'));
const IndexPage = lazy(() => import('./IndexPage').then((m) => ({ default: m.IndexPage })));
const GlossaryPage = lazy(() => import('./GlossaryPage').then((m) => ({ default: m.GlossaryPage })));
const SourcesPage = lazy(() => import('./SourcesPage').then((m) => ({ default: m.SourcesPage })));
const InfoPage = lazy(() => import('./InfoPage').then((m) => ({ default: m.InfoPage })));

/** Pagina di lettura indicata dallo stato (`/percorsi`, `/indice`, `/glossario`, `/fonti`, `/informazioni`). */
export function ReadingPage({ page }: { page: PageId }) {
  return (
    <Suspense fallback={null}>
      <PageContent page={page} />
    </Suspense>
  );
}

function PageContent({ page }: { page: PageId }) {
  if (page === 'percorsi') return <PathsPage />;
  if (page === 'indice') return <IndexPage />;
  if (page === 'glossario') return <GlossaryPage />;
  if (page === 'fonti') return <SourcesPage />;
  if (page === 'circolazione') return <InfoPage id="circolazione" title={PAGE_TITLES.circolazione} />;
  return <InfoPage />;
}
