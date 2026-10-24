import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type CameraControls from 'camera-controls';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CONFIG, LARGHEZZA_STRETTA, larghezzaPannello } from '../app/config';
import { misure } from '../app/misure';
import { useAtlante, useMovimentoRidotto } from '../app/stato';
import { aggiornaRichiamo } from '../pannello/tracciato-richiamo';
import { BERSAGLIO_INIZIALE, POSIZIONE_INIZIALE, scenaApi } from './api';
import { Controlli } from './Controlli';
import { Corpo } from './Corpo';

// Funzione stabile: i controlli si registrano una sola volta, non a ogni render della scena.
function registraControlli(c: CameraControls) {
  if (scenaApi.controlli === c) return;
  scenaApi.controlli = c;
  c.setTarget(...BERSAGLIO_INIZIALE, false);
}

// Margine attorno alla struttura inquadrata, rispetto al suo ingombro.
const MARGINE_INQUADRATURA = 1.9;

/**
 * Muove la telecamera in base a selezione e scheda aperta. Su desktop la struttura
 * viene centrata nella parte di scena non coperta dal cartellino o dalla scheda.
 */
function Regia({ pronta }: { pronta: boolean }) {
  const { stato } = useAtlante();
  const ridotto = useMovimentoRidotto();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const larghezza = useThree((s) => s.size.width);
  const primo = useRef(true);
  const distanza = useRef(0);

  useEffect(() => {
    const c = scenaApi.controlli;
    const u = stato.selezione ? scenaApi.unita.get(stato.selezione) : undefined;
    if (!c || !pronta) return;
    const animata = !ridotto && !primo.current;
    primo.current = false;
    if (!u) {
      c.setFocalOffset(0, 0, 0, animata);
      return;
    }
    const sfera = u.box.getBoundingSphere(new THREE.Sphere());
    sfera.radius = Math.max(sfera.radius, 0.05) * MARGINE_INQUADRATURA;
    distanza.current = sfera.radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2));
    c.fitToSphere(sfera, animata);
  }, [stato.selezione, ridotto, pronta, camera]);

  useEffect(() => {
    const c = scenaApi.controlli;
    if (!c || !pronta || !stato.selezione) return;
    const semialtezza = distanza.current * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    if (larghezza <= LARGHEZZA_STRETTA) {
      // Su smartphone il cartellino è un foglio in basso: la struttura sale nella metà superiore.
      c.setFocalOffset(0, stato.scheda ? 0 : semialtezza * 0.45, 0, !ridotto);
      return;
    }
    const pannello = larghezzaPannello(larghezza, stato.scheda);
    c.setFocalOffset(semialtezza * camera.aspect * (pannello / larghezza), 0, 0, !ridotto);
  }, [stato.selezione, stato.scheda, ridotto, pronta, camera, larghezza]);

  return null;
}

/** Proietta il centro della struttura selezionata sullo schermo per la linea di richiamo. */
function Richiamo() {
  const { stato } = useAtlante();
  const camera = useThree((s) => s.camera);
  const punto = useRef(new THREE.Vector3());
  useFrame(() => {
    const u = stato.selezione ? scenaApi.unita.get(stato.selezione) : undefined;
    if (!u) return aggiornaRichiamo(null);
    const p = u.box.getCenter(punto.current).project(camera);
    if (p.z > 1) return aggiornaRichiamo(null);
    aggiornaRichiamo({ x: ((p.x + 1) / 2) * innerWidth, y: ((1 - p.y) / 2) * innerHeight });
  });
  return null;
}

function Misuratore() {
  const gl = useThree((s) => s.gl);
  const campioni = useRef<number[]>([]);
  useEffect(() => {
    gl.info.autoReset = false;
  }, [gl]);
  useFrame((_, delta) => {
    misure.chiamate = gl.info.render.calls;
    misure.triangoli = gl.info.render.triangles;
    gl.info.reset();
    const c = campioni.current;
    c.push(delta);
    if (c.length > 120) c.shift();
    const media = c.reduce((s, d) => s + d, 0) / c.length;
    misure.frameMs = Math.round(media * 1000 * 10) / 10;
    misure.fps = Math.round(1 / media);
  });
  return null;
}

interface Props {
  pronta: boolean;
  onPronta: () => void;
  /** Falso quando una pagina di lettura copre la scena: niente disegno, niente consumo. */
  attiva: boolean;
}

export default function Scena({ pronta, onPronta, attiva }: Props) {
  return (
    <Canvas
      className="scena"
      frameloop={attiva ? 'always' : 'never'}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 32, near: 0.01, far: 50, position: [...POSIZIONE_INIZIALE] }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <hemisphereLight args={['#e6e2ec', '#1a1420', 0.9]} />
      <directionalLight position={[1.5, 3, 2.5]} intensity={2.2} />
      <directionalLight position={[-2, 1.5, -2]} intensity={1.1} color="#b9aecb" />
      <Controlli onPronti={registraControlli} minDistance={0.15} maxDistance={6} smoothTime={0.35} />
      <Suspense fallback={null}>
        <Corpo />
        <Pronta onPronta={onPronta} />
      </Suspense>
      <Regia pronta={pronta} />
      <Richiamo />
      {CONFIG.misure && <Misuratore />}
    </Canvas>
  );
}

function Pronta({ onPronta }: { onPronta: () => void }) {
  useEffect(onPronta, [onPronta]);
  return null;
}
