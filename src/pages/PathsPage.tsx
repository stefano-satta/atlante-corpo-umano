import { ForwardIcon } from '@/components/common/Icons';
import { PATH_ART } from '@/components/features/guided-path/PathArt';
import { ReadingLayout } from '@/components/features/layout/ReadingLayout';
import { useAtlas } from '@/hooks/useAtlas';
import { GUIDED_PATHS } from '@/utils/content';

const STATUS_LABELS = { bozza: 'Bozza', verificato: 'Verificato', approvato: null } as const;

/**
 * Pagina Percorsi: una card per ogni percorso guidato, con illustrazione, titolo e presentazione.
 * La card apre il primo passo del percorso, come prima faceva la voce Percorsi del menu (D24).
 */
export function PathsPage() {
  const { dispatch } = useAtlas();
  const start = (id: string) => {
    dispatch({ type: 'setGuidedPath', guidedPath: { id, step: 0 } });
    dispatch({ type: 'setPage', page: null });
  };

  return (
    <ReadingLayout title="Percorsi" wide>
      <p className="intro paths-intro">
        Visite guidate dentro il corpo, un passo alla volta. La telecamera inquadra gli organi, gli schemi animati
        mostrano come lavorano e ogni frase rimanda alla sua fonte. In ogni momento puoi fermarti a esplorare e poi
        riprendere il percorso.
      </p>
      <ul className="path-cards">
        {GUIDED_PATHS.map((p) => {
          const art = PATH_ART[p.id] ?? PATH_ART['viaggio-del-cibo'];
          const status = STATUS_LABELS[p.stato];
          return (
            <li key={p.id}>
              <article className="path-card">
                <div className="path-art">{art.art()}</div>
                <div className="path-card-body">
                  <p className="path-card-system">{art.system}</p>
                  <h2>
                    <button
                      type="button"
                      className="path-card-link"
                      aria-describedby={`path-card-${p.id}`}
                      onClick={() => start(p.id)}
                    >
                      {p.titolo}
                    </button>
                  </h2>
                  <p className="path-card-description" id={`path-card-${p.id}`}>
                    {p.descrizione}
                  </p>
                  <p className="path-card-footer">
                    <span className="path-card-meta">
                      {p.passi} passi
                      {status && <span className="path-card-status">{status}</span>}
                    </span>
                    <span className="path-card-cta" aria-hidden="true">
                      Inizia <ForwardIcon />
                    </span>
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </ReadingLayout>
  );
}
