import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { FileLoader } from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useActiveStep } from '@/hooks/useActiveStep';
import { useAtlas } from '@/hooks/useAtlas';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ModelElement, ModelLayer, SceneUnit } from '@/models/scene';
import {
  GHOST_MODEL_LAYERS,
  LAYER_OF_MODEL_LAYER,
  needsVessels,
  VISIBLE_MODEL_LAYERS,
  VISIBLE_UNITS,
} from '@/utils/atlasReducer';
import { BEAT_FADE, BEAT_PERIOD } from '@/utils/heartbeat';
import { playHeartSound, soundsBetween } from '@/utils/heartSound';
import { modelUrl } from '@/utils/layout';
import { sceneApi } from '@/utils/sceneApi';
import {
  bodyUniforms,
  dimmedMaterial,
  fullMaterial,
  pickingMaterial,
  setUnitStates,
  skinMaterial,
} from '@/utils/sceneMaterials';
import {
  createUnits,
  prepareLayer,
  UNIT_DIMMED,
  UNIT_FULL,
  UNIT_GHOST,
  unitStates,
  unitsForElements,
} from '@/utils/sceneModel';

// I vasi (D44) non sono fra questi file: pesano più degli organi e si scaricano solo quando servono.
// Gli organi del solo corpo femminile (D29) stanno in un file a parte, piccolo: si caricano sempre,
// così cambiare corpo non fa attendere e le loro unità hanno subito ingombro e ancoraggio.
const MODEL_FILES = ['ossa', 'muscoli', 'organi', 'pelle', 'organi-donna'] as const;
type ModelFile = (typeof MODEL_FILES)[number];
const PICKING_LAYER = 1;
// I vasi sottili sono larghi pochi pixel: fra i vasi la selezione guarda anche attorno al puntatore (px CSS).
const VESSEL_PICK_RADIUS = { mouse: 4, touch: 12 };
const configureLoader = (loader: GLTFLoader) => {
  loader.setMeshoptDecoder(MeshoptDecoder);
};

interface VesselsProps {
  elements: Map<string, ModelElement>;
  units: Map<string, SceneUnit>;
  materials: { full: THREE.Material; dimmed: THREE.Material };
  showFull: boolean;
  showDimmed: boolean;
  onLoaded: () => void;
}

/** Strato dei vasi, caricato la prima volta che serve. Ingombri e ancoraggi delle unità si riempiono qui. */
function Vessels({ elements, units, materials, showFull, showDimmed, onLoaded }: VesselsProps) {
  const gltf = useLoader(GLTFLoader, modelUrl('vasi.glb'), configureLoader);
  const geometry = useMemo(() => prepareLayer(gltf.scene, elements, units), [gltf, elements, units]);
  useEffect(onLoaded, [onLoaded]);
  if (!geometry) return null;
  return (
    <>
      <mesh
        geometry={geometry}
        material={materials.full}
        visible={showFull}
        onUpdate={(m) => m.layers.enable(PICKING_LAYER)}
      />
      <mesh geometry={geometry} material={materials.dimmed} renderOrder={2} visible={showDimmed} />
    </>
  );
}

