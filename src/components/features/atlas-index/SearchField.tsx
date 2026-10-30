import { type ReactNode, useEffect, useId, useRef } from 'react';

/**
 * Campo di ricerca delle pagine di lettura, fermo in alto mentre si scorre. Il tasto / lo
 * raggiunge da tutta la pagina (useKeyboardShortcuts); `children` resta nella stessa fascia.
 * La sua altezza va nella variabile --search-height della pagina: le intestazioni degli
 * apparati aperti si fermano subito sotto.
 */
export function SearchField({
  label,
  placeholder,
  query,
  onChange,
  status,
  children,
}: {
  label: string;
  placeholder: string;
  query: string;
  onChange: (query: string) => void;
  status: string;
  children?: ReactNode;
}) {
  const fieldId = useId();
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = bar.current;
    const page = element?.closest<HTMLElement>('.reading-page');
    if (!element || !page) return;
    const observer = new ResizeObserver(() => page.style.setProperty('--search-height', `${element.offsetHeight}px`));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <search className="search" ref={bar}>
      <label htmlFor={fieldId} className="label">
        {label}
      </label>
      <div className="search-box">
        <input
          id={fieldId}
          type="search"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          aria-keyshortcuts="/"
        />
        {!query && (
          <span className="search-key" aria-hidden="true">
            /
          </span>
        )}
      </div>
      <p className="search-result" role="status">
        {status}
      </p>
      {children}
    </search>
  );
}
