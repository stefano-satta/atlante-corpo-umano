// Ricerca dell'Indice (D26): senza librerie, sui nomi italiani, sui termini latini e sugli apparati.

/** Testo confrontabile: minuscolo, senza accenti, apostrofi e spazi multipli. */
export function normalizza(testo: string) {
  return testo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Una voce corrisponde se ogni parola cercata è l'inizio di una parola dei suoi testi:
 * "card" trova "Apparato cardiovascolare", "ossa polm" non trova nulla.
 */
export function corrisponde(cercato: string, testi: string[]) {
  const parole = normalizza(cercato).split(' ').filter(Boolean);
  if (!parole.length) return true;
  const disponibili = testi.flatMap((t) => normalizza(t).split(/[\s-]+/));
  return parole.every((p) => disponibili.some((d) => d.startsWith(p)));
}
