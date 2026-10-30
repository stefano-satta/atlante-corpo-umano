// Voce o ricerca da mostrare quando il Glossario si apre da un'altra parte dell'atlante.
let requested: { entry?: string; query?: string } | null = null;

/** Evento con cui il Glossario già aperto sa che c'è una nuova richiesta. */
export const GLOSSARY_REQUEST_EVENT = 'atlante:glossario';

export function requestGlossaryEntry(id: string) {
  requested = { entry: id };
  dispatchEvent(new Event(GLOSSARY_REQUEST_EVENT));
}

export function requestGlossarySearch(query: string) {
  requested = { query };
  dispatchEvent(new Event(GLOSSARY_REQUEST_EVENT));
}

/** Restituisce la voce richiesta, oppure quella nell'indirizzo (#glossario-<id>), e la consuma. */
export function takeRequestedGlossaryEntry() {
  const fromUrl = /^#glossario-([a-z0-9-]+)$/.exec(location.hash)?.[1] ?? null;
  const entry = requested?.entry ?? fromUrl;
  if (requested?.entry) requested = null;
  return entry;
}

/** Restituisce la ricerca richiesta dall'Indice e la consuma. */
export function takeRequestedGlossarySearch() {
  const query = requested?.query ?? null;
  if (query !== null) requested = null;
  return query;
}
