import { useEffect, useRef } from 'react';
import { useAtlante } from '../app/stato';
import { ORGANI_PER_ID } from '../contenuti/organi';
import { scenaApi } from '../scena/api';
import { Cartellino } from './Cartellino';
import { Scheda } from './Scheda';

/**
 * Pannello ancorato al bordo destro, a tutta altezza (D16). Mostra il cartellino
 * della struttura selezionata e si allarga nella scheda quando la si apre.
 */
export function Pannello() {
  const { stato } = useAtlante();
  const u = stato.selezione ? scenaApi.unita.get(stato.selezione) : undefined;
  const organo = u ? ORGANI_PER_ID.get(u.id) : undefined;
  const scheda = stato.scheda && organo?.scheda ? organo : undefined;
  const eraScheda = useRef(false);

  // Chiudendo la scheda il fuoco torna al pulsante che l'aveva aperta.
  useEffect(() => {
    if (eraScheda.current && !scheda) document.querySelector<HTMLElement>('.pannello .azione')?.focus();
    eraScheda.current = !!scheda;
  }, [scheda]);

  if (!u) return null;
  return (
    <aside className="pannello" data-modo={scheda ? 'scheda' : 'cartellino'} aria-label="Struttura selezionata">
      {scheda ? <Scheda organo={scheda} /> : <Cartellino key={u.id} unita={u} />}
    </aside>
  );
}
