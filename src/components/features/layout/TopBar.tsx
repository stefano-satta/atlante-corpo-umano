import { useAtlas } from '@/hooks/useAtlas';
import { useOpenGuidedPath } from '@/hooks/useSelectedStructure';
import { GUIDED_PATHS, hasPage } from '@/utils/content';
import { PAGE_IDS, PAGE_TITLES } from '@/utils/pages';

/** Barra in alto della vista 3D (D11): marchio, percorsi e pagine di lettura. */
export function TopBar() {
  const { dispatch } = useAtlas();
  const pathOpen = useOpenGuidedPath();
  // Finché c'è un solo percorso, la voce Percorsi apre direttamente il suo primo passo (D24).
  const firstPath = GUIDED_PATHS[0];

  return (
    <header className="top-bar">
      <span className="brand">Atlante del corpo umano</span>
      <nav aria-label="Sezioni">
        {firstPath ? (
          <button
            type="button"
            className="nav-item"
            aria-current={pathOpen ? 'true' : undefined}
            onClick={() => dispatch({ type: 'setGuidedPath', guidedPath: { id: firstPath.id, step: 0 } })}
          >
            Percorsi
          </button>
        ) : (
          <button type="button" className="nav-item" aria-disabled="true" title="In preparazione">
            Percorsi
          </button>
        )}
        {PAGE_IDS.map((p) =>
          p !== 'informazioni' || hasPage(p) ? (
            <button
              type="button"
              key={p}
              className="nav-item"
              data-page={p}
              onClick={() => dispatch({ type: 'setPage', page: p })}
            >
              {PAGE_TITLES[p]}
            </button>
          ) : (
            <button type="button" key={p} className="nav-item" aria-disabled="true" title="In preparazione">
              {PAGE_TITLES[p]}
            </button>
          ),
        )}
      </nav>
    </header>
  );
}
