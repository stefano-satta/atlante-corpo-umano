import { useAtlas } from '@/hooks/useAtlas';
import { useOpenGuidedPath } from '@/hooks/useSelectedStructure';
import type { PageId } from '@/models/atlas';
import { GUIDED_PATHS, pageAvailable, QUIZ_THEMES } from '@/utils/content';
import { PAGE_IDS, PAGE_SHORT_TITLES, PAGE_TITLES } from '@/utils/pages';

/** Barra in alto della vista 3D (D11): marchio, esplorazione, percorsi e pagine di lettura. */
export function TopBar() {
  const { state, dispatch } = useAtlas();
  const pathOpen = useOpenGuidedPath();
  // La voce Percorsi apre la pagina con tutti i percorsi; resta segnata anche durante un percorso.
  const pathsCurrent = pathOpen || state.page === 'percorsi';
  // La voce Esplora è l'atlante libero, con qualunque apparato: segnata quando non c'è un percorso
  // né una pagina di lettura. Porta a `/esplora/<apparato>` chiudendo percorso e struttura.
  const quizCurrent = !!state.quiz && !state.page;
  const exploreCurrent = !pathsCurrent && !quizCurrent && !state.page && !state.home;
  const explore = () => {
    dispatch({ type: 'setQuiz', quiz: null });
    dispatch({ type: 'setGuidedPath', guidedPath: null });
    dispatch({ type: 'select', id: null });
    dispatch({ type: 'setPage', page: null });
  };

  return (
    <header className="top-bar">
      <span className="brand">Atlante del corpo umano</span>
      <nav aria-label="Sezioni">
        <button type="button" className="nav-item" aria-current={exploreCurrent ? 'true' : undefined} onClick={explore}>
          Esplora
        </button>
        {GUIDED_PATHS.length > 0 ? (
          <button
            type="button"
            className="nav-item"
            aria-current={pathsCurrent ? 'true' : undefined}
            onClick={() => dispatch({ type: 'setPage', page: 'percorsi' })}
          >
            Percorsi
          </button>
        ) : (
          <button type="button" className="nav-item" aria-disabled="true" title="In preparazione">
            Percorsi
          </button>
        )}
        {/* Quiz (D53): apre la scelta dell'apparato nel pannello; il tema già scelto resta. */}
        {Object.keys(QUIZ_THEMES).length > 0 ? (
          <button
            type="button"
            className="nav-item"
            aria-current={quizCurrent ? 'true' : undefined}
            onClick={() => {
              dispatch({ type: 'setPage', page: null });
              dispatch({ type: 'setQuiz', quiz: { theme: state.quiz?.theme ?? null } });
            }}
          >
            Quiz
          </button>
        ) : (
          <button type="button" className="nav-item" aria-disabled="true" title="In preparazione">
            Quiz
          </button>
        )}
        {PAGE_IDS.map((p) =>
          pageAvailable(p) ? (
            <button
              type="button"
              key={p}
              className="nav-item"
              data-page={p}
              onClick={() => dispatch({ type: 'setPage', page: p })}
            >
              <PageTitle page={p} />
            </button>
          ) : (
            <button type="button" key={p} className="nav-item" aria-disabled="true" title="In preparazione">
              <PageTitle page={p} />
            </button>
          ),
        )}
      </nav>
    </header>
  );
}

/**
 * Titolo della voce, con la forma breve che compare su schermo stretto (`.full`/`.short`). Il
 * nome accessibile è la forma visibile: quella nascosta con `display: none` non conta.
 */
function PageTitle({ page }: { page: PageId }) {
  const short = PAGE_SHORT_TITLES[page];
  if (!short) return <>{PAGE_TITLES[page]}</>;
  return (
    <>
      <span className="full">{PAGE_TITLES[page]}</span>
      <span className="short">{short}</span>
    </>
  );
}
