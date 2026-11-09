import { type ReactNode, useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';
import { Button } from '@/components/common/Button';
import { BackIcon } from '@/components/common/Icons';
import { useAtlas } from '@/hooks/useAtlas';
import { useTextOnly } from '@/hooks/useTextOnly';
import { TextOnlyHeader } from './TextOnlyHeader';

/** Posizione di lettura di ogni voce della cronologia, per ritrovarla con Indietro e Avanti. */
const scrollPositions = new Map<string, number>();
/** Il testo di Glossario e Indice arriva dopo: per un secondo si riprova a ritrovare la posizione. */
const RESTORE_TIMEOUT = 1000;

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
  const { key } = useLocation();
  const navigation = useNavigationType();

  // Aprendo una pagina si parte dall'inizio; tornandoci con Indietro o Avanti si ritrova il punto di lettura.
  // biome-ignore lint/correctness/useExhaustiveDependencies: si decide solo all'apertura della pagina.
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    const el = container.current;
    if (!el) return;
    const saved = navigation === 'POP' ? scrollPositions.get(key) : undefined;
    if (!saved) {
      el.scrollTo({ top: 0 });
      return;
    }
    const restore = () => {
      el.scrollTop = saved;
      if (el.scrollTop >= saved - 1) stop();
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(restore);
    // Si guarda la crescita di tutto il contenuto (l'avviso di bozza può precedere la colonna).
    for (const child of el.children) observer?.observe(child);
    const timer = setTimeout(() => stop(), RESTORE_TIMEOUT);
    function stop() {
      observer?.disconnect();
      clearTimeout(timer);
    }
    restore();
    return stop;
  }, []);

  return (
    <main
      className="reading-page"
      ref={container}
      aria-labelledby="page-title"
      onScroll={(e) => scrollPositions.set(key, e.currentTarget.scrollTop)}
    >
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
    </main>
  );
}
