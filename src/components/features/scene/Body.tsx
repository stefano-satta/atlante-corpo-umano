import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { FileLoader } from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useActiveStep } from '@/hooks/useActiveStep';
import { useAtlas } from '@/hooks/useAtlas';
import type { ModelElement, ModelLayer, SceneUnit } from '@/models/scene';
import { GHOST_MODEL_LAYERS, LAYER_OF_MODEL_LAYER, VISIBLE_MODEL_LAYERS } from '@/utils/atlasReducer';
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
  UNIT_GHOST,
  UNIT_HIDDEN,
  unitStates,
  unitsForElements,
} from '@/utils/sceneModel';

const MODEL_LAYERS: ModelLayer[] = ['ossa', 'muscoli', 'organi', 'pelle'];
// Gli organi del solo corpo femminile (D29) stanno in un file a parte, piccolo: si caricano sempre,
// così cambiare corpo non fa attendere e le loro unità hanno subito ingombro e ancoraggio.
const MODEL_FILES = [...MODEL_LAYERS, 'organi-donna'] as const;
type ModelFile = (typeof MODEL_FILES)[number];
const PICKING_LAYER = 1;

/** Il corpo 3D: carica i modelli, disegna gli strati e sceglie la struttura sotto il puntatore. */
export function Body() {
  const json = useLoader(FileLoader, modelUrl('strutture.json')) as string;
  const gltf = useLoader(
    GLTFLoader,
    MODEL_FILES.map((f) => modelUrl(`${f}.glb`)),
    (loader) => loader.setMeshoptDecoder(MeshoptDecoder),
  );
  const { state, dispatch } = useAtlas();
  const { gl, camera, scene, size } = useThree();

  const { units, byIndex, geometries } = useMemo(() => {
    const elements: ModelElement[] = JSON.parse(json);
    const units = createUnits(elements);
    const byId = new Map(elements.map((e) => [e.id, e]));
    const geometries = Object.fromEntries(
      MODEL_FILES.map((f, i) => [f, prepareLayer(gltf[i].scene, byId, units)]),
    ) as Record<ModelFile, THREE.BufferGeometry | null>;
    const byIndex = new Map<number, SceneUnit>([...units.values()].map((u) => [u.index, u]));
    return { units, byIndex, geometries };
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
  const states = useMemo(
    () => unitStates(units, visible, focus, ghost, state.body),
    [units, visible, focus, ghost, state.body],
  );
  // Si disegnano solo gli strati con almeno un'unità non nascosta, e le semitrasparenti
  // (attenuate o fantasma) solo se ce ne sono.
  const { activeLayers, anyDimmed } = useMemo(() => {
    const activeLayers = new Set<ModelLayer>();
    for (const u of units.values()) if (states[u.index] !== UNIT_HIDDEN) activeLayers.add(u.layer);
    return { activeLayers, anyDimmed: states.includes(UNIT_DIMMED) || states.includes(UNIT_GHOST) };
  }, [units, states]);
  useEffect(() => setUnitStates(states), [states]);
  useEffect(() => {
    bodyUniforms.uHover.value = state.hover ? (units.get(state.hover)?.index ?? 0) : 0;
  }, [state.hover, units]);

  useEffect(() => {
    // Una struttura aperta da un indirizzo diretto può stare in uno strato nascosto: lo si mostra.
    // Non serve per una struttura evidenziata da un passo, che si vede già.
    if (selected && selected.layer !== 'pelle' && !visible.includes(selected.layer) && !highlighted.has(selected.id))
      dispatch({ type: 'revealLayer', layer: LAYER_OF_MODEL_LAYER[selected.layer] });
  }, [selected, visible, highlighted, dispatch]);

  // Selezione via GPU: si disegna l'id di ogni unità e si legge il pixel sotto il puntatore.
  const target = useMemo(() => new THREE.WebGLRenderTarget(1, 1), []);
  const pixel = useMemo(() => new Uint8Array(4), []);
  const unitAt = (x: number, y: number): SceneUnit | undefined => {
    const cam = camera as THREE.PerspectiveCamera;
    const dpr = gl.getPixelRatio();
    cam.setViewOffset(size.width * dpr, size.height * dpr, Math.round(x * dpr), Math.round(y * dpr), 1, 1);
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
    gl.readRenderTargetPixels(target, 0, 0, 1, 1, pixel);
    gl.setRenderTarget(null);
    gl.setClearColor(previousColor, previousAlpha);
    scene.overrideMaterial = null;
    scene.background = background;
    cam.layers.mask = previousLayers;
    cam.clearViewOffset();
    return byIndex.get(pixel[0] + pixel[1] * 256);
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
      dispatch({ type: 'select', id: unitAt(e.offsetX, e.offsetY)?.id ?? null });
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

  useFrame(() => {
    const p = pointer.current;
    if (!p.dirty) return;
    p.dirty = false;
    const u = unitAt(p.x, p.y);
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
          <group key={f} visible={activeLayers.has(layerOf[f]) && (f !== 'organi-donna' || state.body === 'donna')}>
            <mesh geometry={g} material={materials.full} onUpdate={(m) => m.layers.enable(PICKING_LAYER)} />
            <mesh geometry={g} material={materials.dimmed} renderOrder={2} visible={anyDimmed} />
          </group>
        );
      })}
      {/* La pelle del modello è maschile: nel corpo femminile la sagoma non si mostra (D29). */}
      {skin && (
        <mesh geometry={skin} material={materials.skin} renderOrder={3} visible={state.skin && state.body === 'uomo'} />
      )}
    </group>
  );
}
