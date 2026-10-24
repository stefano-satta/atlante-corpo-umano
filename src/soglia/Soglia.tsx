import { useEffect } from 'react';
import { useAtlante, useMovimentoRidotto } from '../app/stato';
import { haPagina, PERCORSI } from '../contenuti/contenuti';
import { IconaAvanti } from '../pannello/icone';
import { scenaApi, vistaIniziale } from '../scena/api';
import { tourGiaVisto } from '../tour/Tour';

/** Rotazione lenta del corpo dietro la soglia, in radianti al secondo. */
const ROTAZIONE = 0.12;

/**
 * Soglia d'ingresso (D26, A1): sopra l'atlante, mentre il modello si carica dietro.
 * Si entra esplorando liberamente, con il tour alla prima visita, o seguendo un percorso.
 */
export function Soglia({ pronta }: { pronta: boolean }) {
  const { invia } = useAtlante();
  const ridotto = useMovimentoRidotto();
  const percorso = PERCORSI[0];

  // Il corpo gira piano dietro il testo; con il movimento ridotto resta fermo.
  useEffect(() => {
    if (!pronta || ridotto) return;
    let id = 0;
    let prima = performance.now();
    const gira = (ora: number) => {
      scenaApi.controlli?.rotate((ROTAZIONE * (ora - prima)) / 1000, 0, false);
      prima = ora;
      id = requestAnimationFrame(gira);
    };
    id = requestAnimationFrame(gira);
    return () => cancelAnimationFrame(id);
  }, [pronta, ridotto]);

  const esplora = () => {
    if (!pronta) return;
    vistaIniziale(!ridotto);
    invia({ tipo: 'soglia', aperta: false });
    if (!tourGiaVisto()) invia({ tipo: 'tour', passo: 0 });
  };

  return (
    <main className="soglia" aria-labelledby="soglia-titolo">
      <div className="soglia-colonna">
        <p className="soglia-marchio">Atlante del corpo umano</p>
        <h1 id="soglia-titolo">Il corpo umano, strato per strato.</h1>
        <p className="soglia-introduzione">
          Un modello 3D da ruotare e ingrandire. Scegli un organo, un osso o un muscolo per leggere dove si trova e cosa
          fa: ogni frase rimanda alla sua fonte.
        </p>

        <div className="soglia-azioni">
          <button
            type="button"
            className="azione soglia-esplora"
            aria-disabled={!pronta}
            aria-describedby={pronta ? undefined : 'soglia-attesa'}
            onClick={esplora}
          >
            Esplora il corpo <IconaAvanti />
          </button>
          {percorso && (
            <button
              type="button"
              className="soglia-percorso"
              onClick={() => invia({ tipo: 'percorso', percorso: { id: percorso.id, passo: 0 } })}
            >
              <span className="soglia-percorso-nome">Segui un percorso</span>
              <span className="soglia-percorso-dettaglio">
                “{percorso.titolo}”, {percorso.passi} passi
              </span>
            </button>
          )}
        </div>
        <p id="soglia-attesa" className="soglia-attesa" aria-live="polite">
          {pronta ? (
            'Modello 3D pronto.'
          ) : (
            <>
              <span className="caricamento-linea" aria-hidden="true" />
              Caricamento del modello 3D…
            </>
          )}
        </p>

        <nav className="soglia-altro" aria-label="Altre sezioni">
          <button type="button" className="voce" onClick={() => invia({ tipo: 'pagina', pagina: 'indice' })}>
            Indice dei contenuti
          </button>
          {haPagina('informazioni') && (
            <button type="button" className="voce" onClick={() => invia({ tipo: 'pagina', pagina: 'informazioni' })}>
              Informazioni e avvertenze
            </button>
          )}
        </nav>
      </div>

      <footer className="soglia-piede">
        <p className="soglia-nota">
          L'atlante ha solo scopo educativo. Non è uno strumento diagnostico e non sostituisce il parere di un medico.
        </p>
        <p className="soglia-nota">
          Modello 3D: BodyParts3D © The Database Center for Life Science, CC BY 4.0; polmoni: Z-Anatomy, CC BY-SA 4.0.
          Modelli derivati CC BY-SA 4.0.
        </p>
      </footer>
    </main>
  );
}
