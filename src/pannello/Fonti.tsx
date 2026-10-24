import { dataEstesa } from '../contenuti/contenuti';
import type { Fonte, FonteNumerata } from '../contenuti/tipi';

/** Autore di una fonte: l'ente, oppure i primi autori seguiti da "e altri". */
export function autoreFonte(f: Fonte) {
  if (f.ente) return f.ente;
  const autori = f.autori ?? [];
  return autori.length > 2 ? `${autori.slice(0, 2).join(', ')} e altri` : autori.join(', ');
}

/** Riferimento bibliografico completo: titolo con collegamento, autore, edizione e date. */
export function Riferimento({ fonte: f }: { fonte: Fonte }) {
  const edizione = [f.editore, f.anno].filter(Boolean).join(', ');
  return (
    <>
      <a href={f.url} target="_blank" rel="noopener noreferrer" className="titolo-fonte">
        {f.titolo}
      </a>
      <span className="autore-fonte">
        {autoreFonte(f)}
        {edizione && `. ${edizione}`}.
      </span>
      <span className="date-fonte">
        {f.aggiornata && `Aggiornata il ${dataEstesa(f.aggiornata)}. `}Consultata il {dataEstesa(f.consultata)}.
      </span>
      {f.nota && <span className="nota-fonte">{f.nota}</span>}
    </>
  );
}

/** Elenco numerato delle fonti di una struttura; i numeri corrispondono ai rimandi nel testo. */
export function ElencoFonti({ fonti }: { fonti: FonteNumerata[] }) {
  return (
    <ol className="elenco-fonti">
      {fonti.map((f) => (
        <li key={f.id} id={`fonte-${f.n}`} value={f.n}>
          <Riferimento fonte={f} />
        </li>
      ))}
    </ol>
  );
}

/** HTML compilato in build dai contenuti (pipeline/contenuti.mjs), con i rimandi alle fonti. */
export function Testo({ html, className }: { html: string; className?: string }) {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML generato in build dai file di contenuti, senza HTML grezzo (il controllo lo vieta)
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
