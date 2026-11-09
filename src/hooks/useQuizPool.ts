import { useMemo } from 'react';
import type { QuizTheme } from '@/models/atlas';
import { QUIZ_THEMES } from '@/utils/content';
import { playableCount, playableQuestions, quizSlugs } from '@/utils/quiz';
import { useQuizQuestions } from './useContent';
import { useTextOnly } from './useTextOnly';

/**
 * Domande che il quiz può usare per il tema scelto (D53): scarica i temi che servono e, nella
 * versione solo testo, toglie le domande che chiedono di guardare il corpo 3D.
 */
export function useQuizPool(theme: QuizTheme | null) {
  const textOnly = useTextOnly();
  const available = useMemo(
    () => Object.keys(QUIZ_THEMES).filter((slug) => playableCount(QUIZ_THEMES[slug], textOnly) > 0),
    [textOnly],
  );
  const slugs = useMemo(() => (theme ? quizSlugs(theme, available) : undefined), [theme, available]);
  const { data, error } = useQuizQuestions(slugs);
  const groups = useMemo(() => data?.map((g) => playableQuestions(g, textOnly)), [data, textOnly]);
  return { available, groups, error };
}
