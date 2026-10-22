// Prepara i modelli 3D del prototipo a partire dai file OBJ di BodyParts3D.
//
// Uso: npm run modelli:prepara (dopo npm run modelli:scarica)
//
// Opzioni: --bp3d <cartella> (predefinita dati-sorgente/bodyparts3d, che deve
// contenere isa_element_parts.txt e la sottocartella isa_BP3D_4.0_obj_99/),
// --obj <cartella degli OBJ>, --ratio 0.1 (D13), --out public/modelli.
//
// Produce un file .glb per strato (ossa, muscoli, organi, pelle) e strutture.json
// con i metadati di ogni struttura (classificazione e coordinate: classifica.mjs).
//
// Licenza dei dati di origine: BodyParts3D, © The Database Center for Life Science,
// CC BY 4.0 (i file OBJ riportano la precedente CC BY-SA 2.1 JP). I modelli derivati
// sono distribuiti con licenza CC BY-SA 4.0.

import fs from 'node:fs';
import path from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt, prune, simplify, weld } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { classifica, convertiVertice } from './classifica.mjs';

const arg = (nome, predefinito) => {
  const i = process.argv.indexOf(`--${nome}`);
  return i > -1 ? process.argv[i + 1] : predefinito;
};

const cartella = arg('bp3d', 'dati-sorgente/bodyparts3d');
const ratio = Number(arg('ratio', '0.1'));
const ratioPelle = Number(arg('ratio-pelle', String(ratio / 2)));
const errore = Number(arg('errore', '0.01'));
const uscita = arg('out', 'public/modelli');
const cartellaObj = arg('obj', path.join(cartella, 'isa_BP3D_4.0_obj_99'));
if (!fs.existsSync(cartellaObj)) {
  console.error(`Mancano i dati di BodyParts3D in ${cartellaObj}: eseguire prima npm run modelli:scarica`);
  process.exit(1);
}

// Legge solo l'intestazione di un OBJ per ricavarne nome e concetto FMA.
function leggiIntestazione(id) {
  const fd = fs.openSync(path.join(cartellaObj, `${id}.obj`), 'r');
  const buf = Buffer.alloc(1500);
  fs.readSync(fd, buf, 0, buf.length, 0);
  fs.closeSync(fd);
  const testo = buf.toString('utf8');
  const nome = /# English name : (.+)/.exec(testo)?.[1].trim() ?? id;
  const fma = /# Concept ID : (\S+)/.exec(testo)?.[1] ?? null;
  return { nome, fma };
}

function leggiObj(id) {
  const righe = fs.readFileSync(path.join(cartellaObj, `${id}.obj`), 'utf8').split('\n');
  const posizioni = [];
  const indici = [];
  for (const riga of righe) {
    if (riga.startsWith('v ')) {
      const [, x, y, z] = riga.split(/\s+/).map(Number);
      posizioni.push(...convertiVertice(x, y, z));
    } else if (riga.startsWith('f ')) {
      const v = riga
        .trim()
        .split(/\s+/)
        .slice(1)
        .map((t) => parseInt(t, 10) - 1);
      for (let k = 1; k < v.length - 1; k++) indici.push(v[0], v[k], v[k + 1]);
    }
  }
  return { posizioni: new Float32Array(posizioni), indici: new Uint32Array(indici) };
}

// Classificazione degli elementi.
const righeParti = fs
  .readFileSync(path.join(cartella, 'isa_element_parts.txt'), 'utf8')
  .trim()
  .split('\n')
  .slice(1)
  .map((r) => r.split('\t'));
const elementiDi = (concetto) => new Set(righeParti.filter((r) => r[1] === concetto).map((r) => r[2].trim()));

const ossa = elementiDi('bone organ');
const muscoli = elementiDi('muscle organ');
const tutti = fs
  .readdirSync(cartellaObj)
  .filter((f) => f.endsWith('.obj'))
  .map((f) => f.slice(0, -4));
const intestazioni = new Map(tutti.map((id) => [id, leggiIntestazione(id)]));

// Alcuni OBJ non riportano il nome: si usa il concetto più specifico che contiene l'elemento.
const dimensioneConcetto = new Map();
for (const [concetto] of righeParti) dimensioneConcetto.set(concetto, (dimensioneConcetto.get(concetto) ?? 0) + 1);
for (const [id, intestazione] of intestazioni) {
  if (intestazione.nome !== id) continue;
  const candidati = righeParti.filter((r) => r[2].trim() === id);
  candidati.sort((a, b) => dimensioneConcetto.get(a[0]) - dimensioneConcetto.get(b[0]));
  if (candidati[0]) intestazioni.set(id, { nome: candidati[0][1], fma: candidati[0][0] });
}

const strutture = [];
for (const id of tutti) {
  const { nome, fma } = intestazioni.get(id);
  const c = classifica(id, nome, ossa, muscoli);
  if (c) strutture.push({ id, nome, fma, ...c });
}

fs.mkdirSync(uscita, { recursive: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;

const riepilogo = {};
for (const strato of ['ossa', 'muscoli', 'organi', 'pelle']) {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const scena = doc.createScene(strato);
  let triangoliPrima = 0;
  for (const s of strutture.filter((s) => s.strato === strato)) {
    const { posizioni, indici } = leggiObj(s.id);
    triangoliPrima += indici.length / 3;
    const prim = doc
      .createPrimitive()
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(posizioni).setBuffer(buffer))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(indici).setBuffer(buffer));
    const mesh = doc.createMesh(s.id).addPrimitive(prim);
    scena.addChild(doc.createNode(s.id).setMesh(mesh));
  }
  await doc.transform(
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: strato === 'pelle' ? ratioPelle : ratio, error: errore }),
    prune(),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  );
  let triangoliDopo = 0;
  for (const m of doc.getRoot().listMeshes())
    for (const p of m.listPrimitives()) triangoliDopo += p.getIndices().getCount() / 3;
  const file = path.join(uscita, `${strato}.glb`);
  await io.write(file, doc);
  riepilogo[strato] = {
    strutture: strutture.filter((s) => s.strato === strato).length,
    triangoliPrima,
    triangoliDopo,
    kB: Math.round(fs.statSync(file).size / 1024),
  };
}

fs.writeFileSync(path.join(uscita, 'strutture.json'), JSON.stringify(strutture));
fs.writeFileSync(
  path.join(uscita, 'riepilogo.json'),
  JSON.stringify({ ratio, ratioPelle, errore, riepilogo }, null, 2),
);
console.table(riepilogo);
