// Valori ammessi nei contenuti e forme dei segni usati nei testi.

export const STATI = ['bozza', 'verificato', 'approvato'];
export const TIPI = { organo: 'organi', osso: 'ossa', muscolo: 'muscoli', vaso: 'vasi', nervo: 'nervi' };
export const TIPI_RELAZIONE = ['fa-parte-di', 'collegato-a'];
export const TIPI_FONTE = ['istituzionale', 'manuale', 'terminologia'];

/** Sezioni ammesse nel corpo, nell'ordine della scheda (D11). "Collegamenti" e "Fonti" si generano. */
export const SEZIONI = ['In breve', 'Dove si trova', 'Come è fatto', 'Cosa fa', 'Il processo'];

/**
 * Stato visivo di ogni passo di un processo animato (ciclo cardiaco). Ogni campo ha valori
 * ammessi fissi: il disegno sa rappresentare solo questi.
 */
export const CAMPI_PASSO = {
  atri: ['rilassati', 'contratti'],
  ventricoli: ['rilassati', 'contratti'],
  av: ['aperte', 'chiuse'],
  semilunari: ['aperte', 'chiuse'],
  segnale: ['nessuno', 'senoatriale', 'atrioventricolare', 'ventricoli'],
  tono: ['nessuno', 'primo', 'secondo'],
};
export const FLUSSI = ['vene-atri', 'atri-ventricoli', 'ventricoli-arterie'];

/**
 * Schemi dei processi animati e fasi che ciascun disegno sa mostrare. Il ciclo cardiaco descrive
 * ogni passo con i campi di CAMPI_PASSO; gli schemi degli apparati urinario e genitali, quello della
 * tiroide e quello della vista con una sola fase.
 */
export const FASI_SCHEMA = {
  'genitale-maschile': ['spermatogenesi', 'maturazione', 'trasporto', 'liquidi', 'eiaculazione'],
  'genitale-femminile': ['follicolo', 'ovulazione', 'tuba', 'endometrio', 'mestruazioni'],
  urinario: ['filtrazione', 'riassorbimento', 'ureteri', 'riempimento', 'minzione'],
  tiroide: ['trh', 'tsh', 'ormoni', 'organi', 'retroazione'],
  vista: ['cornea', 'pupilla', 'cristallino', 'retina', 'chiasma', 'corteccia'],
};
export const SCHEMI_PROCESSO = ['cuore', ...Object.keys(FASI_SCHEMA)];

/** Figure disegnate che una scheda può mostrare in una sua sezione, con titolo e didascalia. */
export const FIGURE = ['vulva', 'orecchio', 'mammella', 'denti'];

/** Schemi 2D che un passo di percorso può mostrare, e strati che può scegliere (D24). */
export const SCHEMI_PERCORSO = [
  'nessuno',
  'torace',
  'inspirazione',
  'espirazione',
  'alveolo',
  // Il viaggio del cibo
  'digerente',
  'bocca',
  'deglutizione',
  'stomaco',
  'duodeno',
  'villo',
  'colon',
  'retto',
];
export const STRATI_PERCORSO = ['muscoli', 'organi', 'scheletro', 'digerente', 'respiratorio'];

export const DATA = /^\d{4}-\d{2}-\d{2}$/;
export const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const CITAZIONE = /\[@([^\]\s]+)\]/g;
export const GRUPPO_CITAZIONI = /(?:\s*\[@[^\]\s]+\])+/g;
// Termine del glossario nel testo: [[alveoli|alveolo]] mostra "alveoli" e rimanda alla voce "alveolo";
// [[alveolo]] usa la voce con lo stesso nome.
export const SEGNO_GLOSSARIO = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/**
 * Temi del quiz (D53): uno per apparato della barra laterale, con il nome dell'indirizzo
 * (`LAYER_SLUGS` in src/utils/url.ts). Un file contenuti/quiz/<tema>.yaml per tema.
 */
export const TEMI_QUIZ = [
  'organi',
  'scheletro',
  'muscoli',
  'cardiocircolatorio',
  'nervoso',
  'digerente',
  'respiratorio',
  'urinario',
  'riproduttivo',
];
/** `testo`: domanda a parole; `indica`: "Quale struttura è evidenziata?", solo con il corpo 3D. */
export const TIPI_DOMANDA = ['testo', 'indica'];
