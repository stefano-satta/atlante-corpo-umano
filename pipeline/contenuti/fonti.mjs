// Fonti (contenuti/fonti.yaml): controllo delle voci e bibliografia della pagina Fonti.

import fs from 'node:fs';
import path from 'node:path';
import { parse as leggiYaml } from 'yaml';
import { DATA, ID, TIPI_FONTE } from './regole.mjs';

function controllaFonte(id, f, errore) {
  if (!ID.test(id)) errore(`identificativo non valido: ${id}`);
  if (!TIPI_FONTE.includes(f?.tipo)) errore(`${id}: tipo deve essere uno tra ${TIPI_FONTE.join(', ')}`);
  if (typeof f?.titolo !== 'string' || !f.titolo) errore(`${id}: manca il titolo`);
  if (!f?.ente && !(Array.isArray(f?.autori) && f.autori.length)) errore(`${id}: servono ente o autori`);
  if (typeof f?.url !== 'string' || !f.url.startsWith('https://'))
    errore(`${id}: l'indirizzo deve iniziare con https://`);
  if (!DATA.test(String(f?.consultata))) errore(`${id}: manca la data di consultazione (AAAA-MM-GG)`);
  if (f?.aggiornata !== undefined && !DATA.test(String(f.aggiornata)))
    errore(`${id}: data di aggiornamento non valida`);
}

export function leggiFonti(cartella, errorePer) {
  const fonti = leggiYaml(fs.readFileSync(path.join(cartella, 'fonti.yaml'), 'utf8')) ?? {};
  for (const [id, f] of Object.entries(fonti)) controllaFonte(id, f, errorePer('fonti.yaml'));
  return fonti;
}

/** Tutte le fonti, ognuna con i contenuti che la citano. */
export function elencoFonti(fonti, strutture, percorsi, glossario, quiz = {}) {
  const domande = Object.values(quiz).flat();
  const citataDa = (idFonte) => [
    ...strutture.filter((s) => s.fonti.some((f) => f.id === idFonte)).map((s) => ({ id: s.id, nome: s.nome })),
    ...percorsi
      .filter((p) => p.fonti.some((f) => f.id === idFonte))
      .map((p) => ({ id: `percorsi/${p.id}`, nome: `percorso “${p.titolo}”` })),
    ...glossario
      .filter((v) => v.fonti.some((f) => f.id === idFonte))
      .map((v) => ({ id: `glossario/${v.id}`, nome: 'glossario' })),
    ...[...new Set(domande.filter((q) => q.fonti.some((f) => f.id === idFonte)).map((q) => q.tema))].map((tema) => ({
      id: `quiz/${tema}`,
      nome: `quiz “${tema[0].toUpperCase()}${tema.slice(1)}”`,
    })),
  ];
  return Object.entries(fonti).map(([id, f]) => ({ id, ...f, citataDa: citataDa(id) }));
}
