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
  /** Punto della superficie a cui arriva la linea di richiamo (vedi `ancoraRichiamo`). */
  ancora: THREE.Vector3;
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
        ancora: new THREE.Vector3(),
      });
  }
  return unita;
}

/**
 * Punto della superficie rivolta in avanti più vicino al centro dell'ingombro visto di fronte.
 * Il centro dell'ingombro non basta: negli organi doppi, come i polmoni, cade nello
 * spazio fra le due parti, cioè su un'altra struttura.
 */
export function ancoraRichiamo(
  posizioni: ArrayLike<number>,
  normali: ArrayLike<number>,
  box: THREE.Box3,
  ancora: THREE.Vector3,
) {
  const c = box.getCenter(new THREE.Vector3());
  const profondita = box.max.z - box.min.z || 1;
  // Solo le facce rivolte verso chi guarda (il davanti del corpo è verso +Z); se non ce ne sono, tutte.
  let soglia = 0.6;
  if (![...Array(posizioni.length / 3).keys()].some((k) => normali[k * 3 + 2] > soglia)) soglia = -1;
  let migliore = Number.POSITIVE_INFINITY;
  for (let i = 0; i < posizioni.length; i += 3) {
    if (normali[i + 2] <= soglia) continue;
    const dx = posizioni[i] - c.x;
    const dy = posizioni[i + 1] - c.y;
    const dz = (box.max.z - posizioni[i + 2]) / profondita;
    const punteggio = dx * dx + dy * dy + 0.01 * dz * dz;
    if (punteggio < migliore) {
      migliore = punteggio;
      ancora.set(posizioni[i], posizioni[i + 1], posizioni[i + 2]);
    }
  }
  return ancora;
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
  const parti = new Map<Unita, THREE.BufferGeometry[]>();
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
    parti.set(u, [...(parti.get(u) ?? []), g]);
    g.setAttribute('aUnit', new THREE.BufferAttribute(new Float32Array(n).fill(u.indice), 1));
    colore.set(ORGANI_PER_ID.get(u.id)?.colore ?? COLORI_STRATO[el.strato]);
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) colore.toArray(col, i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geometrie.push(g);
  });

  for (const [u, gs] of parti) {
    const unione = gs.length > 1 ? mergeGeometries(gs) : gs[0];
    ancoraRichiamo(unione.getAttribute('position').array, unione.getAttribute('normal').array, u.box, u.ancora);
    if (unione !== gs[0]) unione.dispose();
  }

  const unita1 = mergeGeometries(geometrie);
  for (const g of geometrie) g.dispose();
  return unita1;
}

/** Come appare un'unità: nascosta, attenuata (semitrasparente) o piena. */
export const NASCOSTA = 0;
export const ATTENUATA = 1;
export const PIENA = 2;

/**
 * Stato di ogni unità, indicizzato per `Unita.indice`. Senza un fuoco sono piene le unità
 * degli strati visibili. Con un fuoco (la struttura selezionata, o le strutture evidenziate
 * da un passo di percorso) sono piene solo quelle del fuoco, anche se stanno in uno strato
 * nascosto, e le altre degli strati visibili sono attenuate.
 */
export function statiUnita(
  unita: Map<string, Unita>,
  visibili: readonly StratoModello[],
  fuoco: ReadonlySet<string> | null,
) {
  const stati = new Uint8Array(unita.size + 1);
  for (const u of unita.values()) {
    const visibile = visibili.includes(u.strato);
    if (!fuoco?.size) stati[u.indice] = visibile ? PIENA : NASCOSTA;
    else stati[u.indice] = fuoco.has(u.id) ? PIENA : visibile ? ATTENUATA : NASCOSTA;
  }
  return stati;
}

/** Unità indicate da un contenuto: organi per gruppo, ossa e muscoli per FMA (anche più unità per FMA). */
export function unitaPerElementi(elementi: { gruppi: string[]; fma: string[] }, unita: Map<string, Unita>) {
  const ids = elementi.gruppi.filter((g) => unita.has(g));
  for (const u of unita.values()) if (u.fma && elementi.fma.includes(u.fma)) ids.push(u.id);
  return ids;
}

/** Ingombro complessivo di più unità. */
export function ingombro(ids: string[], unita: Map<string, Unita>) {
  const box = new THREE.Box3();
  for (const id of ids) {
    const u = unita.get(id);
    if (u) box.union(u.box);
  }
  return box;
}
