import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BackIcon, CloseIcon, ForwardIcon } from '@/components/common/Icons';
import { useAtlas } from '@/hooks/useAtlas';
import { closeTour } from '@/utils/tour';

// Tour iniziale (D26, B1): quattro passi indicati sugli elementi veri dell'interfaccia.
// Parte da solo alla prima visita, dopo "Esplora il corpo"; si riapre con Aiuto o con il tasto ?.

/** Larghezza massima della scheda della guida, in pixel: deve restare uguale a `.tour` in styles/tour.css. */
const TOUR_MAX_WIDTH = 360;

interface TourStep {
  title: string;
  text: string;
  /** Elemento indicato; senza, il passo riguarda il corpo al centro della scena. */
  target: string | null;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Ruota, avvicinati e sposta',
    text: 'Trascina per ruotare il corpo; usa la rotellina, o due dita sullo schermo, per avvicinarti. Per spostarlo trascina con il tasto destro, tenendo premuto Maiusc o con due dita. Da tastiera: le frecce ruotano, Maiusc + frecce spostano, + e − avvicinano e allontanano.',
    target: null,
  },
  {
    title: 'Scegli una struttura',
    text: 'Fai clic, o tocca, un organo, un osso o un muscolo: si apre il cartellino con il nome, il termine latino e una breve descrizione. Esc lo chiude.',
    target: null,
  },
  {
    title: 'Strati e sagoma',
    text: 'Qui scegli cosa vedere: a sinistra il corpo maschile o femminile, poi lo scheletro, gli organi (con le ossa in trasparenza) o i muscoli (tasti 1, 2 e 3). Sagoma mostra o nasconde la pelle, Vista iniziale riporta il corpo di fronte (tasto 0).',
    target: '.view-controls',
  },
  {
    title: 'Percorsi, Indice e Fonti',
    text: 'In alto trovi i percorsi guidati, l’Indice e il Glossario con la ricerca, e le fonti di tutti i testi. Il pulsante Aiuto, in basso, riapre questa guida.',
    target: '.top-bar nav',
  },
];

/** Rettangolo dell'elemento indicato, se è visibile. */
function targetRect(selector: string | null) {
  const el = selector ? document.querySelector(selector) : null;
  const r = el?.getBoundingClientRect();
  return r && r.width > 0 && r.height > 0 ? r : null;
}

export function Tour() {
  const { state, dispatch } = useAtlas();
  const number = state.tour ?? 0;
  const step = TOUR_STEPS[Math.min(number, TOUR_STEPS.length - 1)];
  const heading = useRef<HTMLHeadingElement>(null);
  const [highlight, setHighlight] = useState<DOMRect | null>(null);

  // Il riquadro segue l'elemento indicato anche quando la finestra cambia misura.
  useLayoutEffect(() => {
    const update = () => setHighlight(targetRect(step.target));
    update();
    addEventListener('resize', update);
    return () => removeEventListener('resize', update);
  }, [step]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a ogni passo il fuoco va al titolo, che lo annuncia
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [number]);

  const last = number === TOUR_STEPS.length - 1;
  const close = () => closeTour(dispatch);
  // La scheda sta sopra un elemento in basso e sotto uno in alto; senza elemento, in basso a sinistra.
  // Il centro resta dentro la finestra: la scheda è larga al massimo TOUR_MAX_WIDTH.
  const above = highlight ? highlight.top > innerHeight / 2 : true;
  const half = Math.min(TOUR_MAX_WIDTH, innerWidth - 32) / 2;
  const center =
    highlight && Math.min(Math.max(highlight.left + highlight.width / 2, 16 + half), innerWidth - 16 - half);
  const position = highlight
    ? above
      ? { bottom: innerHeight - highlight.top + 16, left: center ?? 0 }
      : { top: highlight.bottom + 16, left: center ?? 0 }
    : undefined;

  return (
    <>
      {highlight && (
        <div
          className="tour-highlight"
          aria-hidden="true"
          style={{
            top: highlight.top - 6,
            left: highlight.left - 6,
            width: highlight.width + 12,
            height: highlight.height + 12,
          }}
        />
      )}
      <section
        className="tour"
        data-placement={highlight ? (above ? 'above' : 'below') : 'center'}
        style={position}
        role="dialog"
        aria-modal="false"
        aria-labelledby="tour-title"
        aria-describedby="tour-text"
      >
        <div className="tour-header">
          <span className="label">
            Guida · {number + 1} di {TOUR_STEPS.length}
          </span>
          <button type="button" className="close" aria-label="Chiudi la guida" onClick={close}>
            <CloseIcon />
          </button>
        </div>
        <h2 id="tour-title" ref={heading} tabIndex={-1}>
          {step.title}
        </h2>
        <p id="tour-text" className="tour-text">
          {step.text}
        </p>
        <div className="tour-controls">
          {number > 0 ? (
            <button type="button" className="back" onClick={() => dispatch({ type: 'setTour', step: number - 1 })}>
              <BackIcon /> Indietro
            </button>
          ) : (
            <button type="button" className="back" onClick={close}>
              Salta la guida
            </button>
          )}
          <button
            type="button"
            className="action"
            onClick={() => (last ? close() : dispatch({ type: 'setTour', step: number + 1 }))}
          >
            {last ? 'Inizia a esplorare' : 'Avanti'} <ForwardIcon />
          </button>
        </div>
      </section>
    </>
  );
}
