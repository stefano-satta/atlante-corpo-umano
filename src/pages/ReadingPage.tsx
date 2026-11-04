import type { PageId } from '@/models/atlas';
import { PAGE_TITLES } from '@/utils/pages';
import { GlossaryPage } from './GlossaryPage';
import { IndexPage } from './IndexPage';
import { InfoPage } from './InfoPage';
import { PathsPage } from './PathsPage';
import { SourcesPage } from './SourcesPage';

/** Pagina di lettura indicata dallo stato (`/percorsi`, `/indice`, `/glossario`, `/fonti`, `/informazioni`). */
export function ReadingPage({ page }: { page: PageId }) {
  if (page === 'percorsi') return <PathsPage />;
  if (page === 'indice') return <IndexPage />;
  if (page === 'glossario') return <GlossaryPage />;
  if (page === 'fonti') return <SourcesPage />;
  if (page === 'circolazione') return <InfoPage id="circolazione" title={PAGE_TITLES.circolazione} />;
  return <InfoPage />;
}
