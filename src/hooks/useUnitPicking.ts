import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { SceneUnit } from '@/models/scene';
import { PICKING_LAYER, pickingMaterial } from '@/utils/sceneMaterials';
import { useAtlas } from './useAtlas';

// Vasi e nervi sottili sono larghi pochi pixel: in quegli strati la selezione guarda anche attorno al puntatore
// (px CSS).
const THIN_PICK_RADIUS = { mouse: 4, touch: 12 };
const THIN_LAYERS = new Set(['vasi', 'nervi']);

/** Sceglie la struttura sotto il puntatore: al clic la seleziona, al passaggio la evidenzia. */
export function useUnitPicking(byIndex: Map<number, SceneUnit>) {
  const { state, dispatch } = useAtlas();
  const { gl, camera, scene, size } = useThree();

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
      const radius = THIN_LAYERS.has(state.layer) ? THIN_PICK_RADIUS[e.pointerType === 'touch' ? 'touch' : 'mouse'] : 0;
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

  useFrame(() => {
    const p = pointer.current;
    if (!p.dirty) return;
    p.dirty = false;
    const u = unitAt(p.x, p.y, THIN_LAYERS.has(state.layer) ? THIN_PICK_RADIUS.mouse : 0);
    dispatch({ type: 'hover', id: u?.id ?? null });
    gl.domElement.style.cursor = u ? 'pointer' : '';
  });
}
