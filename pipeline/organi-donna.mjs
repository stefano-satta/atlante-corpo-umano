// Prepara gli organi del corpo femminile dallo Human Reference Atlas (HRA) e li allinea al corpo
// di BodyParts3D; aggiunge una vagina schematica, che l'HRA non contiene (D29).
//
// Uso: npm run modelli:donna (dopo npm run modelli:scarica), poi npm run modelli:prepara.
// Opzioni: --hra <cartella> (predefinita dati-sorgente/hra), --bp3d <cartella degli OBJ>.
//
// Scarica in dati-sorgente/hra/ (esclusa da git) i file .glb dell'HRA, ne controlla l'impronta e
// scrive in dati-sorgente/hra/allineati/ un OBJ per struttura, in coordinate di BodyParts3D
// (millimetri, asse Z in alto), con un'intestazione nello stesso formato: prepara-modelli.mjs li
// tratta come gli altri organi.
//
// Allineamento: i due corpi sono diversi (BodyParts3D è un uomo, l'HRA la donna del Visible Human
// Project), quindi la posizione è approssimata.
// - Utero, tube e ovaie: similitudine (scala, rotazione, traslazione) stimata con ICP fra la pelvi
//   femminile dell'HRA e le ossa dell'anca e il sacro di BodyParts3D.
// - Mammelle: stessa scala e rotazione, traslazione stimata fra sterno e manubrio dell'HRA e quelli
//   di BodyParts3D (il torace della donna HRA ha proporzioni diverse da quelle del nostro corpo).
// I file della pelvi, dello sterno e del manubrio servono solo all'allineamento.
//
// Vagina: ricostruzione schematica da SEER Training, "Genital Tract" (consultato il 2026-10-24):
// un tubo di circa 10 cm dalla cervice all'esterno, fra vescica e retto, inclinato all'indietro
// mentre sale, con la cervice che vi sporge quasi ad angolo retto. Il tubo parte dalla giunzione
// cervico-vaginale dell'HRA, ne prende larghezza e spessore, e scende perpendicolare all'asse della
// cervice; la sezione è un'ellisse costante. La lunghezza di SEER, riportata alla scala della pelvi,
// si accorcia se serve perché il tubo non scenda sotto il piano del perineo, cioè sotto il punto più
// basso delle tuberosità ischiatiche di BodyParts3D: nel modello la cervice è vicina all'uscita
// della pelvi e un tubo più lungo sporgerebbe fra le cosce.
//
// Licenza dei dati: HRA 3D Reference Object Library, CC BY 4.0 (https://humanatlas.io/3d-reference-library).

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { convertiVertice, versoBodyParts3D } from './classifica.mjs';
import { angoloRotazione, applica, campiona, centroide, icp, piuVicino } from './geometria.mjs';

const arg = (nome, predefinito) => {
  const i = process.argv.indexOf(`--${nome}`);
  return i > -1 ? process.argv[i + 1] : predefinito;
};
const cartella = arg('hra', 'dati-sorgente/hra');
const cartellaObj = arg('bp3d', 'dati-sorgente/bodyparts3d/isa_BP3D_4.0_obj_99');
const uscita = path.join(cartella, 'allineati');

