// Prepara i modelli 3D del prototipo a partire dai file OBJ di BodyParts3D.
//
// Uso: npm run modelli:prepara (dopo npm run modelli:scarica)
//
// Opzioni: --bp3d <cartella> (predefinita dati-sorgente/bodyparts3d, che deve
// contenere isa_element_parts.txt e la sottocartella isa_BP3D_4.0_obj_99/),
// --obj <cartella degli OBJ>, --ratio 0.1 (D13), --out public/modelli,
// --polmoni <cartella> (predefinita dati-sorgente/z-anatomy/polmoni, prodotta da
// npm run modelli:polmoni), --tiroide <cartella> (predefinita dati-sorgente/z-anatomy/tiroide,
// prodotta da npm run modelli:tiroide, con le paratiroidi), --ratio-polmoni 0.3 (per gli organi
// di Z-Anatomy, tranne le superfici sotto i 200 triangoli, che non si riducono), --ratio-occhi 0.03
// (sclera, cornea, iride e cristallino), --donna <cartella> (predefinita
// dati-sorgente/hra/allineati, prodotta da npm run modelli:donna), --triangoli-donna 3000,
// --muscoli <cartella> (predefinita dati-sorgente/z-anatomy/muscoli, prodotta da
// npm run modelli:muscoli), --triangoli-muscoli 2000.
//
// Produce un file .glb per strato (ossa, muscoli, organi, pelle), organi-donna.glb con gli
// organi del corpo femminile (D29) e strutture.json con i metadati di ogni struttura
// (classificazione e coordinate: classifica.mjs).
//
// Licenza dei dati di origine: BodyParts3D, © The Database Center for Life Science,
// CC BY 4.0 (i file OBJ riportano la precedente CC BY-SA 2.1 JP); polmoni, tiroide e i muscoli assenti
// da BodyParts3D da Z-Anatomy,
// CC BY-SA 4.0; organi femminili dallo Human Reference Atlas, CC BY 4.0. I modelli derivati
// sono distribuiti con licenza CC BY-SA 4.0.

