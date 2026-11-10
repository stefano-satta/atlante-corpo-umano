import { useEffect, useId, useRef, useState } from 'react';
import { useAtlas } from '@/hooks/useAtlas';
import type { PageId } from '@/models/atlas';
import { pageAvailable } from '@/utils/content';
import { MENU_PAGE_IDS, PAGE_TITLES } from '@/utils/pages';
import { Button } from './Button';
import { MenuIcon } from './Icons';

/** Riga sotto il titolo di ogni voce del menu secondario. */
const DESCRIPTIONS: Partial<Record<PageId, string>> = {
  fonti: 'Le opere da cui vengono i testi',
  informazioni: 'Avvertenze, metodo, crediti e licenze',
  credits: "Chi fa l'atlante e come scrivergli",
};

/**
 * Pulsante del menu secondario della barra in alto, dopo Glossario: apre un riquadro come il cartellino con
 * le voci meno usate (Fonti, Informazioni, Credits). È un pulsante che mostra e nasconde (`aria-expanded`), non un
 * menu ARIA: dentro ci sono pulsanti comuni, raggiungibili con Tab. Si chiude scegliendo una voce, con Esc
 * (il fuoco torna al pulsante), toccando fuori o portando il fuoco altrove.
 */
export function SecondaryMenuButton() {
  const { state, dispatch } = useAtlas();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  // Il pulsante resta segnato mentre è aperta una delle sue pagine, come le voci della barra.
  const current = !!state.page && MENU_PAGE_IDS.includes(state.page);

  useEffect(() => {
    if (!open) return;
    // Toccare fuori, o portarvi il fuoco con Tab, chiude il menu.
    const onOutside = (e: Event) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    // In cattura e fermato: Esc chiude solo il menu, non anche il cartellino o la pagina sotto.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener('pointerdown', onOutside, true);
    document.addEventListener('focusin', onOutside);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', onOutside, true);
      document.removeEventListener('focusin', onOutside);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open]);

  return (
    <div className="secondary-menu" ref={root}>
      <Button
        ref={button}
        className="secondary-menu-button"
        aria-label="Altre sezioni"
        aria-expanded={open}
        aria-controls={panelId}
        aria-current={current ? 'true' : undefined}
        data-pages={MENU_PAGE_IDS.join(' ')}
        onClick={() => setOpen((o) => !o)}
      >
        <MenuIcon />
      </Button>
      <div className="secondary-menu-card" id={panelId} hidden={!open}>
        <p className="label">Altre sezioni</p>
        <ul>
          {MENU_PAGE_IDS.map((p) => (
            <li key={p}>
              {pageAvailable(p) ? (
                <Button
                  aria-current={state.page === p ? 'true' : undefined}
                  onClick={() => {
                    setOpen(false);
                    dispatch({ type: 'setPage', page: p });
                  }}
                >
                  <span className="title">{PAGE_TITLES[p]}</span>
                  <span className="description">{DESCRIPTIONS[p]}</span>
                </Button>
              ) : (
                <Button aria-disabled="true" title="In preparazione">
                  <span className="title">{PAGE_TITLES[p]}</span>
                  <span className="description">In preparazione</span>
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