const CDN = 'https://cdn.humanatlas.io/digital-objects/ref-organ';
// Versioni e impronte SHA-256 dei file ispezionati il 2026-10-24: se un file cambia, va ricontrollato.
const FILE = {
  utero: ['uterus-female/v1.2', '3d-vh-f-uterus', '41014d2b222c2dbbe8d1cc38206b0099ce76d79659a9fdea9f28b8c7d669b864'],
  tubaSx: [
    'fallopian-tube-female-left/v1.2',
    '3d-vh-f-fallopian-tube-l',
    '34817c498e038b599b338f8a35e6c1b3cbda576255c4f2ecca6d9efdebac6c15',
  ],
  tubaDx: [
    'fallopian-tube-female-right/v1.2',
    '3d-vh-f-fallopian-tube-r',
    'eec911de07307d1a27cfe27c939e3f3562590e5c419e27decaf3b1d7b13ab038',
  ],
  ovaioSx: [
    'ovary-female-left/v1.3',
    '3d-vh-f-ovary-l',
    'defd5cdc4b053b4e92193c5864bab2abae1807864ffde8bde7a7cb57f4736609',
  ],
  ovaioDx: [
    'ovary-female-right/v1.3',
    '3d-vh-f-ovary-r',
    '381df741bf3d2511716e68db3ff70d94c0eda770d28a503af2d9fcb7b65113f8',
  ],
  mammellaSx: [
    'mammary-gland-female-left/v1.1',
    '3d-vh-f-mammary-gland-l',
    'e279f2dacb93d44b59dade4f52ed209ddffc1600f228bd544d464dc50663d7d5',
  ],
  mammellaDx: [
    'mammary-gland-female-right/v1.1',
    '3d-vh-f-mammary-gland-r',
    '07d176a3a93761e63de47f86628617e763973cb983ce77d92ec62e8f00a1e1db',
  ],
  pelvi: ['pelvis-female/v1.3', '3d-vh-f-pelvis', '6ef3436e42b7203afcdfa075e57098e97c4e1aaaec08cfdacf6300ba3d5a551d'],
  sterno: [
    'sternum-female/v1.0',
    '3d-vh-f-sternum',
    '530d45a6f7919b29fead3e66e8fa95dd18380e3069d5fbdcd0fd18a8cc230535',
  ],
  manubrio: [
    'manubrium-female/v1.0',
    '3d-vh-f-manubrium',
    '65d757efc43367e5245f76c11689e9b50ba07115e575f9ce90c5c47bfb17c70e',
  ],
};

// Strutture da esportare: nome inglese (riconosciuto da gruppi-organi.mjs), file HRA, parti e
// allineamento. Dell'utero si usano le parti che ne formano la superficie: le pareti anteriore e
// posteriore e gli orifizi ricoprono le stesse zone. Della mammella si usano la forma esterna
// (tessuto adiposo), l'areola e il capezzolo: lobi e dotti, interni, non si vedrebbero.
const STRUTTURE = [
  {
    nome: 'Uterus',
    file: 'utero',
    parti: /^VH_F_(body_of_uterus|fundus_of_uterus|lower_uterine_segment|cervix|cornua)$/,
    allineamento: 'pelvi',
  },
  { nome: 'Left uterine tube', file: 'tubaSx', parti: /./, allineamento: 'pelvi' },
  { nome: 'Right uterine tube', file: 'tubaDx', parti: /./, allineamento: 'pelvi' },
  { nome: 'Left ovary', file: 'ovaioSx', parti: /./, allineamento: 'pelvi' },
  { nome: 'Right ovary', file: 'ovaioDx', parti: /./, allineamento: 'pelvi' },
  { nome: 'Left breast', file: 'mammellaSx', parti: /^VH_F_(fat|areola|nipple)_L$/, allineamento: 'sterno' },
  { nome: 'Right breast', file: 'mammellaDx', parti: /^VH_F_(fat|areola|nipple)_R$/, allineamento: 'sterno' },
];
// Soglia oltre la quale l'allineamento non è accettato: scarto medio, in mm.
const SCARTO_MASSIMO_MM = 8;
// Vagina (SEER Training, "Genital Tract"): circa 10 cm, in metri, prima della scala del corpo.
const LUNGHEZZA_VAGINA_SEER = 0.1;

fs.mkdirSync(uscita, { recursive: true });
for (const [, [percorso, nome, impronta]] of Object.entries(FILE)) {
  const file = path.join(cartella, `${nome}.glb`);
  if (!fs.existsSync(file)) {
    console.log(`scarico ${nome}.glb…`);
    const risposta = await fetch(`${CDN}/${percorso}/assets/${nome}.glb`);
    if (!risposta.ok) throw new Error(`${nome}.glb: HTTP ${risposta.status}`);
    fs.writeFileSync(file, Buffer.from(await risposta.arrayBuffer()));
  }
  const calcolata = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if (calcolata !== impronta) throw new Error(`${nome}.glb diverso da quello ispezionato (${calcolata})`);
}

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });

