import type { ComponentProps, ReactNode } from 'react';
import { Button } from '@/components/common/Button';
import { HelpIcon, ResetViewIcon, UserOutlineIcon } from '@/components/common/Icons';
import { useAtlas } from '@/hooks/useAtlas';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { resetView } from '@/utils/sceneApi';

interface CommandProps extends ComponentProps<'button'> {
  label: string;
  /** Testo del suggerimento, se diverso dall'etichetta. */
  tooltip?: string;
  icon: ReactNode;
}

/** Comando a icona: l'etichetta è il nome accessibile e compare come suggerimento al passaggio o al fuoco. */
export function Command({ label, tooltip = label, icon, className, ...props }: CommandProps) {
  return (
    <Button aria-label={label} className={`command ${className ?? ''}`.trim()} {...props}>
      {icon}
      <span className="command-tooltip" aria-hidden="true">
        {tooltip}
      </span>
    </Button>
  );
}

/** Barra dei comandi della vista; `leading` è il comando che apre il menu, dove la barra laterale non c'è. */
export function NavigationToolbar({ leading }: { leading?: ReactNode }) {
  const { state, dispatch } = useAtlas();
  const reducedMotion = useReducedMotion();
  // La pelle del modello è maschile (D29): nel corpo femminile la sagoma non c'è.
  const skinAvailable = state.body === 'uomo';
  const skinNote = 'La sagoma del modello è maschile: nel corpo femminile non è disponibile';
  return (
    <div className="toolbar" role="toolbar" aria-label="Comandi della vista">
      {leading}
      <Command
        label="Vista iniziale"
        icon={<ResetViewIcon />}
        onClick={() => {
          dispatch({ type: 'select', id: null });
          resetView(!reducedMotion);
        }}
      />
      <Command
        label="Sagoma"
        tooltip={skinAvailable ? 'Sagoma' : 'Sagoma: solo nel corpo maschile'}
        aria-description={skinAvailable ? undefined : skinNote}
        icon={<UserOutlineIcon />}
        aria-pressed={state.skin && skinAvailable}
        disabled={!skinAvailable}
        onClick={() => dispatch({ type: 'toggleSkin' })}
      />
      <Command
        label="Aiuto"
        icon={<HelpIcon />}
        className="command-help"
        aria-keyshortcuts="?"
        onClick={() => dispatch({ type: 'setTour', step: 0 })}
      />
    </div>
  );
}
