import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { FileLoader } from 'three';
import { CONFIG, percorsoModelli } from '../config';
import { misure, kBModelli } from '../misure';
import { STRATI_VISIBILI, useAtlante } from '../stato';
import { creaUnita, preparaStrato, type Elemento, type StratoModello, type Unita } from './modello';
import { materialeAttenuato, materialePelle, materialePieno, materialeSelezione, uniformiCorpo } from './materiali';
import { scenaApi } from './api';

const STRATI: StratoModello[] = ['ossa', 'muscoli', 'organi', 'pelle'];
const LIVELLO_SELEZIONE = 1;

export function Corpo() {
  const testo = useLoader(FileLoader, percorsoModelli('strutture.json')) as string;
  const gltf = useGLTF(STRATI.map((s) => percorsoModelli(`${s}.glb`)));
  const { stato, invia } = useAtlante();
  const { gl, camera, scene, size } = useThree();

  const { unita, perIndice, geometrie } = useMemo(() => {
    const elementi: Elemento[] = JSON.parse(testo);
    const unita = creaUnita(elementi);
    const perId = new Map(elementi.map((e) => [e.id, e]));
    const geometrie = Object.fromEntries(
      STRATI.map((s, i) => [s, preparaStrato(gltf[i].scene, perId, unita, CONFIG.unisci && s !== 'pelle')]),
    ) as Record<StratoModello, THREE.BufferGeometry[]>;
    const perIndice = new Map<number, Unita>([...unita.values()].map((u) => [u.indice, u]));
    return { unita, perIndice, geometrie };
  }, [testo, gltf]);

  const materiali = useMemo(
    () => ({ pieno: materialePieno(), attenuato: materialeAttenuato(), pelle: materialePelle() }),
    [],
  );

  useEffect(() => {
    scenaApi.unita = unita;
    requestAnimationFrame(() => {
      misure.interattivoMs = Math.round(performance.now());
      misure.kBScaricati = kBModelli();
    });
  }, [unita]);

  // Selezione e hover passano agli shader tramite uniform.
  const sel = stato.selezione ? unita.get(stato.selezione) : undefined;
  useEffect(() => {
    uniformiCorpo.uSel.value = sel?.indice ?? 0;
    uniformiCorpo.uAny.value = sel ? 1 : 0;
  }, [sel]);
  useEffect(() => {
    uniformiCorpo.uHover.value = stato.hover ? (unita.get(stato.hover)?.indice ?? 0) : 0;
  }, [stato.hover, unita]);

  // Una selezione che non appartiene agli strati visibili viene annullata.
  const visibili = STRATI_VISIBILI[stato.strato];
  useEffect(() => {
    if (sel && !visibili.includes(sel.strato as never)) invia({ tipo: 'seleziona', id: null });
  }, [sel, visibili, invia]);

  // Selezione via GPU: si disegna l'id di ogni unità e si legge il pixel sotto il puntatore.
  const bersaglio = useMemo(() => new THREE.WebGLRenderTarget(1, 1), []);
  const pixel = useMemo(() => new Uint8Array(4), []);
  const leggiUnita = (x: number, y: number): Unita | undefined => {
    const cam = camera as THREE.PerspectiveCamera;
    const dpr = gl.getPixelRatio();
    cam.setViewOffset(size.width * dpr, size.height * dpr, Math.round(x * dpr), Math.round(y * dpr), 1, 1);
    const livelliPrima = cam.layers.mask;
    cam.layers.set(LIVELLO_SELEZIONE);
    const sfondo = scene.background;
    scene.background = null;
    scene.overrideMaterial = materialeSelezione;
    const colorePrima = gl.getClearColor(new THREE.Color());
    const alfaPrima = gl.getClearAlpha();
    gl.setClearColor(0x000000, 0);
    gl.setRenderTarget(bersaglio);
    gl.clear();
    gl.render(scene, cam);
    gl.readRenderTargetPixels(bersaglio, 0, 0, 1, 1, pixel);
    gl.setRenderTarget(null);
    gl.setClearColor(colorePrima, alfaPrima);
    scene.overrideMaterial = null;
    scene.background = sfondo;
    cam.layers.mask = livelliPrima;
    cam.clearViewOffset();
    return perIndice.get(pixel[0] + pixel[1] * 256);
  };

  const puntatore = useRef({ x: 0, y: 0, sporco: false, giuX: 0, giuY: 0 });
  useEffect(() => {
    const el = gl.domElement;
    const muovi = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      puntatore.current.x = e.offsetX;
      puntatore.current.y = e.offsetY;
      puntatore.current.sporco = true;
    };
    const giu = (e: PointerEvent) => {
      puntatore.current.giuX = e.offsetX;
      puntatore.current.giuY = e.offsetY;
    };
    const su = (e: PointerEvent) => {
      const p = puntatore.current;
      if (Math.hypot(e.offsetX - p.giuX, e.offsetY - p.giuY) > 5) return; // era una rotazione
      misure.inizioSelezione = performance.now();
      const u = leggiUnita(e.offsetX, e.offsetY);
      invia({ tipo: 'seleziona', id: u?.id ?? null });
    };
    const esci = () => invia({ tipo: 'hover', id: null });
    el.addEventListener('pointermove', muovi);
    el.addEventListener('pointerdown', giu);
    el.addEventListener('pointerup', su);
    el.addEventListener('pointerleave', esci);
    return () => {
      el.removeEventListener('pointermove', muovi);
      el.removeEventListener('pointerdown', giu);
      el.removeEventListener('pointerup', su);
      el.removeEventListener('pointerleave', esci);
    };
  });

  useFrame(() => {
    const p = puntatore.current;
    if (!p.sporco) return;
    p.sporco = false;
    const u = leggiUnita(p.x, p.y);
    invia({ tipo: 'hover', id: u?.id ?? null });
    gl.domElement.style.cursor = u ? 'pointer' : '';
  });

  return (
    <group>
      {(['ossa', 'muscoli', 'organi'] as const).map((s) => (
        <group key={s} visible={visibili.includes(s)}>
          {geometrie[s].map((g, i) => (
            <group key={i}>
              <mesh geometry={g} material={materiali.pieno} onUpdate={(m) => m.layers.enable(LIVELLO_SELEZIONE)} />
              <mesh geometry={g} material={materiali.attenuato} renderOrder={2} visible={!!sel} />
            </group>
          ))}
        </group>
      ))}
      <group visible={stato.pelle}>
        {geometrie.pelle.map((g, i) => (
          <mesh key={i} geometry={g} material={materiali.pelle} renderOrder={3} />
        ))}
      </group>
    </group>
  );
}
