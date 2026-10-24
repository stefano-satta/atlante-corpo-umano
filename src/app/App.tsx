import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { haPagina, PERCORSI } from '../contenuti/contenuti';
import { ORGANI_PER_ID } from '../contenuti/organi';
import { BarraComandi } from '../esplora/BarraComandi';
import { PannelloMisure } from '../esplora/PannelloMisure';
import { Pagina } from '../pagine/Pagina';
import { Pannello, usePercorsoAperto, useStrutturaSelezionata } from '../pannello/Pannello';
import { Richiamo } from '../pannello/Richiamo';
import { scenaApi, vistaIniziale } from '../scena/api';
import { CONFIG } from './config';
import { type IdPagina, type Strato, useAtlante, useMovimentoRidotto } from './stato';

// Il motore 3D (three.js e React Three Fiber) sta in un pacchetto separato: l'interfaccia
// compare subito e il modello si carica in parallelo (D14).
const Scena = lazy(() => import('../scena/Scena'));

// Voci della barra in alto (D11). L'Indice arriva con la M7.
const VOCI: Array<{ nome: string; pagina?: IdPagina }> = [
  { nome: 'Indice' },
  { nome: 'Fonti', pagina: 'fonti' },
  { nome: 'Informazioni', pagina: 'informazioni' },
];
const TASTI_STRATO: Record<string, Strato> = { '1': 'muscoli', '2': 'organi', '3': 'scheletro' };

// Il controllo crea un contesto WebGL di prova: va fatto una volta sola e il contesto va
// rilasciato subito. I browser ne tengono attivi pochi (circa 16) e, superato il limite,
// chiudono il più vecchio, cioè quello della scena.
let webglSupportato: boolean | undefined;
function supportaWebGL() {
  if (webglSupportato === undefined) {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      webglSupportato = !!gl;
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      webglSupportato = false;
    }
  }
  return webglSupportato;
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
      // Con una pagina di lettura aperta i tasti servono solo a chiuderla.
      if (stato.pagina) {
        if (e.key === 'Escape') invia({ tipo: 'pagina', pagina: null });
        return;
      }
      const c = scenaApi.controlli;
      const animata = !ridotto;
      switch (e.key) {
        case 'Escape':
          if (stato.scheda) invia({ tipo: 'scheda', aperta: false });
          else if (stato.selezione || !stato.percorso) invia({ tipo: 'seleziona', id: null });
          else invia({ tipo: 'percorso', percorso: null });
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
  }, [stato.scheda, stato.pagina, stato.selezione, stato.percorso, invia, ridotto]);

  // Chiudendo una pagina il fuoco torna alla voce del menu che l'aveva aperta.
  const paginaPrecedente = useRef(stato.pagina);
  useEffect(() => {
    const prima = paginaPrecedente.current;
    paginaPrecedente.current = stato.pagina;
    if (prima && !stato.pagina) document.querySelector<HTMLElement>(`[data-pagina="${prima}"]`)?.focus();
  }, [stato.pagina]);

  const { unita: u, voce, scheda } = useStrutturaSelezionata();
  const percorso = usePercorsoAperto();
  // Finché c'è un solo percorso, la voce Percorsi apre direttamente il suo primo passo (D24).
  const primoPercorso = PERCORSI[0];
  const nome = voce?.nome ?? (u && (ORGANI_PER_ID.get(u.id)?.nome ?? u.nomeFma));
  const annuncio = nome ? `Selezionato: ${nome}` : '';

  if (!supportaWebGL())
    return (
      <main className="senza-webgl">
        <h1>Atlante del corpo umano</h1>
        <p>Questo browser non supporta la grafica 3D (WebGL 2). Nella versione completa si aprirà l'Indice testuale.</p>
      </main>
    );

  return (
    <div className="atlante" data-pannello={u ? (scheda ? 'scheda' : 'cartellino') : percorso ? 'percorso' : 'no'}>
      {/* Con una pagina di lettura aperta la vista resta montata ma inerte, e la scena smette di disegnare. */}
      <div className="vista" inert={!!stato.pagina}>
        <Suspense fallback={null}>
          <Scena pronta={pronta} onPronta={onPronta} attiva={!stato.pagina} />
        </Suspense>
        <header className="barra-alta">
          <span className="marchio">Atlante del corpo umano</span>
          <nav aria-label="Sezioni">
            {primoPercorso ? (
              <button
                type="button"
                className="voce"
                aria-current={percorso ? 'true' : undefined}
                onClick={() => invia({ tipo: 'percorso', percorso: { id: primoPercorso.id, passo: 0 } })}
              >
                Percorsi
              </button>
            ) : (
              <button type="button" className="voce" aria-disabled="true" title="In preparazione">
                Percorsi
              </button>
            )}
            {VOCI.map((v) =>
              v.pagina && (v.pagina === 'fonti' || haPagina(v.pagina)) ? (
                <button
                  type="button"
                  key={v.nome}
                  className="voce"
                  data-pagina={v.pagina}
                  onClick={() => invia({ tipo: 'pagina', pagina: v.pagina ?? null })}
                >
                  {v.nome}
                </button>
              ) : (
                <button type="button" key={v.nome} className="voce" aria-disabled="true" title="In preparazione">
                  {v.nome}
                </button>
              ),
            )}
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
        {!scheda && <BarraComandi />}
        <footer className="piede">
          <p>Versione in sviluppo: alcuni nomi e testi sono in preparazione.</p>
          <p>
            Modello 3D: BodyParts3D © The Database Center for Life Science, CC BY 4.0; polmoni: Z-Anatomy, CC BY-SA 4.0.
            Modelli derivati CC BY-SA 4.0.
          </p>
        </footer>
        <p className="solo-lettori" aria-live="polite">
          {annuncio}
        </p>
        {CONFIG.misure && <PannelloMisure />}
      </div>
      {stato.pagina && <Pagina key={stato.pagina} id={stato.pagina} />}
    </div>
  );
}
