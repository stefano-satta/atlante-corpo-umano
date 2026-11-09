import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router';
import { Footer } from '@/components/common/Footer';
import { LoadingBar } from '@/components/common/LoadingBar';
import { Navbar } from '@/components/common/Navbar';
import { Callout } from '@/components/features/panel/Callout';
import { Panel } from '@/components/features/panel/Panel';
import { ViewControls } from '@/components/features/toolbar/ViewControls';
import { Tour } from '@/components/features/tour/Tour';
import { useAtlas } from '@/hooks/useAtlas';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useOpenGuidedPath, useSelectedStructure } from '@/hooks/useSelectedStructure';
import type { LazyModelLayer } from '@/models/scene';
import { LAZY_MODEL_LAYERS, needsModelLayer } from '@/utils/atlasReducer';
import { ORGANS_BY_ID } from '@/utils/organs';
import { HomePage } from './HomePage';

// Il motore 3D (three.js e React Three Fiber) sta in un pacchetto separato: l'interfaccia
// compare subito e il modello si carica in parallelo (D14).
const Scene = lazy(() => import('@/components/features/scene/Scene'));

const LOADING_TEXT: Record<LazyModelLayer, string> = {
  vasi: 'Caricamento dei vasi sanguigni',
  nervi: 'Caricamento dei nervi',
};

/** L'atlante con il corpo 3D: scena, barre, pannello, e sopra soglia, guida e pagine di lettura. */
export function AtlasPage() {
  const { state } = useAtlas();
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const [lazyLoaded, setLazyLoaded] = useState<ReadonlySet<LazyModelLayer>>(new Set());
  const onLazyLayerLoaded = useCallback(
    (layer: LazyModelLayer) => setLazyLoaded((s) => (s.has(layer) ? s : new Set([...s, layer]))),
    [],
  );
  const loading = LAZY_MODEL_LAYERS.find((l) => !lazyLoaded.has(l) && needsModelLayer(l, state.layer, state.selection));
  useKeyboardShortcuts();

  // La scena si monta la prima volta che l'atlante si vede (o la soglia, dove il corpo gira dietro il
  // testo): chi apre direttamente una pagina di lettura non scarica three.js né i modelli. Poi resta montata.
  const [sceneWanted, setSceneWanted] = useState(!state.page);
  if (!state.page && !sceneWanted) setSceneWanted(true);

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
  const title = useDocumentTitle(name);

  return (
    <div
      className="atlas"
      data-panel={unit ? (sheet ? 'sheet' : 'card') : pathOpen ? 'path' : 'none'}
      data-home={state.home ? 'yes' : undefined}
    >
      {/* Con una pagina di lettura aperta la vista resta montata ma inerte, e la scena smette di disegnare.
          Sotto la soglia la scena continua a disegnare: il corpo si carica e gira dietro il testo. */}
      <title>{title}</title>
      <div className="view" inert={!!state.page || state.home}>
        {sceneWanted && (
          <Suspense fallback={null}>
            <Scene
              ready={ready}
              onReady={onReady}
              active={!state.page}
              lazyLoaded={lazyLoaded}
              onLazyLayerLoaded={onLazyLayerLoaded}
            />
          </Suspense>
        )}
        <Navbar />
        {sceneWanted && !ready && !state.home && (
          <div className="loading" role="status">
            <span>Caricamento del modello 3D</span>
            <LoadingBar />
          </div>
        )}
        {ready && loading && (
          <div className="loading" role="status">
            <span>{LOADING_TEXT[loading]}</span>
            <LoadingBar />
          </div>
        )}
        <Callout />
        <Panel />
        {!sheet && <ViewControls />}
        <Footer />
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
