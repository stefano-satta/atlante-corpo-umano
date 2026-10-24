// Voce del glossario da mostrare quando l'Indice si apre dalla definizione sul posto.
let requested: string | null = null;

export function requestGlossaryEntry(id: string) {
  requested = id;
}

/** Restituisce la voce richiesta, oppure quella nell'indirizzo (#glossario-<id>), e la consuma. */
export function takeRequestedGlossaryEntry() {
  const fromUrl = /^#glossario-([a-z0-9-]+)$/.exec(location.hash)?.[1] ?? null;
  const entry = requested ?? fromUrl;
  requested = null;
  return entry;
}