/** Parti di un file HRA (metri, asse Y in alto come three.js), in coordinate del mondo. */
async function leggiHra(chiave, parti = /./) {
  const doc = await io.read(path.join(cartella, `${FILE[chiave][1]}.glb`));
  const mesh = [];
  for (const n of doc.getRoot().listNodes()) {
    const m = n.getMesh();
    if (!m || !parti.test(n.getName())) continue;
    const W = n.getWorldMatrix();
    for (const p of m.listPrimitives()) {
      const a = p.getAttribute('POSITION');
      const e = [0, 0, 0];
      const vertici = [];
      for (let i = 0; i < a.getCount(); i++) {
        a.getElement(i, e);
        vertici.push([0, 1, 2].map((r) => W[r] * e[0] + W[4 + r] * e[1] + W[8 + r] * e[2] + W[12 + r]));
      }
      const indici = p.getIndices()?.getArray() ?? Uint32Array.from(vertici.keys());
      mesh.push({ nome: n.getName(), vertici, indici: [...indici] });
    }
  }
  if (!mesh.length) throw new Error(`${chiave}: nessuna parte corrisponde a ${parti}`);
  return mesh;
}
const puntiHra = async (chiave, parti) => (await leggiHra(chiave, parti)).flatMap((m) => m.vertici);

/** Vertici di un OBJ di BodyParts3D, nelle coordinate di three.js. */
function puntiBp3d(...id) {
  const punti = [];
  for (const i of id)
    for (const r of fs.readFileSync(path.join(cartellaObj, `${i}.obj`), 'utf8').split('\n'))
      if (r.startsWith('v ')) {
        const [, x, y, z] = r.split(/\s+/).map(Number);
        punti.push(convertiVertice(x, y, z));
      }
  return punti;
}

// Pelvi: anca sinistra e destra (osso compatto di ileo, ischio e pube) e sacro.
const pelvi = icp([
  [
    campiona(await puntiHra('pelvi', /^VH_F_(ilium|ischium|pubis)_compact_bone_L$/), 3000),
    campiona(puntiBp3d('FJ3288'), 3000),
  ],
  [
    campiona(await puntiHra('pelvi', /^VH_F_(ilium|ischium|pubis)_compact_bone_R$/), 3000),
    campiona(puntiBp3d('FJ3152'), 3000),
  ],
  [campiona(await puntiHra('pelvi', /^VH_F_sacrum$/), 2000), campiona(puntiBp3d('FJ3393'), 2000)],
]);
// Sterno: corpo (FJ3178) e manubrio (FJ3290), solo traslazione.
const sterno = icp(
  [
    [
      campiona([...(await puntiHra('sterno')), ...(await puntiHra('manubrio'))], 3000),
      campiona(puntiBp3d('FJ3178', 'FJ3290'), 3000),
    ],
  ],
  { iniziale: pelvi.T, soloTraslazione: true },
);
const trasformazioni = { pelvi: pelvi.T, sterno: sterno.T };
const rapporto = {
  pelvi: {
    scarto_mm: +(pelvi.scarto * 1000).toFixed(2),
    scala: +pelvi.T.s.toFixed(4),
    rotazione_gradi: +angoloRotazione(pelvi.T.R).toFixed(2),
    traslazione_mm: pelvi.T.t.map((x) => +(x * 1000).toFixed(1)),
  },
  sterno: {
    scarto_mm: +(sterno.scarto * 1000).toFixed(2),
    spostamento_dalla_pelvi_mm: sterno.T.t.map((x, k) => +((x - pelvi.T.t[k]) * 1000).toFixed(1)),
  },
  strutture: {},
};
for (const [nome, { scarto }] of Object.entries({ pelvi, sterno }))
  if (scarto * 1000 > SCARTO_MASSIMO_MM)
    throw new Error(`allineamento ${nome}: scarto medio ${(scarto * 1000).toFixed(1)} mm oltre ${SCARTO_MASSIMO_MM}`);

