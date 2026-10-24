import type { ReactNode } from 'react';
import { DraftNotice } from '@/components/common/DraftNotice';
import { RichText } from '@/components/features/glossary/RichText';
import { ReadingLayout } from '@/components/features/layout/ReadingLayout';
import { usePage } from '@/hooks/useContent';
import { formatLongDate } from '@/utils/format';

/** Pagina Informazioni: testo editoriale dai contenuti (contenuti/pagine/informazioni.md). */
export function InfoPage() {
  const { data: page, error } = usePage('informazioni');

  let content: ReactNode;
  if (error) content = <p className="notice">Non è stato possibile caricare la pagina.</p>;
  else if (!page) content = <p role="status">Caricamento…</p>;
  else
    content = (
      <>
        <DraftNotice status={page.stato} />
        <RichText className="page-text" html={page.html} />
        <p className="revision">Ultima revisione: {formatLongDate(page.revisione)}.</p>
      </>
    );

  return <ReadingLayout title="Informazioni">{content}</ReadingLayout>;
}
