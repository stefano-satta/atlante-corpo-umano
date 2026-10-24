import type CameraControls from 'camera-controls';
import type { SceneUnit } from '@/models/scene';

/** Accesso alla scena dall'interfaccia (tastiera, pulsanti) senza passare per React. */
export const sceneApi = {
  controls: null as CameraControls | null,
  units: new Map<string, SceneUnit>(),
};

// Vista iniziale: corpo intero, leggermente dall'alto, centrato all'altezza del bacino.
// Sta qui e non nella scena perché l'interfaccia la usa senza caricare il motore 3D.
export const INITIAL_TARGET = [0, 0.8, 0.1] as const;
export const INITIAL_POSITION = [0, 1.0, 4.2] as const;

export function resetView(animated: boolean) {
  const c = sceneApi.controls;
  if (!c) return;
  c.setFocalOffset(0, 0, 0, animated);
  c.setLookAt(...INITIAL_POSITION, ...INITIAL_TARGET, animated);
}

if (import.meta.env.DEV) Object.assign(window, { __scene: sceneApi });
