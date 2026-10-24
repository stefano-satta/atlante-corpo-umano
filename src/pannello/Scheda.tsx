import { useEffect, useRef } from 'react';
import { useAtlante } from '../app/stato';
import { dataEstesa, haPagina, useStruttura } from '../contenuti/contenuti';
import type { VoceIndice } from '../contenuti/tipi';
import { LinkPagina } from '../pagine/Pagina';
import { AvvisoStato, NomeRelazione, Termine } from './Cartellino';
import { ElencoFonti, Testo } from './Fonti';
import { IconaIndietro } from './icone';
import { registraBersaglio } from './tracciato-richiamo';

/** Contenuto del pannello allargato: la scheda completa di un organo (sezioni di D11). */
export function Scheda({ voce }: { voce: VoceIndice }) {
  const { invia } = useAtlante();
  const { dato: s } = useStruttura(voce.id);
  const titolo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const pannello = titolo.current?.closest('.pannello');
    if (pannello) pannello.scrollTop = 0;
    titolo.current?.focus({ preventScroll: true });
  }, []);

  const indice = [
    ...(s?.sezioni.map((x) => ({ ancora: x.ancora, titolo: x.chiave })) ?? []),
    { ancora: 'collegamenti', titolo: 'Collegamenti' },
    { ancora: 'fonti', titolo: 'Fonti' },
  ];

  return (
    <article className="scheda" aria-labelledby="scheda-titolo">
      <header className="scheda-testa">
        <div className="pannello-testa">
          <button type="button" className="indietro" onClick={() => invia({ tipo: 'scheda', aperta: false })}>
            <IconaIndietro /> Torna al cartellino
          </button>
        </div>
        <span className="etichetta">{voce.nomeApparato}</span>
        <h1
          id="scheda-titolo"
          className="nome"
          tabIndex={-1}
          ref={(el) => {
            titolo.current = el;
            registraBersaglio(el);
          }}
        >
          {voce.nome}
        </h1>
        <Termine termine={voce.termine} ta2={voce.ta2} />
      </header>
      {/* Solo l'indice resta fermo in alto mentre si legge: il titolo scorre via con il testo. */}
      <nav className="indice-scheda" aria-label="Sezioni della scheda">
        {indice.map((x) => (
          <a key={x.ancora} href={`#sez-${x.ancora}`}>
            {x.titolo}
          </a>
        ))}
      </nav>
      <div className="scheda-corpo">
        <AvvisoStato stato={voce.stato} />
        {!s && (
          <p className="avviso" role="status">
            Caricamento del testo…
          </p>
        )}
        {s?.sezioni.map((x) => (
          <section key={x.ancora} id={`sez-${x.ancora}`} aria-labelledby={`t-${x.ancora}`}>
            <h2 id={`t-${x.ancora}`}>{x.titolo}</h2>
            <Testo className="testo" html={x.html} />
            {x.chiave === 'Il processo' && voce.id === 'cuore' && (
              <figure className="riquadro-processo">
                <div className="segnaposto-animazione" aria-hidden="true">
                  <span>Ciclo cardiaco</span>
                </div>
                <figcaption>
                  L'animazione del ciclo cardiaco, con pausa e avanzamento passo per passo, è in preparazione.
                </figcaption>
              </figure>
            )}
          </section>
        ))}
        {s && (
          <>
            <section id="sez-collegamenti" aria-labelledby="t-collegamenti">
              <h2 id="t-collegamenti">Collegamenti</h2>
              <ul className="collegamenti">
                {s.relazioni.map((r) => (
                  <li key={`${r.tipo}-${r.id}`}>
                    <span className="etichetta">{r.tipo === 'fa-parte-di' ? 'Fa parte di' : 'Collegato a'}</span>
                    <NomeRelazione relazione={r} />
                  </li>
                ))}
              </ul>
            </section>
            <section id="sez-fonti" aria-labelledby="t-fonti">
              <h2 id="t-fonti">Fonti</h2>
              <ElencoFonti fonti={s.fonti} />
              {s.limiti && (
                <>
                  <h3>Note sulle fonti</h3>
                  <p className="note">{s.limiti}</p>
                </>
              )}
              <p className="revisione">
                Ultima revisione del testo: {dataEstesa(s.revisione)}. I testi non sono stati rivisti da un medico
                {haPagina('informazioni') ? (
                  <>
                    : <LinkPagina pagina="informazioni">come sono scritti</LinkPagina>.
                  </>
                ) : (
                  '.'
                )}
              </p>
            </section>
          </>
        )}
      </div>
    </article>
  );
}
