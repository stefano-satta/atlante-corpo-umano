import { lazy, type ReactNode, Suspense } from 'react';
import { TextOnlyHeader } from '@/components/features/layout/TextOnlyHeader';
import { DetailSheet } from '@/components/features/panel/DetailSheet';
import { TextOnlyContext } from '@/contexts/TextOnlyContext';
import { useAtlas } from '@/hooks/useAtlas';
import { hasGuidedPath, STRUCTURES } from '@/utils/content';
import { ReadingPage } from './ReadingPage';

const GuidedPathPanel = lazy(() => import('@/components/features/guided-path/GuidedPathPanel'));

/**
 * Atlante senza grafica 3D (D26, E1): si apre l'Indice, e da lì si leggono i testi delle
 * strutture, il ciclo cardiaco e i percorsi, con gli stessi indirizzi della versione 3D.
 * Una struttura si riconosce dal suo id o dall'unità del modello che la mostra.
 */
export function TextOnlyAtlasPage() {
  const { state } = useAtlas();
  const entry = state.selection
    ? STRUCTURES.find((s) => s.id === state.selection || s.unita === state.selection)
    : undefined;
  const path = !state.selection && state.guidedPath && hasGuidedPath(state.guidedPath.id);

  let content: ReactNode;
  if (state.page || (!entry && !path)) content = <ReadingPage page={state.page ?? 'indice'} />;
  else
    content = (
      <main className="reading-page text-reading" aria-label={entry ? entry.nome : 'Percorso guidato'}>
        <div className="reading-column">
          <TextOnlyHeader />
          {entry ? (
            <DetailSheet key={entry.id} entry={entry} />
          ) : (
            <Suspense fallback={<p role="status">Caricamento del percorso…</p>}>
              <GuidedPathPanel />
            </Suspense>
          )}
        </div>
      </main>
    );

  return <TextOnlyContext.Provider value={true}>{content}</TextOnlyContext.Provider>;
}
