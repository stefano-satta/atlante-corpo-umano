import { SITE_TITLE } from '@/utils/pages';
import { Logo } from './Logo';

/** Marchio dell'atlante (D56): logo e nome, senza link. Lo stesso nella barra in alto e nella soglia. */
export function Brand({ className }: { className?: string }) {
  return (
    <span className={className ? `brand ${className}` : 'brand'}>
      <Logo />
      {SITE_TITLE}
    </span>
  );
}
