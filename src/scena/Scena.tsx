import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type CameraControls from 'camera-controls';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CONFIG, LARGHEZZA_STRETTA, larghezzaPannello } from '../app/config';
import { misure } from '../app/misure';
import { useAtlante, useMovimentoRidotto } from '../app/stato';
import { aggiornaRichiamo } from '../pannello/tracciato-richiamo';
import { usePassoAttivo } from '../percorsi/passo';
import { BERSAGLIO_INIZIALE, POSIZIONE_INIZIALE, scenaApi } from './api';
import { Controlli } from './Controlli';
import { Corpo } from './Corpo';
import { ingombro, unitaPerElementi } from './modello';

// Funzione stabile: i controlli si registrano una sola volta, non a ogni render della scena.
function registraControlli(c: CameraControls) {
  if (scenaApi.controlli === c) return;
  scenaApi.controlli = c;
  c.setTarget(...BERSAGLIO_INIZIALE, false);
}

// Margine attorno alla struttura inquadrata, rispetto al suo ingombro. Le strutture di un passo
// di percorso sono un insieme più grande e chiedono meno margine.
const MARGINE_INQUADRATURA = 1.9;
const MARGINE_PERCORSO = 1.25;
/** Spostamento del corpo verso destra sotto la soglia, in frazioni di mezza larghezza della vista. */
const SPOSTAMENTO_SOGLIA = 0.42;
// Nei percorsi la telecamera guarda il corpo di fronte, appena dall'alto.
const POLARE_PERCORSO = Math.PI / 2 - 0.12;

/**
 * Muove la telecamera in base a selezione, scheda aperta e passo di percorso. Su desktop
 * la struttura viene centrata nella parte di scena non coperta dal pannello.
 */
function Regia({ pronta }: { pronta: boolean }) {
  const { stato } = useAtlante();
  const { passo } = usePassoAttivo();
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
    let sfera: THREE.Sphere;
    if (u) {
      sfera = u.box.getBoundingSphere(new THREE.Sphere());
      sfera.radius = Math.max(sfera.radius, 0.05) * MARGINE_INQUADRATURA;
    } else if (passo) {
      // Telecamera narrante (D24): inquadra le strutture del passo, viste di fronte.
      const box = ingombro(unitaPerElementi(passo.inquadra ?? passo.evidenzia, scenaApi.unita), scenaApi.unita);
      if (box.isEmpty()) return;
      sfera = box.getBoundingSphere(new THREE.Sphere());
      // Su smartphone il percorso occupa la metà bassa dello schermo: le strutture stanno nella metà alta.
      sfera.radius = Math.max(sfera.radius, 0.05) * MARGINE_PERCORSO * (larghezza <= LARGHEZZA_STRETTA ? 1.7 : 1);
      c.rotateTo(0, POLARE_PERCORSO, animata);
    } else {
      // Sotto la soglia, su schermo largo, il corpo sta a destra del testo d'ingresso (D26).
      const semilarghezza = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * c.distance * camera.aspect;
      const spostamento = stato.soglia && larghezza > LARGHEZZA_STRETTA ? -semilarghezza * SPOSTAMENTO_SOGLIA : 0;
      c.setFocalOffset(spostamento, 0, 0, animata);
      return;
    }
    distanza.current = sfera.radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2));
    c.fitToSphere(sfera, animata);
  }, [stato.selezione, stato.soglia, passo, ridotto, pronta, camera, larghezza]);

  useEffect(() => {
    const c = scenaApi.controlli;
    if (!c || !pronta || (!stato.selezione && !passo)) return;
    const semialtezza = distanza.current * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    if (larghezza <= LARGHEZZA_STRETTA) {
      // Su smartphone cartellino e percorso sono un foglio in basso: la struttura sale nella metà superiore.
      c.setFocalOffset(0, stato.scheda ? 0 : semialtezza * (stato.selezione ? 0.45 : 0.62), 0, !ridotto);
      return;
    }
    const pannello = larghezzaPannello(larghezza, stato.scheda);
    c.setFocalOffset(semialtezza * camera.aspect * (pannello / larghezza), 0, 0, !ridotto);
  }, [stato.selezione, stato.scheda, passo, ridotto, pronta, camera, larghezza]);

  return null;
}

/** Proietta il punto di ancoraggio della struttura selezionata sullo schermo per la linea di richiamo. */
function Richiamo() {
  const { stato } = useAtlante();
  const camera = useThree((s) => s.camera);
  const punto = useRef(new THREE.Vector3());
  useFrame(() => {
    const u = stato.selezione ? scenaApi.unita.get(stato.selezione) : undefined;
    if (!u) return aggiornaRichiamo(null);
    const p = punto.current.copy(u.ancora).project(camera);
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
