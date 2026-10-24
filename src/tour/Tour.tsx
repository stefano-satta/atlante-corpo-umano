import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAtlante } from '../app/stato';
import { IconaAvanti, IconaChiudi, IconaIndietro } from '../pannello/icone';

// Tour iniziale (D26, B1): quattro passi indicati sugli elementi veri dell'interfaccia.
// Parte da solo alla prima visita, dopo "Esplora il corpo"; si riapre con Aiuto o con il tasto ?.

const CHIAVE = 'atlante.tour';
/** Larghezza massima della scheda della guida, in pixel: deve restare uguale a `.tour` in stile.css. */
const LARGHEZZA_TOUR = 360;

/** Vero se il tour è già stato visto in questo browser. Senza memoria disponibile si mostra di nuovo. */
export function tourGiaVisto() {
  try {
    return localStorage.getItem(CHIAVE) === 'visto';
  } catch {
    return false;
  }
}

function ricordaTour() {
  try {
    localStorage.setItem(CHIAVE, 'visto');
  } catch {
    // Memoria del browser non disponibile (navigazione privata, dati bloccati): il tour tornerà.
  }
}

interface PassoTour {
  titolo: string;
  testo: string;
  /** Elemento indicato; senza, il passo riguarda il corpo al centro della scena. */
  bersaglio: string | null;
}

export const PASSI_TOUR: PassoTour[] = [
  {
    titolo: 'Ruota e avvicinati',
    testo:
      'Trascina per ruotare il corpo; usa la rotellina, o due dita sullo schermo, per avvicinarti. Da tastiera: le frecce ruotano, + e − avvicinano e allontanano.',
    bersaglio: null,
  },
  {
    titolo: 'Scegli una struttura',
    testo:
      'Fai clic, o tocca, un organo, un osso o un muscolo: si apre il cartellino con il nome, il termine latino e una breve descrizione. Esc lo chiude.',
    bersaglio: null,
  },
  {
    titolo: 'Strati e sagoma',
    testo:
      'Qui scegli cosa vedere: i muscoli, lo scheletro con gli organi o solo lo scheletro (tasti 1, 2 e 3). Sagoma mostra o nasconde la pelle, Vista iniziale riporta il corpo di fronte (tasto 0).',
    bersaglio: '.barra-comandi',
  },
  {
    titolo: 'Percorsi, Indice e Fonti',
    testo:
      'In alto trovi i percorsi guidati, l’Indice con la ricerca e il glossario, e le fonti di tutti i testi. Il pulsante Aiuto, in basso, riapre questa guida.',
    bersaglio: '.barra-alta nav',
  },
];

/** Rettangolo dell'elemento indicato, se è visibile. */
function rettangolo(selettore: string | null) {
  const el = selettore ? document.querySelector(selettore) : null;
  const r = el?.getBoundingClientRect();
  return r && r.width > 0 && r.height > 0 ? r : null;
}

export function chiudiTour(invia: ReturnType<typeof useAtlante>['invia']) {
  ricordaTour();
  invia({ tipo: 'tour', passo: null });
  // Il fuoco va al pulsante che riapre la guida, così si sa dove ritrovarla.
  requestAnimationFrame(() => document.querySelector<HTMLElement>('.comando-aiuto')?.focus());
}

export function Tour() {
  const { stato, invia } = useAtlante();
  const numero = stato.tour ?? 0;
  const passo = PASSI_TOUR[Math.min(numero, PASSI_TOUR.length - 1)];
  const titolo = useRef<HTMLHeadingElement>(null);
  const [bordo, setBordo] = useState<DOMRect | null>(null);

  // Il riquadro segue l'elemento indicato anche quando la finestra cambia misura.
  useLayoutEffect(() => {
    const aggiorna = () => setBordo(rettangolo(passo.bersaglio));
    aggiorna();
    addEventListener('resize', aggiorna);
    return () => removeEventListener('resize', aggiorna);
  }, [passo]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a ogni passo il fuoco va al titolo, che lo annuncia
  useEffect(() => {
    titolo.current?.focus({ preventScroll: true });
  }, [numero]);

  const ultimo = numero === PASSI_TOUR.length - 1;
  const chiudi = () => chiudiTour(invia);
  // La scheda sta sopra un elemento in basso e sotto uno in alto; senza elemento, in basso al centro.
  // Il centro resta dentro la finestra: la scheda è larga al massimo LARGHEZZA_TOUR.
  const sopra = bordo ? bordo.top > innerHeight / 2 : true;
  const meta = Math.min(LARGHEZZA_TOUR, innerWidth - 32) / 2;
  const centro = bordo && Math.min(Math.max(bordo.left + bordo.width / 2, 16 + meta), innerWidth - 16 - meta);
  const posizione = bordo
    ? sopra
      ? { bottom: innerHeight - bordo.top + 16, left: centro ?? 0 }
      : { top: bordo.bottom + 16, left: centro ?? 0 }
    : undefined;

  return (
    <>
      {bordo && (
        <div
          className="tour-bordo"
          aria-hidden="true"
          style={{ top: bordo.top - 6, left: bordo.left - 6, width: bordo.width + 12, height: bordo.height + 12 }}
        />
      )}
      <section
        className="tour"
        data-posizione={bordo ? (sopra ? 'sopra' : 'sotto') : 'centro'}
        style={posizione}
        role="dialog"
        aria-modal="false"
        aria-labelledby="tour-titolo"
        aria-describedby="tour-testo"
      >
        <div className="tour-testa">
          <span className="etichetta">
            Guida · {numero + 1} di {PASSI_TOUR.length}
          </span>
          <button type="button" className="chiudi" aria-label="Chiudi la guida" onClick={chiudi}>
            <IconaChiudi />
          </button>
        </div>
        <h2 id="tour-titolo" ref={titolo} tabIndex={-1}>
          {passo.titolo}
        </h2>
        <p id="tour-testo" className="tour-testo">
          {passo.testo}
        </p>
        <div className="tour-comandi">
          {numero > 0 ? (
            <button type="button" className="indietro" onClick={() => invia({ tipo: 'tour', passo: numero - 1 })}>
              <IconaIndietro /> Indietro
            </button>
          ) : (
            <button type="button" className="indietro" onClick={chiudi}>
              Salta la guida
            </button>
          )}
          <button
            type="button"
            className="azione"
            onClick={() => (ultimo ? chiudi() : invia({ tipo: 'tour', passo: numero + 1 }))}
          >
            {ultimo ? 'Inizia a esplorare' : 'Avanti'} <IconaAvanti />
          </button>
        </div>
      </section>
    </>
  );
}
