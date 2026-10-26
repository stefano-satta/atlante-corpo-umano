import { useEffect } from 'react';
import { ForwardIcon } from '@/components/common/Icons';
import { LoadingBar } from '@/components/common/LoadingBar';
import { useAtlas } from '@/hooks/useAtlas';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { GUIDED_PATHS, hasPage } from '@/utils/content';
import { resetView, sceneApi } from '@/utils/sceneApi';
import { hasSeenTour } from '@/utils/tour';

/** Rotazione lenta del corpo dietro la soglia, in radianti al secondo. */
const ROTATION_SPEED = 0.12;

/**
 * Soglia d'ingresso (D26, A1): sopra l'atlante, mentre il modello si carica dietro.
 * Si entra esplorando liberamente, con il tour alla prima visita, o seguendo un percorso.
 */
export function HomePage({ ready }: { ready: boolean }) {
  const { dispatch } = useAtlas();
  const reducedMotion = useReducedMotion();
  const path = GUIDED_PATHS[0];

  // Il corpo gira piano dietro il testo; con il movimento ridotto resta fermo.
  useEffect(() => {
    if (!ready || reducedMotion) return;
    let id = 0;
    let previous = performance.now();
    const spin = (now: number) => {
      sceneApi.controls?.rotate((ROTATION_SPEED * (now - previous)) / 1000, 0, false);
      previous = now;
      id = requestAnimationFrame(spin);
    };
    id = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(id);
  }, [ready, reducedMotion]);

  const explore = () => {
    if (!ready) return;
    resetView(!reducedMotion);
    dispatch({ type: 'setHome', open: false });
    if (!hasSeenTour()) dispatch({ type: 'setTour', step: 0 });
  };

  return (
    <main className="home" aria-labelledby="home-title">
      <div className="home-column">
        <p className="home-brand">Atlante del corpo umano</p>
        <h1 id="home-title">Il corpo umano, strato per strato.</h1>
        <p className="home-intro">
          Un modello 3D da ruotare e ingrandire. Scegli un organo, un osso o un muscolo per leggere dove si trova e cosa
          fa: ogni frase rimanda alla sua fonte.
        </p>

        <div className="home-actions">
          <button
            type="button"
            className="action home-explore"
            aria-disabled={!ready}
            aria-describedby={ready ? undefined : 'home-status'}
            onClick={explore}
          >
            Esplora il corpo <ForwardIcon />
          </button>
          {path && (
            <button
              type="button"
              className="home-path"
              onClick={() => dispatch({ type: 'setGuidedPath', guidedPath: { id: path.id, step: 0 } })}
            >
              <span className="home-path-name">Segui un percorso</span>
              <span className="home-path-detail">
                “{path.titolo}”, {path.passi} passi
              </span>
            </button>
          )}
        </div>
        <p id="home-status" className="home-status" aria-live="polite">
          {ready ? (
            'Modello 3D pronto.'
          ) : (
            <>
              <LoadingBar />
              Caricamento del modello 3D…
            </>
          )}
        </p>

        <nav className="home-links" aria-label="Altre sezioni">
          <button type="button" className="nav-item" onClick={() => dispatch({ type: 'setPage', page: 'indice' })}>
            Indice dei contenuti
          </button>
          {hasPage('informazioni') && (
            <button
              type="button"
              className="nav-item"
              onClick={() => dispatch({ type: 'setPage', page: 'informazioni' })}
            >
              Informazioni e avvertenze
            </button>
          )}
        </nav>
      </div>

      <footer className="home-footer">
        <p className="home-note">
          L'atlante ha solo scopo educativo. Non è uno strumento diagnostico e non sostituisce il parere di un medico.
        </p>
        <p className="home-note">
          Modello 3D: BodyParts3D © The Database Center for Life Science, CC BY 4.0; polmoni, tiroide e paratiroidi:
          Z-Anatomy, CC BY-SA 4.0; organi femminili: Human Reference Atlas, CC BY 4.0. Modelli derivati CC BY-SA 4.0.
        </p>
      </footer>
    </main>
  );
}
