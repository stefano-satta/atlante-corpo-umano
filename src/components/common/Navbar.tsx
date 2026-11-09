import { useAtlas } from '@/hooks/useAtlas';
import { useOpenGuidedPath } from '@/hooks/useSelectedStructure';
import type { PageId } from '@/models/atlas';
import { GUIDED_PATHS, pageAvailable, QUIZ_THEMES } from '@/utils/content';
import { PAGE_IDS, PAGE_SHORT_TITLES, PAGE_TITLES } from '@/utils/pages';
import { Button } from './Button';

/** Barra in alto della vista 3D (D11): marchio, esplorazione, percorsi e pagine di lettura. */
export function Navbar() {
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
        <Button variant="nav" aria-current={exploreCurrent ? 'true' : undefined} onClick={explore}>
          Esplora
        </Button>
        {GUIDED_PATHS.length > 0 ? (
          <Button
            variant="nav"
            aria-current={pathsCurrent ? 'true' : undefined}
            onClick={() => dispatch({ type: 'setPage', page: 'percorsi' })}
          >
            Percorsi
          </Button>
        ) : (
          <Button variant="nav" aria-disabled="true" title="In preparazione">
            Percorsi
          </Button>
        )}
        {/* Quiz (D53): apre la scelta dell'apparato nel pannello; il tema già scelto resta. */}
        {Object.keys(QUIZ_THEMES).length > 0 ? (
          <Button
            variant="nav"
            aria-current={quizCurrent ? 'true' : undefined}
            onClick={() => {
              dispatch({ type: 'setPage', page: null });
              dispatch({ type: 'setQuiz', quiz: { theme: state.quiz?.theme ?? null } });
            }}
          >
            Quiz
          </Button>
        ) : (
          <Button variant="nav" aria-disabled="true" title="In preparazione">
            Quiz
          </Button>
        )}
        {PAGE_IDS.map((p) =>
          pageAvailable(p) ? (
            <Button key={p} variant="nav" data-page={p} onClick={() => dispatch({ type: 'setPage', page: p })}>
              <PageTitle page={p} />
            </Button>
          ) : (
            <Button key={p} variant="nav" aria-disabled="true" title="In preparazione">
              <PageTitle page={p} />
            </Button>
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
