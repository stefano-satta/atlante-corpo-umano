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

/** Un carattere confrontabile, con la stessa lunghezza: serve a ritrovare nel testo originale ciò che corrisponde. */
function normalizeChar(c: string) {
  const n = c
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’\s]/g, ' ');
  return n.length === 1 ? n : c.toLowerCase();
}

/**
 * Divide un testo in pezzi, segnando gli inizi di parola che corrispondono alla ricerca:
 * con "ret", "Retto femorale" diventa [{ "Ret", trovato }, { "to femorale" }].
 */
export function highlight(text: string, query: string) {
  const words = normalize(query).split(' ').filter(Boolean);
  const plain = [...text].map(normalizeChar).join('');
  const marked: boolean[] = [...text].map(() => false);
  for (let i = 0; i < plain.length; i++) {
    if (i > 0 && !/[\s-]/.test(plain[i - 1])) continue;
    const longest = Math.max(0, ...words.filter((w) => plain.startsWith(w, i)).map((w) => w.length));
    for (let j = i; j < i + longest; j++) marked[j] = true;
  }
  const chars = [...text];
  const parts: { text: string; match: boolean }[] = [];
  chars.forEach((c, i) => {
    const last = parts.at(-1);
    if (last && last.match === marked[i]) last.text += c;
    else parts.push({ text: c, match: marked[i] });
  });
  return parts;
}
