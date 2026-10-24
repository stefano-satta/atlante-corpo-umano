import { type ReactNode, useEffect, useRef } from 'react';
import { type IdPagina, useAtlante } from '../app/stato';
import { dataEstesa, GLOSSARIO, haPagina, PERCORSI, STRUTTURE, useFonti, usePagina } from '../contenuti/contenuti';
import type { FonteCitata } from '../contenuti/tipi';
import { Indice } from '../indice/Indice';
import { Riferimento, Testo } from '../pannello/Fonti';
import { IconaIndietro } from '../pannello/icone';

/** Collegamento interno a una pagina di lettura, senza ricaricare l'atlante. */
export function LinkPagina({ pagina, children }: { pagina: IdPagina; children: ReactNode }) {
  const { invia } = useAtlante();
  // Una pagina non ancora approvata manca dalla build di produzione: resta il testo, senza collegamento.
  if (pagina === 'informazioni' && !haPagina(pagina)) return <>{children}</>;
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
  const pubblicate = new Set([
    ...STRUTTURE.map((s) => s.id),
    ...PERCORSI.map((p) => `percorsi/${p.id}`),
    ...GLOSSARIO.map((v) => `glossario/${v.id}`),
  ]);
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
                // Più voci del glossario citano la stessa fonte: il nome "glossario" compare una volta sola.
                const citata = [...new Set(f.citataDa.filter((c) => pubblicate.has(c.id)).map((c) => c.nome))];
                return (
                  <li key={f.id}>
                    <Riferimento fonte={f} />
                    {citata.length > 0 && <span className="citata-da">Citata per: {citata.join(', ')}.</span>}
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

const TITOLI: Record<IdPagina, string> = { indice: 'Indice', fonti: 'Fonti', informazioni: 'Informazioni' };

/**
 * Pagina di lettura sopra l'atlante: la scena resta dov'era e si ritrova chiudendo.
 * Senza grafica 3D (`senza3d`) le pagine sono l'atlante stesso e si torna all'Indice.
 */
export function Pagina({ id, senza3d = false }: { id: IdPagina; senza3d?: boolean }) {
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
        {senza3d ? (
          <IntestazioneTestuale />
        ) : (
          <button type="button" className="indietro" onClick={() => invia({ tipo: 'pagina', pagina: null })}>
            <IconaIndietro /> Torna all'atlante
          </button>
        )}
        <h1 id="pagina-titolo" ref={titolo} tabIndex={-1}>
          {TITOLI[id]}
        </h1>
        {id === 'indice' ? <Indice senza3d={senza3d} /> : id === 'fonti' ? <Fonti /> : <PaginaMarkdown id={id} />}
      </div>
    </main>
  );
}

const SEZIONI_TESTUALI: IdPagina[] = ['indice', 'fonti', 'informazioni'];

/**
 * Testa della versione testuale (D26): avviso e menu, al posto della barra in alto della scena.
 * Si usa anche nelle letture di strutture e percorsi.
 */
export function IntestazioneTestuale() {
  const { stato, invia } = useAtlante();
  const attiva = stato.selezione || stato.percorso ? null : (stato.pagina ?? 'indice');
  return (
    <header className="testa-testuale">
      <span className="marchio">Atlante del corpo umano</span>
      <nav aria-label="Sezioni">
        {SEZIONI_TESTUALI.filter((p) => p !== 'informazioni' || haPagina(p)).map((p) => (
          <button
            type="button"
            key={p}
            className="voce"
            aria-current={attiva === p ? 'page' : undefined}
            onClick={() => {
              invia({ tipo: 'seleziona', id: null });
              invia({ tipo: 'percorso', percorso: null });
              invia({ tipo: 'pagina', pagina: p });
            }}
          >
            {TITOLI[p]}
          </button>
        ))}
      </nav>
      <p className="avviso">
        Questo browser non mostra la grafica 3D (WebGL 2), quindi l'atlante si apre nella versione testuale: gli stessi
        testi, senza il modello del corpo.
      </p>
    </header>
  );
}
