// Ricerca dell'Indice (D26): senza librerie, sui nomi italiani, sui termini latini e sugli apparati.

/** Testo confrontabile: minuscolo, senza accenti, apostrofi e spazi multipli. */
export function normalize(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Una voce corrisponde se ogni parola cercata è l'inizio di una parola dei suoi testi:
 * "card" trova "Apparato cardiovascolare", "ossa polm" non trova nulla.
 */
export function matches(query: string, texts: string[]) {
  const words = normalize(query).split(' ').filter(Boolean);
  if (!words.length) return true;
  const available = texts.flatMap((t) => normalize(t).split(/[\s-]+/));
  return words.every((w) => available.some((a) => a.startsWith(w)));
}
