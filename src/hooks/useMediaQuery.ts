import { useEffect, useMemo, useReducer } from 'react';

/** Vero se la media query è soddisfatta, aggiornato se cambia (per esempio ruotando il tablet). */
export function useMediaQuery(media: string) {
  const query = useMemo(() => matchMedia(media), [media]);
  const [matches, update] = useReducer(() => query.matches, query.matches);
  useEffect(() => {
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [query]);
  return matches;
}
