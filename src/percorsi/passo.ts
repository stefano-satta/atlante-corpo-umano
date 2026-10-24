import { useAtlante } from '../app/stato';
import { usePercorso } from '../contenuti/contenuti';

/** Percorso in corso e passo mostrato, se il contenuto è pubblicato e già caricato. */
export function usePassoAttivo() {
  const { stato } = useAtlante();
  const { dato: percorso, errore } = usePercorso(stato.percorso?.id);
  const passo = percorso && stato.percorso ? percorso.passi[stato.percorso.passo] : undefined;
  return { percorso, passo, numero: stato.percorso?.passo ?? 0, errore };
}
