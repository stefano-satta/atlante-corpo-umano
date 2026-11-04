// Pagine editoriali (contenuti/pagine/, come Informazioni): Markdown semplice, con le stesse regole sugli stati.

import { DATA, STATI } from './regole.mjs';
import { controllaHtml, fileMarkdown, leggiMarkdown } from './testo.mjs';

export function leggiPagine({ cartella, errorePer, marked, lexer }) {
  const pagine = [];
  for (const file of fileMarkdown(cartella, 'pagine')) {
    const errore = errorePer(`pagine/${file}`);
    const letto = leggiMarkdown(cartella, 'pagine', file, errore);
    if (!letto) continue;
    const d = letto.dati;
    if (`${d.id}.md` !== file) errore(`l'id "${d.id}" deve coincidere con il nome del file`);
    if (!STATI.includes(d.stato)) errore(`stato deve essere uno tra ${STATI.join(', ')}`);
    if (!DATA.test(String(d.revisione))) errore('manca la data di revisione');
    controllaHtml(lexer(letto.corpo), errore);
    pagine.push({
      id: d.id,
      titolo: d.titolo,
      stato: d.stato,
      revisione: String(d.revisione),
      html: marked.parse(letto.corpo),
    });
  }
  return pagine;
}
