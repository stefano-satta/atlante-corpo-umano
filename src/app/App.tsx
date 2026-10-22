import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { ORGANI_PER_ID } from '../contenuti/organi';
import { BarraComandi } from '../esplora/BarraComandi';
import { PannelloMisure } from '../esplora/PannelloMisure';
import { Pannello } from '../pannello/Pannello';
import { Richiamo } from '../pannello/Richiamo';
import { scenaApi, vistaIniziale } from '../scena/api';
import { CONFIG } from './config';
import { type Strato, useAtlante, useMovimentoRidotto } from './stato';

// Il motore 3D (three.js e React Three Fiber) sta in un pacchetto separato: l'interfaccia
// compare subito e il modello si carica in parallelo (D14).
const Scena = lazy(() => import('../scena/Scena'));

const VOCI = ['Percorsi', 'Indice', 'Fonti', 'Informazioni'];
const TASTI_STRATO: Record<string, Strato> = { '1': 'muscoli', '2': 'organi', '3': 'scheletro' };

function supportaWebGL() {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

export function App() {
  const { stato, invia } = useAtlante();
  const ridotto = useMovimentoRidotto();
  const [pronta, setPronta] = useState(false);
  const onPronta = useCallback(() => setPronta(true), []);

  // Comandi da tastiera (D11): frecce per ruotare, + e − per lo zoom, 1–3 per gli strati,
  // 0 per la vista iniziale, Esc per chiudere scheda o cartellino.
  useEffect(() => {
    const suTasto = (e: KeyboardEvent) => {
      if (e.target instanceof Element && e.target.closest('input, textarea')) return;
      const c = scenaApi.controlli;
      const animata = !ridotto;
      switch (e.key) {
        case 'Escape':
          if (stato.scheda) invia({ tipo: 'scheda', aperta: false });
          else invia({ tipo: 'seleziona', id: null });
          return;
        case 'ArrowLeft':
          c?.rotate(-0.3, 0, animata);
          break;
        case 'ArrowRight':
          c?.rotate(0.3, 0, animata);
          break;
        case 'ArrowUp':
          c?.rotate(0, -0.2, animata);
          break;
        case 'ArrowDown':
          c?.rotate(0, 0.2, animata);
          break;
        case '+':
        case '=':
          c?.dolly(0.3, animata);
          break;
        case '-':
          c?.dolly(-0.3, animata);
          break;
        case '0':
          invia({ tipo: 'seleziona', id: null });
          vistaIniziale(animata);
          break;
        default:
          if (TASTI_STRATO[e.key]) invia({ tipo: 'strato', strato: TASTI_STRATO[e.key] });
          else return;
      }
      e.preventDefault();
    };
    addEventListener('keydown', suTasto);
    return () => removeEventListener('keydown', suTasto);
  }, [stato.scheda, invia, ridotto]);

  const u = stato.selezione ? scenaApi.unita.get(stato.selezione) : undefined;
  const conScheda = stato.scheda && !!(u && ORGANI_PER_ID.get(u.id)?.scheda);
  const annuncio = u ? `Selezionato: ${ORGANI_PER_ID.get(u.id)?.nome ?? u.nomeFma}` : '';

  if (!supportaWebGL())
    return (
      <main className="senza-webgl">
        <h1>Atlante del corpo umano</h1>
        <p>Questo browser non supporta la grafica 3D (WebGL 2). Nella versione completa si aprirà l'Indice testuale.</p>
      </main>
    );

  return (
    <div className="atlante" data-pannello={u ? (conScheda ? 'scheda' : 'cartellino') : 'no'}>
      <Suspense fallback={null}>
        <Scena pronta={pronta} onPronta={onPronta} />
      </Suspense>
      <header className="barra-alta">
        <span className="marchio">Atlante del corpo umano</span>
        <nav aria-label="Sezioni">
          {VOCI.map((v) => (
            <button type="button" key={v} className="voce" aria-disabled="true" title="In preparazione">
              {v}
            </button>
          ))}
        </nav>
      </header>
      {!pronta && (
        <div className="caricamento" role="status">
          <span>Caricamento del modello 3D</span>
          <span className="caricamento-linea" aria-hidden="true" />
        </div>
      )}
      <Richiamo />
      <Pannello />
      {!conScheda && <BarraComandi />}
      <footer className="piede">
        <p>Versione in sviluppo: nomi e testi sono in preparazione.</p>
        <p>Modello 3D: BodyParts3D © The Database Center for Life Science, CC BY 4.0. Modelli derivati CC BY-SA 4.0.</p>
      </footer>
      <p className="solo-lettori" aria-live="polite">
        {annuncio}
      </p>
      {CONFIG.misure && <PannelloMisure />}
    </div>
  );
}
