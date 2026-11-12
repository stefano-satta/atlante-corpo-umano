import { Button } from '@/components/common/Button';
import { ForwardIcon } from '@/components/common/Icons';
import { useAtlas } from '@/hooks/useAtlas';
import { GUIDED_PATHS } from '@/utils/content';

/**
 * Invito a seguire un percorso dal fondo di una pagina di lettura: apre il primo passo nell'atlante.
 * Un percorso non ancora approvato manca dalla build di produzione, e allora l'invito non c'è.
 */
export function PathInvite({ id, children }: { id: string; children: string }) {
  const { dispatch } = useAtlas();
  const path = GUIDED_PATHS.find((p) => p.id === id);
  if (!path) return null;
  const start = () => {
    dispatch({ type: 'setGuidedPath', guidedPath: { id, step: 0 } });
    dispatch({ type: 'setPage', page: null });
  };
  return (
    <p className="path-invite">
      {children}{' '}
      <Button variant="text" onClick={start}>
        Segui il percorso “{path.titolo}” <ForwardIcon />
      </Button>
    </p>
  );
}
