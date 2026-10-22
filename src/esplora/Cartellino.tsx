import { useLayoutEffect } from 'react';
import { misure } from '../app/misure';
import { useAtlante } from '../app/stato';
import { NOMI_APPARATI, ORGANI_PER_ID } from '../contenuti/organi';
import { scenaApi } from '../scena/api';

const FA_PARTE_DI = { ossa: 'Scheletro', muscoli: 'Sistema muscolare' } as const;

export function Cartellino() {
  const { stato, invia } = useAtlante();
  const u = stato.selezione ? scenaApi.unita.get(stato.selezione) : undefined;

  useLayoutEffect(() => {
    if (!u || !misure.inizioSelezione) return;
    const inizio = misure.inizioSelezione;
    misure.inizioSelezione = 0;
    requestAnimationFrame(() => {
      misure.latenzaSelezioneMs = Math.round(performance.now() - inizio);
    });
  }, [u]);

  if (!u || stato.scheda) return null;
  const organo = ORGANI_PER_ID.get(u.id);
  const appartenenza = organo ? NOMI_APPARATI[organo.apparato] : FA_PARTE_DI[u.strato as keyof typeof FA_PARTE_DI];

  return (
    <aside className="cartellino" aria-labelledby="cartellino-nome">
      <div className="cartellino-testa">
        <span className="etichetta">{appartenenza}</span>
        <button
          type="button"
          className="chiudi"
          aria-label="Chiudi il cartellino"
          onClick={() => invia({ tipo: 'seleziona', id: null })}
        >
          ×
        </button>
      </div>
      <h2 id="cartellino-nome" className="nome">
        {organo ? organo.nome : u.nomeFma}
      </h2>
      {organo ? (
        <p className="termine">{organo.termine}</p>
      ) : (
        <p className="provvisorio">
          Nome provvisorio in inglese (FMA). La traduzione italiana verificata arriverà con i contenuti.
        </p>
      )}
      <p className="testo-prova">
        <span className="badge">Testo di prova</span> Qui comparirà una descrizione divulgativa di due-quattro frasi,
        verificata su fonti istituzionali, con i riferimenti numerati alle fonti.
      </p>
      <dl className="relazioni">
        <dt>Fa parte di</dt>
        <dd>{appartenenza}</dd>
        <dt>Collegato a</dt>
        <dd className="in-preparazione">In preparazione</dd>
      </dl>
      {organo?.scheda ? (
        <button type="button" className="apri-scheda" onClick={() => invia({ tipo: 'scheda', aperta: true })}>
          Apri la scheda <span aria-hidden="true">→</span>
        </button>
      ) : organo ? (
        <p className="nota">Nel prototipo la scheda è disponibile solo per il cuore.</p>
      ) : null}
      {!organo && u.fma && <p className="fonte">Identificativo anatomico: {u.fma}</p>}
    </aside>
  );
}
