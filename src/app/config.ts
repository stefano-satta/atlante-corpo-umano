// Parametri leggibili dall'indirizzo:
//   ?misure=1   mostra il pannello delle misure di prestazione
const parametri = new URLSearchParams(location.search);

export const CONFIG = {
  misure: parametri.get('misure') === '1',
};

export const percorsoModelli = (file: string) => `/modelli/${file}`;
