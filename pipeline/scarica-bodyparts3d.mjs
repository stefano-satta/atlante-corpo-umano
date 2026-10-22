// Scarica i dati originali di BodyParts3D dall'archivio ufficiale DBCLS in
// dati-sorgente/bodyparts3d/ (esclusa da git) ed estrae gli OBJ.
//
// Uso: npm run modelli:scarica
// Richiede il comando di sistema `unzip`.
//
// Licenza dei dati: BodyParts3D, © The Database Center for Life Science, CC BY 4.0
// (https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html).

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ARCHIVIO = 'https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST';
const FILE = ['isa_element_parts.txt', 'isa_parts_list_e.txt', 'isa_BP3D_4.0_obj_99.zip'];
const destinazione = path.resolve('dati-sorgente/bodyparts3d');

fs.mkdirSync(destinazione, { recursive: true });

for (const nome of FILE) {
  const file = path.join(destinazione, nome);
  if (fs.existsSync(file)) {
    console.log(`già presente: ${nome}`);
    continue;
  }
  console.log(`scarico ${nome}…`);
  const risposta = await fetch(`${ARCHIVIO}/${nome}`);
  if (!risposta.ok) throw new Error(`${nome}: HTTP ${risposta.status}`);
  const temporaneo = `${file}.parziale`;
  fs.writeFileSync(temporaneo, Buffer.from(await risposta.arrayBuffer()));
  fs.renameSync(temporaneo, file);
}

const cartellaObj = path.join(destinazione, 'isa_BP3D_4.0_obj_99');
if (!fs.existsSync(cartellaObj)) {
  console.log('estraggo gli OBJ…');
  execFileSync('unzip', ['-q', path.join(destinazione, 'isa_BP3D_4.0_obj_99.zip'), '-d', destinazione]);
}
console.log(`pronto: ${fs.readdirSync(cartellaObj).length} file OBJ in ${cartellaObj}`);
