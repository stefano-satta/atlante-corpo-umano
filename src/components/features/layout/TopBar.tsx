import { useAtlas } from '@/hooks/useAtlas';
import { useOpenGuidedPath } from '@/hooks/useSelectedStructure';
import type { PageId } from '@/models/atlas';
import { GUIDED_PATHS, pageAvailable } from '@/utils/content';
import { PAGE_IDS, PAGE_SHORT_TITLES, PAGE_TITLES } from '@/utils/pages';

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
          pageAvailable(p) ? (
            <button
              type="button"
              key={p}
              className="nav-item"
              data-page={p}
              onClick={() => dispatch({ type: 'setPage', page: p })}
            >
              <PageTitle page={p} />
            </button>
          ) : (
            <button type="button" key={p} className="nav-item" aria-disabled="true" title="In preparazione">
              <PageTitle page={p} />
            </button>
          ),
        )}
      </nav>
    </header>
  );
}

/**
 * Titolo della voce, con la forma breve che compare su schermo stretto (`.full`/`.short`). Il
 * nome accessibile è la forma visibile: quella nascosta con `display: none` non conta.
 */
function PageTitle({ page }: { page: PageId }) {
  const short = PAGE_SHORT_TITLES[page];
  if (!short) return <>{PAGE_TITLES[page]}</>;
  return (
    <>
      <span className="full">{PAGE_TITLES[page]}</span>
      <span className="short">{short}</span>
    </>
  );
}
