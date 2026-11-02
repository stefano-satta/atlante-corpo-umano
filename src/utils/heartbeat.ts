// Battito del cuore 3D quando il cuore è selezionato (D41): animazione semplificata, non in scala.
// Le pareti del cuore si contraggono verso il centro della propria camera, prima gli atri e poi
// i ventricoli; muscoli papillari e valvole seguono i ventricoli. Lo spostamento si calcola nel
// vertex shader, così ogni fotogramma aggiorna solo due uniform.

/** Parte del cuore di un vertice, nell'attributo aBeat: 0 nessuna. */
export const BEAT_NONE = 0;
export const BEAT_LEFT_ATRIUM = 1;
export const BEAT_RIGHT_ATRIUM = 2;
export const BEAT_VENTRICLES = 3;

/** Durata di un battito, in secondi. */
export const BEAT_PERIOD = 1.1;
/** Durata dell'entrata e dell'uscita del battito, in secondi. */
export const BEAT_FADE = 0.4;

/**
 * Parte del cuore di un elemento del modello. Nel modello i due ventricoli sono una sola parete
 * ("Wall of ventricle"): tutto ciò che non è un atrio segue i ventricoli.
 */
export function heartbeatPart(unitId: string, fmaName: string) {
  if (unitId !== 'cuore') return BEAT_NONE;
  if (fmaName === 'Wall of left atrium') return BEAT_LEFT_ATRIUM;
  if (fmaName === 'Wall of right atrium') return BEAT_RIGHT_ATRIUM;
  return BEAT_VENTRICLES;
}

/** Le pareti danno il centro di ogni camera; papillari e valvole no, perché lo sposterebbero. */
export function isHeartWall(fmaName: string) {
  return fmaName.startsWith('Wall of ');
}

/**
 * Funzione GLSL `beat(p)` per il vertex shader, con le sue dichiarazioni. Gli atri si contraggono
 * del 5% nella prima parte del ciclo, i ventricoli dell'8% subito dopo; il resto del ciclo è riposo.
 */
export const BEAT_GLSL = `attribute float aBeat;
uniform float uBeatTime;
uniform float uBeatAmount;
uniform vec3 uBeatPivots[3];
float beatPulse(float t, float a, float b) {
  float x = clamp((t - a) / (b - a), 0.0, 1.0);
  float s = sin(3.14159265 * x);
  return s * s;
}
vec3 beat(vec3 p) {
  if (aBeat < 0.5 || uBeatAmount <= 0.0) return p;
  float t = fract(uBeatTime / ${BEAT_PERIOD.toFixed(2)});
  vec3 o;
  float c;
  if (aBeat < 1.5) { o = uBeatPivots[0]; c = 0.05 * beatPulse(t, 0.0, 0.18); }
  else if (aBeat < 2.5) { o = uBeatPivots[1]; c = 0.05 * beatPulse(t, 0.0, 0.18); }
  else { o = uBeatPivots[2]; c = 0.08 * beatPulse(t, 0.16, 0.52); }
  return o + (p - o) * (1.0 - uBeatAmount * c);
}`;
