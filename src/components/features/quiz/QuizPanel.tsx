import { Button } from '@/components/common/Button';
import { CloseIcon } from '@/components/common/Icons';
import { LAYERS } from '@/components/features/toolbar/LayerSwitch';
import { useAtlas } from '@/hooks/useAtlas';
import { useQuizPool } from '@/hooks/useQuizPool';
import { useQuizRound } from '@/hooks/useQuizRound';
import { useQuizSceneFocus } from '@/hooks/useQuizSceneFocus';
import type { QuizTheme } from '@/models/atlas';
import { QuestionCard } from './QuestionCard';
import { QuizResult } from './QuizResult';
import { QuizSetup } from './QuizSetup';

function themeName(theme: QuizTheme) {
  return theme === 'completa' ? 'Completa' : (LAYERS.find((l) => l.id === theme)?.name ?? theme);
}

/**
 * Quiz di autoverifica nel pannello a destra (D53), caricato solo quando lo si apre. Si sceglie
 * l'apparato (o "Completa", con domande di tutti), e ogni domanda evidenzia nel corpo 3D la
 * struttura di cui parla. Il miglior risultato resta in questo browser.
 */
export default function QuizPanel() {
  const { state, dispatch } = useAtlas();
  const theme = state.quiz?.theme ?? null;
  return (
    <article className="quiz" aria-labelledby="quiz-title">
      <div className="panel-header">
        <span className="label">Quiz{theme ? ` · ${themeName(theme)}` : ''}</span>
        <Button variant="close" aria-label="Chiudi il quiz" onClick={() => dispatch({ type: 'setQuiz', quiz: null })}>
          <CloseIcon />
        </Button>
      </div>
      {/* Cambiare tema, dal pannello o dalla barra degli apparati, ricomincia da capo. */}
      <QuizSession key={theme ?? 'scelta'} theme={theme} />
    </article>
  );
}

/** Un giro del quiz: sceglie quale schermata mostrare secondo la fase. */
function QuizSession({ theme }: { theme: QuizTheme | null }) {
  const { dispatch } = useAtlas();
  const { available, groups, error } = useQuizPool(theme);
  const { round, start, choose, next } = useQuizRound(theme);
  const current = round.phase === 'question' ? round.questions[round.index] : undefined;
  useQuizSceneFocus(current?.question, theme);
  const startRound = () => groups && start(groups);

  if (round.phase === 'question' && current)
    return (
      <QuestionCard
        key={round.index}
        prepared={current}
        number={round.index + 1}
        total={round.questions.length}
        chosen={round.chosen}
        onChoose={choose}
        onNext={next}
      />
    );
  if (round.phase === 'result')
    return (
      <QuizResult
        score={round.score}
        previous={round.previous}
        record={round.record}
        onRestart={startRound}
        onChangeTheme={() => dispatch({ type: 'setQuiz', quiz: { theme: null } })}
      />
    );
  return <QuizSetup theme={theme} available={available} ready={!!groups} error={error} onStart={startRound} />;
}
