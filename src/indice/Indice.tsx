import { useEffect, useId, useMemo, useState } from 'react';
import { useAtlante } from '../app/stato';
import { GLOSSARIO, PERCORSI, PROCESSI, STRUTTURE, useGlossario } from '../contenuti/contenuti';
import { voceRichiesta } from '../glossario/richiesta';
import { autoreFonte, Testo } from '../pannello/Fonti';
import { corrisponde } from './ricerca';
import { gruppiPerApparato, type VoceStruttura } from './voci';

/**
 * Indice dell'atlante (D26): alternativa testuale alla scena, con ricerca. Elenca percorsi,
 * processi, organi e strutture con testo per apparato, e il glossario. Senza grafica 3D
 * (`senza3d`) le voci aprono il testo invece di mostrare la struttura nel corpo.
 */
export function Indice({ senza3d = false }: { senza3d?: boolean }) {
  const { invia } = useAtlante();
  const [cercato, setCercato] = useState('');
  const idCampo = useId();
  const gruppi = useMemo(() => gruppiPerApparato(), []);
  const { dato: definizioni, errore: erroreGlossario } = useGlossario(GLOSSARIO.length > 0);

  // Arrivando da una definizione sul posto, o da /indice#glossario-<voce>, si va a quella voce.
  // Si aspetta un fotogramma: all'apertura la pagina torna in cima e mette il fuoco sul titolo.
  useEffect(() => {
    if (!definizioni) return;
    const id = requestAnimationFrame(() => {
      const voce = voceRichiesta();
      const elemento = voce ? document.getElementById(`glossario-${voce}`) : null;
      elemento?.scrollIntoView({ block: 'start' });
      elemento?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [definizioni]);

  const chiudi = () => invia({ tipo: 'pagina', pagina: null });
  const mostra = (v: VoceStruttura) => {
    if (senza3d) {
      if (v.contenuto) invia({ tipo: 'seleziona', id: v.contenuto.id });
    } else if (v.unita) invia({ tipo: 'seleziona', id: v.unita });
    chiudi();
  };
  const apriScheda = (unita: string) => {
    invia({ tipo: 'seleziona', id: unita });
    invia({ tipo: 'scheda', aperta: true });
    chiudi();
  };

  const filtrati = gruppi
    .map((g) => ({
      ...g,
      voci: g.voci.filter((v) => corrisponde(cercato, [v.nome, v.termine, ...v.altri])),
    }))
    .filter((g) => g.voci.length);
  const percorsi = PERCORSI.filter((p) => corrisponde(cercato, [p.titolo, 'percorso']));
  const processi = PROCESSI.flatMap((p) => {
    const s = STRUTTURE.find((x) => x.id === p.struttura);
    return s && corrisponde(cercato, [p.titolo, s.nome, 'processo']) ? [{ ...p, s }] : [];
  });
  const glossario = (definizioni ?? []).filter((v) => corrisponde(cercato, [v.termine, ...v.varianti]));
  const totale = filtrati.reduce((n, g) => n + g.voci.length, 0) + percorsi.length + processi.length + glossario.length;
  const cercando = cercato.trim() !== '';

  return (
    <div className="indice">
      <p className="introduzione">
        {senza3d
          ? 'Tutto ciò che l’atlante contiene, in ordine di apparato. Scegli un nome per leggerne il testo.'
          : 'Tutto ciò che l’atlante contiene, in ordine di apparato. Scegli un nome per vederlo nel corpo.'}
      </p>

      <search className="ricerca">
        <label htmlFor={idCampo} className="etichetta">
          Cerca nell'atlante
        </label>
        <input
          id={idCampo}
          type="search"
          value={cercato}
          onChange={(e) => setCercato(e.target.value)}
          placeholder="Un organo, un termine latino, un apparato…"
          autoComplete="off"
          spellCheck={false}
        />
        <p className="esito-ricerca" role="status">
          {cercando ? (totale === 1 ? '1 risultato' : `${totale} risultati`) : ''}
        </p>
      </search>

      {cercando && totale === 0 && (
        <p className="nessun-risultato">
          Nessun risultato per «{cercato.trim()}». Prova con il nome italiano, con il termine latino o con il nome di un
          apparato.
        </p>
      )}

      {percorsi.length > 0 && (
        <section aria-labelledby="indice-percorsi">
          <h2 id="indice-percorsi">Percorsi guidati</h2>
          <ul className="voci-indice">
            {percorsi.map((p) => (
              <li key={p.id} className="voce-indice">
                <button
                  type="button"
                  className="nome-voce"
                  aria-label={`${p.titolo}: inizia il percorso`}
                  onClick={() => {
                    invia({ tipo: 'percorso', percorso: { id: p.id, passo: 0 } });
                    chiudi();
                  }}
                >
                  {p.titolo}
                </button>
                <span className="dettaglio-voce">Percorso in {p.passi} passi</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {processi.length > 0 && (
        <section aria-labelledby="indice-processi">
          <h2 id="indice-processi">Processi</h2>
          <ul className="voci-indice">
            {processi.map((p) => (
              <li key={p.id} className="voce-indice">
                <button
                  type="button"
                  className="nome-voce"
                  aria-label={`${p.titolo}: ${senza3d ? 'leggi il testo' : 'apri la scheda'}`}
                  onClick={() => {
                    if (senza3d) {
                      invia({ tipo: 'seleziona', id: p.s.id });
                      chiudi();
                    } else if (p.s.unita) apriScheda(p.s.unita);
                  }}
                >
                  {p.titolo}
                </button>
                <span className="dettaglio-voce">Animazione nella scheda: {p.s.nome}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {filtrati.length > 0 && (
        <section aria-labelledby="indice-strutture">
          <h2 id="indice-strutture">Organi e strutture</h2>
          {filtrati.map((g) => (
            <section key={g.apparato} className="gruppo-indice" aria-labelledby={`indice-${g.apparato}`}>
              <h3 id={`indice-${g.apparato}`} className="etichetta">
                {g.nome}
              </h3>
              <ul className="voci-indice">
                {g.voci.map((v) => (
                  <VoceOrgano key={v.chiave} voce={v} senza3d={senza3d} mostra={mostra} apriScheda={apriScheda} />
                ))}
              </ul>
            </section>
          ))}
          <p className="nota">
            Le ossa e i muscoli senza testo non sono nell'Indice: per ora hanno solo il nome inglese del modello 3D.
            {!senza3d && ' Si possono scegliere direttamente nel corpo.'}
          </p>
        </section>
      )}

      {GLOSSARIO.length > 0 && (!cercando || glossario.length > 0) && (
        <section aria-labelledby="indice-glossario" id="glossario">
          <h2 id="indice-glossario">Glossario</h2>
          {erroreGlossario ? (
            <p className="avviso">Non è stato possibile caricare il glossario.</p>
          ) : !definizioni ? (
            <p>Caricamento del glossario…</p>
          ) : (
            <>
              {definizioni.some((v) => v.stato !== 'approvato') && (
                <p className="avviso-stato">
                  Bozza: alcune definizioni non sono ancora approvate e sono visibili solo in sviluppo.
                </p>
              )}
              <dl className="glossario">
                {glossario.map((v) => (
                  <div key={v.id} id={`glossario-${v.id}`} tabIndex={-1} className="voce-glossario">
                    <dt>{v.termine}</dt>
                    <dd>
                      <Testo className="definizione" html={v.html} />
                      <p className="fonte-voce">
                        {v.fonti.length > 1 ? 'Fonti: ' : 'Fonte: '}
                        {v.fonti.map((f, i) => (
                          <span key={f.id}>
                            {i > 0 && '; '}
                            <a href={f.url} target="_blank" rel="noopener noreferrer">
                              {f.titolo}
                            </a>{' '}
                            ({autoreFonte(f)})
                          </span>
                        ))}
                        .
                      </p>
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </section>
      )}
    </div>
  );
}

function VoceOrgano({
  voce: v,
  senza3d,
  mostra,
  apriScheda,
}: {
  voce: VoceStruttura;
  senza3d: boolean;
  mostra: (v: VoceStruttura) => void;
  apriScheda: (unita: string) => void;
}) {
  const c = v.contenuto;
  const tipo = c ? (c.scheda ? 'Testo e scheda' : 'Testo') : 'Solo nel modello 3D';
  const attiva = senza3d ? !!c : !!v.unita;
  return (
    <li className="voce-indice" data-contenuto={c ? 'si' : 'no'}>
      {attiva ? (
        <button
          type="button"
          className="nome-voce"
          aria-label={`${v.nome}: ${senza3d ? 'leggi il testo' : 'mostra nel corpo'}`}
          onClick={() => mostra(v)}
        >
          {v.nome}
        </button>
      ) : (
        <span className="nome-voce">{v.nome}</span>
      )}
      <span className="termine-voce" lang="la">
        {v.termine}
      </span>
      <span className="dettaglio-voce">{tipo}</span>
      {c?.scheda && !senza3d && v.unita && (
        <button
          type="button"
          className="apri-voce"
          aria-label={`Apri la scheda: ${v.nome}`}
          onClick={() => v.unita && apriScheda(v.unita)}
        >
          Scheda
        </button>
      )}
    </li>
  );
}
