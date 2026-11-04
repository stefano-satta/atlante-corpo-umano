// Lettura, controllo e compilazione dei contenuti (D17).
//
// Ogni struttura è un file Markdown in contenuti/strutture/ con intestazione YAML;
// le fonti stanno in contenuti/fonti.yaml, i nomi delle strutture senza scheda in
// contenuti/riferimenti.yaml e le definizioni del glossario in contenuti/glossario.yaml. Il controllo automatico ferma la build se trova un
// errore: una citazione senza fonte, un paragrafo senza rimando, una relazione verso
// una struttura sconosciuta, un elemento 3D che non esiste nel modello.
//
// Questo file coordina la lettura; le regole e ogni tipo di contenuto stanno in pipeline/contenuti/.
// yaml e marked si usano solo in build: nel sito arriva HTML già pronto.

import fs from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';
import { parse as leggiYaml } from 'yaml';
import { elencoFonti, leggiFonti } from './contenuti/fonti.mjs';
import { controllaParti, leggiGlossario } from './contenuti/glossario.mjs';
import { leggiPagine } from './contenuti/pagine.mjs';
import { leggiPercorsi } from './contenuti/percorsi.mjs';
import { leggiProcessi } from './contenuti/processi.mjs';
import { compilaStruttura, leggiIntestazioni } from './contenuti/strutture.mjs';
import { compilatore } from './contenuti/testo.mjs';

/**
 * Legge e controlla tutti i contenuti. Restituisce i dati compilati e l'elenco degli
 * errori; con almeno un errore la build si ferma.
 *
 * @param {string} cartella cartella contenuti/
 * @param {{ gruppi: Set<string>, fma: Set<string> }} modello strutture presenti nel modello 3D
 */
export function leggiContenuti(cartella, modello) {
  const errori = [];
  const errorePer = (file) => (messaggio) => errori.push(`${file}: ${messaggio}`);

  const fonti = leggiFonti(cartella, errorePer);
  const riferimenti = leggiYaml(fs.readFileSync(path.join(cartella, 'riferimenti.yaml'), 'utf8')) ?? {};
  const marked = new Marked({ gfm: true, breaks: false });
  const base = {
    cartella,
    modello,
    fonti,
    apparati: riferimenti.apparati ?? {},
    nomi: riferimenti.nomi ?? {},
    marked,
    lexer: (testo) => marked.lexer(testo),
    errorePer,
  };

  const glossario = leggiGlossario(base);
  const contesto = { ...base, compila: compilatore(marked, new Set(glossario.map((v) => v.id))) };

  const grezze = leggiIntestazioni(contesto);
  const perId = new Map(grezze.map((g) => [g.dati.id, g]));
  controllaParti(glossario, perId, errorePer);
  const processiPer = leggiProcessi(contesto, perId);
  const strutture = grezze.map((g) => compilaStruttura(g, perId, processiPer, contesto));
  const pagine = leggiPagine(contesto);
  const percorsi = leggiPercorsi(contesto);

  return { strutture, pagine, percorsi, glossario, fonti: elencoFonti(fonti, strutture, percorsi, glossario), errori };
}

/** Strutture e gruppi presenti nel modello 3D, da public/modelli/strutture.json. */
export function leggiModello(file) {
  const elementi = JSON.parse(fs.readFileSync(file, 'utf8'));
  return {
    gruppi: new Set(elementi.map((e) => e.gruppo).filter(Boolean)),
    fma: new Set(elementi.map((e) => e.fma).filter(Boolean)),
    // I vasi senza FMA (quelli di Z-Anatomy) si indicano con il gruppo, che riunisce i loro pezzi.
    id: new Set(elementi.flatMap((e) => (e.strato === 'vasi' && e.gruppo ? [e.id, e.gruppo] : [e.id]))),
    // FMA → unità selezionabile: il gruppo per gli organi, l'elemento stesso per ossa e muscoli.
    unita: new Map(elementi.filter((e) => e.fma).map((e) => [e.fma, e.gruppo ?? e.id])),
  };
}

/**
 * Indice delle unità che il sito deve conoscere prima di scaricare la scena: quali sono vasi (il loro
 * file si scarica solo quando servono) e quali si vedono in un solo corpo (D29).
 */
export function indiceModello(file) {
  const elementi = JSON.parse(fs.readFileSync(file, 'utf8'));
  const unita = new Map();
  for (const e of elementi) if (!unita.has(e.gruppo ?? e.id)) unita.set(e.gruppo ?? e.id, e);
  const voci = [...unita];
  return {
    vasi: voci.filter(([, e]) => e.strato === 'vasi').map(([id]) => id),
    corpi: Object.fromEntries(voci.filter(([, e]) => e.corpo).map(([id, e]) => [id, e.corpo])),
  };
}
