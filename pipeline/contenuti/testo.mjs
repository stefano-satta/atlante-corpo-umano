// Strumenti comuni per leggere, controllare e compilare i testi Markdown.

import fs from 'node:fs';
import path from 'node:path';
import { parse as leggiYaml } from 'yaml';
import { CITAZIONE, GRUPPO_CITAZIONI, SEGNO_GLOSSARIO, SEZIONI } from './regole.mjs';

export function separaIntestazione(testo) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(testo.replace(/\r\n/g, '\n'));
  if (!m) return null;
  return { dati: leggiYaml(m[1]) ?? {}, corpo: m[2] };
}

/** File Markdown di una sottocartella dei contenuti, in ordine; nessuno se la cartella non c'è. */
export function fileMarkdown(cartella, sottocartella) {
  const dir = path.join(cartella, sottocartella);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort();
}

/** Legge un file Markdown con la sua intestazione; senza intestazione segnala l'errore e dà null. */
export function leggiMarkdown(cartella, sottocartella, file, errore, messaggio = 'manca l’intestazione YAML') {
  const letto = separaIntestazione(fs.readFileSync(path.join(cartella, sottocartella, file), 'utf8'));
  if (!letto) errore(messaggio);
  return letto;
}

export const ancora = (titolo) =>
  titolo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Divide il corpo nelle sezioni introdotte da "## Titolo". */
export function dividiSezioni(corpo, errore) {
  const parti = corpo.split(/^## (.+)$/m);
  if (parti[0].trim()) errore('c’è del testo prima della prima sezione');
  const sezioni = [];
  for (let i = 1; i < parti.length; i += 2) {
    const titolo = parti[i].trim();
    const chiave = SEZIONI.find((s) => titolo === s || titolo.startsWith(`${s}:`));
    if (!chiave) errore(`sezione non ammessa: "${titolo}" (ammesse: ${SEZIONI.join(', ')})`);
    sezioni.push({ chiave: chiave ?? titolo, titolo, testo: parti[i + 1].trim() });
  }
  if (sezioni[0]?.chiave !== 'In breve') errore('la prima sezione deve essere "In breve"');
  const ordine = sezioni.map((s) => SEZIONI.indexOf(s.chiave));
  if (ordine.some((n, i) => i > 0 && n <= ordine[i - 1])) errore('sezioni ripetute o fuori ordine');
  return sezioni;
}

/** Testi dei passi di un processo o di un percorso: una sezione "## Titolo" per ogni passo dell'intestazione. */
export function dividiPassi(corpo, passi, errore) {
  const sezioni = corpo.split(/^## (.+)$/m);
  if (sezioni[0].trim()) errore('c’è del testo prima del primo passo');
  const testi = [];
  for (let i = 1; i < sezioni.length; i += 2) testi.push({ titolo: sezioni[i].trim(), testo: sezioni[i + 1].trim() });
  if (testi.length !== passi.length)
    errore(`i passi nell'intestazione (${passi.length}) e nel testo (${testi.length}) non coincidono`);
  return testi;
}

/**
 * Ogni paragrafo deve citare almeno una fonte. Fanno eccezione i paragrafi che
 * introducono un elenco (finiscono con i due punti); in quel caso le voci dell'elenco
 * devono avere un rimando, a meno che non lo abbia già il paragrafo introduttivo.
 */
export function controllaRimandi(lexer, testo, errore) {
  let introduzioneCitata = false;
  const token = lexer(testo);
  controllaHtml(token, errore);
  for (const t of token) {
    if (t.type === 'paragraph') {
      const citato = CITAZIONE.test(t.text);
      CITAZIONE.lastIndex = 0;
      const introduce = t.text.trimEnd().endsWith(':');
      if (!citato && !introduce) errore(`paragrafo senza fonte: "${t.text.slice(0, 60)}…"`);
      introduzioneCitata = introduce && citato;
    } else if (t.type === 'list') {
      for (const voce of t.items) {
        const citata = CITAZIONE.test(voce.text);
        CITAZIONE.lastIndex = 0;
        if (!citata && !introduzioneCitata) errore(`voce di elenco senza fonte: "${voce.text.slice(0, 60)}…"`);
      }
      introduzioneCitata = false;
    } else if (t.type !== 'space') {
      introduzioneCitata = false;
    }
  }
}

/** Il testo è solo Markdown: nessun HTML grezzo, né a blocchi né dentro una frase. */
export function controllaHtml(token, errore) {
  for (const t of token) {
    if (t.type === 'html') return errore('HTML non ammesso nel testo');
    const figli = [...(t.tokens ?? []), ...(t.items ?? [])];
    if (figli.length) controllaHtml(figli, errore);
  }
}

/**
 * Numerazione delle fonti di un contenuto, nell'ordine della prima citazione, e
 * trasformazione dei gruppi [@id] in rimandi numerati.
 */
export function numeratore(fonti, errore) {
  const ordine = [];
  const numero = (id) => {
    if (!fonti[id]) {
      errore(`citazione di una fonte inesistente: [@${id}]`);
      return 0;
    }
    if (!ordine.includes(id)) ordine.push(id);
    return ordine.indexOf(id) + 1;
  };
  const rimandi = (testo) =>
    testo.replace(GRUPPO_CITAZIONI, (gruppo) => {
      const numeri = [...gruppo.matchAll(CITAZIONE)].map((m) => numero(m[1]));
      const link = numeri.map((n) => `<a href="#fonte-${n}">${n}</a>`).join(', ');
      return `<sup class="citation"><span class="visually-hidden">fonti </span>${link}</sup>`;
    });
  const elenco = () => ordine.map((id, i) => ({ n: i + 1, id, ...fonti[id] }));
  return { ordine, numero, rimandi, elenco };
}

/**
 * Trasforma i segni [[testo|voce]] in collegamenti alla voce del glossario, che l'interfaccia
 * apre sul posto. Una voce che non esiste nel glossario è un errore.
 */
function segniGlossario(voci, errore) {
  return (testo) =>
    testo.replace(SEGNO_GLOSSARIO, (_, mostrato, voce) => {
      const id = (voce ?? mostrato).trim().toLowerCase().replace(/\s+/g, '-');
      if (!voci.has(id)) errore(`termine del glossario inesistente: [[${mostrato}${voce ? `|${voce}` : ''}]]`);
      return `[${mostrato.trim()}](/glossario#glossario-${id})`;
    });
}

/** Aggiunge classe e voce ai collegamenti del glossario prodotti da marked. */
const marcaGlossario = (html) =>
  html.replace(
    /<a href="\/glossario#glossario-([a-z0-9-]+)">/g,
    '<a class="glossary-term" href="/glossario#glossario-$1" data-term="$1">',
  );

/** Testo Markdown di un contenuto → HTML, con i rimandi alle fonti e i termini del glossario. */
export const compilatore = (marked, idGlossario) => (testo, rimandi, errore) =>
  marcaGlossario(marked.parse(rimandi(segniGlossario(idGlossario, errore)(testo))));
