import { useEffect, useState } from 'react';
import type { CitedSource, GlossaryDefinition, GuidedPath, Page, QuizQuestion, Structure } from '@/models/content';
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

/**
 * Domande del quiz di uno o più temi (D53), caricate in parallelo: il quiz completo le chiede tutte.
 * `data` arriva quando ci sono tutte, nello stesso ordine dei temi.
 */
export function useQuizQuestions(slugs: readonly string[] | undefined) {
  const key = slugs?.join(',');
  const [, refresh] = useState(0);
  const [failed, setFailed] = useState<string | null>(null);
  useEffect(() => {
    const list = key ? key.split(',') : [];
    const missing = list.filter((s) => !loaded.has(`quiz/${s}`));
    if (!missing.length) return;
    let active = true;
    Promise.all(missing.map((s) => loaders.quiz[s]?.() ?? Promise.reject(new Error(s)))).then(
      (modules) => {
        for (const [i, s] of missing.entries()) loaded.set(`quiz/${s}`, modules[i].default);
        if (active) refresh((n) => n + 1);
      },
      () => active && setFailed(key ?? null),
    );
    return () => {
      active = false;
    };
  }, [key]);
  if (!key) return { data: undefined, error: false };
  const groups = key.split(',').map((s) => loaded.get(`quiz/${s}`) as QuizQuestion[] | undefined);
  return {
    data: groups.every(Boolean) ? (groups as QuizQuestion[][]) : undefined,
    error: failed === key,
  };
}
