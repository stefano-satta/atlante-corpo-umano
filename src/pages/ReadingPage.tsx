import type { PageId } from '@/models/atlas';
import { GlossaryPage } from './GlossaryPage';
import { IndexPage } from './IndexPage';
import { InfoPage } from './InfoPage';
import { SourcesPage } from './SourcesPage';

/** Pagina di lettura indicata dallo stato (`/indice`, `/glossario`, `/fonti`, `/informazioni`). */
export function ReadingPage({ page }: { page: PageId }) {
  if (page === 'indice') return <IndexPage />;
  if (page === 'glossario') return <GlossaryPage />;
  if (page === 'fonti') return <SourcesPage />;
  return <InfoPage />;
}
