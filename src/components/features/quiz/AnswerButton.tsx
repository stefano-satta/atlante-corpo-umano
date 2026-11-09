import type { AnswerResult } from '@/utils/quiz';

// Dopo la scelta, la lettera lascia il posto al segno dell'esito: l'informazione non sta nel solo colore.
const MARK: Partial<Record<AnswerResult, string>> = { correct: '✓', wrong: '✗' };
const SPOKEN: Partial<Record<AnswerResult, string>> = {
  correct: ' (risposta giusta)',
  wrong: ' (la tua risposta, sbagliata)',
};

interface AnswerButtonProps {
  letter: string;
  text: string;
  /** Esito dopo la scelta; prima, nessuno. */
  result: AnswerResult | undefined;
  onChoose: () => void;
}

/** Una delle quattro risposte: si sceglie con un clic o con la sua lettera. */
export function AnswerButton({ letter, text, result, onChoose }: AnswerButtonProps) {
  const spoken = result && SPOKEN[result];
  return (
    <button
      type="button"
      className="quiz-answer"
      data-result={result}
      aria-disabled={result ? true : undefined}
      aria-keyshortcuts={letter}
      onClick={onChoose}
    >
      <span className="quiz-letter" aria-hidden="true">
        {(result && MARK[result]) ?? letter}
      </span>
      <span className="quiz-answer-text">{text}</span>
      {spoken && <span className="visually-hidden">{spoken}</span>}
    </button>
  );
}
