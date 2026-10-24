import type { SceneUnit } from '@/models/scene';
import { STRUCTURES } from './content';
import { BODY_SYSTEM_NAMES, ORGANS_BY_ID } from './organs';
import { sceneApi } from './sceneApi';

const PART_OF = { ossa: 'Scheletro', muscoli: 'Sistema muscolare' } as const;

/** Appartenenza mostrata per le strutture che non hanno ancora un contenuto. */
export function membershipLabel(unit: SceneUnit) {
  const organ = ORGANS_BY_ID.get(unit.id);
  return organ ? BODY_SYSTEM_NAMES[organ.system] : PART_OF[unit.layer as keyof typeof PART_OF];
}

/** Unità del modello 3D che mostra un contenuto: l'organo per gruppo, altrimenti l'osso o il muscolo per FMA. */
export function unitForContent(id: string) {
  const entry = STRUCTURES.find((s) => s.id === id);
  if (!entry) return undefined;
  if (entry.elementi3d.gruppo) return sceneApi.units.has(entry.elementi3d.gruppo) ? entry.elementi3d.gruppo : undefined;
  for (const u of sceneApi.units.values()) if (u.fma && entry.elementi3d.fma.includes(u.fma)) return u.id;
  return undefined;
}
