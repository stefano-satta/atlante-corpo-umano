import * as THREE from 'three';

// Uniform condivisi da tutti i materiali del corpo: stato di ogni unità (nascosta, attenuata,
// piena, fantasma; vedi unitStates) in una texture di una riga, e unità sotto il puntatore. Gli id delle
// unità partono da 1; 0 significa "nessuna".
export const bodyUniforms = {
  uStates: { value: new THREE.DataTexture(new Uint8Array(1), 1, 1, THREE.RedFormat) },
  uHover: { value: 0 },
};

/** Aggiorna gli stati delle unità letti dagli shader. */
export function setUnitStates(states: Uint8Array) {
  const t = bodyUniforms.uStates.value;
  if (t.image.width === states.length) {
    (t.image.data as Uint8Array).set(states);
    t.needsUpdate = true;
    return;
  }
  const next = new THREE.DataTexture(states.slice(), states.length, 1, THREE.RedFormat);
  next.needsUpdate = true;
  bodyUniforms.uStates.value = next;
  t.dispose();
}

// Stato dell'unità del frammento: 0 nascosta, 1 attenuata, 2 piena, 3 fantasma.
const READ_STATE = 'float state = texelFetch(uStates, ivec2(int(vUnit + 0.5), 0), 0).r * 255.0;';

function injectUnit(shader: THREE.WebGLProgramParametersWithUniforms, fragment: string) {
  Object.assign(shader.uniforms, bodyUniforms);
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nattribute float aUnit;\nvarying float vUnit;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvUnit = aUnit;');
  shader.fragmentShader = shader.fragmentShader
    .replace(
      '#include <common>',
      '#include <common>\nuniform sampler2D uStates;\nuniform float uHover;\nvarying float vUnit;',
    )
    .replace('#include <color_fragment>', `#include <color_fragment>\n${READ_STATE}\n${fragment}`);
}

/** Strutture piene: le unità nello stato "piena". */
export function fullMaterial() {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0 });
  m.onBeforeCompile = (shader) =>
    injectUnit(
      shader,
      `if (abs(state - 2.0) > 0.5) discard;
       if (abs(vUnit - uHover) < 0.5) diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), 0.28);`,
    );
  return m;
}

/**
 * Strutture attenuate (attorno alla selezione o alle strutture di un passo) e fantasma
 * (le ossa nella vista Organi): semitrasparenti, le fantasma un po' di più.
 */
export function dimmedMaterial() {
  const m = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    transparent: true,
    opacity: 0.13,
    depthWrite: false,
  });
  m.onBeforeCompile = (shader) =>
    injectUnit(
      shader,
      `if (state < 0.5 || abs(state - 2.0) < 0.5) discard;
       if (state > 2.5) diffuseColor.a *= 0.7;
       if (abs(vUnit - uHover) < 0.5) diffuseColor.a = min(1.0, diffuseColor.a * 3.0);`,
    );
  return m;
}

/** Sagoma della pelle: quasi invisibile al centro, più marcata sui contorni. */
export function skinMaterial() {
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
       float rim = 1.0 - abs(dot(normalize(normal), normalize(vViewPosition)));
       gl_FragColor.a *= 0.6 + 5.0 * pow(rim, 3.0);`,
    );
  };
  return m;
}

/** Materiale per la selezione via GPU: codifica l'id dell'unità nel colore. Le unità nascoste e fantasma non si scelgono. */
export const pickingMaterial = new THREE.ShaderMaterial({
  uniforms: bodyUniforms,
  vertexShader: `attribute float aUnit;
    varying float vUnit;
    void main() {
      vUnit = aUnit;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: `precision highp float;
    uniform sampler2D uStates;
    varying float vUnit;
    void main() {
      ${READ_STATE}
      if (state < 0.5 || state > 2.5) discard;
      float id = floor(vUnit + 0.5);
      gl_FragColor = vec4(mod(id, 256.0) / 255.0, floor(id / 256.0) / 255.0, 0.0, 1.0);
    }`,
});
