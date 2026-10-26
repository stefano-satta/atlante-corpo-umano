// Prepara gli organi che arrivano da Z-Anatomy: scarica il pacchetto ufficiale in dati-sorgente/z-anatomy/
// (esclusa da git), ne controlla l'impronta, estrae Startup.blend ed esegue in Blender lo script di
// esportazione indicato, che allinea gli organi a BodyParts3D e li scrive in dati-sorgente/z-anatomy/:
// esporta-polmoni.py (predefinito) per i lobi dei polmoni, esporta-tiroide.py per la tiroide.
//
// Uso: npm run modelli:polmoni e npm run modelli:tiroide (dopo npm run modelli:scarica), poi
// npm run modelli:prepara.
// Richiede `unzip` e Blender (percorso nella variabile BLENDER, altrimenti quello predefinito su macOS).
//
// Licenza dei dati: Z-Anatomy, CC BY-SA 4.0 (https://github.com/Z-Anatomy/Models-of-human-anatomy).

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const URL = 'https://raw.githubusercontent.com/Z-Anatomy/Models-of-human-anatomy/master/Z-Anatomy.zip';
// Impronta git (blob SHA-1) della versione ispezionata il 2026-10-24: se il pacchetto cambia,
// polmoni e tiroide vanno ricontrollati prima di aggiornare questo valore.
const IMPRONTA = 'f43cabc6f366b2a6058dd2ed4a2b3c7b9b2492cb';
const SCRIPT = process.argv[2] ?? 'esporta-polmoni.py';
const BLENDER = process.env.BLENDER ?? '/Applications/Blender.app/Contents/MacOS/Blender';
const cartella = path.resolve('dati-sorgente/z-anatomy');
const archivio = path.join(cartella, 'Z-Anatomy.zip');
const blend = path.join(cartella, 'Z-Anatomy', 'Startup.blend');

fs.mkdirSync(cartella, { recursive: true });
if (!fs.existsSync(archivio)) {
  console.log('scarico Z-Anatomy.zip…');
  const risposta = await fetch(URL);
  if (!risposta.ok) throw new Error(`Z-Anatomy.zip: HTTP ${risposta.status}`);
  fs.writeFileSync(`${archivio}.parziale`, Buffer.from(await risposta.arrayBuffer()));
  fs.renameSync(`${archivio}.parziale`, archivio);
}
const dati = fs.readFileSync(archivio);
const impronta = createHash('sha1').update(`blob ${dati.length}\0`).update(dati).digest('hex');
if (impronta !== IMPRONTA) throw new Error(`Z-Anatomy.zip diverso da quello ispezionato (${impronta})`);

if (!fs.existsSync(blend)) {
  console.log('estraggo Startup.blend…');
  execFileSync('unzip', ['-q', '-o', archivio, 'Z-Anatomy/Startup.blend', '-d', cartella]);
}
if (!fs.existsSync(BLENDER)) throw new Error(`Blender non trovato in ${BLENDER}: indicarlo con BLENDER=…`);

// -Y: Blender non esegue gli script contenuti nel file.
execFileSync(
  BLENDER,
  ['-b', '-Y', blend, '--python-exit-code', '1', '--python', path.resolve('pipeline', SCRIPT), '--'],
  { stdio: ['ignore', 'inherit', 'ignore'] },
);
