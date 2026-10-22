// Parametri del prototipo leggibili dall'indirizzo, per confrontare le varianti:
//   ?dettaglio=10|25   livello di semplificazione dei modelli (percentuale di vertici)
//   ?modo=unito|separato   una geometria per strato oppure una per struttura
//   ?misure=1   mostra il pannello delle misure
const parametri = new URLSearchParams(location.search);

export const CONFIG = {
  dettaglio: parametri.get('dettaglio') === '25' ? 'r25' : 'r10',
  unisci: parametri.get('modo') !== 'separato',
  misure: parametri.get('misure') === '1',
};

export const percorsoModelli = (file: string) => `/modelli/${CONFIG.dettaglio}/${file}`;
