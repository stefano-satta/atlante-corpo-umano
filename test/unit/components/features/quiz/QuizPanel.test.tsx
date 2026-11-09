// @vitest-environment jsdom
import '../../../../dom-setup';
import urinario from 'virtual:contenuti/quiz/urinario';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { Panel } from '@/components/features/panel/Panel';
import { AtlasProvider } from '@/contexts/AtlasContext';
import type { QuizQuestion } from '@/models/content';

afterEach(() => localStorage.clear());

function renderAt(path: string) {
  history.pushState(null, '', path);
  return render(
    <BrowserRouter>
      <AtlasProvider>
        <Panel />
      </AtlasProvider>
    </BrowserRouter>,
  );
}

const questions = urinario as QuizQuestion[];
// Le domande "Quale organo è evidenziato?" hanno lo stesso testo: si riconoscono dall'id.
const correctFor = (title: HTMLElement) => {
  const q = questions.find((x) => x.id === title.dataset.question);
  if (!q) throw new Error(`domanda sconosciuta: ${title.dataset.question}`);
  return q.risposte[0];
};
const answerButtons = () => within(document.querySelector('.quiz-answers') as HTMLElement).getAllByRole('button');
const answerButton = (text: string) =>
  answerButtons().find((b) => b.querySelector('.quiz-answer-text')?.textContent === text);

describe('quiz (D53)', () => {
  it('su /quiz chiede di scegliere un apparato prima di iniziare', async () => {
    renderAt('/quiz');
    expect(await screen.findByRole('heading', { name: 'Mettiti alla prova' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Inizia il quiz/ }).hasAttribute('disabled')).toBe(true);
    const select = screen.getByRole('combobox', { name: 'Apparato' });
    fireEvent.change(select, { target: { value: 'urinario' } });
    expect(location.pathname).toBe('/quiz/urinario');
  });

  it('segna in verde la risposta giusta e in rosso quella sbagliata scelta', async () => {
    renderAt('/quiz/urinario');
    const start = await screen.findByRole('button', { name: /Inizia il quiz/ });
    await screen.findByText(/10 domande a caso/);
    fireEvent.click(start);

    const title = await screen.findByRole('heading', { level: 2 });
    expect(screen.getByText('Domanda 1 di 10')).toBeTruthy();
    const right = correctFor(title);
    const answers = answerButtons();
    expect(answers).toHaveLength(4);
    const wrong = answers.find((b) => b !== answerButton(right));
    if (!wrong) throw new Error('nessuna risposta sbagliata');
    fireEvent.click(wrong);

    expect(wrong.dataset.result).toBe('wrong');
    const correct = answers.find((b) => b.dataset.result === 'correct');
    expect(correct).toBe(answerButton(right));
    expect(screen.getByText(`Risposta sbagliata: quella giusta è “${right}”.`)).toBeTruthy();
    // Dopo la risposta non si cambia idea.
    fireEvent.click(correct as HTMLElement);
    expect(wrong.dataset.result).toBe('wrong');
    expect(screen.getByRole('button', { name: /Avanti/ })).toBeTruthy();
  });

  it('alla fine mostra il punteggio e ricorda il migliore', async () => {
    renderAt('/quiz/urinario');
    await screen.findByText(/10 domande a caso/);
    fireEvent.click(screen.getByRole('button', { name: /Inizia il quiz/ }));
    for (let i = 0; i < 10; i++) {
      const title = await screen.findByRole('heading', { level: 2 });
      fireEvent.click(answerButton(correctFor(title)) as HTMLElement);
      fireEvent.click(screen.getByRole('button', { name: i < 9 ? /Avanti/ : /Vedi il risultato/ }));
    }
    expect(await screen.findByRole('heading', { name: '10 su 10' })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('atlante.quiz') ?? '{}').urinario).toEqual({ correct: 10, total: 10 });
  });

  it('da tastiera si risponde con le lettere A–D e si va avanti con Invio', async () => {
    renderAt('/quiz/urinario');
    await screen.findByText(/10 domande a caso/);
    fireEvent.click(screen.getByRole('button', { name: /Inizia il quiz/ }));

    const first = await screen.findByRole('heading', { level: 2 });
    expect(answerButtons()[1].getAttribute('aria-keyshortcuts')).toBe('B');
    // Invio prima di rispondere non salta la domanda, e i numeri non scelgono risposte.
    fireEvent.keyDown(first, { key: 'Enter' });
    fireEvent.keyDown(first, { key: '1' });
    expect(screen.getByText('Domanda 1 di 10')).toBeTruthy();
    expect(answerButtons().every((b) => !b.dataset.result)).toBe(true);

    fireEvent.keyDown(first, { key: 'c' });
    expect(answerButtons()[2].dataset.result).toMatch(/correct|wrong/);
    fireEvent.keyDown(document.activeElement ?? first, { key: 'Enter' });

    expect(await screen.findByText('Domanda 2 di 10')).toBeTruthy();
    fireEvent.keyDown(screen.getByRole('heading', { level: 2 }), { key: 'B' });
    expect(answerButtons()[1].dataset.result).toMatch(/correct|wrong/);
  });

  it("si chiude con il pulsante e torna all'esplorazione", async () => {
    renderAt('/quiz/urinario');
    fireEvent.click(await screen.findByRole('button', { name: 'Chiudi il quiz' }));
    expect(screen.queryByRole('complementary', { name: 'Quiz' })).toBeNull();
    expect(location.pathname).toBe('/esplora/urinario');
  });
});
