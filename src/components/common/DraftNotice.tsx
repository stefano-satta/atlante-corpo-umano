import type { ContentStatus } from '@/models/content';

/** Avviso per i testi non ancora approvati, che si vedono solo in sviluppo. */
export function DraftNotice({ status }: { status: ContentStatus }) {
  if (status === 'approvato') return null;
  return <p className="draft-notice">Bozza ({status}): testo non ancora approvato, visibile solo in sviluppo.</p>;
}
