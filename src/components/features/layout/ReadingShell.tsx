import { type ReactNode, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router';
import { Footer } from '@/components/common/Footer';
import { Navbar } from '@/components/common/Navbar';
import { useTextOnly } from '@/hooks/useTextOnly';

/** Posizione di lettura di ogni voce della cronologia, per ritrovarla con Indietro e Avanti. */
const scrollPositions = new Map<string, number>();
/** Il testo di Glossario e Indice arriva dopo: per un secondo si riprova a ritrovare la posizione. */
const RESTORE_TIMEOUT = 1000;

/**
 * Guscio delle pagine di lettura (Percorsi, Indice, Glossario, Fonti, Informazioni, Credits): una pagina a sé, con
 * barra in alto, contenuto e crediti, senza l'atlante sotto. Resta montato passando da una pagina all'altra.
 * Aprendo una pagina si parte dall'inizio; tornandoci con Indietro o Avanti si ritrova il punto di lettura.
 * Nella versione testuale la barra è nella testa di ogni pagina (`TextOnlyHeader`).
 */
export function ReadingShell({ children }: { children?: ReactNode }) {
  const textOnly = useTextOnly();
  const scroller = useRef<HTMLDivElement>(null);
  const { key } = useLocation();
  const navigation = useNavigationType();

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    // Cambiare solo la ricerca (`?q=`) sostituisce la voce: la pagina resta dov'è.
    if (navigation === 'REPLACE') return;
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
    for (const child of el.children) observer?.observe(child);
    const timer = setTimeout(() => stop(), RESTORE_TIMEOUT);
    function stop() {
      observer?.disconnect();
      clearTimeout(timer);
    }
    restore();
    return stop;
  }, [key, navigation]);

  return (
    <div className="reading-page" ref={scroller} onScroll={(e) => scrollPositions.set(key, e.currentTarget.scrollTop)}>
      {!textOnly && <Navbar />}
      <main className="reading-main" aria-labelledby="page-title">
        {children ?? <Outlet />}
      </main>
      {!textOnly && <Footer />}
    </div>
  );
}
