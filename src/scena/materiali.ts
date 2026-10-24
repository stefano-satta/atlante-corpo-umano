import * as THREE from 'three';

// Uniform condivisi da tutti i materiali del corpo: stato di ogni unità (nascosta, attenuata,
// piena; vedi statiUnita) in una texture di una riga, e unità sotto il puntatore. Gli id delle
// unità partono da 1; 0 significa "nessuna".
export const uniformiCorpo = {
  uStati: { value: new THREE.DataTexture(new Uint8Array(1), 1, 1, THREE.RedFormat) },
  uHover: { value: 0 },
};

/** Aggiorna gli stati delle unità letti dagli shader. */
export function impostaStati(stati: Uint8Array) {
  const t = uniformiCorpo.uStati.value;
  if (t.image.width === stati.length) {
    (t.image.data as Uint8Array).set(stati);
    t.needsUpdate = true;
    return;
  }
  const nuova = new THREE.DataTexture(stati.slice(), stati.length, 1, THREE.RedFormat);
  nuova.needsUpdate = true;
  uniformiCorpo.uStati.value = nuova;
  t.dispose();
}

// Stato dell'unità del frammento: 0 nascosta, 1 attenuata, 2 piena.
const LEGGI_STATO = 'float stato = texelFetch(uStati, ivec2(int(vUnit + 0.5), 0), 0).r * 255.0;';

function iniettaUnita(shader: THREE.WebGLProgramParametersWithUniforms, frammento: string) {
  Object.assign(shader.uniforms, uniformiCorpo);
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nattribute float aUnit;\nvarying float vUnit;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvUnit = aUnit;');
  shader.fragmentShader = shader.fragmentShader
    .replace(
      '#include <common>',
      '#include <common>\nuniform sampler2D uStati;\nuniform float uHover;\nvarying float vUnit;',
    )
    .replace('#include <color_fragment>', `#include <color_fragment>\n${LEGGI_STATO}\n${frammento}`);
}

/** Strutture piene: le unità nello stato "piena". */
export function materialePieno() {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0 });
  m.onBeforeCompile = (shader) =>
    iniettaUnita(
      shader,
      `if (stato < 1.5) discard;
       if (abs(vUnit - uHover) < 0.5) diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), 0.28);`,
    );
  return m;
}

/** Strutture attenuate: semitrasparenti, attorno alla selezione o alle strutture di un passo. */
export function materialeAttenuato() {
  const m = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    transparent: true,
    opacity: 0.13,
    depthWrite: false,
  });
  m.onBeforeCompile = (shader) =>
    iniettaUnita(
      shader,
      `if (abs(stato - 1.0) > 0.5) discard;
       if (abs(vUnit - uHover) < 0.5) diffuseColor.a = min(1.0, diffuseColor.a * 3.0);`,
    );
  return m;
}

/** Sagoma della pelle: quasi invisibile al centro, più marcata sui contorni. */
export function materialePelle() {
  const m = new THREE.MeshStandardMaterial({
    color: '#e9e4ef',
    roughness: 1,
    transparent: true,
    opacity: 0.05,
    depthWrite: false,
    side: THREE.FrontSide,
  });
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
       float bordo = 1.0 - abs(dot(normalize(normal), normalize(vViewPosition)));
       gl_FragColor.a *= 0.6 + 5.0 * pow(bordo, 3.0);`,
    );
  };
  return m;
}

/** Materiale per la selezione via GPU: codifica l'id dell'unità nel colore. Le unità nascoste non si scelgono. */
export const materialeSelezione = new THREE.ShaderMaterial({
  uniforms: uniformiCorpo,
  vertexShader: `attribute float aUnit;
    varying float vUnit;
    void main() {
      vUnit = aUnit;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: `precision highp float;
    uniform sampler2D uStati;
    varying float vUnit;
    void main() {
      ${LEGGI_STATO}
      if (stato < 0.5) discard;
      float id = floor(vUnit + 0.5);
      gl_FragColor = vec4(mod(id, 256.0) / 255.0, floor(id / 256.0) / 255.0, 0.0, 1.0);
    }`,
});
