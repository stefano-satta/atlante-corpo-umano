import { useEffect, useRef } from 'react';
import { useAtlante } from '../app/stato';
import { contenutoDi } from '../contenuti/contenuti';
import { scenaApi } from '../scena/api';
import { Cartellino } from './Cartellino';
import { Scheda } from './Scheda';

/** Unità selezionata e, se la scheda è aperta e disponibile, la voce di contenuto da mostrare. */
export function useStrutturaSelezionata() {
  const { stato } = useAtlante();
  const unita = stato.selezione ? scenaApi.unita.get(stato.selezione) : undefined;
  const voce = contenutoDi(unita);
  const scheda = stato.scheda && voce?.scheda ? voce : undefined;
  return { unita, voce, scheda };
}

/**
 * Pannello ancorato al bordo destro, a tutta altezza (D16). Mostra il cartellino
 * della struttura selezionata e si allarga nella scheda quando la si apre.
 */
export function Pannello() {
  const { unita, scheda } = useStrutturaSelezionata();
  const eraScheda = useRef(false);

  // Chiudendo la scheda il fuoco torna al pulsante che l'aveva aperta.
  useEffect(() => {
    if (eraScheda.current && !scheda) document.querySelector<HTMLElement>('.pannello .azione')?.focus();
    eraScheda.current = !!scheda;
  }, [scheda]);

  if (!unita) return null;
  return (
    <aside className="pannello" data-modo={scheda ? 'scheda' : 'cartellino'} aria-label="Struttura selezionata">
      {scheda ? <Scheda voce={scheda} /> : <Cartellino key={unita.id} unita={unita} />}
    </aside>
  );
}