function scriviObj(nome, mesh, intestazione) {
  const righe = [...intestazione, `# English name : ${nome}`];
  let base = 1;
  for (const m of mesh) {
    for (const p of m.vertici)
      righe.push(
        `v ${versoBodyParts3D(...p)
          .map((x) => x.toFixed(4))
          .join(' ')}`,
      );
    for (let i = 0; i < m.indici.length; i += 3)
      righe.push(`f ${m.indici[i] + base} ${m.indici[i + 1] + base} ${m.indici[i + 2] + base}`);
    base += m.vertici.length;
  }
  fs.writeFileSync(path.join(uscita, `${nome.replaceAll(' ', '_')}.obj`), `${righe.join('\n')}\n`);
  rapporto.strutture[nome] = {
    vertici: base - 1,
    triangoli: mesh.reduce((s, m) => s + m.indici.length / 3, 0),
  };
}

const INTESTAZIONE_HRA = [
  '# Human Reference Atlas, 3D Reference Object Library (HuBMAP), CC BY 4.0',
  '# Allineato a BodyParts3D 4.0 da pipeline/organi-donna.mjs; coordinate in mm, asse Z in alto',
];
for (const s of STRUTTURE) {
  const T = trasformazioni[s.allineamento];
  const mesh = (await leggiHra(s.file, s.parti)).map((m) => ({ ...m, vertici: m.vertici.map((p) => applica(T, p)) }));
  scriviObj(s.nome, mesh, [...INTESTAZIONE_HRA, `# Parti HRA : ${mesh.map((m) => m.nome).join(', ')}`]);
}

// Vagina schematica. La lunghezza di SEER si riporta alla scala del corpo dell'atlante, come gli
// altri organi femminili (la donna HRA è più grande del corpo di BodyParts3D), e si limita al
// piano del perineo.
const T = pelvi.T;
const giunzione = (await puntiHra('utero', /^VH_F_cervicovaginal_junction$/)).map((p) => applica(T, p));
const orifizioInterno = centroide((await puntiHra('utero', /^VH_F_internal_cervical_os$/)).map((p) => applica(T, p)));
const orifizioEsterno = centroide((await puntiHra('utero', /^VH_F_external_cervical_os$/)).map((p) => applica(T, p)));
const normalizza = (v) => v.map((x) => x / Math.hypot(...v));
const asseCervice = normalizza(orifizioEsterno.map((x, k) => x - orifizioInterno[k]));
// Direzione della vagina: nel piano sagittale, perpendicolare all'asse della cervice, verso il basso.
let direzione = normalizza([0, -asseCervice[2], asseCervice[1]]);
if (direzione[1] > 0) direzione = direzione.map((x) => -x);
const laterale = [1, 0, 0];
const anteroposteriore = normalizza([0, direzione[2], -direzione[1]]);
const inizio = centroide(giunzione);
const perineo = Math.min(...puntiBp3d('FJ3288', 'FJ3152').map((p) => p[1]));
const LUNGHEZZA_VAGINA = Math.min(LUNGHEZZA_VAGINA_SEER * T.s, (inizio[1] - perineo) / -direzione[1]);
const ampiezza = (asse) => {
  const proiezioni = giunzione.map((p) => p.reduce((s, x, k) => s + (x - inizio[k]) * asse[k], 0));
  return (Math.max(...proiezioni) - Math.min(...proiezioni)) / 2;
};
const semiLarghezza = ampiezza(laterale);
const semiSpessore = ampiezza(anteroposteriore);
const ANELLI = 16;
const LATI = 24;
const vertici = [];
const indici = [];
for (let a = 0; a <= ANELLI; a++) {
  const c = inizio.map((x, k) => x + direzione[k] * LUNGHEZZA_VAGINA * (a / ANELLI));
  for (let l = 0; l < LATI; l++) {
    const th = (2 * Math.PI * l) / LATI;
    const [u, v] = [Math.cos(th) * semiLarghezza, Math.sin(th) * semiSpessore];
    vertici.push(c.map((x, k) => x + laterale[k] * u + anteroposteriore[k] * v));
  }
}
for (let a = 0; a < ANELLI; a++)
  for (let l = 0; l < LATI; l++) {
    const [i, j] = [a * LATI + l, a * LATI + ((l + 1) % LATI)];
    indici.push(i, i + LATI, j, j, i + LATI, j + LATI);
  }
