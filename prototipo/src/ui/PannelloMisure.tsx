import { useEffect, useState } from 'react';
import { misure } from '../misure';
import { CONFIG } from '../config';

export function PannelloMisure() {
  const [, aggiorna] = useState(0);
  useEffect(() => {
    const t = setInterval(() => aggiorna((n) => n + 1), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <dl className="misure" aria-label="Misure di prestazione">
      <dt>Variante</dt>
      <dd>
        {CONFIG.dettaglio} · {CONFIG.unisci ? 'unito' : 'separato'}
      </dd>
      <dt>FPS</dt>
      <dd>
        {misure.fps} ({misure.frameMs} ms)
      </dd>
      <dt>Chiamate di disegno</dt>
      <dd>{misure.chiamate}</dd>
      <dt>Triangoli disegnati</dt>
      <dd>{misure.triangoli.toLocaleString('it-IT')}</dd>
      <dt>Interattivo dopo</dt>
      <dd>{misure.interattivoMs} ms</dd>
      <dt>Modelli scaricati</dt>
      <dd>{misure.kBScaricati} kB</dd>
      <dt>Latenza selezione</dt>
      <dd>{misure.latenzaSelezioneMs} ms</dd>
    </dl>
  );
}
