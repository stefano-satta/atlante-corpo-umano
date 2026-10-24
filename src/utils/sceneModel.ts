import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ModelElements } from '@/models/content';
import type { ModelElement, ModelLayer, SceneUnit } from '@/models/scene';
import { ORGANS_BY_ID } from './organs';

const LAYER_COLORS: Record<ModelLayer, string> = {
  ossa: '#d9d2c5',
  muscoli: '#a8574f',
  organi: '#b0897c',
  pelle: '#e4e0d8',
};

/** Come appare un'unità: nascosta, attenuata (semitrasparente) o piena. */
export const UNIT_HIDDEN = 0;
export const UNIT_DIMMED = 1;
export const UNIT_FULL = 2;

export function createUnits(elements: ModelElement[]) {
  const units = new Map<string, SceneUnit>();
  for (const e of elements) {
    const id = e.gruppo ?? e.id;
    if (!units.has(id))
      units.set(id, {
        index: units.size + 1,
        id,
        layer: e.strato,
        fmaName: e.nome,
        fma: e.fma,
        box: new THREE.Box3(),
        anchor: new THREE.Vector3(),
      });
  }
  return units;
}

/**
 * Punto della superficie rivolta in avanti più vicino al centro dell'ingombro visto di fronte.
 * Il centro dell'ingombro non basta: negli organi doppi, come i polmoni, cade nello
 * spazio fra le due parti, cioè su un'altra struttura.
 */
export function calloutAnchor(
  positions: ArrayLike<number>,
  normals: ArrayLike<number>,
  box: THREE.Box3,
  anchor: THREE.Vector3,
) {
  const c = box.getCenter(new THREE.Vector3());
  const depth = box.max.z - box.min.z || 1;
  // Solo le facce rivolte verso chi guarda (il davanti del corpo è verso +Z); se non ce ne sono, tutte.
  let threshold = 0.6;
  if (![...Array(positions.length / 3).keys()].some((k) => normals[k * 3 + 2] > threshold)) threshold = -1;
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < positions.length; i += 3) {
    if (normals[i + 2] <= threshold) continue;
    const dx = positions[i] - c.x;
    const dy = positions[i + 1] - c.y;
    const dz = (box.max.z - positions[i + 2]) / depth;
    const score = dx * dx + dy * dy + 0.01 * dz * dz;
    if (score < best) {
      best = score;
      anchor.set(positions[i], positions[i + 1], positions[i + 2]);
    }
  }
  return anchor;
}

/**
 * Converte le mesh di uno strato (quantizzate da meshopt) in geometrie float con
 * normali, colore per vertice e attributo aUnit; aggiorna l'ingombro delle unità.
 * Restituisce un'unica geometria per strato (D13: 3 chiamate di disegno invece di 484).
 */
export function prepareLayer(
  scene: THREE.Object3D,
  elements: Map<string, ModelElement>,
  units: Map<string, SceneUnit>,
): THREE.BufferGeometry | null {
  scene.updateMatrixWorld(true);
  const geometries: THREE.BufferGeometry[] = [];
  const parts = new Map<SceneUnit, THREE.BufferGeometry[]>();
  const v = new THREE.Vector3();
  const color = new THREE.Color();

  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const el = elements.get(mesh.name);
    const u = el && units.get(el.gruppo ?? el.id);
    if (!el || !u || !mesh.geometry.index) return;
    const source = mesh.geometry.getAttribute('position');
    const n = source.count;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      v.fromBufferAttribute(source, i).applyMatrix4(mesh.matrixWorld);
      v.toArray(pos, i * 3);
      u.box.expandByPoint(v);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setIndex(new THREE.BufferAttribute(Uint32Array.from(mesh.geometry.index.array), 1));
    g.computeVertexNormals();
    parts.set(u, [...(parts.get(u) ?? []), g]);
    g.setAttribute('aUnit', new THREE.BufferAttribute(new Float32Array(n).fill(u.index), 1));
    color.set(ORGANS_BY_ID.get(u.id)?.color ?? LAYER_COLORS[el.strato]);
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) color.toArray(col, i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geometries.push(g);
  });

  for (const [u, gs] of parts) {
    const merged = gs.length > 1 ? mergeGeometries(gs) : gs[0];
    calloutAnchor(merged.getAttribute('position').array, merged.getAttribute('normal').array, u.box, u.anchor);
    if (merged !== gs[0]) merged.dispose();
  }

  const layer = mergeGeometries(geometries);
  for (const g of geometries) g.dispose();
  return layer;
}

/**
 * Stato di ogni unità, indicizzato per `SceneUnit.index`. Senza un fuoco sono piene le unità
 * degli strati visibili. Con un fuoco (la struttura selezionata, o le strutture evidenziate
 * da un passo di percorso) sono piene solo quelle del fuoco, anche se stanno in uno strato
 * nascosto, e le altre degli strati visibili sono attenuate.
 */
export function unitStates(
  units: Map<string, SceneUnit>,
  visible: readonly ModelLayer[],
  focus: ReadonlySet<string> | null,
) {
  const states = new Uint8Array(units.size + 1);
  for (const u of units.values()) {
    const isVisible = visible.includes(u.layer);
    if (!focus?.size) states[u.index] = isVisible ? UNIT_FULL : UNIT_HIDDEN;
    else states[u.index] = focus.has(u.id) ? UNIT_FULL : isVisible ? UNIT_DIMMED : UNIT_HIDDEN;
  }
  return states;
}

/** Unità indicate da un contenuto: organi per gruppo, ossa e muscoli per FMA (anche più unità per FMA). */
export function unitsForElements(elements: ModelElements, units: Map<string, SceneUnit>) {
  const ids = elements.gruppi.filter((g) => units.has(g));
  for (const u of units.values()) if (u.fma && elements.fma.includes(u.fma)) ids.push(u.id);
  return ids;
}

/** Ingombro complessivo di più unità. */
export function boundingBoxOf(ids: string[], units: Map<string, SceneUnit>) {
  const box = new THREE.Box3();
  for (const id of ids) {
    const u = units.get(id);
    if (u) box.union(u.box);
  }
  return box;
}
