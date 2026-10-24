import { useLayoutEffect } from 'react';
import { misure } from '../app/misure';
import { useSenza3d } from '../app/senza3d';
import { useAtlante } from '../app/stato';
import { contenutoDi, haPercorso, PERCORSI, STRUTTURE, urlTa2, useStruttura } from '../contenuti/contenuti';
import { NOMI_APPARATI, ORGANI_PER_ID } from '../contenuti/organi';
import type { Relazione, Struttura } from '../contenuti/tipi';
import { scenaApi } from '../scena/api';
import type { Unita } from '../scena/modello';
import { ElencoFonti, Testo } from './Fonti';
import { IconaAvanti, IconaChiudi, IconaIndietro } from './icone';
import { registraBersaglio } from './tracciato-richiamo';

const FA_PARTE_DI = { ossa: 'Scheletro', muscoli: 'Sistema muscolare' } as const;

/** Appartenenza mostrata per le strutture che non hanno ancora un contenuto. */
export function appartenenza(u: Unita) {
  const organo = ORGANI_PER_ID.get(u.id);
  return organo ? NOMI_APPARATI[organo.apparato] : FA_PARTE_DI[u.strato as keyof typeof FA_PARTE_DI];
}

/** Unità del modello 3D che mostra un contenuto: l'organo per gruppo, altrimenti l'osso o il muscolo per FMA. */
function unitaDelContenuto(id: string) {
  const voce = STRUTTURE.find((s) => s.id === id);
  if (!voce) return undefined;
  if (voce.elementi3d.gruppo) return scenaApi.unita.has(voce.elementi3d.gruppo) ? voce.elementi3d.gruppo : undefined;
  for (const u of scenaApi.unita.values()) if (u.fma && voce.elementi3d.fma.includes(u.fma)) return u.id;
  return undefined;
}

/**
 * Nome di una struttura collegata, con il numero della fonte che documenta il collegamento.
 * Se la struttura ha un contenuto ed è nel modello, il nome la seleziona nel corpo (D18).
 */
export function NomeRelazione({ relazione: r }: { relazione: Relazione }) {
  const { invia } = useAtlante();
  const senza3d = useSenza3d();
  // Nella versione testuale si seleziona il contenuto stesso, che si apre come pagina.
  const unita = r.conContenuto ? (senza3d ? r.id : unitaDelContenuto(r.id)) : undefined;
  return (
    <>
      {unita ? (
        <a
          href={`/esplora/${unita}`}
          onClick={(e) => {
            e.preventDefault();
            invia({ tipo: 'seleziona', id: unita });
          }}
        >
          {r.nome}
        </a>
      ) : (
        r.nome
      )}
      {r.fonte && (
        <sup className="rimando">
          <span className="solo-lettori">fonte </span>
          <a href={`#fonte-${r.fonte}`}>{r.fonte}</a>
        </sup>
      )}
    </>
  );
}

export function Relazioni({ struttura: s }: { struttura: Struttura }) {
  const di = (tipo: Relazione['tipo']) => s.relazioni.filter((r) => r.tipo === tipo);
  const voci = (elenco: Relazione[]) =>
    elenco.map((r, i) => (
      <span key={r.id}>
        {i > 0 && ', '}
        <NomeRelazione relazione={r} />
      </span>
    ));
  return (
    <dl className="relazioni">
      <dt className="etichetta">Fa parte di</dt>
      <dd>{voci(di('fa-parte-di'))}</dd>
      {di('collegato-a').length > 0 && (
        <>
          <dt className="etichetta">Collegato a</dt>
          <dd>{voci(di('collegato-a'))}</dd>
        </>
      )}
    </dl>
  );
}

/** Termine latino della Terminologia Anatomica, con il numero che rimanda alla voce ufficiale. */
export function Termine({ termine, ta2 }: { termine: string; ta2: number }) {
  return (
    <p className="termine">
      <span lang="la">{termine}</span>{' '}
      <a className="ta2" href={urlTa2(ta2)} target="_blank" rel="noopener noreferrer">
        <span className="solo-lettori">Terminologia Anatomica, voce </span>TA2 {ta2}
      </a>
    </p>
  );
}

