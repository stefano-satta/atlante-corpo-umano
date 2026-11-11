import { useEffect, useRef } from 'react';
import type { NumberedSource } from '@/models/content';
import { SourceList } from './SourceList';

/**
 * Elenco delle fonti chiuso in un riquadro a scomparsa, con lo stesso aspetto di "Note sulle fonti".
 * Un rimando numerato del testo (`#fonte-n`) apre il riquadro prima che il browser vi scorra.
 */
export function SourceDisclosure({ title, sources }: { title: string; sources: NumberedSource[] }) {
  const details = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const open = (e: MouseEvent) => {
      const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href^="#fonte-"]') : null;
      const el = details.current;
      if (!a || !el) return;
      const target = el.querySelector(`[id="${a.getAttribute('href')?.slice(1)}"]`);
      if (target) el.open = true;
    };
    document.addEventListener('click', open, true);
    return () => document.removeEventListener('click', open, true);
  }, []);

  return (
    <details className="source-notes source-disclosure" ref={details}>
      <summary>{title}</summary>
      <SourceList sources={sources} />
    </details>
  );
}
