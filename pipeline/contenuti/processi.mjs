// Processi animati (contenuti/processi/): un passo per sezione "## Titolo", con lo stato del
// disegno nell'intestazione. Si compilano insieme alla struttura a cui appartengono, così i
// rimandi usano la stessa numerazione delle fonti della scheda.

import { CAMPI_PASSO, DATA, FASI_SCHEMA, FLUSSI, SCHEMI_PROCESSO, STATI } from './regole.mjs';
import { controllaRimandi, dividiPassi, fileMarkdown, leggiMarkdown } from './testo.mjs';

function controllaPassi(schema, passi, errore) {
  passi.forEach((passo, i) => {
    if (schema !== 'cuore') {
      const fasi = FASI_SCHEMA[schema] ?? [];
      if (!fasi.includes(passo?.fase)) errore(`passo ${i + 1}: fase deve essere una tra ${fasi.join(', ')}`);
      return;
    }
    for (const [campo, valori] of Object.entries(CAMPI_PASSO))
      if (!valori.includes(passo?.[campo])) errore(`passo ${i + 1}: ${campo} deve essere uno tra ${valori.join(', ')}`);
    for (const f of passo?.flussi ?? []) if (!FLUSSI.includes(f)) errore(`passo ${i + 1}: flusso sconosciuto ${f}`);
  });
}

/** Legge e controlla i processi; restituisce, per ogni struttura, quelli che le appartengono. */
export function leggiProcessi({ cartella, errorePer }, strutture) {
  const processiPer = new Map();
  for (const file of fileMarkdown(cartella, 'processi')) {
    const errore = errorePer(`processi/${file}`);
    const letto = leggiMarkdown(cartella, 'processi', file, errore);
    if (!letto) continue;
    const d = letto.dati;
    if (`${d.id}.md` !== file) errore(`l'id "${d.id}" deve coincidere con il nome del file`);
    // Un processo appartiene a una struttura (struttura) o a tutte quelle di un apparato (strutture):
    // compare nella scheda di ognuna.
    const proprietarie = d.strutture ?? [d.struttura];
    if (!Array.isArray(proprietarie) || !proprietarie.length) errore('strutture deve essere un elenco');
    for (const id of proprietarie) if (!strutture.has(id)) errore(`struttura sconosciuta: ${id}`);
    const schema = d.schema ?? 'cuore';
    if (!SCHEMI_PROCESSO.includes(schema)) errore(`schema deve essere uno tra ${SCHEMI_PROCESSO.join(', ')}`);
    if (typeof d.titolo !== 'string' || !d.titolo) errore('manca il titolo');
    if (!STATI.includes(d.stato)) errore(`stato deve essere uno tra ${STATI.join(', ')}`);
    if (!DATA.test(String(d.revisione))) errore('manca la data di revisione');
    const passi = Array.isArray(d.passi) ? d.passi : [];
    if (passi.length < 2) errore('servono almeno due passi');
    controllaPassi(schema, passi, errore);
    const testi = dividiPassi(letto.corpo, passi, errore);
    for (const id of Array.isArray(proprietarie) ? proprietarie : []) {
      if (!processiPer.has(id)) processiPer.set(id, []);
      processiPer.get(id).push({ errore, dati: d, schema, principale: proprietarie[0], passi, testi });
    }
  }
  return processiPer;
}

/** Compila un processo per la scheda di una struttura, con la numerazione delle fonti di quella scheda. */
export function compilaProcesso(p, idStruttura, rimandi, { lexer, compila }) {
  // Un processo di più strutture si compila per ognuna: l'errore si segnala una volta sola.
  const principale = idStruttura === p.principale;
  return {
    id: p.dati.id,
    titolo: p.dati.titolo,
    schema: p.schema,
    // La struttura da cui l'Indice apre il processo.
    principale: p.principale,
    stato: p.dati.stato,
    revisione: String(p.dati.revisione),
    passi: p.passi.map((passo, i) => {
      const testo = p.testi[i]?.testo ?? '';
      if (principale) controllaRimandi(lexer, testo, p.errore);
      const titolo = p.testi[i]?.titolo ?? '';
      const html = compila(testo, rimandi, principale ? p.errore : () => {});
      if (p.schema !== 'cuore') return { titolo, html, fase: passo.fase };
      return {
        titolo,
        html,
        ...Object.fromEntries(Object.keys(CAMPI_PASSO).map((c) => [c, passo[c]])),
        flussi: passo.flussi ?? [],
      };
    }),
  };
}
