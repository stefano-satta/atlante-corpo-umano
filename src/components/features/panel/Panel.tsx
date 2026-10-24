import { lazy, Suspense, useEffect, useRef } from 'react';
import { useAtlas } from '@/hooks/useAtlas';
import { useOpenGuidedPath, useSelectedStructure } from '@/hooks/useSelectedStructure';
import { DetailSheet } from './DetailSheet';
import { InfoCard } from './InfoCard';

// Il percorso guidato (testo, schemi, comandi) si scarica solo quando lo si apre.
const GuidedPathPanel = lazy(() => import('@/components/features/guided-path/GuidedPathPanel'));

/**
 * Pannello ancorato al bordo destro, a tutta altezza (D16). Mostra il cartellino
 * della struttura selezionata e si allarga nella scheda quando la si apre; senza
 * selezione mostra il percorso guidato in corso (D24).
 */
export function Panel() {
  const { state, dispatch } = useAtlas();
  const { unit, sheet } = useSelectedStructure();
  const pathOpen = useOpenGuidedPath();
  const wasSheet = useRef(false);

  useEffect(() => {
    if (state.guidedPath && !pathOpen) dispatch({ type: 'setGuidedPath', guidedPath: null });
  }, [state.guidedPath, pathOpen, dispatch]);

  // Chiudendo la scheda il fuoco torna al pulsante che l'aveva aperta.
  useEffect(() => {
    if (wasSheet.current && !sheet) document.querySelector<HTMLElement>('.panel .action')?.focus();
    wasSheet.current = !!sheet;
  }, [sheet]);

  if (!unit)
    return pathOpen ? (
      <aside className="panel" data-mode="path" aria-label="Percorso guidato">
        <Suspense fallback={null}>
          <GuidedPathPanel />
        </Suspense>
      </aside>
    ) : null;
  return (
    <aside className="panel" data-mode={sheet ? 'sheet' : 'card'} aria-label="Struttura selezionata">
      {sheet ? <DetailSheet entry={sheet} /> : <InfoCard key={unit.id} unit={unit} />}
    </aside>
  );
}
