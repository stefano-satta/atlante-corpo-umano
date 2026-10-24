import type { ReactNode } from 'react';
import { useAtlas } from '@/hooks/useAtlas';
import type { PageId } from '@/models/atlas';
import { hasPage } from '@/utils/content';

/** Collegamento interno a una pagina di lettura, senza ricaricare l'atlante. */
export function PageLink({ page, children }: { page: PageId; children: ReactNode }) {
  const { dispatch } = useAtlas();
  // Una pagina non ancora approvata manca dalla build di produzione: resta il testo, senza collegamento.
  if (page === 'informazioni' && !hasPage(page)) return <>{children}</>;
  return (
    <a
      href={`/${page}`}
      onClick={(e) => {
        e.preventDefault();
        dispatch({ type: 'setPage', page });
      }}
    >
      {children}
    </a>
  );
}
