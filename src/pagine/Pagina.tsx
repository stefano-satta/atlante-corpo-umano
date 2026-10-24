import { type ReactNode, useEffect, useRef } from 'react';
import { type IdPagina, useAtlante } from '../app/stato';
import { dataEstesa, haPagina, STRUTTURE, useFonti, usePagina } from '../contenuti/contenuti';
import type { FonteCitata } from '../contenuti/tipi';
import { Riferimento, Testo } from '../pannello/Fonti';
import { IconaIndietro } from '../pannello/icone';

/** Collegamento interno a una pagina di lettura, senza ricaricare l'atlante. */
export function LinkPagina({ pagina, children }: { pagina: IdPagina; children: ReactNode }) {
  const { invia } = useAtlante();
  // Una pagina non ancora approvata manca dalla build di produzione: resta il testo, senza collegamento.
  if (pagina !== 'fonti' && !haPagina(pagina)) return <>{children}</>;
  return (
    <a
      href={`/${pagina}`}
      onClick={(e) => {
        e.preventDefault();
        invia({ tipo: 'pagina', pagina });
      }}
    >
      {children}
    </a>
  );
}

const GRUPPI: Array<{ tipo: FonteCitata['tipo']; titolo: string; descrizione: string }> = [
  {
    tipo: 'istituzionale',
    titolo: 'Enti di sanità pubblica',
    descrizione: 'Pagine divulgative di istituti dei National Institutes of Health statunitensi.',
  },
  {
    tipo: 'manuale',
    titolo: 'Manuali universitari',
    descrizione: 'Capitoli di manuali usati nei corsi di anatomia e fisiologia.',
  },
  {
    tipo: 'terminologia',
    titolo: 'Terminologia',
    descrizione: 'Standard internazionale usato per verificare i termini latini.',
  },
];

function Fonti() {
  const { dato: fonti, errore } = useFonti();
  if (errore) return <p className="avviso">Non è stato possibile caricare l'elenco delle fonti.</p>;
  if (!fonti) return <p role="status">Caricamento delle fonti…</p>;
  const pubblicate = new Set(STRUTTURE.map((s) => s.id));
  return (
    <>
      <p className="introduzione">
        Tutte le fonti usate per scrivere e verificare i testi dell'atlante, con la data in cui sono state consultate.
        Nei testi ogni rimando numerato porta alla fonte corrispondente.
      </p>
      {GRUPPI.map((g) => {
        const elenco = fonti.filter((f) => f.tipo === g.tipo);
        if (!elenco.length) return null;
        return (
          <section key={g.tipo} aria-labelledby={`gruppo-${g.tipo}`}>
            <h2 id={`gruppo-${g.tipo}`}>{g.titolo}</h2>
            <p className="descrizione-gruppo">{g.descrizione}</p>
            <ul className="bibliografia">
              {elenco.map((f) => {
                const citata = f.citataDa.filter((c) => pubblicate.has(c.id));
                return (
                  <li key={f.id}>
                    <Riferimento fonte={f} />
                    {citata.length > 0 && (
                      <span className="citata-da">Citata per: {citata.map((c) => c.nome).join(', ')}.</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </>
  );
}

function PaginaMarkdown({ id }: { id: IdPagina }) {
  const { dato: pagina, errore } = usePagina(id);
  if (errore) return <p className="avviso">Non è stato possibile caricare la pagina.</p>;
  if (!pagina) return <p role="status">Caricamento…</p>;
  return (
    <>
      {pagina.stato !== 'approvato' && (
        <p className="avviso-stato">Bozza ({pagina.stato}): testo non ancora approvato, visibile solo in sviluppo.</p>
      )}
      <Testo className="testo-pagina" html={pagina.html} />
      <p className="revisione">Ultima revisione: {dataEstesa(pagina.revisione)}.</p>
    </>
  );
}

const TITOLI: Record<IdPagina, string> = { fonti: 'Fonti', informazioni: 'Informazioni' };

/** Pagina di lettura sopra l'atlante: la scena resta dov'era e si ritrova chiudendo. */
export function Pagina({ id }: { id: IdPagina }) {
  const { invia } = useAtlante();
  const titolo = useRef<HTMLHeadingElement>(null);
  const contenitore = useRef<HTMLElement>(null);

  useEffect(() => {
    contenitore.current?.scrollTo({ top: 0 });
    titolo.current?.focus({ preventScroll: true });
  }, []);

  return (
    <main className="pagina" ref={contenitore} aria-labelledby="pagina-titolo">
      <div className="pagina-colonna">
        <button type="button" className="indietro" onClick={() => invia({ tipo: 'pagina', pagina: null })}>
          <IconaIndietro /> Torna all'atlante
        </button>
        <h1 id="pagina-titolo" ref={titolo} tabIndex={-1}>
          {TITOLI[id]}
        </h1>
        {id === 'fonti' ? <Fonti /> : <PaginaMarkdown id={id} />}
      </div>
    </main>
  );
}
