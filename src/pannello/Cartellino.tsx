import { useLayoutEffect } from 'react';
import { misure } from '../app/misure';
import { useAtlante } from '../app/stato';
import { NOMI_APPARATI, ORGANI_PER_ID } from '../contenuti/organi';
import type { Unita } from '../scena/modello';
import { IconaAvanti, IconaChiudi } from './icone';
import { registraBersaglio } from './tracciato-richiamo';

const FA_PARTE_DI = { ossa: 'Scheletro', muscoli: 'Sistema muscolare' } as const;

export function appartenenza(u: Unita) {
  const organo = ORGANI_PER_ID.get(u.id);
  return organo ? NOMI_APPARATI[organo.apparato] : FA_PARTE_DI[u.strato as keyof typeof FA_PARTE_DI];
}

/** Contenuto del pannello per la struttura selezionata. */
export function Cartellino({ unita: u }: { unita: Unita }) {
  const { invia } = useAtlante();
  const organo = ORGANI_PER_ID.get(u.id);
  const gruppo = appartenenza(u);
  const nome = organo ? organo.nome : u.nomeFma;

  useLayoutEffect(() => {
    if (!misure.inizioSelezione) return;
    const inizio = misure.inizioSelezione;
    misure.inizioSelezione = 0;
    requestAnimationFrame(() => {
      misure.latenzaSelezioneMs = Math.round(performance.now() - inizio);
    });
  }, []);

  return (
    <div className="cartellino">
      <div className="pannello-testa">
        <span className="etichetta">{gruppo}</span>
        <button
          type="button"
          className="chiudi"
          aria-label="Chiudi il cartellino"
          onClick={() => invia({ tipo: 'seleziona', id: null })}
        >
          <IconaChiudi />
        </button>
      </div>
      <h2 id="pannello-nome" className={nome.length > 16 ? 'nome lungo' : 'nome'} ref={registraBersaglio}>
        {nome}
      </h2>
      {organo ? (
        <p className="termine" lang="la">
          {organo.termine}
        </p>
      ) : (
        <p className="provvisorio">
          Nome provvisorio in inglese, dalla Foundational Model of Anatomy. Il nome italiano verificato è in
          preparazione.
        </p>
      )}
      <p className="testo in-preparazione">
        <span className="etichetta">Testo in preparazione</span>
        Qui comparirà una descrizione divulgativa di due-quattro frasi, verificata su fonti istituzionali e con i
        riferimenti alle fonti.
      </p>
      <dl className="relazioni">
        <dt className="etichetta">Fa parte di</dt>
        <dd>{gruppo}</dd>
        <dt className="etichetta">Collegato a</dt>
        <dd className="assente">In preparazione</dd>
      </dl>
      {organo?.scheda ? (
        <button type="button" className="azione" onClick={() => invia({ tipo: 'scheda', aperta: true })}>
          Apri la scheda <IconaAvanti />
        </button>
      ) : organo ? (
        <p className="nota">Per ora la scheda completa è disponibile solo per il cuore.</p>
      ) : null}
      {!organo && u.fma && <p className="fonte">Identificativo FMA {u.fma.replace(/^FMA/, '')}</p>}
    </div>
  );
}