// Chiusura dei due capi con un vertice centrale.
for (const [a, verso] of [
  [0, 1],
  [ANELLI, -1],
]) {
  const centro = vertici.length;
  vertici.push(inizio.map((x, k) => x + direzione[k] * LUNGHEZZA_VAGINA * (a / ANELLI)));
  for (let l = 0; l < LATI; l++) {
    const [i, j] = [a * LATI + l, a * LATI + ((l + 1) % LATI)];
    indici.push(...(verso > 0 ? [centro, j, i] : [centro, i, j]));
  }
}
// Il verso delle facce deve guardare all'esterno: si controlla su un triangolo del fianco.
{
  const [i, j, k] = indici.slice(0, 3).map((n) => vertici[n]);
  const e1 = j.map((x, n) => x - i[n]);
  const e2 = k.map((x, n) => x - i[n]);
  const normale = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
  const asse = inizio.map(
    (x, n) => i[n] - x - direzione[n] * direzione.reduce((s, d, m) => s + d * (i[m] - inizio[m]), 0),
  );
  if (normale.reduce((s, x, n) => s + x * asse[n], 0) < 0)
    for (let n = 0; n < indici.length; n += 3) [indici[n + 1], indici[n + 2]] = [indici[n + 2], indici[n + 1]];
}
scriviObj(
  'Vagina',
  [{ nome: 'ricostruzione schematica', vertici, indici }],
  [
    '# Ricostruzione schematica (D29): non deriva da dati anatomici di una persona',
    '# Origine e direzione da HRA (giunzione cervico-vaginale, asse della cervice), CC BY 4.0;',
    '# lunghezza e decorso da SEER Training, Genital Tract; generata da pipeline/organi-donna.mjs',
    '# Coordinate in mm, asse Z in alto',
  ],
);

// Controlli sulla vagina: angolo con la cervice, distanza da vescica e retto di BodyParts3D.
const fine = inizio.map((x, k) => x + direzione[k] * LUNGHEZZA_VAGINA);
const assi = Array.from({ length: 11 }, (_, i) => inizio.map((x, k) => x + direzione[k] * LUNGHEZZA_VAGINA * (i / 10)));
const vescica = puntiBp3d('FJ3149');
const retto = puntiBp3d('FJ2571');
rapporto.vagina = {
  lunghezza_mm: +(LUNGHEZZA_VAGINA * 1000).toFixed(1),
  lunghezza_seer_in_scala_mm: +(LUNGHEZZA_VAGINA_SEER * T.s * 1000).toFixed(1),
  larghezza_mm: +(semiLarghezza * 2000).toFixed(1),
  spessore_mm: +(semiSpessore * 2000).toFixed(1),
  angolo_con_la_cervice_gradi: +(
    (Math.acos(asseCervice.reduce((s, x, k) => s + x * direzione[k], 0)) * 180) /
    Math.PI
  ).toFixed(1),
  inclinazione_sulla_verticale_gradi: +((Math.acos(-direzione[1]) * 180) / Math.PI).toFixed(1),
  verso_avanti_scendendo: direzione[2] > 0,
  inizio_mm: versoBodyParts3D(...inizio).map((x) => +x.toFixed(1)),
  fine_mm: versoBodyParts3D(...fine).map((x) => +x.toFixed(1)),
  distanza_minima_asse_vescica_mm: +(Math.min(...assi.map((p) => piuVicino(p, vescica).distanza)) * 1000).toFixed(1),
  distanza_minima_asse_retto_mm: +(Math.min(...assi.map((p) => piuVicino(p, retto).distanza)) * 1000).toFixed(1),
};

fs.writeFileSync(path.join(uscita, 'rapporto.json'), JSON.stringify(rapporto, null, 2));
console.log(JSON.stringify(rapporto, null, 2));
