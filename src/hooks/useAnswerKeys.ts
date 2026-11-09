import { type RefObject, useEffect, useEffectEvent } from 'react';
import { answerIndexOfKey } from '@/utils/quiz';

// Mentre si scrive, o in una finestra di dialogo (glossario), le lettere restano lettere.
const TYPING = 'input, select, textarea, dialog, [contenteditable="true"]';
// Invio su questi elementi fa il loro lavoro (aprire una fonte, una voce del glossario).
const ACTIVATABLE = 'a, button, summary';

interface AnswerKeys {
  answered: boolean;
  onChoose: (answer: number) => void;
  onNext: () => void;
  /** Il pulsante "Avanti": Invio su di lui va avanti come altrove nel pannello. */
  nextButton: RefObject<HTMLButtonElement | null>;
}

/** Tastiera del quiz (D53): A–D scelgono la risposta, Invio passa alla domanda successiva. */
export function useAnswerKeys({ answered, onChoose, onNext, nextButton }: AnswerKeys) {
  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    const target = e.target instanceof Element ? e.target : null;
    if (target?.closest(TYPING)) return;

    if (e.key === 'Enter') {
      const otherControl = target?.closest(ACTIVATABLE) && target !== nextButton.current;
      if (!answered || otherControl) return;
      e.preventDefault();
      onNext();
      return;
    }

    const answer = answerIndexOfKey(e.key);
    if (answer < 0) return;
    e.preventDefault();
    onChoose(answer);
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKeyDown(e);
    addEventListener('keydown', listener);
    return () => removeEventListener('keydown', listener);
  }, []);
}
