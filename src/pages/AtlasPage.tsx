import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router';
import { LoadingBar } from '@/components/common/LoadingBar';
import { TopBar } from '@/components/features/layout/TopBar';
import { Callout } from '@/components/features/panel/Callout';
import { Panel } from '@/components/features/panel/Panel';
import { BodySwitch } from '@/components/features/toolbar/BodySwitch';
import { LayerSwitch } from '@/components/features/toolbar/LayerSwitch';
import { Toolbar } from '@/components/features/toolbar/Toolbar';
import { Tour } from '@/components/features/tour/Tour';
import { useAtlas } from '@/hooks/useAtlas';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useOpenGuidedPath, useSelectedStructure } from '@/hooks/useSelectedStructure';
import { ORGANS_BY_ID } from '@/utils/organs';
import { HomePage } from './HomePage';

// Il motore 3D (three.js e React Three Fiber) sta in un pacchetto separato: l'interfaccia
// compare subito e il modello si carica in parallelo (D14).
const Scene = lazy(() => import('@/components/features/scene/Scene'));

/** L'atlante con il corpo 3D: scena, barre, pannello, e sopra soglia, guida e pagine di lettura. */
export function AtlasPage() {
  const { state } = useAtlas();
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  useKeyboardShortcuts();

  // Chiudendo una pagina il fuoco torna alla voce del menu che l'aveva aperta.
  const previousPage = useRef(state.page);
  useEffect(() => {
    const previous = previousPage.current;
    previousPage.current = state.page;
    if (previous && !state.page) document.querySelector<HTMLElement>(`[data-page="${previous}"]`)?.focus();
  }, [state.page]);

  const { unit, entry, sheet } = useSelectedStructure();
  const pathOpen = useOpenGuidedPath();
  const name = entry?.nome ?? (unit && (ORGANS_BY_ID.get(unit.id)?.name ?? unit.fmaName));

  return (
    <div
      className="atlas"
      data-panel={unit ? (sheet ? 'sheet' : 'card') : pathOpen ? 'path' : 'none'}
      data-home={state.home ? 'yes' : undefined}
    >
      {/* Con una pagina di lettura aperta la vista resta montata ma inerte, e la scena smette di disegnare.
          Sotto la soglia la scena continua a disegnare: il corpo si carica e gira dietro il testo. */}
      <div className="view" inert={!!state.page || state.home}>
        <Suspense fallback={null}>
          <Scene ready={ready} onReady={onReady} active={!state.page} />
        </Suspense>
        <TopBar />
        {!ready && !state.home && (
          <div className="loading" role="status">
            <span>Caricamento del modello 3D</span>
            <LoadingBar />
          </div>
        )}
        <Callout />
        <Panel />
        {!sheet && (
          <div className="view-controls">
            <BodySwitch />
            <LayerSwitch />
            <Toolbar />
          </div>
        )}
        <footer className="footer">
          <p>Versione in sviluppo: alcuni nomi e testi sono in preparazione.</p>
          <p>
            Modello 3D: BodyParts3D © The Database Center for Life Science, CC BY 4.0; polmoni, tiroide, paratiroidi,
            parotidi e 37 muscoli: Z-Anatomy, CC BY-SA 4.0; organi femminili: Human Reference Atlas, CC BY 4.0. Modelli
            derivati CC BY-SA 4.0.
          </p>
        </footer>
        <p className="visually-hidden" aria-live="polite">
          {name ? `Selezionato: ${name}` : ''}
        </p>
      </div>
      {state.tour !== null && !state.home && !state.page && <Tour />}
      {state.home && <HomePage ready={ready} />}
      {/* Pagina di lettura della rotta (/indice, /glossario, /fonti, /informazioni). */}
      <Outlet />
    </div>
  );
}