export function AvvisoStato({ stato }: { stato: Struttura['stato'] }) {
  if (stato === 'approvato') return null;
  return <p className="avviso-stato">Bozza ({stato}): testo non ancora approvato, visibile solo in sviluppo.</p>;
}

/** Ritorno al passo del percorso guidato da cui si è partiti per esplorare una struttura (D24). */
function TornaAlPercorso() {
  const { stato, invia } = useAtlante();
  const percorso = stato.percorso;
  if (!percorso || !haPercorso(percorso.id)) return null;
  const titolo = PERCORSI.find((p) => p.id === percorso.id)?.titolo;
  return (
    <button type="button" className="indietro torna-percorso" onClick={() => invia({ tipo: 'seleziona', id: null })}>
      <IconaIndietro /> Torna al percorso “{titolo}”, passo {percorso.passo + 1}
    </button>
  );
}

/** Contenuto del pannello per la struttura selezionata. */
export function Cartellino({ unita: u }: { unita: Unita }) {
  const { invia } = useAtlante();
  const voce = contenutoDi(u);
  const { dato: struttura, errore } = useStruttura(voce?.id);
  const organo = ORGANI_PER_ID.get(u.id);
  const nome = voce?.nome ?? organo?.nome ?? u.nomeFma;
  const gruppo = voce?.nomeApparato ?? appartenenza(u);

  useLayoutEffect(() => {
    if (!misure.inizioSelezione) return;
    const inizio = misure.inizioSelezione;
    misure.inizioSelezione = 0;
    requestAnimationFrame(() => {
      misure.latenzaSelezioneMs = Math.round(performance.now() - inizio);
    });
  }, []);

  const breve = struttura?.sezioni[0];
  const numeriRelazioni = new Set(struttura?.relazioni.map((r) => r.fonte));
  const fonti = struttura?.fonti.filter((f) => f.n <= struttura.fontiBreve || numeriRelazioni.has(f.n)) ?? [];

  return (
    <div className="cartellino">
      <TornaAlPercorso />
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
      {voce ? (
        <Termine termine={voce.termine} ta2={voce.ta2} />
      ) : organo ? (
        <p className="termine" lang="la">
          {organo.termine}
        </p>
      ) : (
        <p className="provvisorio">
          Nome provvisorio in inglese, dalla Foundational Model of Anatomy. Il nome italiano verificato è in
          preparazione.
        </p>
      )}
      {voce && <AvvisoStato stato={voce.stato} />}

      {struttura && breve ? (
        <>
          <Testo className="testo" html={breve.html} />
          <Relazioni struttura={struttura} />
        </>
      ) : voce && !errore ? (
        <p className="testo in-preparazione" role="status">
          Caricamento del testo…
        </p>
      ) : (
        <>
          <p className="testo in-preparazione">
            <span className="etichetta">Testo in preparazione</span>
            Per questa struttura non c'è ancora una descrizione verificata.
          </p>
          <dl className="relazioni">
            <dt className="etichetta">Fa parte di</dt>
            <dd>{gruppo}</dd>
          </dl>
        </>
      )}

      {voce?.scheda && (
        <button type="button" className="azione" onClick={() => invia({ tipo: 'scheda', aperta: true })}>
          Apri la scheda <IconaAvanti />
        </button>
      )}

      {struttura?.limiti && (
        <details className="note-fonti">
          <summary>Note sulle fonti</summary>
          <p>{struttura.limiti}</p>
        </details>
      )}
      {fonti.length > 0 && (
        <section className="fonti-cartellino" aria-labelledby="fonti-cartellino-titolo">
          <h3 id="fonti-cartellino-titolo" className="etichetta">
            Fonti
          </h3>
          <ElencoFonti fonti={fonti} />
        </section>
      )}
      {!voce && u.fma && u.strato !== 'organi' && (
        <p className="fonte">Identificativo FMA {u.fma.replace(/^FMA/, '')}</p>
      )}
    </div>
  );
}
