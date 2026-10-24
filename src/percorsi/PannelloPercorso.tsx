import { useEffect, useRef, useState } from 'react';
import { useSenza3d } from '../app/senza3d';
import { useAtlante, useMovimentoRidotto } from '../app/stato';
import type { PassoPercorso } from '../contenuti/tipi';
import { AvvisoStato } from '../pannello/Cartellino';
import { ElencoFonti, Testo } from '../pannello/Fonti';
import { IconaAvanti, IconaChiudi, IconaIndietro, IconaPausa, IconaRiproduci } from '../pannello/icone';
import { usePassoAttivo } from './passo';
import { SchemaAlveolo, SchemaTorace, useFase } from './SchemaRespiro';

const FASI = { riposo: null, inspirazione: 'Inspirazione', espirazione: 'Espirazione' } as const;

/** Schema 2D del passo, con la riproduzione continua (assente con il movimento ridotto). */
function Schema({ passo }: { passo: PassoPercorso }) {
  const ridotto = useMovimentoRidotto();
  // La riproduzione parte ferma (WCAG 2.2.2) e si ferma cambiando passo: il componente si rimonta.
  const [inRiproduzione, impostaRiproduzione] = useState(false);
  const fase = useFase(passo.schema, inRiproduzione && !ridotto, ridotto);
  const alveolo = passo.schema === 'alveolo';

  return (
    <figure className="ciclo respiro" aria-label={alveolo ? 'Schema di un alveolo' : 'Schema del torace'}>
      <div className="ciclo-schema" data-in-riproduzione={inRiproduzione}>
        {alveolo ? <SchemaAlveolo /> : <SchemaTorace fase={fase} />}
        {!alveolo && FASI[fase] && (
          <span className="ciclo-tono fase-respiro" key={fase}>
            {FASI[fase]}
          </span>
        )}
      </div>
      {!ridotto && (
        <div className="ciclo-comandi">
          <button
            type="button"
            className="ciclo-pulsante riproduci"
            onClick={() => impostaRiproduzione((r) => !r)}
            aria-pressed={inRiproduzione}
          >
            {inRiproduzione ? <IconaPausa /> : <IconaRiproduci />}
            {inRiproduzione ? 'Pausa' : alveolo ? 'Riproduci gli scambi' : 'Riproduci il respiro'}
          </button>
        </div>
      )}
      {alveolo && (
        <ul className="ciclo-legenda">
          <li className="voce-legenda">
            <span className="campione povero" aria-hidden="true" /> Sangue povero di ossigeno
          </li>
          <li className="voce-legenda">
            <span className="campione ricco" aria-hidden="true" /> Sangue ricco di ossigeno
          </li>
          <li className="voce-legenda">
            <span className="campione ossigeno" aria-hidden="true" /> Ossigeno, dall'aria al sangue
          </li>
          <li className="voce-legenda">
            <span className="campione anidride" aria-hidden="true" /> Anidride carbonica, dal sangue all'aria
          </li>
        </ul>
      )}
      <p className="ciclo-avvertenza">
        {alveolo
          ? 'Schema semplificato, non in scala: un solo alveolo e un solo capillare.'
          : "Schema semplificato, non in scala; i movimenti sono accentuati. Il lato destro del corpo è a sinistra dell'immagine."}
      </p>
    </figure>
  );
}

/**
 * Percorso guidato nel pannello a destra (D24): un passo alla volta, con testo, schema e fonti.
 * Ogni passo sceglie lo strato e le strutture evidenziate; la telecamera le inquadra (Scena.tsx).
 */
