import { useEffect, useRef } from 'react';
import { useAtlante } from '../app/stato';
import { NOMI_APPARATI, type Organo } from '../contenuti/organi';
import { IconaIndietro } from './icone';
import { registraBersaglio } from './tracciato-richiamo';

// Sezioni della scheda organo approvate in D11. I testi arrivano con la milestone M3.
const SEZIONI = ['In breve', 'Dove si trova', 'Come è fatto', 'Cosa fa', 'Il processo', 'Collegamenti', 'Fonti'];
const ancora = (s: string) => `sez-${s.replace(/\s/g, '-').toLowerCase()}`;

/** Contenuto del pannello allargato: la scheda completa di un organo. */
export function Scheda({ organo }: { organo: Organo }) {
  const { invia } = useAtlante();
  const titolo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titolo.current?.focus({ preventScroll: true });
  }, []);

  return (
    <article className="scheda" aria-labelledby="scheda-titolo">
      <header className="scheda-testa">
        <div className="pannello-testa">
          <button type="button" className="indietro" onClick={() => invia({ tipo: 'scheda', aperta: false })}>
            <IconaIndietro /> Torna al cartellino
          </button>
        </div>
        <span className="etichetta">{NOMI_APPARATI[organo.apparato]}</span>
        <h1
          id="scheda-titolo"
          className="nome"
          tabIndex={-1}
          ref={(el) => {
            titolo.current = el;
            registraBersaglio(el);
          }}
        >
          {organo.nome}
        </h1>
        <p className="termine" lang="la">
          {organo.termine}
        </p>
        <nav className="indice-scheda" aria-label="Sezioni della scheda">
          {SEZIONI.map((s) => (
            <a key={s} href={`#${ancora(s)}`}>
              {s}
            </a>
          ))}
        </nav>
      </header>
      <div className="scheda-corpo">
        <p className="avviso">
          I testi verificati di questa scheda sono in preparazione. Le righe grigie indicano dove compariranno.
        </p>
        {SEZIONI.map((s) => (
          <section key={s} id={ancora(s)} aria-labelledby={`t-${ancora(s)}`}>
            <h2 id={`t-${ancora(s)}`}>{s}</h2>
            {s === 'Il processo' ? (
              <figure className="riquadro-processo">
                <div className="segnaposto-animazione" aria-hidden="true">
                  <span>Ciclo cardiaco</span>
                </div>
                <figcaption>
                  Qui comparirà l'animazione del ciclo cardiaco, con pausa e avanzamento passo per passo.
                </figcaption>
              </figure>
            ) : (
              <div className="righe-attesa">
                <span className="solo-lettori">Testo in preparazione</span>
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </div>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
