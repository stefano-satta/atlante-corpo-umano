import { useEffect, useSyncExternalStore } from 'react';
import { sceneCover } from '@/utils/sceneCover';

/** Vero quando l'interfaccia copre per intero la scena 3D (`utils/sceneCover.ts`). */
export function useSceneCovered() {
  return useSyncExternalStore(sceneCover.subscribe, sceneCover.get);
}

/** Segna la scena come coperta finché `covered` è vero e il componente resta montato. */
export function useCoverScene(covered: boolean) {
  useEffect(() => {
    sceneCover.set(covered);
    return () => sceneCover.set(false);
  }, [covered]);
}
