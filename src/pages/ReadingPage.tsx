import { lazy, Suspense } from 'react';
import type { PageId } from '@/models/atlas';
import { PAGE_TITLES } from '@/utils/pages';
import { GlossaryPage } from './GlossaryPage';
import { IndexPage } from './IndexPage';
import { InfoPage } from './InfoPage';
import { SourcesPage } from './SourcesPage';

// La pagina Percorsi, con le sue illustrazioni, si scarica solo quando la si apre (come il quiz, D53).
const PathsPage = lazy(() => import('./PathsPage'));

/** Pagina di lettura indicata dallo stato (`/percorsi`, `/indice`, `/glossario`, `/fonti`, `/informazioni`). */
export function ReadingPage({ page }: { page: PageId }) {
  if (page === 'percorsi')
    return (
      <Suspense fallback={null}>
        <PathsPage />
      </Suspense>
    );
  if (page === 'indice') return <IndexPage />;
  if (page === 'glossario') return <GlossaryPage />;
  if (page === 'fonti') return <SourcesPage />;
  if (page === 'circolazione') return <InfoPage id="circolazione" title={PAGE_TITLES.circolazione} />;
  return <InfoPage />;
}
