import { caricaFonti, caricaPagina, caricaStruttura, STRUTTURE } from 'virtual:contenuti';
import { useEffect, useState } from 'react';
import type { FonteCitata, Pagina, Struttura, VoceIndice } from './tipi';

export { STRUTTURE };

const perGruppo = new Map<string, VoceIndice>();
const perFma = new Map<string, VoceIndice>();
for (const s of STRUTTURE) {
  if (s.elementi3d.gruppo) perGruppo.set(s.elementi3d.gruppo, s);
  for (const fma of s.elementi3d.fma) perFma.set(fma, s);
}

/** Contenuto associato a un'unità del modello: un organo per gruppo, un osso o un muscolo per FMA. */
export function contenutoDi(u: { id: string; strato: string; fma: string | null } | undefined) {
  if (!u) return undefined;
  return u.strato === 'organi' ? perGruppo.get(u.id) : u.fma ? perFma.get(u.fma) : undefined;
}

export const haPagina = (id: string) => id in caricaPagina;

// Moduli di contenuto già caricati: restano in memoria, così riaprire una struttura è immediato.
const caricati = new Map<string, unknown>();

function useCaricato<T>(chiave: string | undefined, carica: (() => Promise<{ default: T }>) | undefined) {
  const [, aggiorna] = useState(0);
  const [errore, segnalaErrore] = useState<string | null>(null);
  useEffect(() => {
    if (!chiave || !carica || caricati.has(chiave)) return;
    let attivo = true;
    carica().then(
      (m) => {
        caricati.set(chiave, m.default);
        if (attivo) aggiorna((n) => n + 1);
      },
      () => attivo && segnalaErrore(chiave),
    );
    return () => {
      attivo = false;
    };
  }, [chiave, carica]);
  if (!chiave) return { dato: undefined, errore: false };
  return { dato: caricati.get(chiave) as T | undefined, errore: errore === chiave };
}

export const useStruttura = (id: string | undefined) =>
  useCaricato<Struttura>(id && `struttura/${id}`, id ? caricaStruttura[id] : undefined);
export const usePagina = (id: string) => useCaricato<Pagina>(`pagina/${id}`, caricaPagina[id]);
export const useFonti = () => useCaricato<FonteCitata[]>('fonti', caricaFonti);

const MESI = [
  'gennaio',
  'febbraio',
  'marzo',
  'aprile',
  'maggio',
  'giugno',
  'luglio',
  'agosto',
  'settembre',
  'ottobre',
  'novembre',
  'dicembre',
];

/** "2026-10-22" → "22 ottobre 2026", senza passare per il fuso orario. */
export function dataEstesa(iso: string) {
  const [a, m, g] = iso.split('-').map(Number);
  return `${g} ${MESI[m - 1]} ${a}`;
}

export const urlTa2 = (numero: number) => `https://ta2viewer.openanatomy.org/?id=${numero}`;
