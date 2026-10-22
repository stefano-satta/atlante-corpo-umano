import type CameraControls from 'camera-controls';
import type { Unita } from './modello';

/** Accesso alla scena dall'interfaccia (tastiera, pulsanti) senza passare per React. */
export const scenaApi = {
  controlli: null as CameraControls | null,
  unita: new Map<string, Unita>(),
};

if (import.meta.env.DEV) Object.assign(window, { __scena: scenaApi });
