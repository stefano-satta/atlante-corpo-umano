import { useEffect, useRef } from 'react';
import { NOMI_APPARATI, ORGANI_PER_ID } from '../dati/organi';
import { useAtlante } from '../stato';

// Sezioni della scheda organo approvate in D11. Nel prototipo sono solo impaginate.
const SEZIONI = ['In breve', 'Dove si trova', 'Come è fatto', 'Cosa fa', 'Il processo', 'Collegamenti', 'Fonti'];

export function Scheda() {
  const { stato, invia } = useAtlante();
  const organo = stato.selezione ? ORGANI_PER_ID.get(stato.selezione) : undefined;
  const titolo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (stato.scheda) titolo.current?.focus();
  }, [stato.scheda]);

  if (!stato.scheda || !organo) return null;
  return (
    <article className="scheda" aria-labelledby="scheda-titolo">
      <header className="scheda-testa">
        <button className="indietro" onClick={() => invia({ tipo: 'scheda', aperta: false })}>
          <span aria-hidden="true">←</span> Torna al cartellino
        </button>
        <span className="etichetta">{NOMI_APPARATI[organo.apparato]}</span>
        <h1 id="scheda-titolo" ref={titolo} tabIndex={-1}>
          {organo.nome}
        </h1>
        <p className="termine">{organo.termine}</p>
        <p className="avviso-prova">
          Prototipo: la scheda mostra solo l'impaginazione. I contenuti verificati arriveranno in Fase 6.
        </p>
        <nav className="indice-scheda" aria-label="Sezioni della scheda">
          {SEZIONI.map((s) => (
            <a key={s} href={`#sez-${s.replace(/\s/g, '-').toLowerCase()}`}>
              {s}
            </a>
          ))}
        </nav>
      </header>
      <div className="scheda-corpo">
        {SEZIONI.map((s) => (
          <section key={s} id={`sez-${s.replace(/\s/g, '-').toLowerCase()}`} aria-labelledby={`t-${s}`}>
            <h2 id={`t-${s}`}>{s}</h2>
            {s === 'Il processo' ? (
              <figure className="riquadro-processo">
                <div className="segnaposto-animazione" aria-hidden="true">
                  <span>Ciclo cardiaco</span>
                </div>
                <figcaption>
                  Qui andrà l'animazione del ciclo cardiaco, con pausa e avanzamento passo per passo. Non fa parte del
                  prototipo P1.
                </figcaption>
              </figure>
            ) : (
              <div className="righe-prova" aria-label="Testo di prova">
                <span />
                <span />
                <span />
              </div>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
