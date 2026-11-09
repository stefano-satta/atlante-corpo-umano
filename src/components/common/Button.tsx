import type { ComponentProps } from 'react';

/** Aspetti ricorrenti dei pulsanti: ciascuno corrisponde a una classe dei fogli di stile. */
const VARIANT_CLASS = {
  action: 'action',
  back: 'back',
  close: 'close',
  nav: 'nav-item',
  cycle: 'cycle-button',
  text: 'text-button',
} as const;

export type ButtonVariant = keyof typeof VARIANT_CLASS;

export interface ButtonProps extends ComponentProps<'button'> {
  /** Aspetto del pulsante; `className` aggiunge classi proprie. */
  variant?: ButtonVariant;
}

/**
 * Pulsante dell'atlante. È `type="button"` salvo indicazione contraria, così dentro un modulo
 * non lo invia per sbaglio; tutti gli altri attributi, gli eventi e `ref` passano al `<button>`.
 */
export function Button({ variant, className, type = 'button', ...props }: ButtonProps) {
  const classes = [variant && VARIANT_CLASS[variant], className].filter(Boolean).join(' ');
  return <button type={type} className={classes || undefined} {...props} />;
}
