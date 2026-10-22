import { GRUPPI_ORGANI } from './gruppi-organi.mjs';

/**
 * Da millimetri con asse Z verso l'alto (BodyParts3D) a metri con asse Y verso
 * l'alto (three.js); la parte anteriore del corpo guarda verso +Z.
 */
export function convertiVertice(x, y, z) {
  return [x / 1000, z / 1000, -y / 1000];
}

/**
 * Strato e organo di un elemento. `ossa` e `muscoli` sono gli insiemi di id che
 * BodyParts3D colloca sotto "bone organ" e "muscle organ". Vasi e nervi sono
 * esclusi dagli organi anche quando il nome cita un organo (es. "Branch of … gyrus").
 */
export function classifica(id, nome, ossa, muscoli) {
  if (nome === 'Skin') return { strato: 'pelle', gruppo: null };
  if (ossa.has(id) || /costal cartilage$/i.test(nome)) return { strato: 'ossa', gruppo: null };
  if (muscoli.has(id)) return { strato: 'muscoli', gruppo: null };
  if (/artery|vein|branch|nerve|tributary/i.test(nome)) return null;
  const g = GRUPPI_ORGANI.find((g) => g.elementi.test(nome));
  return g ? { strato: 'organi', gruppo: g.id } : null;
}
