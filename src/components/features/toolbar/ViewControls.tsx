import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Button } from '@/components/common/Button';
import { CloseIcon, SlidersIcon } from '@/components/common/Icons';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { SIDEBAR_WIDTH } from '@/utils/layout';
import { GenreSelector } from './GenreSelector';
import { LayerSwitch } from './LayerSwitch';
import { Command, NavigationToolbar } from './NavigationToolbar';

const SELECTORS_LABEL = 'Genere e apparati';

/**
 * Comandi dell'atlante: genere e apparati stanno in una barra laterale, o sotto i 1024 px in un menu
 * a comparsa aperto dal primo comando della barra.
 */
export function ViewControls() {
  const wide = useMediaQuery(`(min-width: ${SIDEBAR_WIDTH}px)`);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = drawer.current;
    if (!dialog || dialog.open === open) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: il menu si chiude se cambia l'indirizzo (Indietro) o la misura dello schermo
  useEffect(() => setOpen(false), [pathname, wide]);

  return (
    <>
      {wide ? (
        <section className="selector-panel" aria-label={SELECTORS_LABEL}>
          <GenreSelector />
          <LayerSwitch />
        </section>
      ) : (
        // biome-ignore lint/a11y/useKeyWithClickEvents: il clic sullo sfondo è una scorciatoia; con la tastiera si chiude con Esc o con la X
        <dialog
          ref={drawer}
          className="selector-drawer"
          aria-label={SELECTORS_LABEL}
          onClose={() => setOpen(false)}
          onClick={(e) => {
            if (e.target === drawer.current) setOpen(false);
          }}
        >
          <div className="selector-drawer-content">
            <Button
              variant="close"
              className="selector-close"
              aria-label={`Chiudi ${SELECTORS_LABEL.toLowerCase()}`}
              onClick={() => setOpen(false)}
            >
              <CloseIcon />
            </Button>
            <GenreSelector />
            <LayerSwitch />
          </div>
        </dialog>
      )}
      <div className="view-controls">
        <NavigationToolbar
          leading={
            !wide && (
              <Command
                label="Apparati"
                icon={<SlidersIcon />}
                className="selector-trigger"
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen(true)}
              />
            )
          }
        />
      </div>
    </>
  );
}
