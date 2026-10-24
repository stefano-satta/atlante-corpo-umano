import type { Source } from '@/models/content';

const MONTHS = [
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
export function formatLongDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** Voce ufficiale della Terminologia Anatomica (TA2). */
export const ta2Url = (number: number) => `https://ta2viewer.openanatomy.org/?id=${number}`;

/** Autore di una fonte: l'ente, oppure i primi autori seguiti da "e altri". */
export function sourceAuthor(source: Source) {
  if (source.ente) return source.ente;
  const authors = source.autori ?? [];
  return authors.length > 2 ? `${authors.slice(0, 2).join(', ')} e altri` : authors.join(', ');
}
