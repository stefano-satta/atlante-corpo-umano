import { lazy, Suspense } from 'react';
import { PageLoader } from '@/components/common/PageLoader';
import { PathInvite } from '@/components/features/guided-path/PathInvite';
import type { PageId } from '@/models/atlas';
import { PAGE_TITLES } from '@/utils/pages';
import { CreditsPage } from './CreditsPage';
import { InfoPage } from './InfoPage';
import { SourcesPage } from './SourcesPage';

// Percorsi, Indice e Glossario si scaricano solo quando li si apre (D55); Fonti, Informazioni e Credits
// sono leggere e arrivano con l'atlante.
const PathsPage = lazy(() => import('./PathsPage'));
const IndexPage = lazy(() => import('./IndexPage').then((m) => ({ default: m.IndexPage })));
const GlossaryPage = lazy(() => import('./GlossaryPage').then((m) => ({ default: m.GlossaryPage })));

/** Pagina di lettura indicata dallo stato (`/percorsi`, `/indice`, `/glossario`, `/fonti`, `/informazioni`…). */
export function ReadingPage({ page }: { page: PageId }) {
  if (page === 'fonti') return <SourcesPage />;
  if (page === 'informazioni') return <InfoPage />;
  if (page === 'credits') return <CreditsPage />;
  if (page === 'circolazione')
    return (
      <InfoPage id="circolazione" title={PAGE_TITLES.circolazione}>
        <PathInvite id="giro-del-sangue">Per vedere il viaggio del sangue un passo alla volta nel corpo 3D:</PathInvite>
      </InfoPage>
    );
  return (
    <Suspense fallback={<PageLoader label={LOADING_LABELS[page] ?? 'Caricamento'} />}>
      {page === 'percorsi' ? <PathsPage /> : page === 'indice' ? <IndexPage /> : <GlossaryPage />}
    </Suspense>
  );
}

const LOADING_LABELS: Partial<Record<PageId, string>> = {
  percorsi: 'Caricamento dei percorsi',
  indice: "Caricamento dell'indice",
  glossario: 'Caricamento del glossario',
};
