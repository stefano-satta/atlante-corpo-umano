import { useEffect, useRef } from 'react';
import { DraftNotice } from '@/components/common/DraftNotice';
import { ForwardIcon } from '@/components/common/Icons';
import { SourceList } from '@/components/common/SourceList';
import { RichText } from '@/components/features/glossary/RichText';
import { useAnswerKeys } from '@/hooks/useAnswerKeys';
import { useTextOnly } from '@/hooks/useTextOnly';
import { ANSWER_LETTERS, answerResult, type PreparedQuestion } from '@/utils/quiz';
import { AnswerButton } from './AnswerButton';

interface QuestionCardProps {
  prepared: PreparedQuestion;
  /** Posizione della domanda nel giro, contata da 1. */
  number: number;
  total: number;
  /** Risposta scelta, o null se non si è ancora risposto. */
  chosen: number | null;
  onChoose: (answer: number) => void;
  onNext: () => void;
}

/** Una domanda: le quattro risposte e, dopo la scelta, l'esito, la spiegazione con le fonti e "Avanti". */
export function QuestionCard({ prepared, number, total, chosen, onChoose, onNext }: QuestionCardProps) {
  const { question: q, answers, correct } = prepared;
  const textOnly = useTextOnly();
  const title = useRef<HTMLHeadingElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const answered = chosen !== null;
  const last = number === total;

  // A ogni domanda il pannello torna in cima e il fuoco va al testo; dopo la risposta, su "Avanti".
  useEffect(() => {
    const panel = title.current?.closest('.panel, .reading-page');
    if (panel) panel.scrollTop = 0;
    title.current?.focus();
  }, []);
  useEffect(() => {
    if (answered) next.current?.focus();
  }, [answered]);
  useAnswerKeys({ answered, onChoose, onNext, nextButton: next });

  return (
    <>
      <p className="path-count label">
        Domanda {number} di {total}
      </p>
      <h2 id="quiz-title" ref={title} tabIndex={-1} className="quiz-question" data-question={q.id}>
        {q.domanda}
      </h2>
      {q.tipo === 'indica' && !textOnly && <p className="note quiz-hint">Guarda la struttura evidenziata nel corpo.</p>}
      <DraftNotice status={q.stato} />
      <ol className="quiz-answers">
        {answers.map((text, i) => (
          <li key={text}>
            <AnswerButton
              letter={ANSWER_LETTERS[i]}
              text={text}
              result={answerResult(i, correct, chosen)}
              onChoose={() => onChoose(i)}
            />
          </li>
        ))}
      </ol>
      <KeyHint answered={answered} last={last} />
      <div className="quiz-feedback" aria-live="polite">
        {answered && (
          <>
            <p className="quiz-verdict" data-result={chosen === correct ? 'correct' : 'wrong'}>
              {chosen === correct ? 'Risposta giusta.' : `Risposta sbagliata: quella giusta è “${answers[correct]}”.`}
            </p>
            <RichText className="text" html={q.spiegazione} />
          </>
        )}
      </div>
      {answered && (
        <>
          <button type="button" ref={next} className="action" aria-keyshortcuts="Enter" onClick={onNext}>
            {last ? 'Vedi il risultato' : 'Avanti'} <ForwardIcon />
          </button>
          {q.fonti.length > 0 && (
            <section className="card-sources" aria-labelledby="quiz-sources-title">
              <h3 id="quiz-sources-title" className="label">
                Fonti di questa risposta
              </h3>
              <SourceList sources={q.fonti} />
            </section>
          )}
        </>
      )}
    </>
  );
}

/** Promemoria dei tasti, nascosto dove non c'è una tastiera (quiz.css). */
function KeyHint({ answered, last }: { answered: boolean; last: boolean }) {
  return (
    <p className="note quiz-keys">
      {answered ? (
        <>
          Premi <kbd>Invio</kbd> per {last ? 'vedere il risultato' : 'andare avanti'}.
        </>
      ) : (
        <>
          Da tastiera: <kbd>A</kbd>, <kbd>B</kbd>, <kbd>C</kbd> o <kbd>D</kbd> per rispondere.
        </>
      )}
    </p>
  );
}
