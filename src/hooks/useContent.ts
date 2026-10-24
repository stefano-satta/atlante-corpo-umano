import { useEffect, useState } from 'react';
import type { CitedSource, GlossaryDefinition, GuidedPath, Page, Structure } from '@/models/content';
import { loaders } from '@/utils/content';

// Moduli di contenuto già caricati: restano in memoria, così riaprire una struttura è immediato.
const loaded = new Map<string, unknown>();

function useLoadedModule<T>(key: string | undefined, load: (() => Promise<{ default: T }>) | undefined) {
  const [, refresh] = useState(0);
  const [failed, setFailed] = useState<string | null>(null);
  useEffect(() => {
    if (!key || !load || loaded.has(key)) return;
    let active = true;
    load().then(
      (m) => {
        loaded.set(key, m.default);
        if (active) refresh((n) => n + 1);
      },
      () => active && setFailed(key),
    );
    return () => {
      active = false;
    };
  }, [key, load]);
  if (!key) return { data: undefined, error: false };
  return { data: loaded.get(key) as T | undefined, error: failed === key };
}

export const useStructure = (id: string | undefined) =>
  useLoadedModule<Structure>(id && `struttura/${id}`, id ? loaders.structure[id] : undefined);
export const usePage = (id: string) => useLoadedModule<Page>(`pagina/${id}`, loaders.page[id]);
export const useGuidedPath = (id: string | undefined) =>
  useLoadedModule<GuidedPath>(id && `percorso/${id}`, id ? loaders.guidedPath[id] : undefined);
export const useGlossary = (enabled = true) =>
  useLoadedModule<GlossaryDefinition[]>(enabled ? 'glossario' : undefined, loaders.glossary);
export const useSources = () => useLoadedModule<CitedSource[]>('fonti', loaders.sources);
