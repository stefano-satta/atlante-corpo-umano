// Percorsi guidati (contenuti/percorsi/, D24): un passo per sezione "## Titolo", con strato,
// strutture evidenziate, inquadratura e schema nell'intestazione. Hanno fonti numerate proprie.

import { DATA, SCHEMI_PERCORSO, STATI, STRATI_PERCORSO } from './regole.mjs';
import { controllaRimandi, dividiPassi, fileMarkdown, leggiMarkdown, numeratore } from './testo.mjs';

/** Strutture del modello indicate per gruppo (organi) o per FMA (ossa e muscoli). */
function elementi(valore, campo, i, modello, errore) {
  const gruppi = valore?.gruppi ?? [];
  const fma = valore?.fma ?? [];
  for (const g of gruppi)
    if (!modello.gruppi.has(g)) errore(`passo ${i + 1}: il gruppo 3D "${g}" non esiste nel modello`);
  for (const f of fma) if (!modello.fma.has(f)) errore(`passo ${i + 1}: l'elemento ${f} non esiste nel modello`);
  if (!gruppi.length && !fma.length) errore(`passo ${i + 1}: ${campo} deve indicare dei gruppi o degli FMA`);
  return { gruppi, fma };
}

export function leggiPercorsi({ cartella, errorePer, fonti, modello, lexer, compila }) {
  const percorsi = [];
  for (const file of fileMarkdown(cartella, 'percorsi')) {
    const errore = errorePer(`percorsi/${file}`);
    const letto = leggiMarkdown(cartella, 'percorsi', file, errore);
    if (!letto) continue;
    const d = letto.dati;
    if (`${d.id}.md` !== file) errore(`l'id "${d.id}" deve coincidere con il nome del file`);
    if (typeof d.titolo !== 'string' || !d.titolo) errore('manca il titolo');
    // Presentazione breve per la card della pagina Percorsi.
    if (typeof d.descrizione !== 'string' || !d.descrizione.trim()) errore('manca la descrizione');
    if (!STATI.includes(d.stato)) errore(`stato deve essere uno tra ${STATI.join(', ')}`);
    if (!DATA.test(String(d.revisione))) errore('manca la data di revisione');
    const passi = Array.isArray(d.passi) ? d.passi : [];
    if (passi.length < 2) errore('servono almeno due passi');
    const testi = dividiPassi(letto.corpo, passi, errore);

    const { rimandi, elenco } = numeratore(fonti, errore);
    const compilati = passi.map((passo, i) => {
      if (!STRATI_PERCORSO.includes(passo?.strato))
        errore(`passo ${i + 1}: strato deve essere uno tra ${STRATI_PERCORSO.join(', ')}`);
      if (!SCHEMI_PERCORSO.includes(passo?.schema))
        errore(`passo ${i + 1}: schema deve essere uno tra ${SCHEMI_PERCORSO.join(', ')}`);
      const testo = testi[i]?.testo ?? '';
      controllaRimandi(lexer, testo, errore);
      return {
        titolo: testi[i]?.titolo ?? '',
        html: compila(testo, rimandi, errore),
        strato: passo?.strato,
        evidenzia: elementi(passo?.evidenzia, 'evidenzia', i, modello, errore),
        inquadra: passo?.inquadra ? elementi(passo.inquadra, 'inquadra', i, modello, errore) : null,
        schema: passo?.schema,
      };
    });
    percorsi.push({
      id: d.id,
      titolo: d.titolo,
      descrizione: typeof d.descrizione === 'string' ? d.descrizione.trim() : '',
      stato: d.stato,
      revisione: String(d.revisione),
      limiti: typeof d.limiti === 'string' ? d.limiti.trim() : null,
      passi: compilati,
      fonti: elenco(),
    });
  }
  return percorsi;
}
