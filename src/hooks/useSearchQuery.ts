import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Testo cercato in una pagina di lettura, tenuto nell'indirizzo (`?q=`) senza nuove voci di
 * cronologia: tornando indietro da una struttura si ritrovano i risultati. `requested` è una
 * ricerca arrivata da un'altra pagina, che vince su quella dell'indirizzo.
 */
export function useSearchQuery(requested?: () => string | null) {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(() => requested?.() ?? params.get('q') ?? '');

  const fromUrl = params.get('q') ?? '';
  const wanted = query.trim();
  useEffect(() => {
    if (wanted === fromUrl.trim()) return;
    setParams(wanted ? { q: wanted } : {}, { replace: true, preventScrollReset: true });
  }, [wanted, fromUrl, setParams]);

  return [query, setQuery] as const;
}