export default function PannelloPercorso() {
  const { invia } = useAtlante();
  const senza3d = useSenza3d();
  const { percorso, passo, numero, errore } = usePassoAttivo();
  const titolo = useRef<HTMLHeadingElement>(null);
  const totale = percorso?.passi.length ?? 0;

  // Ogni passo mostra il suo strato: anche tornando al percorso dopo aver esplorato.
  useEffect(() => {
    if (passo) invia({ tipo: 'mostra-strato', strato: passo.strato });
  }, [passo, invia]);

  // Un indirizzo con un passo oltre l'ultimo porta all'ultimo.
  useEffect(() => {
    if (percorso && numero >= totale) invia({ tipo: 'percorso', percorso: { id: percorso.id, passo: totale - 1 } });
  }, [percorso, numero, totale, invia]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a ogni nuovo passo il pannello torna in cima
  useEffect(() => {
    const pannello = titolo.current?.closest('.pannello, .pagina');
    if (pannello) pannello.scrollTop = 0;
  }, [numero]);

  if (errore) return <p className="avviso percorso">Non è stato possibile caricare il percorso.</p>;
  if (!percorso || !passo)
    return (
      <p className="percorso testo in-preparazione" role="status">
        Caricamento del percorso…
      </p>
    );

  const vai = (n: number) => invia({ tipo: 'percorso', percorso: { id: percorso.id, passo: n } });
  const chiudi = () => invia({ tipo: 'percorso', percorso: null });
  const ultimo = numero === totale - 1;
  // Fonti citate in questo passo, con la numerazione del percorso.
  const citate = new Set([...passo.html.matchAll(/#fonte-(\d+)/g)].map((m) => Number(m[1])));
  const fonti = percorso.fonti.filter((f) => citate.has(f.n));

  return (
    <article className="percorso" aria-labelledby="percorso-passo">
      <div className="pannello-testa">
        <span className="etichetta">Percorso · {percorso.titolo}</span>
        <button type="button" className="chiudi" aria-label="Chiudi il percorso" onClick={chiudi}>
          <IconaChiudi />
        </button>
      </div>
      <p className="percorso-numero etichetta">
        Passo {numero + 1} di {totale}
      </p>
      <h2 id="percorso-passo" ref={titolo} className={passo.titolo.length > 16 ? 'nome lungo' : 'nome'}>
        {passo.titolo}
      </h2>
      <p className="solo-lettori" aria-live="polite">
        Passo {numero + 1} di {totale}: {passo.titolo}
      </p>
      <AvvisoStato stato={percorso.stato} />

      {passo.schema !== 'nessuno' && <Schema key={numero} passo={passo} />}
      <Testo className="testo" html={passo.html} />

      <nav className="percorso-comandi" aria-label="Passi del percorso">
        <button type="button" className="indietro" onClick={() => vai(numero - 1)} disabled={numero === 0}>
          <IconaIndietro /> Indietro
        </button>
        {ultimo ? (
          <button type="button" className="azione" onClick={chiudi}>
            {senza3d ? "Torna all'indice" : 'Esplora liberamente'} <IconaAvanti />
          </button>
        ) : (
          <button type="button" className="azione" onClick={() => vai(numero + 1)}>
            Avanti <IconaAvanti />
          </button>
        )}
        <ol className="percorso-passi">
          {percorso.passi.map((p, i) => (
            <li key={p.titolo}>
              <button
                type="button"
                aria-label={`Passo ${i + 1}: ${p.titolo}`}
                aria-current={i === numero ? 'step' : undefined}
                onClick={() => vai(i)}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      {senza3d ? (
        <p className="nota">Nella versione testuale il corpo 3D non c'è: restano il testo e gli schemi.</p>
      ) : (
        <p className="nota">
          Puoi ruotare il corpo e scegliere una struttura in ogni momento, poi tornare al percorso.
        </p>
      )}

      {percorso.limiti && (
        <details className="note-fonti">
          <summary>Note sulle fonti</summary>
          <p>{percorso.limiti}</p>
        </details>
      )}
      {fonti.length > 0 && (
        <section className="fonti-cartellino" aria-labelledby="fonti-percorso-titolo">
          <h3 id="fonti-percorso-titolo" className="etichetta">
            Fonti di questo passo
          </h3>
          <ElencoFonti fonti={fonti} />
        </section>
      )}
    </article>
  );
}
