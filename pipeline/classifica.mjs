import { GRUPPI_ORGANI } from './gruppi-organi.mjs';

/**
 * Da millimetri con asse Z verso l'alto (BodyParts3D) a metri con asse Y verso
 * l'alto (three.js); la parte anteriore del corpo guarda verso +Z.
 */
export function convertiVertice(x, y, z) {
  return [x / 1000, z / 1000, -y / 1000];
}

/** Inversa di `convertiVertice`: da metri (three.js) a millimetri di BodyParts3D. */
export function versoBodyParts3D(x, y, z) {
  return [x * 1000, -z * 1000, y * 1000];
}

// Vasi sanguigni (D44): il nome cita il tipo di vaso, oppure è uno dei pochi tronchi e archi che non lo cita.
const VASO =
  /\b(arter(y|ies)|arterial|aorta|veins?|vena|venous|tributary)\b|^(Left |Right )?(celiac trunk|coronary sinus|costocervical trunk|deep palmar arch|plantar arch|thyrocervical trunk|pulmonary trunk)$/i;
const VENA = /\b(veins?|vena|venous|tributary)\b|coronary sinus/i;
// Circolo polmonare: il tronco, le arterie e le vene polmonari e i loro rami segmentali e lingulari. Nel
// fegato e nel rene il nome dei rami è diverso ("segmental hepatic artery", "segmental branch").
const POLMONARE = /pulmonary|segmental (artery|vein)|lingular (artery|vein)|right apical segmental vein/i;
const SOLO_UOMO = /penis|testicular/i;
// Elementi con la stessa geometria di un altro (misurato sui vertici), o che riuniscono due tratti già
// presenti: l'aorta discendente è toracica più addominale. Si tiene un elemento solo.
const VASI_DOPPI = new Set(['FJ1846', 'FJ2013', 'FJ2011', 'FJ2386', 'FJ2394', 'FJ3082', 'FJ3427', 'FJ3534']);

/**
 * Dati di un vaso: `vaso` è il tipo anatomico, `sangue` il colore con cui si mostra (come nello schema
 * del ciclo cardiaco, il circolo polmonare è invertito). I pezzi con lo stesso nome formano una sola
 * unità; i vasi di un solo corpo lo indicano in `corpo` e hanno un gruppo a parte. I vasi di
 * Z-Anatomy dichiarano il `tipo` nel file: fra loro ci sono nomi come "Superior sagittal sinus".
 */
export function classificaVaso(id, nome, tipo) {
  if (!tipo && (!VASO.test(nome) || /nerve|ganglion|biliary/i.test(nome) || VASI_DOPPI.has(id))) return null;
  const vaso = tipo ?? (VENA.test(nome) ? 'vena' : 'arteria');
  const povero = POLMONARE.test(nome) ? vaso === 'arteria' : vaso === 'vena';
  const uomo = SOLO_UOMO.test(nome);
  const slug = nome.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    strato: 'vasi',
    gruppo: `vaso-${uomo ? 'uomo-' : ''}${slug}`,
    vaso,
    sangue: povero ? 'povero' : 'ricco',
    ...(uomo ? { corpo: 'uomo' } : {}),
  };
}

/**
 * Strato e organo di un elemento. `ossa` e `muscoli` sono gli insiemi di id che
 * BodyParts3D colloca sotto "bone organ" e "muscle organ". I vasi formano uno strato a sé anche quando
 * il nome cita un organo (es. "Branch of … gyrus"); i nervi sono esclusi dagli organi, tranne quelli
 * dei gruppi che li ammettono (il nervo ottico).
 */
export function classifica(id, nome, ossa, muscoli) {
  if (nome === 'Skin') return { strato: 'pelle', gruppo: null };
  if (ossa.has(id) || /costal cartilage$/i.test(nome)) return { strato: 'ossa', gruppo: null };
  if (muscoli.has(id)) return { strato: 'muscoli', gruppo: null };
  const vaso = classificaVaso(id, nome);
  if (vaso) return vaso;
  const g = GRUPPI_ORGANI.find((g) => g.elementi.test(nome));
  if (/artery|vein|branch|nerve|tributary/i.test(nome) && !g?.nervo) return null;
  if (!g) return null;
  return g.corpo ? { strato: 'organi', gruppo: g.id, corpo: g.corpo } : { strato: 'organi', gruppo: g.id };
}
