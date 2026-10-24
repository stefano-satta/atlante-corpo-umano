import { lazy, Suspense, useEffect, useRef } from 'react';
import { useAtlante } from '../app/stato';
import { contenutoDi, haPercorso } from '../contenuti/contenuti';
import { scenaApi } from '../scena/api';
import { Cartellino } from './Cartellino';
import { Scheda } from './Scheda';

// Il percorso guidato (testo, schemi, comandi) si scarica solo quando lo si apre.
const PannelloPercorso = lazy(() => import('../percorsi/PannelloPercorso'));

/** Percorso guidato in corso e pubblicato: un indirizzo verso un percorso che non c'è non apre nulla. */
export function usePercorsoAperto() {
  const { stato } = useAtlante();
  return !!stato.percorso && haPercorso(stato.percorso.id);
}

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
 * della struttura selezionata e si allarga nella scheda quando la si apre; senza
 * selezione mostra il percorso guidato in corso (D24).
 */
export function Pannello() {
  const { stato, invia } = useAtlante();
  const { unita, scheda } = useStrutturaSelezionata();
  const percorso = usePercorsoAperto();
  const eraScheda = useRef(false);

  useEffect(() => {
    if (stato.percorso && !percorso) invia({ tipo: 'percorso', percorso: null });
  }, [stato.percorso, percorso, invia]);

  // Chiudendo la scheda il fuoco torna al pulsante che l'aveva aperta.
  useEffect(() => {
    if (eraScheda.current && !scheda) document.querySelector<HTMLElement>('.pannello .azione')?.focus();
    eraScheda.current = !!scheda;
  }, [scheda]);

  if (!unita)
    return percorso ? (
      <aside className="pannello" data-modo="percorso" aria-label="Percorso guidato">
        <Suspense fallback={null}>
          <PannelloPercorso />
        </Suspense>
      </aside>
    ) : null;
  return (
    <aside className="pannello" data-modo={scheda ? 'scheda' : 'cartellino'} aria-label="Struttura selezionata">
      {scheda ? <Scheda voce={scheda} /> : <Cartellino key={unita.id} unita={unita} />}
    </aside>
  );
}
