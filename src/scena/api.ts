import type CameraControls from 'camera-controls';
import type { Unita } from './modello';

/** Accesso alla scena dall'interfaccia (tastiera, pulsanti) senza passare per React. */
export const scenaApi = {
  controlli: null as CameraControls | null,
  unita: new Map<string, Unita>(),
};

// Vista iniziale: corpo intero, leggermente dall'alto, centrato all'altezza del bacino.
// Sta qui e non in Scena.tsx perché l'interfaccia la usa senza caricare il motore 3D.
export const BERSAGLIO_INIZIALE = [0, 0.8, 0.1] as const;
export const POSIZIONE_INIZIALE = [0, 1.0, 4.2] as const;

export function vistaIniziale(animata: boolean) {
  const c = scenaApi.controlli;
  if (!c) return;
  c.setFocalOffset(0, 0, 0, animata);
  c.setLookAt(...POSIZIONE_INIZIALE, ...BERSAGLIO_INIZIALE, animata);
}

if (import.meta.env.DEV) Object.assign(window, { __scena: scenaApi });