import fs from 'node:fs';
import path from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt, prune, simplifyPrimitive, weld } from '@gltf-transform/functions';
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
// Gli organi di Z-Anatomy sono già semplici superfici suddivise: si riducono meno degli OBJ di BodyParts3D.
const cartellaPolmoni = arg('polmoni', 'dati-sorgente/z-anatomy/polmoni');
const cartellaTiroide = arg('tiroide', 'dati-sorgente/z-anatomy/tiroide');
const ratioPolmoni = Number(arg('ratio-polmoni', '0.3'));
// Sclera, cornea, iride e cristallino sono superfici lisce con molti più triangoli del necessario
// (la sclera quasi 40.000): ridotti di più, restano rotondi e tengono lo strato nel suo peso.
const ratioOcchi = Number(arg('ratio-occhi', '0.03'));
// Gli organi dell'HRA hanno molti più triangoli del necessario (la mammella destra oltre 400.000):
// ognuno si riduce a un numero massimo di triangoli invece che a una frazione.
const cartellaDonna = arg('donna', 'dati-sorgente/hra/allineati');
const triangoliDonna = Number(arg('triangoli-donna', '3000'));
// I muscoli di Z-Anatomy assenti da BodyParts3D vanno da 170 a 34.000 triangoli: anche loro si riducono a
// un numero massimo, così i piccoli muscoli del viso restano interi.
const cartellaMuscoli = arg('muscoli', 'dati-sorgente/z-anatomy/muscoli');
const triangoliMuscoli = Number(arg('triangoli-muscoli', '2000'));
for (const [cartellaDati, comando] of [
  [cartellaObj, 'npm run modelli:scarica'],
  [cartellaPolmoni, 'npm run modelli:polmoni'],
  [cartellaTiroide, 'npm run modelli:tiroide'],
  [cartellaDonna, 'npm run modelli:donna'],
  [cartellaMuscoli, 'npm run modelli:muscoli'],
]) {
  if (!fs.existsSync(cartellaDati)) {
    console.error(`Mancano i dati in ${cartellaDati}: eseguire prima ${comando}`);
    process.exit(1);
  }
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

function leggiObj(file) {
  const righe = fs.readFileSync(file, 'utf8').split('\n');
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

// Alcuni muscoli (deltoide, bicipite, quadricipite, gastrocnemio…) esistono solo come capi o parti,
// che BodyParts3D non colloca sotto "muscle organ"; altri (interossei e lombricali della mano,
// interspinali…) solo come gruppo, sotto "musculature". La parte ascendente e la discendente del
// trapezio sono solo "organ zone": entrano perché un'altra parte dello stesso muscolo è già tra i muscoli.
const muscoli = new Set([
  ...elementiDi('muscle organ'),
  ...elementiDi('head of muscle organ'),
  ...elementiDi('zone of muscle organ'),
  ...elementiDi('musculature'),
]);
const muscoloDi = (id) => /(?:part|head) of (?:right|left) (.+)$/i.exec(intestazioni.get(id)?.nome ?? '')?.[1];
const muscoliConParti = new Set([...muscoli].map(muscoloDi).filter(Boolean));
for (const id of elementiDi('organ zone')) if (muscoliConParti.has(muscoloDi(id))) muscoli.add(id);

const strutture = [];
for (const id of tutti) {
  const { nome, fma } = intestazioni.get(id);
  const c = classifica(id, nome, ossa, muscoli);
  if (c) strutture.push({ id, nome, fma, ...c });
}
const fileObj = new Map(strutture.map((s) => [s.id, path.join(cartellaObj, `${s.id}.obj`)]));

// Polmoni, tiroide e paratiroidi di Z-Anatomy, già allineati alle coordinate di BodyParts3D da
// esporta-polmoni.py ed esporta-tiroide.py. Non hanno un identificativo FMA nel file di origine:
// il campo resta vuoto.
for (const [cartellaZa, gruppi] of [
  [cartellaPolmoni, ['polmoni']],
  [cartellaTiroide, ['tiroide', 'paratiroidi']],
]) {
  for (const f of fs.readdirSync(cartellaZa).filter((f) => f.endsWith('.obj'))) {
    const file = path.join(cartellaZa, f);
    const nome = /# English name : (.+)/.exec(fs.readFileSync(file, 'utf8').slice(0, 1000))?.[1].trim();
    const c = nome && classifica(f, nome, new Set(), new Set());
    if (!gruppi.includes(c?.gruppo)) throw new Error(`${f}: elemento di ${gruppi} non riconosciuto (${nome})`);
    const id = `ZA-${f.slice(0, -4).toLowerCase().replaceAll('_', '-')}`;
    strutture.push({ id, nome, fma: null, ...c });
    fileObj.set(id, file);
  }
}

// Organi femminili dell'HRA e vagina schematica, già allineati da organi-donna.mjs.
for (const f of fs.readdirSync(cartellaDonna).filter((f) => f.endsWith('.obj'))) {
  const file = path.join(cartellaDonna, f);
  const nome = /# English name : (.+)/.exec(fs.readFileSync(file, 'utf8').slice(0, 2000))?.[1].trim();
  const c = nome && classifica(f, nome, new Set(), new Set());
  if (c?.corpo !== 'donna') throw new Error(`${f}: organo femminile non riconosciuto (${nome})`);
  const id = `HRA-${f.slice(0, -4).toLowerCase().replaceAll('_', '-')}`;
  strutture.push({ id, nome, fma: null, ...c });
  fileObj.set(id, file);
}

// Muscoli di Z-Anatomy assenti da BodyParts3D, già allineati da esporta-muscoli.py.
for (const f of fs.readdirSync(cartellaMuscoli).filter((f) => f.endsWith('.obj'))) {
  const file = path.join(cartellaMuscoli, f);
  const nome = /# English name : (.+)/.exec(fs.readFileSync(file, 'utf8').slice(0, 1000))?.[1].trim();
  if (!nome) throw new Error(`${f}: nome del muscolo mancante`);
  const id = `ZA-${f.slice(0, -4).toLowerCase().replaceAll('_', '-')}`;
  strutture.push({ id, nome, fma: null, strato: 'muscoli', gruppo: null });
  fileObj.set(id, file);
}

const gruppoDi = new Map(strutture.map((s) => [s.id, s.gruppo]));

// File .glb di una struttura: gli organi del solo corpo femminile stanno in un file a parte.
const fileDi = (s) => (s.corpo === 'donna' ? 'organi-donna' : s.strato);

fs.mkdirSync(uscita, { recursive: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;

const riepilogo = {};
for (const strato of ['ossa', 'muscoli', 'organi', 'pelle', 'organi-donna']) {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const scena = doc.createScene(strato);
  let triangoliPrima = 0;
  for (const s of strutture.filter((s) => fileDi(s) === strato)) {
    const { posizioni, indici } = leggiObj(fileObj.get(s.id));
    triangoliPrima += indici.length / 3;
    const prim = doc
      .createPrimitive()
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(posizioni).setBuffer(buffer))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(indici).setBuffer(buffer));
    const mesh = doc.createMesh(s.id).addPrimitive(prim);
    scena.addChild(doc.createNode(s.id).setMesh(mesh));
  }
  await doc.transform(weld());
  for (const m of doc.getRoot().listMeshes()) {
    for (const p of m.listPrimitives()) {
      const triangoli = p.getIndices().getCount() / 3;
      const r =
        strato === 'pelle'
          ? ratioPelle
          : strato === 'muscoli' && m.getName().startsWith('ZA-')
            ? Math.min(1, triangoliMuscoli / triangoli)
            : m.getName().startsWith('ZA-')
              ? // Le paratiroidi hanno poco più di 100 triangoli: ridotte, perderebbero la forma.
                triangoli < 200
                ? 1
                : ratioPolmoni
              : m.getName().startsWith('HRA-')
                ? Math.min(1, triangoliDonna / triangoli)
                : gruppoDi.get(m.getName()) === 'occhi'
                  ? ratioOcchi
                  : ratio;
      simplifyPrimitive(p, { simplifier: MeshoptSimplifier, ratio: r, error: errore });
    }
  }
  await doc.transform(prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  let triangoliDopo = 0;
  for (const m of doc.getRoot().listMeshes())
    for (const p of m.listPrimitives()) triangoliDopo += p.getIndices().getCount() / 3;
  const file = path.join(uscita, `${strato}.glb`);
  await io.write(file, doc);
  riepilogo[strato] = {
    strutture: strutture.filter((s) => fileDi(s) === strato).length,
    triangoliPrima,
    triangoliDopo,
    kB: Math.round(fs.statSync(file).size / 1024),
  };
}

fs.writeFileSync(path.join(uscita, 'strutture.json'), JSON.stringify(strutture));
fs.writeFileSync(
  path.join(uscita, 'riepilogo.json'),
  JSON.stringify(
    { ratio, ratioPelle, ratioPolmoni, ratioOcchi, triangoliDonna, triangoliMuscoli, errore, riepilogo },
    null,
    2,
  ),
);
console.table(riepilogo);
