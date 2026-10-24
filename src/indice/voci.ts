import { STRUTTURE } from '../contenuti/contenuti';
import { NOMI_APPARATI, ORGANI } from '../contenuti/organi';
import type { VoceIndice } from '../contenuti/tipi';

/** Una voce dell'Indice: un organo del modello o una struttura con testo, nel suo apparato. */
export interface VoceStruttura {
  chiave: string;
  nome: string;
  termine: string;
  /** Altri testi su cui cercare: sinonimi e nome dell'apparato. */
  altri: string[];
  /** Unità del modello da selezionare per mostrare la voce nel corpo. */
  unita: string | null;
  contenuto?: VoceIndice;
}

export interface GruppoApparato {
  apparato: string;
  nome: string;
  voci: VoceStruttura[];
}

const ORDINE = ['cardiovascolare', 'respiratorio', 'digerente', 'urinario', 'nervoso', 'linfatico', 'scheletrico'];

/**
 * Voci dell'Indice raggruppate per apparato (D26): gli organi del modello, con il testo quando c'è,
 * e le ossa e i muscoli che hanno un testo. Le altre ossa e gli altri muscoli restano fuori finché
 * hanno solo il nome inglese del modello.
 */
export function gruppiPerApparato(strutture: VoceIndice[] = STRUTTURE): GruppoApparato[] {
  const gruppi = new Map<string, GruppoApparato>();
  const aggiungi = (apparato: string, nome: string, voce: VoceStruttura) => {
    if (!gruppi.has(apparato)) gruppi.set(apparato, { apparato, nome, voci: [] });
    gruppi.get(apparato)?.voci.push(voce);
  };
  const usate = new Set<string>();
  for (const o of ORGANI) {
    const c = strutture.find((s) => s.unita === o.id);
    if (c) usate.add(c.id);
    const nomeApparato = c?.nomeApparato ?? NOMI_APPARATI[o.apparato];
    aggiungi(c?.apparato ?? o.apparato, nomeApparato, {
      chiave: o.id,
      nome: c?.nome ?? o.nome,
      termine: c?.termine ?? o.termine,
      altri: [...(c?.sinonimi ?? []), nomeApparato],
      unita: o.id,
      contenuto: c,
    });
  }
  for (const c of strutture)
    if (!usate.has(c.id))
      aggiungi(c.apparato, c.nomeApparato, {
        chiave: c.id,
        nome: c.nome,
        termine: c.termine,
        altri: [...c.sinonimi, c.nomeApparato],
        unita: c.unita,
        contenuto: c,
      });
  const posto = (a: string) => (ORDINE.includes(a) ? ORDINE.indexOf(a) : ORDINE.length);
  return [...gruppi.values()]
    .sort((a, b) => posto(a.apparato) - posto(b.apparato) || a.nome.localeCompare(b.nome, 'it'))
    .map((g) => ({ ...g, voci: g.voci.sort((a, b) => a.nome.localeCompare(b.nome, 'it')) }));
}
