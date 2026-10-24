import { useAtlas } from '@/hooks/useAtlas';
import { useTextOnly } from '@/hooks/useTextOnly';
import type { Relation, Structure } from '@/models/content';
import { unitForContent } from '@/utils/structures';

/**
 * Nome di una struttura collegata, con il numero della fonte che documenta il collegamento.
 * Se la struttura ha un contenuto ed è nel modello, il nome la seleziona nel corpo (D18).
 */
export function RelatedName({ relation: r }: { relation: Relation }) {
  const { dispatch } = useAtlas();
  const textOnly = useTextOnly();
  // Nella versione testuale si seleziona il contenuto stesso, che si apre come pagina.
  const unit = r.conContenuto ? (textOnly ? r.id : unitForContent(r.id)) : undefined;
  return (
    <>
      {unit ? (
        <a
          href={`/esplora/${unit}`}
          onClick={(e) => {
            e.preventDefault();
            dispatch({ type: 'select', id: unit });
          }}
        >
          {r.nome}
        </a>
      ) : (
        r.nome
      )}
      {r.fonte && (
        <sup className="citation">
          <span className="visually-hidden">fonte </span>
          <a href={`#fonte-${r.fonte}`}>{r.fonte}</a>
        </sup>
      )}
    </>
  );
}

/** Appartenenza e collegamenti di una struttura, nel cartellino. */
export function Relations({ structure: s }: { structure: Structure }) {
  const ofType = (type: Relation['tipo']) => s.relazioni.filter((r) => r.tipo === type);
  const names = (list: Relation[]) =>
    list.map((r, i) => (
      <span key={r.id}>
        {i > 0 && ', '}
        <RelatedName relation={r} />
      </span>
    ));
  return (
    <dl className="relations">
      <dt className="label">Fa parte di</dt>
      <dd>{names(ofType('fa-parte-di'))}</dd>
      {ofType('collegato-a').length > 0 && (
        <>
          <dt className="label">Collegato a</dt>
          <dd>{names(ofType('collegato-a'))}</dd>
        </>
      )}
    </dl>
  );
}
