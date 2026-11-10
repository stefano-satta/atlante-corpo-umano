import { useAtlas } from '@/hooks/useAtlas';
import { useOpenGuidedPath } from '@/hooks/useSelectedStructure';
import { GUIDED_PATHS, pageAvailable, QUIZ_THEMES } from '@/utils/content';
import { NAV_PAGE_IDS, PAGE_TITLES } from '@/utils/pages';
import { Brand } from './Brand';
import { Button } from './Button';
import { SecondaryMenuButton } from './SecondaryMenuButton';

/**
 * Barra in alto (D11): marchio; a sinistra Esplora, Percorsi e Quiz; a destra Indice, Glossario e il menu
 * secondario con le altre pagine di lettura. Sull'atlante e in cima alle pagine.
 */
export function Navbar() {
  const { state, dispatch } = useAtlas();
  const pathOpen = useOpenGuidedPath();
  // La voce Percorsi apre la pagina con tutti i percorsi; resta segnata anche durante un percorso.
  const pathsCurrent = state.page === 'percorsi' || (pathOpen && !state.page);
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
      <Brand />
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
        {/* Da Indice in poi le voci stanno a destra (`.nav-end` le spinge con margin-left: auto). */}
        {NAV_PAGE_IDS.map((p, i) =>
          pageAvailable(p) ? (
            <Button
              key={p}
              variant="nav"
              className={i === 0 ? 'nav-end' : undefined}
              data-page={p}
              aria-current={state.page === p ? 'true' : undefined}
              onClick={() => dispatch({ type: 'setPage', page: p })}
            >
              {PAGE_TITLES[p]}
            </Button>
          ) : (
            <Button
              key={p}
              variant="nav"
              className={i === 0 ? 'nav-end' : undefined}
              aria-disabled="true"
              title="In preparazione"
            >
              {PAGE_TITLES[p]}
            </Button>
          ),
        )}
      </nav>
      <SecondaryMenuButton />
    </header>
  );
}
