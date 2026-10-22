import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ORGANI_PER_ID } from '../contenuti/organi';

export type StratoModello = 'ossa' | 'muscoli' | 'organi' | 'pelle';

/** Una riga di strutture.json, prodotto da scripts/prepara-modelli.mjs. */
export interface Elemento {
  id: string;
  nome: string;
  fma: string | null;
  strato: StratoModello;
  gruppo: string | null;
}

/** Ciò che l'utente seleziona: un organo intero, oppure un singolo osso o muscolo. */
export interface Unita {
  indice: number;
  id: string;
  strato: StratoModello;
  nomeFma: string;
  fma: string | null;
  box: THREE.Box3;
}

const COLORI_STRATO: Record<StratoModello, string> = {
  ossa: '#d9d2c5',
  muscoli: '#a8574f',
  organi: '#b0897c',
  pelle: '#e4e0d8',
};

export function creaUnita(elementi: Elemento[]) {
  const unita = new Map<string, Unita>();
  for (const e of elementi) {
    const id = e.gruppo ?? e.id;
    if (!unita.has(id))
      unita.set(id, {
        indice: unita.size + 1,
        id,
        strato: e.strato,
        nomeFma: e.nome,
        fma: e.fma,
        box: new THREE.Box3(),
      });
  }
  return unita;
}

/**
 * Converte le mesh di uno strato (quantizzate da meshopt) in geometrie float con
 * normali, colore per vertice e attributo aUnit; aggiorna l'ingombro delle unità.
 * Restituisce un'unica geometria per strato (D13: 3 chiamate di disegno invece di 484).
 */
export function preparaStrato(
  scena: THREE.Object3D,
  elementi: Map<string, Elemento>,
  unita: Map<string, Unita>,
): THREE.BufferGeometry | null {
  scena.updateMatrixWorld(true);
  const geometrie: THREE.BufferGeometry[] = [];
  const v = new THREE.Vector3();
  const colore = new THREE.Color();

  scena.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const el = elementi.get(mesh.name);
    const u = el && unita.get(el.gruppo ?? el.id);
    if (!el || !u || !mesh.geometry.index) return;
    const sorgente = mesh.geometry.getAttribute('position');
    const n = sorgente.count;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      v.fromBufferAttribute(sorgente, i).applyMatrix4(mesh.matrixWorld);
      v.toArray(pos, i * 3);
      u.box.expandByPoint(v);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setIndex(new THREE.BufferAttribute(Uint32Array.from(mesh.geometry.index.array), 1));
    g.computeVertexNormals();
    g.setAttribute('aUnit', new THREE.BufferAttribute(new Float32Array(n).fill(u.indice), 1));
    colore.set(ORGANI_PER_ID.get(u.id)?.colore ?? COLORI_STRATO[el.strato]);
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) colore.toArray(col, i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geometrie.push(g);
  });

  const unita1 = mergeGeometries(geometrie);
  for (const g of geometrie) g.dispose();
  return unita1;
}