/** Il corpo 3D: carica i modelli, disegna gli strati e sceglie la struttura sotto il puntatore. */
export function Body({ onVesselsLoaded }: { onVesselsLoaded: () => void }) {
  const json = useLoader(FileLoader, modelUrl('strutture.json')) as string;
  const gltf = useLoader(
    GLTFLoader,
    MODEL_FILES.map((f) => modelUrl(`${f}.glb`)),
    configureLoader,
  );
  const { state, dispatch } = useAtlas();
  const { gl, camera, scene, size } = useThree();

  const { units, byId, byIndex, geometries } = useMemo(() => {
    const elements: ModelElement[] = JSON.parse(json);
    const units = createUnits(elements);
    const byId = new Map(elements.map((e) => [e.id, e]));
    // Camere del cuore che batte: atrio sinistro, atrio destro, ventricoli (heartbeat.ts).
    const chambers = [new THREE.Box3(), new THREE.Box3(), new THREE.Box3()];
    const geometries = Object.fromEntries(
      MODEL_FILES.map((f, i) => [f, prepareLayer(gltf[i].scene, byId, units, chambers)]),
    ) as Record<ModelFile, THREE.BufferGeometry | null>;
    chambers.forEach((c, i) => {
      if (!c.isEmpty()) c.getCenter(bodyUniforms.uBeatPivots.value[i]);
    });
    const byIndex = new Map<number, SceneUnit>([...units.values()].map((u) => [u.index, u]));
    return { units, byId, byIndex, geometries };
  }, [json, gltf]);

  const materials = useMemo(() => ({ full: fullMaterial(), dimmed: dimmedMaterial(), skin: skinMaterial() }), []);

  useEffect(() => {
    sceneApi.units = units;
  }, [units]);

  // Fuoco della vista: la struttura selezionata, altrimenti le strutture evidenziate dal passo
  // di percorso in corso (D24), che possono stare anche in uno strato nascosto.
  const selected = state.selection ? units.get(state.selection) : undefined;
  const { step } = useActiveStep();
  const highlighted = useMemo(() => new Set(step ? unitsForElements(step.evidenzia, units) : []), [step, units]);
  const visible = VISIBLE_MODEL_LAYERS[state.layer];
  const ghost = GHOST_MODEL_LAYERS[state.layer];
  const focus = useMemo(() => (selected ? new Set([selected.id]) : highlighted), [selected, highlighted]);
  const alsoVisible = VISIBLE_UNITS[state.layer];
  const states = useMemo(
    () => unitStates(units, visible, focus, ghost, state.body, alsoVisible),
    [units, visible, focus, ghost, state.body, alsoVisible],
  );
  // Una volta scaricati, i vasi restano: tornare allo strato non fa attendere.
  const [vesselsWanted, setVesselsWanted] = useState(false);
  const wantsVessels = needsVessels(state.layer, state.selection);
  useEffect(() => {
    if (wantsVessels) setVesselsWanted(true);
  }, [wantsVessels]);
  // Per ogni strato si disegnano solo le passate che servono: quella piena se ha unità piene,
  // quella semitrasparente se ne ha di attenuate o fantasma. Il resto verrebbe solo scartato dallo shader.
  const { fullLayers, dimmedLayers } = useMemo(() => {
    const fullLayers = new Set<ModelLayer>();
    const dimmedLayers = new Set<ModelLayer>();
    for (const u of units.values()) {
      const s = states[u.index];
      if (s === UNIT_FULL) fullLayers.add(u.layer);
      else if (s === UNIT_DIMMED || s === UNIT_GHOST) dimmedLayers.add(u.layer);
    }
    return { fullLayers, dimmedLayers };
  }, [units, states]);
  useEffect(() => setUnitStates(states), [states]);
  useEffect(() => {
    bodyUniforms.uHover.value = state.hover ? (units.get(state.hover)?.index ?? 0) : 0;
  }, [state.hover, units]);

  useEffect(() => {
    // Una struttura aperta da un indirizzo diretto può stare in uno strato nascosto: lo si mostra.
    // Non serve per una struttura evidenziata da un passo, che si vede già.
    if (
      selected &&
      selected.layer !== 'pelle' &&
      !visible.includes(selected.layer) &&
      !alsoVisible.includes(selected.id) &&
      !highlighted.has(selected.id)
    )
      dispatch({ type: 'revealLayer', layer: LAYER_OF_MODEL_LAYER[selected.layer] });
  }, [selected, visible, alsoVisible, highlighted, dispatch]);

  // Selezione via GPU: si disegna l'id di ogni unità e si legge il pixel sotto il puntatore.
  const target = useMemo(() => new THREE.WebGLRenderTarget(1, 1), []);
  const unitAt = (x: number, y: number, radius = 0): SceneUnit | undefined => {
    const cam = camera as THREE.PerspectiveCamera;
    const dpr = gl.getPixelRatio();
    const r = Math.round(radius * dpr);
    const side = 2 * r + 1;
    target.setSize(side, side);
    cam.setViewOffset(
      size.width * dpr,
      size.height * dpr,
      Math.round(x * dpr) - r,
      Math.round(y * dpr) - r,
      side,
      side,
    );
    const previousLayers = cam.layers.mask;
    cam.layers.set(PICKING_LAYER);
    const background = scene.background;
    scene.background = null;
    scene.overrideMaterial = pickingMaterial;
    const previousColor = gl.getClearColor(new THREE.Color());
    const previousAlpha = gl.getClearAlpha();
    gl.setClearColor(0x000000, 0);
    gl.setRenderTarget(target);
    gl.clear();
    gl.render(scene, cam);
    const pixels = new Uint8Array(side * side * 4);
    gl.readRenderTargetPixels(target, 0, 0, side, side, pixels);
    gl.setRenderTarget(null);
    gl.setClearColor(previousColor, previousAlpha);
    scene.overrideMaterial = null;
    scene.background = background;
    cam.layers.mask = previousLayers;
    cam.clearViewOffset();
    // Il pixel sotto il puntatore, altrimenti la struttura più vicina nel raggio.
    let best = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < side * side; i++) {
      const id = pixels[i * 4] + pixels[i * 4 + 1] * 256;
      const distance = ((i % side) - r) ** 2 + (Math.floor(i / side) - r) ** 2;
      if (id && distance < bestDistance && distance <= r * r) {
        best = id;
        bestDistance = distance;
      }
    }
    return byIndex.get(best);
  };

  const pointer = useRef({ x: 0, y: 0, dirty: false, downX: 0, downY: 0 });
  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.current.x = e.offsetX;
      pointer.current.y = e.offsetY;
      pointer.current.dirty = true;
    };
    const onDown = (e: PointerEvent) => {
      pointer.current.downX = e.offsetX;
      pointer.current.downY = e.offsetY;
    };
    const onUp = (e: PointerEvent) => {
      const p = pointer.current;
      if (Math.hypot(e.offsetX - p.downX, e.offsetY - p.downY) > 5) return; // era una rotazione
      const radius = state.layer === 'vasi' ? VESSEL_PICK_RADIUS[e.pointerType === 'touch' ? 'touch' : 'mouse'] : 0;
      dispatch({ type: 'select', id: unitAt(e.offsetX, e.offsetY, radius)?.id ?? null });
    };
    const onLeave = () => dispatch({ type: 'hover', id: null });
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointerleave', onLeave);
    };
  });

  // Battito del cuore selezionato (D41): entra ed esce con una dissolvenza; ogni battito parte
  // dagli atri. Con il movimento ridotto il cuore resta fermo.
  const reducedMotion = useReducedMotion();
  const beating = state.selection === 'cuore' && state.heartbeat && !reducedMotion;
  const sound = beating && state.heartSound;
  useFrame((_, delta) => {
    const { uBeatAmount, uBeatTime } = bodyUniforms;
    const dt = Math.min(delta, 0.1);
    uBeatAmount.value = THREE.MathUtils.clamp(uBeatAmount.value + (beating ? dt : -dt) / BEAT_FADE, 0, 1);
    const previous = uBeatTime.value;
    uBeatTime.value = uBeatAmount.value > 0 ? previous + dt : 0;
    // I due toni (D42) suonano quando il ciclo animato passa per il loro istante.
    if (sound && uBeatAmount.value > 0.5)
      for (const tone of soundsBetween((previous / BEAT_PERIOD) % 1, (uBeatTime.value / BEAT_PERIOD) % 1))
        playHeartSound(tone);
  });

  useFrame(() => {
    const p = pointer.current;
    if (!p.dirty) return;
    p.dirty = false;
    const u = unitAt(p.x, p.y, state.layer === 'vasi' ? VESSEL_PICK_RADIUS.mouse : 0);
    dispatch({ type: 'hover', id: u?.id ?? null });
    gl.domElement.style.cursor = u ? 'pointer' : '';
  });

  const skin = geometries.pelle;
  // Strato del modello di ogni file: gli organi femminili si mostrano con gli altri organi.
  const layerOf: Record<Exclude<ModelFile, 'pelle'>, ModelLayer> = {
    ossa: 'ossa',
    muscoli: 'muscoli',
    organi: 'organi',
    'organi-donna': 'organi',
  };
  return (
    <group>
      {(['ossa', 'muscoli', 'organi', 'organi-donna'] as const).map((f) => {
        const g = geometries[f];
        if (!g) return null;
        return (
          <group key={f} visible={f !== 'organi-donna' || state.body === 'donna'}>
            <mesh
              geometry={g}
              material={materials.full}
              visible={fullLayers.has(layerOf[f])}
              onUpdate={(m) => m.layers.enable(PICKING_LAYER)}
            />
            <mesh geometry={g} material={materials.dimmed} renderOrder={2} visible={dimmedLayers.has(layerOf[f])} />
          </group>
        );
      })}
      {vesselsWanted && (
        <Suspense fallback={null}>
          <Vessels
            elements={byId}
            units={units}
            materials={materials}
            showFull={fullLayers.has('vasi')}
            showDimmed={dimmedLayers.has('vasi')}
            onLoaded={onVesselsLoaded}
          />
        </Suspense>
      )}
      {/* La pelle del modello è maschile: nel corpo femminile la sagoma non si mostra (D29). */}
      {skin && (
        <mesh geometry={skin} material={materials.skin} renderOrder={3} visible={state.skin && state.body === 'uomo'} />
      )}
    </group>
  );
}
