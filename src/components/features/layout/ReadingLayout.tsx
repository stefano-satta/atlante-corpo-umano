import { type ReactNode, useEffect, useRef } from 'react';
import { BackIcon } from '@/components/common/Icons';
import { useAtlas } from '@/hooks/useAtlas';
import { useTextOnly } from '@/hooks/useTextOnly';
import { TextOnlyHeader } from './TextOnlyHeader';

/**
 * Pagina di lettura sopra l'atlante: la scena resta dov'era e si ritrova chiudendo.
 * Nella versione testuale le pagine sono l'atlante stesso e al posto del ritorno c'è il menu.
 * Una colonna larga (`wide`) accoglie le griglie di card, come nella pagina Percorsi.
 */
export function ReadingLayout({ title, wide, children }: { title: string; wide?: boolean; children: ReactNode }) {
  const { dispatch } = useAtlas();
  const textOnly = useTextOnly();
  const heading = useRef<HTMLHeadingElement>(null);
  const container = useRef<HTMLElement>(null);

  useEffect(() => {
    container.current?.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
  }, []);

  return (
    <main className="reading-page" ref={container} aria-labelledby="page-title">
      <div className={wide ? 'reading-column wide' : 'reading-column'}>
        {textOnly ? (
          <TextOnlyHeader />
        ) : (
          <button type="button" className="back" onClick={() => dispatch({ type: 'setPage', page: null })}>
            <BackIcon /> Torna all'atlante
          </button>
        )}
        <h1 id="page-title" ref={heading} tabIndex={-1}>
          {title}
        </h1>
        {children}
      </div>
    </main>
  );
}
