import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type CameraControls from 'camera-controls';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useActiveStep } from '@/hooks/useActiveStep';
import { useAtlas } from '@/hooks/useAtlas';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { updateCallout } from '@/utils/calloutPath';
import { NARROW_WIDTH, panelWidth } from '@/utils/layout';
import { INITIAL_POSITION, INITIAL_TARGET, sceneApi } from '@/utils/sceneApi';
import { boundingBoxOf, unitsForElements } from '@/utils/sceneModel';
import { Body } from './Body';
import { Controls } from './Controls';

// Funzione stabile: i controlli si registrano una sola volta, non a ogni render della scena.
function registerControls(c: CameraControls) {
  if (sceneApi.controls === c) return;
  sceneApi.controls = c;
  c.setTarget(...INITIAL_TARGET, false);
}

// Margine attorno alla struttura inquadrata, rispetto al suo ingombro. Le strutture di un passo
// di percorso sono un insieme più grande e chiedono meno margine.
const SELECTION_MARGIN = 1.9;
const PATH_MARGIN = 1.25;
/** Spostamento del corpo verso destra sotto la soglia, in frazioni di mezza larghezza della vista. */
const HOME_OFFSET = 0.42;
// Nei percorsi la telecamera guarda il corpo di fronte, appena dall'alto.
const PATH_POLAR_ANGLE = Math.PI / 2 - 0.12;

/**
 * Muove la telecamera in base a selezione, scheda aperta e passo di percorso. Su desktop
 * la struttura viene centrata nella parte di scena non coperta dal pannello.
 */
function CameraDirector({ ready }: { ready: boolean }) {
  const { state } = useAtlas();
  const { step } = useActiveStep();
  const reducedMotion = useReducedMotion();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const width = useThree((s) => s.size.width);
  const first = useRef(true);
  const distance = useRef(0);

  useEffect(() => {
    const c = sceneApi.controls;
    const u = state.selection ? sceneApi.units.get(state.selection) : undefined;
    if (!c || !ready) return;
    const animated = !reducedMotion && !first.current;
    first.current = false;
    let sphere: THREE.Sphere;
    if (u) {
      sphere = u.box.getBoundingSphere(new THREE.Sphere());
      sphere.radius = Math.max(sphere.radius, 0.05) * SELECTION_MARGIN;
    } else if (step) {
      // Telecamera narrante (D24): inquadra le strutture del passo, viste di fronte.
      const box = boundingBoxOf(unitsForElements(step.inquadra ?? step.evidenzia, sceneApi.units), sceneApi.units);
      if (box.isEmpty()) return;
      sphere = box.getBoundingSphere(new THREE.Sphere());
      // Su smartphone il percorso occupa la metà bassa dello schermo: le strutture stanno nella metà alta.
      sphere.radius = Math.max(sphere.radius, 0.05) * PATH_MARGIN * (width <= NARROW_WIDTH ? 1.7 : 1);
      c.rotateTo(0, PATH_POLAR_ANGLE, animated);
    } else {
      // Sotto la soglia, su schermo largo, il corpo sta a destra del testo d'ingresso (D26).
      const halfWidth = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * c.distance * camera.aspect;
      const offset = state.home && width > NARROW_WIDTH ? -halfWidth * HOME_OFFSET : 0;
      c.setFocalOffset(offset, 0, 0, animated);
      return;
    }
    distance.current = sphere.radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2));
    c.fitToSphere(sphere, animated);
  }, [state.selection, state.home, step, reducedMotion, ready, camera, width]);

  useEffect(() => {
    const c = sceneApi.controls;
    if (!c || !ready || (!state.selection && !step)) return;
    const halfHeight = distance.current * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    if (width <= NARROW_WIDTH) {
      // Su smartphone cartellino e percorso sono un foglio in basso: la struttura sale nella metà superiore.
      c.setFocalOffset(0, state.sheet ? 0 : halfHeight * (state.selection ? 0.45 : 0.62), 0, !reducedMotion);
      return;
    }
    const panel = panelWidth(width, state.sheet);
    c.setFocalOffset(halfHeight * camera.aspect * (panel / width), 0, 0, !reducedMotion);
  }, [state.selection, state.sheet, step, reducedMotion, ready, camera, width]);

  return null;
}

/** Proietta il punto di ancoraggio della struttura selezionata sullo schermo per la linea di richiamo. */
function CalloutTracker() {
  const { state } = useAtlas();
  const camera = useThree((s) => s.camera);
  const point = useRef(new THREE.Vector3());
  useFrame(() => {
    const u = state.selection ? sceneApi.units.get(state.selection) : undefined;
    if (!u) return updateCallout(null);
    const p = point.current.copy(u.anchor).project(camera);
    if (p.z > 1) return updateCallout(null);
    updateCallout({ x: ((p.x + 1) / 2) * innerWidth, y: ((1 - p.y) / 2) * innerHeight });
  });
  return null;
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}

interface Props {
  ready: boolean;
  onReady: () => void;
  /** Falso quando una pagina di lettura copre la scena: niente disegno, niente consumo. */
  active: boolean;
}

export default function Scene({ ready, onReady, active }: Props) {
  return (
    <Canvas
      className="scene"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 32, near: 0.01, far: 50, position: [...INITIAL_POSITION] }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <hemisphereLight args={['#e6e2ec', '#1a1420', 0.9]} />
      <directionalLight position={[1.5, 3, 2.5]} intensity={2.2} />
      <directionalLight position={[-2, 1.5, -2]} intensity={1.1} color="#b9aecb" />
      <Controls onReady={registerControls} minDistance={0.15} maxDistance={6} smoothTime={0.35} />
      <Suspense fallback={null}>
        <Body />
        <ReadySignal onReady={onReady} />
      </Suspense>
      <CameraDirector ready={ready} />
      <CalloutTracker />
    </Canvas>
  );
}
