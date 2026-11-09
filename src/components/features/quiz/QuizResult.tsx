import { useEffect, useRef } from 'react';
import { Button } from '@/components/common/Button';
import { ForwardIcon } from '@/components/common/Icons';
import type { QuizScore } from '@/utils/quizScore';

interface QuizResultProps {
  score: QuizScore;
  /** Miglior risultato prima di questo giro, se c'era. */
  previous: QuizScore | null;
  /** Questo giro è il nuovo miglior risultato. */
  record: boolean;
  onRestart: () => void;
  onChangeTheme: () => void;
}

function recordText({ previous, record }: Pick<QuizResultProps, 'previous' | 'record'>) {
  if (!previous) return null;
  return record
    ? 'È il tuo miglior risultato.'
    : `Il tuo miglior risultato resta ${previous.correct} su ${previous.total}.`;
}

/** Fine del giro: punteggio, confronto con il migliore e come ripartire. */
export function QuizResult({ score, previous, record, onRestart, onChangeTheme }: QuizResultProps) {
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => title.current?.focus(), []);
  const summary =
    score.correct === score.total ? 'Tutte giuste!' : `Hai risposto bene a ${score.correct} domande su ${score.total}.`;

  return (
    <>
      <h2 id="quiz-title" ref={title} tabIndex={-1} className="name">
        {score.correct} su {score.total}
      </h2>
      <p className="quiz-intro">
        {summary} {recordText({ previous, record })}
      </p>
      <div className="quiz-actions">
        <Button variant="action" onClick={onRestart}>
          Ricomincia <ForwardIcon />
        </Button>
        <Button variant="back" onClick={onChangeTheme}>
          Cambia apparato
        </Button>
      </div>
    </>
  );
}
