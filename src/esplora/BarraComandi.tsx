import { type Strato, useAtlante, useMovimentoRidotto } from '../app/stato';
import { vistaIniziale } from '../scena/Scena';

const STRATI: Array<{ id: Strato; nome: string; breve: string }> = [
  { id: 'muscoli', nome: 'Muscoli', breve: 'Muscoli' },
  { id: 'organi', nome: 'Scheletro e organi', breve: 'Organi' },
  { id: 'scheletro', nome: 'Scheletro', breve: 'Scheletro' },
];

export function BarraComandi() {
  const { stato, invia } = useAtlante();
  const ridotto = useMovimentoRidotto();
  return (
    <div
      className={`barra-comandi${stato.selezione ? ' con-selezione' : ''}`}
      role="toolbar"
      aria-label="Comandi della vista"
    >
      <div className="gruppo-strati" role="radiogroup" aria-label="Strato visibile">
        {STRATI.map((s) => (
          // biome-ignore lint/a11y/useSemanticElements: pulsanti con ruolo radio per lo stile a segmenti; tastiera e lettori di schermo restano corretti
          <button
            type="button"
            key={s.id}
            role="radio"
            aria-checked={stato.strato === s.id}
            className="strato"
            aria-label={s.nome}
            onClick={() => invia({ tipo: 'strato', strato: s.id })}
          >
            <span className="esteso">{s.nome}</span>
            <span className="breve" aria-hidden="true">
              {s.breve}
            </span>
          </button>
        ))}
      </div>
      <span className="separatore" aria-hidden="true" />
      <button type="button" className="comando" aria-pressed={stato.pelle} onClick={() => invia({ tipo: 'pelle' })}>
        Sagoma
      </button>
      <button
        type="button"
        className="comando"
        onClick={() => {
          invia({ tipo: 'seleziona', id: null });
          vistaIniziale(!ridotto);
        }}
      >
        <span className="esteso">Vista iniziale</span>
        <span className="breve" aria-hidden="true">
          Inizio
        </span>
      </button>
    </div>
  );
}
