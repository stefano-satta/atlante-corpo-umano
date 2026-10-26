import { useAtlas } from '@/hooks/useAtlas';
import { useTextOnly } from '@/hooks/useTextOnly';
import { STRUCTURES } from '@/utils/content';

/**
 * Collegamento dalla voce di una parte senza modello 3D alla scheda che la descrive ("parteDi").
 * Non compare se la scheda non è pubblicata o se è già quella aperta.
 */
export function PartOfLink({ partOf, onNavigate }: { partOf: string | null; onNavigate?: () => void }) {
  const { state, dispatch } = useAtlas();
  const textOnly = useTextOnly();
  const parent = STRUCTURES.find((s) => s.id === partOf);
  const target = textOnly ? parent?.id : parent?.unita;
  if (!parent || !target) return null;
  if (state.page === null && state.selection === target && (textOnly || state.sheet)) return null;
  return (
    <a
      className="part-of-link"
      href={`/${textOnly ? 'esplora' : 'organo'}/${encodeURIComponent(target)}`}
      onClick={(e) => {
        e.preventDefault();
        dispatch({ type: 'select', id: target });
        if (!textOnly) dispatch({ type: 'setSheet', open: true });
        dispatch({ type: 'setPage', page: null });
        onNavigate?.();
      }}
    >
      Apri la scheda: {parent.nome}
    </a>
  );
}
