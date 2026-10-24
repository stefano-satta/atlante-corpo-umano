import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAtlante } from '../app/stato';
import { useGlossario } from '../contenuti/contenuti';
import { autoreFonte, Testo } from '../pannello/Fonti';
import { IconaChiudi } from '../pannello/icone';
import { richiediVoce } from './richiesta';

/** Larghezza massima del riquadro, in pixel: deve restare uguale a `.definizione-glossario` in stile.css. */
const LARGHEZZA = 340;

/**
 * Definizione sul posto di un termine del glossario (D26): un riquadro accanto al termine,
 * che si chiude con Esc, con un clic fuori o con il pulsante, e riporta il fuoco al termine.
 */
export function Definizione({ ancora, onChiudi }: { ancora: HTMLAnchorElement; onChiudi: () => void }) {
  const { invia } = useAtlante();
  const { dato: glossario, errore } = useGlossario();
  const riquadro = useRef<HTMLElement>(null);
  const id = useId();
  const [posizione, setPosizione] = useState<{ top?: number; bottom?: number; left: number }>({ left: 0 });
  const voce = glossario?.find((v) => v.id === ancora.dataset.glossario);

  // Sotto il termine, o sopra se sotto non c'è spazio; segue il termine quando il testo scorre.
  useLayoutEffect(() => {
    const aggiorna = () => {
      const r = ancora.getBoundingClientRect();
      const larghezza = Math.min(LARGHEZZA, innerWidth - 32);
      const left = Math.min(Math.max(r.left, 16), innerWidth - 16 - larghezza);
      setPosizione(
        r.bottom < innerHeight * 0.6 ? { top: r.bottom + 8, left } : { bottom: innerHeight - r.top + 8, left },
      );
    };
    aggiorna();
    addEventListener('scroll', aggiorna, true);
    addEventListener('resize', aggiorna);
    return () => {
      removeEventListener('scroll', aggiorna, true);
      removeEventListener('resize', aggiorna);
    };
  }, [ancora]);

  useEffect(() => {
    ancora.setAttribute('aria-expanded', 'true');
    riquadro.current?.focus({ preventScroll: true });
    const chiudi = (fuoco: boolean) => {
      onChiudi();
      if (fuoco) ancora.focus({ preventScroll: true });
    };
    // Esc chiude solo la definizione, non anche il cartellino o la scheda sotto.
    const suTasto = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      chiudi(true);
    };
    const suPuntatore = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!riquadro.current?.contains(t) && !ancora.contains(t)) chiudi(false);
    };
    document.addEventListener('keydown', suTasto, true);
    document.addEventListener('pointerdown', suPuntatore, true);
    return () => {
      ancora.removeAttribute('aria-expanded');
      document.removeEventListener('keydown', suTasto, true);
      document.removeEventListener('pointerdown', suPuntatore, true);
    };
  }, [ancora, onChiudi]);

  return createPortal(
    <section
      ref={riquadro}
      className="definizione-glossario"
      style={posizione}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-termine`}
      tabIndex={-1}
    >
      <div className="definizione-testa">
        <span className="etichetta">Glossario</span>
        <button
          type="button"
          className="chiudi"
          aria-label="Chiudi la definizione"
          onClick={() => {
            onChiudi();
            ancora.focus({ preventScroll: true });
          }}
        >
          <IconaChiudi />
        </button>
      </div>
      <p className="definizione-termine" id={`${id}-termine`}>
        {voce?.termine ?? ancora.textContent}
      </p>
      {errore ? (
        <p>Non è stato possibile caricare la definizione.</p>
      ) : !voce ? (
        <p>Caricamento…</p>
      ) : (
        <>
          <Testo className="definizione" html={voce.html} />
          <p className="fonte-voce">
            {voce.fonti.length > 1 ? 'Fonti: ' : 'Fonte: '}
            {voce.fonti.map((f, i) => (
              <span key={f.id}>
                {i > 0 && '; '}
                <a href={f.url} target="_blank" rel="noopener noreferrer">
                  {f.titolo}
                </a>{' '}
                ({autoreFonte(f)})
              </span>
            ))}
            .
          </p>
          <a
            className="definizione-tutto"
            href={`/indice#glossario-${voce.id}`}
            onClick={(e) => {
              e.preventDefault();
              richiediVoce(voce.id);
              onChiudi();
              invia({ tipo: 'pagina', pagina: 'indice' });
            }}
          >
            Tutto il glossario
          </a>
        </>
      )}
    </section>,
    document.body,
  );
}
