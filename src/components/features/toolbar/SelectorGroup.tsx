import { type KeyboardEvent, useId } from 'react';

export interface SelectorOption<T extends string> {
  id: T;
  name: string;
}

interface SelectorGroupProps<T extends string> {
  title: string;
  /** Segmenti affiancati o elenco con un cerchio per ogni voce. */
  variant: 'segments' | 'list';
  options: Array<SelectorOption<T>>;
  value: T;
  onChange: (id: T) => void;
}

const ARROW_STEPS: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

/** Scelta esclusiva con titolo: Tab entra sulla voce attiva, le frecce cambiano voce e non ruotano il corpo. */
export function SelectorGroup<T extends string>({ title, variant, options, value, onChange }: SelectorGroupProps<T>) {
  const titleId = useId();

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = ARROW_STEPS[e.key];
    if (!step || e.shiftKey) return;
    e.preventDefault();
    e.stopPropagation();
    const current = options.findIndex((o) => o.id === value);
    const next = options[(current + step + options.length) % options.length];
    onChange(next.id);
    e.currentTarget.querySelector<HTMLElement>(`[data-option="${next.id}"]`)?.focus();
  };

  return (
    <div className="selector-group">
      <span className="label selector-title" id={titleId}>
        {title}
      </span>
      <div className={`selector-${variant}`} role="radiogroup" aria-labelledby={titleId} onKeyDown={onKeyDown}>
        {options.map((o) => (
          // biome-ignore lint/a11y/useSemanticElements: pulsanti con ruolo radio per lo stile; le frecce sono gestite dal gruppo
          <button
            type="button"
            key={o.id}
            role="radio"
            aria-checked={value === o.id}
            tabIndex={value === o.id ? 0 : -1}
            className="selector-option"
            data-option={o.id}
            onClick={() => onChange(o.id)}
          >
            {o.name}
          </button>
        ))}
      </div>
    </div>
  );
}
