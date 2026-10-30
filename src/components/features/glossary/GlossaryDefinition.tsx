import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '@/components/common/Icons';
import { ShortSourceList } from '@/components/common/ShortSourceList';
import { useAtlas } from '@/hooks/useAtlas';
import { useGlossary } from '@/hooks/useContent';
import { requestGlossaryEntry } from '@/utils/glossaryRequest';
import { PartOfLink } from './PartOfLink';
import { RichText } from './RichText';

/** Larghezza massima del riquadro, in pixel: deve restare uguale a `.glossary-popover` in styles/glossary.css. */
const MAX_WIDTH = 340;

/**
 * Definizione sul posto di un termine del glossario (D26): un riquadro accanto al termine,
 * che si chiude con Esc, con un clic fuori o con il pulsante, e riporta il fuoco al termine.
 */
export function GlossaryDefinition({ anchor, onClose }: { anchor: HTMLAnchorElement; onClose: () => void }) {
  const { dispatch } = useAtlas();
  const { data: glossary, error } = useGlossary();
  const popover = useRef<HTMLElement>(null);
  const id = useId();
  const [position, setPosition] = useState<{ top?: number; bottom?: number; left: number }>({ left: 0 });
  const entry = glossary?.find((v) => v.id === anchor.dataset.term);

  // Sotto il termine, o sopra se sotto non c'è spazio; segue il termine quando il testo scorre.
  useLayoutEffect(() => {
    const update = () => {
      const r = anchor.getBoundingClientRect();
      const width = Math.min(MAX_WIDTH, innerWidth - 32);
      const left = Math.min(Math.max(r.left, 16), innerWidth - 16 - width);
      setPosition(
        r.bottom < innerHeight * 0.6 ? { top: r.bottom + 8, left } : { bottom: innerHeight - r.top + 8, left },
      );
    };
    update();
    addEventListener('scroll', update, true);
    addEventListener('resize', update);
    return () => {
      removeEventListener('scroll', update, true);
      removeEventListener('resize', update);
    };
  }, [anchor]);

  useEffect(() => {
    anchor.setAttribute('aria-expanded', 'true');
    popover.current?.focus({ preventScroll: true });
    const close = (returnFocus: boolean) => {
      onClose();
      if (returnFocus) anchor.focus({ preventScroll: true });
    };
    // Esc chiude solo la definizione, non anche il cartellino o la scheda sotto.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      close(true);
    };
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!popover.current?.contains(t) && !anchor.contains(t)) close(false);
    };
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      anchor.removeAttribute('aria-expanded');
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [anchor, onClose]);

  return createPortal(
    <section
      ref={popover}
      className="glossary-popover"
      style={position}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-term`}
      tabIndex={-1}
    >
      <div className="popover-header">
        <span className="label">Glossario</span>
        <button
          type="button"
          className="close"
          aria-label="Chiudi la definizione"
          onClick={() => {
            onClose();
            anchor.focus({ preventScroll: true });
          }}
        >
          <CloseIcon />
        </button>
      </div>
      <p className="popover-term" id={`${id}-term`}>
        {entry?.termine ?? anchor.textContent}
      </p>
      {error ? (
        <p>Non è stato possibile caricare la definizione.</p>
      ) : !entry ? (
        <p>Caricamento…</p>
      ) : (
        <>
          <RichText className="definition" html={entry.html} />
          <ShortSourceList sources={entry.fonti} />
          <PartOfLink partOf={entry.parteDi} onNavigate={onClose} />
          <a
            className="popover-all"
            href={`/glossario#glossario-${entry.id}`}
            onClick={(e) => {
              e.preventDefault();
              requestGlossaryEntry(entry.id);
              onClose();
              dispatch({ type: 'setPage', page: 'glossario' });
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
