import { type ReactNode, useEffect, useRef } from 'react';
import { Button } from '@/components/common/Button';
import { BackIcon } from '@/components/common/Icons';
import { useAtlas } from '@/hooks/useAtlas';
import { useTextOnly } from '@/hooks/useTextOnly';
import { TextOnlyHeader } from './TextOnlyHeader';

/**
 * Colonna di una pagina di lettura, dentro `ReadingShell`: ritorno all'atlante, titolo e testo.
 * Nella versione testuale le pagine sono l'atlante stesso e al posto del ritorno c'è il menu.
 * Una colonna larga (`wide`) accoglie le griglie di card, come nella pagina Percorsi.
 */
export function ReadingLayout({ title, wide, children }: { title: string; wide?: boolean; children: ReactNode }) {
  const { dispatch } = useAtlas();
  const textOnly = useTextOnly();
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className={wide ? 'reading-column wide' : 'reading-column'}>
      {textOnly ? (
        <TextOnlyHeader />
      ) : (
        <Button variant="back" onClick={() => dispatch({ type: 'setPage', page: null })}>
          <BackIcon /> Torna all'atlante
        </Button>
      )}
      <h1 id="page-title" ref={heading} tabIndex={-1}>
        {title}
      </h1>
      {children}
    </div>
  );
}
