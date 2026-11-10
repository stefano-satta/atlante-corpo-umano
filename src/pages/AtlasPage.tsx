import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
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
import { canonicalFor } from '@/utils/pages';
import { readUrl } from '@/utils/url';
import { HomePage } from './HomePage';

// Il motore 3D (three.js e React Three Fiber) sta in un pacchetto separato: l'interfaccia
// compare subito e il modello si carica in parallelo (D14).
const Scene = lazy(() => import('@/components/features/scene/Scene'));

const LOADING_TEXT: Record<LazyModelLayer, string> = {
  muscoli: 'Caricamento dei muscoli',
  vasi: 'Caricamento dei vasi sanguigni',
  nervi: 'Caricamento dei nervi',
};

/**
 * Guscio della versione 3D. Le rotte con il corpo (soglia, esplorazione, percorsi a passi, quiz) mostrano
 * l'atlante; le pagine di lettura sono pagine a sé (`ReadingShell`, nell'`Outlet`), senza l'atlante sotto.
 * L'atlante si monta la prima volta che si vede: chi apre direttamente una pagina di lettura non scarica
 * three.js né i modelli. Poi resta montato, nascosto e fermo sotto le pagine, così tornandoci la scena
 * non si ricarica e la telecamera è dov'era.
 */
export function AtlasPage() {
  const { state } = useAtlas();
  useKeyboardShortcuts();
  // Atlante e pagina di lettura seguono la stessa rotta dell'`Outlet` (il router la aggiorna in una
  // transizione): non si vedono mai insieme, né nessuno dei due.
  const { pathname } = useLocation();
  const onAtlas = !readUrl(pathname).page;
  const [visited, setVisited] = useState(onAtlas);
  if (onAtlas && !visited) setVisited(true);

  const { unit, entry } = useSelectedStructure();
  const name = entry?.nome ?? (unit && (ORGANS_BY_ID.get(unit.id)?.name ?? unit.fmaName));
  const title = useDocumentTitle(name);

  return (
    <>
      <title>{title}</title>
      <link rel="canonical" href={canonicalFor(pathname)} />
      {visited && <AtlasView hidden={!onAtlas} name={name} />}
      <Outlet />
    </>
  );
}

/** L'atlante con il corpo 3D: scena, barre, pannello, e sopra soglia e guida. */
function AtlasView({ hidden, name }: { hidden: boolean; name: string | null | undefined }) {
  const { state } = useAtlas();
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const [lazyLoaded, setLazyLoaded] = useState<ReadonlySet<LazyModelLayer>>(new Set());
  const onLazyLayerLoaded = useCallback(
    (layer: LazyModelLayer) => setLazyLoaded((s) => (s.has(layer) ? s : new Set([...s, layer]))),
    [],
  );
  const loading = LAZY_MODEL_LAYERS.find((l) => !lazyLoaded.has(l) && needsModelLayer(l, state.layer, state.selection));

  // Chiudendo una pagina il fuoco torna alla voce del menu che l'aveva aperta, quando l'atlante si rivede:
  // per Fonti, Informazioni e Credits è il pulsante del menu secondario (`data-pages`), che a quel punto è chiuso.
  const lastPage = useRef(state.page);
  if (state.page) lastPage.current = state.page;
  const wasHidden = useRef(hidden);
  useEffect(() => {
    if (wasHidden.current && !hidden && lastPage.current)
      document
        .querySelector<HTMLElement>(
          `.atlas :is([data-page="${lastPage.current}"], [data-pages~="${lastPage.current}"])`,
        )
        ?.focus();
    wasHidden.current = hidden;
  }, [hidden]);

  const { unit, sheet } = useSelectedStructure();
  const pathOpen = useOpenGuidedPath();

  return (
    <div
      className="atlas"
      hidden={hidden}
      inert={hidden}
      data-panel={unit ? (sheet ? 'sheet' : 'card') : pathOpen ? 'path' : 'none'}
      data-home={state.home ? 'yes' : undefined}
    >
      {/* Sotto una pagina di lettura l'atlante resta montato ma nascosto, e la scena smette di disegnare.
          Sotto la soglia la scena continua a disegnare: il corpo si carica e gira dietro il testo. */}
      <div className="view" inert={state.home}>
        <Suspense fallback={null}>
          <Scene
            ready={ready}
            onReady={onReady}
            active={!hidden}
            lazyLoaded={lazyLoaded}
            onLazyLayerLoaded={onLazyLayerLoaded}
          />
        </Suspense>
        <Navbar />
        {!ready && !state.home && (
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
      {state.tour !== null && !state.home && !hidden && <Tour />}
      {state.home && <HomePage ready={ready} />}
    </div>
  );
}
