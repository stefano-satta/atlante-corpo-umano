// Glossario (contenuti/glossario.yaml, D26): una voce per termine, con una definizione breve che cita le sue fonti.

import fs from 'node:fs';
import path from 'node:path';
import { parse as leggiYaml } from 'yaml';
import { CITAZIONE, DATA, GRUPPO_CITAZIONI, ID, SEGNO_GLOSSARIO, STATI } from './regole.mjs';
import { controllaHtml } from './testo.mjs';

function compilaVoce(id, v, { fonti, marked, lexer }, errore) {
  if (!ID.test(id)) errore('identificativo non valido');
  if (typeof v?.termine !== 'string' || !v.termine) errore('manca il termine');
  if (v?.varianti !== undefined && !(Array.isArray(v.varianti) && v.varianti.every((x) => typeof x === 'string')))
    errore('varianti deve essere un elenco di parole');
  if (!STATI.includes(v?.stato)) errore(`stato deve essere uno tra ${STATI.join(', ')}`);
  if (!DATA.test(String(v?.revisione))) errore('manca la data di revisione (AAAA-MM-GG)');
  const definizione = typeof v?.definizione === 'string' ? v.definizione.trim() : '';
  if (!definizione) errore('manca la definizione');
  const citate = [...definizione.matchAll(CITAZIONE)].map((m) => m[1]);
  if (definizione && !citate.length) errore('la definizione non cita nessuna fonte');
  for (const f of citate) if (!fonti[f]) errore(`citazione di una fonte inesistente: [@${f}]`);
  controllaHtml(lexer(definizione), errore);
  if (SEGNO_GLOSSARIO.test(definizione)) errore('una definizione non può rimandare ad altre voci');
  SEGNO_GLOSSARIO.lastIndex = 0;
  // Termine latino della TA2, facoltativo ma sempre con il suo numero.
  if ((v?.latino === undefined) !== (v?.ta2 === undefined)) errore('latino e ta2 vanno indicati insieme');
  if (v?.latino !== undefined && (typeof v.latino !== 'string' || !v.latino)) errore('latino non valido');
  if (v?.ta2 !== undefined && !Number.isInteger(v.ta2)) errore('ta2 deve essere un numero');
  if (v?.nelModello !== undefined && (typeof v.nelModello !== 'boolean' || !v?.parteDi))
    errore('nelModello va indicato (vero o falso) solo con parteDi');
  return {
    id,
    termine: v?.termine ?? id,
    varianti: v?.varianti ?? [],
    latino: v?.latino ?? null,
    ta2: v?.ta2 ?? null,
    // Struttura che descrive la parte: l'Indice la elenca lì. Di solito la parte non è nel modello
    // 3D; con nelModello c'è, ma unita alla struttura e non si sceglie da sola (le parti dell'occhio).
    parteDi: v?.parteDi ?? null,
    nelModello: v?.nelModello ?? false,
    html: marked.parseInline(definizione.replace(GRUPPO_CITAZIONI, '').trim()),
    fonti: [...new Set(citate)].filter((f) => fonti[f]).map((f) => ({ id: f, ...fonti[f] })),
    stato: v?.stato,
    revisione: String(v?.revisione),
  };
}

export function leggiGlossario(contesto) {
  const file = path.join(contesto.cartella, 'glossario.yaml');
  const voci = fs.existsSync(file) ? (leggiYaml(fs.readFileSync(file, 'utf8')) ?? {}) : {};
  return Object.entries(voci)
    .map(([id, v]) => compilaVoce(id, v, contesto, contesto.errorePer(`glossario.yaml: ${id}`)))
    .sort((a, b) => a.termine.localeCompare(b.termine, 'it'));
}

/** Ogni voce che descrive una parte deve rimandare a una struttura esistente. */
export function controllaParti(glossario, strutture, errorePer) {
  for (const v of glossario)
    if (v.parteDi !== null && !strutture.has(v.parteDi))
      errorePer(`glossario.yaml: ${v.id}`)(`parteDi indica una struttura sconosciuta: ${v.parteDi}`);
}
