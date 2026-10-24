import { useCallback, useState } from 'react';
import { GlossaryDefinition } from './GlossaryDefinition';

/**
 * HTML compilato in build dai contenuti (pipeline/contenuti.mjs), con i rimandi alle fonti.
 * I termini del glossario sono collegamenti all'Indice: un clic apre la definizione sul posto,
 * mentre Ctrl, Cmd o Maiuscolo lasciano al browser l'apertura in un'altra scheda.
 */
export function RichText({ html, className }: { html: string; className?: string }) {
  const [term, setTerm] = useState<HTMLAnchorElement | null>(null);
  const close = useCallback(() => setTerm(null), []);
  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: il clic arriva dai collegamenti del testo, che restano attivabili da tastiera */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Invio su un collegamento produce già un clic */}
      <div
        className={className}
        onClick={(e) => {
          const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a.glossary-term') : null;
          if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          setTerm((current) => (current === a ? null : a));
        }}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML generato in build dai file di contenuti, senza HTML grezzo (il controllo lo vieta)
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {term && <GlossaryDefinition anchor={term} onClose={close} />}
    </>
  );
}
