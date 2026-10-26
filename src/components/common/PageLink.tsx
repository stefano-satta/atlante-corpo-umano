import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { PageId } from '@/models/atlas';
import { hasPage } from '@/utils/content';

/** Collegamento interno a una pagina di lettura: la rotta la apre senza ricaricare l'atlante. */
export function PageLink({ page, children }: { page: PageId; children: ReactNode }) {
  // Una pagina non ancora approvata manca dalla build di produzione: resta il testo, senza collegamento.
  if (page === 'informazioni' && !hasPage(page)) return <>{children}</>;
  return <Link to={`/${page}`}>{children}</Link>;
}
