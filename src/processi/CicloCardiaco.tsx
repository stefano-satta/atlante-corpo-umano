import { useMovimentoRidotto } from '../app/stato';
import type { Processo } from '../contenuti/tipi';
import { Testo } from '../pannello/Fonti';
import { IconaPausa, IconaPrecedente, IconaRiproduci, IconaSuccessivo } from '../pannello/icone';
import { useRiproduzione } from './riproduzione';
import { SchemaCuore } from './SchemaCuore';

const TONI = { primo: 'Primo tono', secondo: 'Secondo tono' } as const;

/**
 * Animazione del ciclo cardiaco nella scheda del cuore (M5). Ogni passo mostra lo schema
 * nello stato descritto dal contenuto e la didascalia con i rimandi alle fonti della scheda.
 */
export default function CicloCardiaco({ processo }: { processo: Processo }) {
  const ridotto = useMovimentoRidotto();
  const { passo: n, inRiproduzione, vai, avanti, indietro, alterna } = useRiproduzione(processo.passi.length);
  const passo = processo.passi[n];
  const totale = processo.passi.length;

  return (
    <figure className="ciclo" aria-labelledby="ciclo-titolo">
      <figcaption id="ciclo-titolo" className="ciclo-titolo">
        {processo.titolo}
      </figcaption>
      <div className="ciclo-schema" data-in-riproduzione={inRiproduzione}>
        <SchemaCuore passo={passo} />
        {passo.tono !== 'nessuno' && (
          <span className="ciclo-tono" key={`${n}-${passo.tono}`}>
            {TONI[passo.tono]}
          </span>
        )}
      </div>

      <div className="ciclo-comandi">
        <button type="button" className="ciclo-pulsante" onClick={indietro} aria-label="Passo precedente">
          <IconaPrecedente />
        </button>
        {/* Con il movimento ridotto non c'è riproduzione continua: si va avanti un passo alla volta. */}
        {!ridotto && (
          <button type="button" className="ciclo-pulsante riproduci" onClick={alterna} aria-pressed={inRiproduzione}>
            {inRiproduzione ? <IconaPausa /> : <IconaRiproduci />}
            {inRiproduzione ? 'Pausa' : 'Riproduci'}
          </button>
        )}
        <button type="button" className="ciclo-pulsante" onClick={avanti} aria-label="Passo successivo">
          <IconaSuccessivo />
        </button>
        <ol className="ciclo-passi" aria-label="Passi del ciclo">
          {processo.passi.map((p, i) => (
            <li key={p.titolo}>
              <button
                type="button"
                aria-label={`Passo ${i + 1}: ${p.titolo}`}
                aria-current={i === n ? 'step' : undefined}
                onClick={() => vai(i)}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* Durante la riproduzione le didascalie non vengono lette di continuo: solo quando si sceglie un passo. */}
      <div className="ciclo-didascalia" aria-live={inRiproduzione ? 'off' : 'polite'}>
        <p className="ciclo-numero etichetta">
          Passo {n + 1} di {totale}
        </p>
        <h3>{passo.titolo}</h3>
        <Testo className="testo" html={passo.html} />
      </div>

      <ul className="ciclo-legenda">
        <li className="voce-legenda">
          <span className="campione povero" aria-hidden="true" /> Sangue povero di ossigeno
        </li>
        <li className="voce-legenda">
          <span className="campione ricco" aria-hidden="true" /> Sangue ricco di ossigeno
        </li>
        <li className="voce-legenda">
          <span className="campione segnale" aria-hidden="true" /> Segnale elettrico
        </li>
      </ul>
      <p className="ciclo-avvertenza">
        Schema semplificato: forme, proporzioni e tempi non sono in scala. Il lato destro del cuore è a sinistra
        dell'immagine, come in una persona vista di fronte.
      </p>
    </figure>
  );
}
