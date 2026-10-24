// Voce del glossario da mostrare quando l'Indice si apre dalla definizione sul posto.
let richiesta: string | null = null;

export function richiediVoce(id: string) {
  richiesta = id;
}

/** Restituisce la voce richiesta, oppure quella nell'indirizzo (#glossario-<id>), e la consuma. */
export function voceRichiesta() {
  const dallIndirizzo = /^#glossario-([a-z0-9-]+)$/.exec(location.hash)?.[1] ?? null;
  const voce = richiesta ?? dallIndirizzo;
  richiesta = null;
  return voce;
}
