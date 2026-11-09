import { useAtlas } from '@/hooks/useAtlas';
import { pageAvailable, QUIZ_THEMES } from '@/utils/content';
import { PAGE_TITLES, READING_PAGE_IDS } from '@/utils/pages';

/**
 * Testa della versione testuale (D26): avviso e menu, al posto della barra in alto della scena.
 * Si usa anche nelle letture di strutture e percorsi.
 */
export function TextOnlyHeader() {
  const { state, dispatch } = useAtlas();
  const current = state.selection || state.guidedPath || state.quiz ? null : (state.page ?? 'indice');
  return (
    <header className="text-header">
      <span className="brand">Atlante del corpo umano</span>
      <nav aria-label="Sezioni">
        {READING_PAGE_IDS.filter(pageAvailable).map((p) => (
          <button
            type="button"
            key={p}
            className="nav-item"
            aria-current={current === p ? 'page' : undefined}
            onClick={() => {
              dispatch({ type: 'select', id: null });
              dispatch({ type: 'setGuidedPath', guidedPath: null });
              dispatch({ type: 'setQuiz', quiz: null });
              dispatch({ type: 'setPage', page: p });
            }}
          >
            {PAGE_TITLES[p]}
          </button>
        ))}
        {Object.keys(QUIZ_THEMES).length > 0 && (
          <button
            type="button"
            className="nav-item"
            aria-current={state.quiz && !state.page ? 'page' : undefined}
            onClick={() => {
              dispatch({ type: 'setPage', page: null });
              dispatch({ type: 'setQuiz', quiz: { theme: null } });
            }}
          >
            Quiz
          </button>
        )}
      </nav>
      <p className="notice">
        Questo browser non mostra la grafica 3D (WebGL 2), quindi l'atlante si apre nella versione testuale: gli stessi
        testi, senza il modello del corpo.
      </p>
    </header>
  );
}
