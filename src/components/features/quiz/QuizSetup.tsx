import { useId } from 'react';
import { Button } from '@/components/common/Button';
import { ForwardIcon } from '@/components/common/Icons';
import { LAYERS } from '@/components/features/toolbar/LayerSwitch';
import { useAtlas } from '@/hooks/useAtlas';
import { useTextOnly } from '@/hooks/useTextOnly';
import type { QuizTheme } from '@/models/atlas';
import { QUIZ_THEMES } from '@/utils/content';
import { playableCount, roundSize } from '@/utils/quiz';
import { bestScore } from '@/utils/quizScore';
import { LAYER_SLUGS } from '@/utils/url';

interface QuizSetupProps {
  theme: QuizTheme | null;
  /** Temi dei contenuti con almeno una domanda da mostrare. */
  available: string[];
  /** Le domande del tema sono scaricate. */
  ready: boolean;
  error: boolean;
  onStart: () => void;
}

/** Prima schermata del quiz: scelta dell'apparato e partenza. */
export function QuizSetup({ theme, available, ready, error, onStart }: QuizSetupProps) {
  const { dispatch } = useAtlas();
  const textOnly = useTextOnly();
  const selectId = useId();
  const countOf = (slug: string) => playableCount(QUIZ_THEMES[slug], textOnly);
  const total = available.reduce((n, slug) => n + countOf(slug), 0);
  const count = !theme ? 0 : theme === 'completa' ? total : countOf(LAYER_SLUGS[theme]);
  const best = theme ? bestScore(theme) : null;
  const chooseTheme = (value: string) =>
    dispatch({ type: 'setQuiz', quiz: { theme: (value || null) as QuizTheme | null } });

  return (
    <>
      <h2 id="quiz-title" className="name">
        Mettiti alla prova
      </h2>
      <p className="quiz-intro">
        Scegli un apparato e rispondi alle domande: ognuna ha quattro risposte e una sola è giusta.
        {!textOnly && ' Il corpo 3D mostra la struttura di cui parla la domanda.'}
      </p>
      <label className="quiz-field" htmlFor={selectId}>
        <span className="label">Apparato</span>
        <select id={selectId} value={theme ?? ''} onChange={(e) => chooseTheme(e.target.value)}>
          <option value="" disabled>
            Scegli un apparato…
          </option>
          <option value="completa" disabled={total === 0}>
            Completa: tutti gli apparati ({total})
          </option>
          {LAYERS.map((l) => {
            const n = countOf(LAYER_SLUGS[l.id]);
            return (
              <option key={l.id} value={l.id} disabled={n === 0}>
                {l.name} {n ? `(${n})` : '(in preparazione)'}
              </option>
            );
          })}
        </select>
      </label>
      {theme && count > 0 && (
        <p className="note quiz-round">
          {Math.min(roundSize(theme), count)} domande a caso
          {theme === 'completa' ? ', da tutti gli apparati' : ''}.
          {best && ` Il tuo miglior risultato: ${best.correct} su ${best.total}.`}
        </p>
      )}
      {error && <p className="notice">Non è stato possibile caricare le domande.</p>}
      <Button variant="action" disabled={!theme || !ready || count === 0} onClick={onStart}>
        {theme && !ready && !error ? 'Caricamento delle domande…' : 'Inizia il quiz'} <ForwardIcon />
      </Button>
      <p className="note">Il quiz serve solo a verificare da soli che cosa si è capito: non è un esame.</p>
    </>
  );
}
