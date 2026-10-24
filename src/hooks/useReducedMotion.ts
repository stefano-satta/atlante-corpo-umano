import { useEffect, useMemo, useReducer } from 'react';

/** Preferenza del sistema per il movimento ridotto, aggiornata se cambia. */
export function useReducedMotion() {
  const query = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)'), []);
  const [reduced, update] = useReducer(() => query.matches, query.matches);
  useEffect(() => {
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [query]);
  return reduced;
}
