import type { ReactNode } from 'react';
import { DraftNotice } from '@/components/common/DraftNotice';
import { RichText } from '@/components/features/glossary/RichText';
import { ReadingLayout } from '@/components/features/layout/ReadingLayout';
import { usePage } from '@/hooks/useContent';
import { formatLongDate } from '@/utils/format';

/** Pagina con un testo editoriale dai contenuti (contenuti/pagine/): Informazioni, se non è indicata un'altra. */
export function InfoPage({
  id = 'informazioni',
  title = 'Informazioni',
  children,
}: {
  id?: string;
  title?: string;
  /** Contenuto aggiunto dopo il testo, come l'invito a un percorso. */
  children?: ReactNode;
}) {
  const { data: page, error } = usePage(id);

  let content: ReactNode;
  if (error) content = <p className="notice">Non è stato possibile caricare la pagina.</p>;
  else if (!page) content = <p role="status">Caricamento…</p>;
  else
    content = (
      <>
        <DraftNotice status={page.stato} />
        <RichText className="page-text" html={page.html} />
        {children}
        <p className="revision">Ultima revisione: {formatLongDate(page.revisione)}.</p>
      </>
    );

  return <ReadingLayout title={title}>{content}</ReadingLayout>;
}
