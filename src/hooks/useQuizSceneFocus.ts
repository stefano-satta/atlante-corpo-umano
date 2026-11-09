import { useEffect } from 'react';
import type { QuizTheme } from '@/models/atlas';
import type { QuizQuestion } from '@/models/content';
import { singleBodyOf } from '@/utils/modelIndex';
import { layerOfQuizTheme } from '@/utils/quiz';
import { useAtlas } from './useAtlas';

/**
 * Porta il corpo 3D sulla struttura della domanda in corso (D53): la evidenzia e la inquadra, passa
 * al corpo Uomo/Donna giusto e, nel quiz completo, all'apparato della domanda. Senza domanda, nulla.
 */
export function useQuizSceneFocus(question: QuizQuestion | undefined, theme: QuizTheme | null) {
  const { dispatch } = useAtlas();
  useEffect(() => {
    if (!question) {
      dispatch({ type: 'setQuizFocus', focus: null });
      return;
    }
    dispatch({
      type: 'setQuizFocus',
      focus: question.evidenzia,
      layer: theme === 'completa' ? layerOfQuizTheme(question.tema) : undefined,
      body: question.unita ? singleBodyOf(question.unita) : undefined,
    });
  }, [question, theme, dispatch]);
}
