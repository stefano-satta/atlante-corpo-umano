import * as THREE from 'three';

// Uniform condivisi da tutti i materiali del corpo: unità selezionata, unità
// sotto il puntatore e presenza di una selezione. Gli id delle unità partono
// da 1; 0 significa "nessuna".
export const uniformiCorpo = {
  uSel: { value: 0 },
  uHover: { value: 0 },
  uAny: { value: 0 },
};

function iniettaUnita(shader: THREE.WebGLProgramParametersWithUniforms, frammento: string) {
  Object.assign(shader.uniforms, uniformiCorpo);
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nattribute float aUnit;\nvarying float vUnit;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvUnit = aUnit;');
  shader.fragmentShader = shader.fragmentShader
    .replace(
      '#include <common>',
      '#include <common>\nuniform float uSel;\nuniform float uHover;\nuniform float uAny;\nvarying float vUnit;',
    )
    .replace('#include <color_fragment>', `#include <color_fragment>\n${frammento}`);
}

/** Strutture piene: con una selezione attiva resta visibile solo l'unità scelta. */
export function materialePieno() {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0 });
  m.onBeforeCompile = (shader) =>
    iniettaUnita(
      shader,
      `if (uAny > 0.5 && abs(vUnit - uSel) > 0.5) discard;
       if (abs(vUnit - uHover) < 0.5) diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), 0.28);`,
    );
  return m;
}

/** Strutture attenuate: tutte tranne la selezionata, semitrasparenti. */
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
      `if (uAny < 0.5 || abs(vUnit - uSel) < 0.5) discard;
       if (abs(vUnit - uHover) < 0.5) diffuseColor.a = min(1.0, diffuseColor.a * 3.0);`,
    );
  return m;
}

/** Sagoma della pelle: quasi invisibile al centro, più marcata sui contorni. */
export function materialePelle() {
  const m = new THREE.MeshStandardMaterial({
    color: '#e4e0d8',
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

/** Materiale per la selezione via GPU: codifica l'id dell'unità nel colore. */
export const materialeSelezione = new THREE.ShaderMaterial({
  vertexShader: `attribute float aUnit;
    varying float vUnit;
    void main() {
      vUnit = aUnit;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: `precision highp float;
    varying float vUnit;
    void main() {
      float id = floor(vUnit + 0.5);
      gl_FragColor = vec4(mod(id, 256.0) / 255.0, floor(id / 256.0) / 255.0, 0.0, 1.0);
    }`,
});
