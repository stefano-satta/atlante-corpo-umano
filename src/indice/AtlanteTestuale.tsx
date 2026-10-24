import { lazy, Suspense } from 'react';
import { Senza3d } from '../app/senza3d';
import { useAtlante } from '../app/stato';
import { haPercorso, STRUTTURE } from '../contenuti/contenuti';
import { IntestazioneTestuale, Pagina } from '../pagine/Pagina';
import { Scheda } from '../pannello/Scheda';

const PannelloPercorso = lazy(() => import('../percorsi/PannelloPercorso'));

/**
 * Atlante senza grafica 3D (D26, E1): si apre l'Indice, e da lì si leggono i testi delle
 * strutture, il ciclo cardiaco e i percorsi, con gli stessi indirizzi della versione 3D.
 * Una struttura si riconosce dal suo id o dall'unità del modello che la mostra.
 */
export function AtlanteTestuale() {
  const { stato } = useAtlante();
  const voce = stato.selezione
    ? STRUTTURE.find((s) => s.id === stato.selezione || s.unita === stato.selezione)
    : undefined;
  const percorso = !stato.selezione && stato.percorso && haPercorso(stato.percorso.id);

  let contenuto: React.ReactNode;
  if (stato.pagina || (!voce && !percorso)) contenuto = <Pagina id={stato.pagina ?? 'indice'} senza3d />;
  else
    contenuto = (
      <main className="pagina lettura-testuale" aria-label={voce ? voce.nome : 'Percorso guidato'}>
        <div className="pagina-colonna">
          <IntestazioneTestuale />
          {voce ? (
            <Scheda key={voce.id} voce={voce} />
          ) : (
            <Suspense fallback={<p role="status">Caricamento del percorso…</p>}>
              <PannelloPercorso />
            </Suspense>
          )}
        </div>
      </main>
    );

  return <Senza3d.Provider value={true}>{contenuto}</Senza3d.Provider>;
}
