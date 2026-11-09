import type { AtlasAction, AtlasState, BodyKind, Layer } from '@/models/atlas';
import type { LazyModelLayer, ModelLayer } from '@/models/scene';
import { lazyLayerOf, singleBodyOf } from './modelIndex';
import { readUrl } from './url';

/** Corpo in cui si vede una struttura: quello attuale, salvo le strutture di un solo corpo (D29). */
export function bodyFor(current: BodyKind, selection: string | null): BodyKind {
  return (selection && singleBodyOf(selection)) || current;
}

export function atlasReducer(s: AtlasState, a: AtlasAction): AtlasState {
  const next = reduce(s, a);
  // Il suono del battito (D42) c'è solo mentre il cuore selezionato batte.
  return next.heartSound && (next.selection !== 'cuore' || !next.heartbeat) ? { ...next, heartSound: false } : next;
}

function reduce(s: AtlasState, a: AtlasAction): AtlasState {
  switch (a.type) {
    case 'setLayer':
      // Nel quiz (D53) scegliere un apparato dalla barra o dai tasti cambia il tema: si ricomincia da lì.
      return {
        ...s,
        layer: a.layer,
        selection: null,
        sheet: false,
        quiz: s.quiz && { theme: a.layer, focus: null },
      };
    case 'revealLayer':
      return { ...s, layer: a.layer };
    case 'toggleSkin':
      return { ...s, skin: !s.skin };
    case 'toggleHeartbeat':
      return { ...s, heartbeat: !s.heartbeat };
    case 'toggleHeartSound':
      return { ...s, heartSound: !s.heartSound };
    case 'setBody': {
      // Un organo dell'altro corpo non si vede più: la selezione si chiude.
      const keep = bodyFor(a.body, s.selection) === a.body;
      return { ...s, body: a.body, selection: keep ? s.selection : null, sheet: keep && s.sheet };
    }
    case 'select':
      // Scegliere un organo di un solo corpo, dall'Indice o da un collegamento, porta a quel corpo.
      // Una struttura scelta chiude il quiz, che non deve mostrare cartellini (D53).
      return {
        ...s,
        selection: a.id,
        sheet: false,
        home: s.home && !a.id,
        body: bodyFor(s.body, a.id),
        quiz: a.id ? null : s.quiz,
      };
    case 'setSheet':
      return { ...s, sheet: a.open && s.selection !== null };
    case 'setPage':
      return { ...s, page: a.page };
    case 'setGuidedPath':
      // Scegliere un passo chiude la struttura che si stava esplorando.
      return {
        ...s,
        guidedPath: a.guidedPath,
        selection: null,
        sheet: false,
        home: s.home && !a.guidedPath,
        quiz: a.guidedPath ? null : s.quiz,
      };
    case 'setQuiz': {
      // Il quiz (D53) prende il pannello: chiude struttura, scheda, percorso e soglia. Un apparato
      // come tema mostra subito quello strato; "completa" cambia strato a ogni domanda.
      if (!a.quiz) return { ...s, quiz: null };
      const theme = a.quiz.theme;
      const layer = theme && theme !== 'completa' ? theme : s.layer;
      return {
        ...s,
        quiz: { theme, focus: s.quiz?.theme === theme ? s.quiz.focus : null },
        layer,
        selection: null,
        sheet: false,
        guidedPath: null,
        home: false,
      };
    }
    case 'setQuizFocus':
      if (!s.quiz) return s;
      return { ...s, quiz: { ...s.quiz, focus: a.focus }, layer: a.layer ?? s.layer, body: a.body ?? s.body };
    case 'hover':
      return s.hover === a.id ? s : { ...s, hover: a.id };
    case 'setHome':
      return { ...s, home: a.open };
    case 'setTour':
      return { ...s, tour: a.step };
  }
}

/** Stato all'apertura, dall'indirizzo: su `/` la soglia è aperta. */
export function initialAtlasState(pathname: string): AtlasState {
  const url = readUrl(pathname);
  return {
    body: bodyFor('uomo', url.selection),
    skin: true,
    heartbeat: true,
    heartSound: false,
    hover: null,
    tour: null,
    ...url,
    quiz: url.quiz ? { theme: url.quiz.theme, focus: null } : null,
    layer: url.layer ?? 'organi',
  };
}

/** Gruppi di organi dell'apparato digerente, dalla bocca all'intestino crasso. */
export const DIGESTIVE_ORGANS = [
  'lingua',
  'denti',
  'ghiandole-salivari',
  'esofago',
  'stomaco',
  'intestino-tenue',
  'intestino-crasso',
  'fegato',
  'colecisti',
  'pancreas',
];

/** Muscoli costrittori della faringe (superiori, medi, inferiori) e sfintere esterno dell'ano. */
const DIGESTIVE_MUSCLES = ['FJ2759', 'FJ2747', 'FJ2742', 'FJ2754', 'FJ2752', 'FJ2740', 'FJ1450M', 'FJ2543', 'FJ2548'];

/** Organi dell'apparato respiratorio presenti nel modello: faringe e laringe non ci sono. */
export const RESPIRATORY_ORGANS = ['cavita-nasale', 'trachea-bronchi', 'polmoni'];

/**
 * Muscoli dell'inspirazione tranquilla (diaframma e intercostali esterni), ossa nasali e cornetti nasali
 * inferiori, come nel percorso "Un respiro", e cartilagini del naso di Z-Anatomy (D50).
 */
const RESPIRATORY_UNITS = [
  'FJ3131',
  'FJ1451',
  'FJ1451M',
  'FJ3378',
  'FJ3272',
  'FJ3369',
  'FJ3263',
  'ZA-nasal-septal-cartilage',
  'ZA-right-lateral-process-of-nasal-septal-cartilage',
  'ZA-left-lateral-process-of-nasal-septal-cartilage',
  'ZA-right-major-alar-cartilage',
  'ZA-left-major-alar-cartilage',
];

/** Organi dell'apparato urinario presenti nel modello: l'uretra è solo maschile. */
export const URINARY_ORGANS = ['reni', 'ureteri', 'vescica', 'uretra'];

/**
 * Organi dell'apparato riproduttivo, maschili e femminili: ogni corpo mostra i suoi (D29). L'uretra
 * maschile fa parte anche dell'apparato urinario.
 */
export const REPRODUCTIVE_ORGANS = [
  'testicoli',
  'epididimi',
  'dotti-deferenti',
  'vescichette-seminali',
  'prostata',
  'uretra',
  'pene',
  'ovaie',
  'tube-uterine',
  'utero',
  'vagina',
  'mammelle',
];

/** Strati del modello visibili per ciascuno strato della barra dei comandi. */
export const VISIBLE_MODEL_LAYERS: Record<Layer, ModelLayer[]> = {
  scheletro: ['ossa'],
  organi: ['organi'],
  muscoli: ['muscoli'],
  vasi: ['vasi'],
  nervi: ['nervi'],
  digerente: [],
  respiratorio: [],
  urinario: [],
  riproduttivo: [],
};

/**
 * Unità di un altro strato del modello che fanno parte dello strato della barra: il cuore fra i vasi (D44),
 * l'encefalo, l'ipotalamo e il nervo ottico fra i nervi (D46). L'apparato digerente (D48) non ha uno strato
 * del modello: mostra gli organi del canale digerente e le ghiandole annesse, con i muscoli costrittori della
 * faringe (che nel modello manca) e lo sfintere esterno dell'ano, come nel percorso "Il viaggio del cibo".
 * Allo stesso modo l'apparato respiratorio (D49, D50) mostra cavità nasale, trachea e bronchi, polmoni, i
 * muscoli dell'inspirazione tranquilla e le ossa e le cartilagini del naso. Gli apparati urinario e
 * riproduttivo (D51) mostrano solo i loro organi.
 */
export const VISIBLE_UNITS: Record<Layer, string[]> = {
  scheletro: [],
  organi: [],
  muscoli: [],
  vasi: ['cuore'],
  nervi: ['encefalo', 'ipotalamo', 'nervo-ottico'],
  digerente: [...DIGESTIVE_ORGANS, ...DIGESTIVE_MUSCLES],
  respiratorio: [...RESPIRATORY_ORGANS, ...RESPIRATORY_UNITS],
  urinario: URINARY_ORGANS,
  riproduttivo: REPRODUCTIVE_ORGANS,
};

/** Strati del modello mostrati solo come contesto (fantasma, non selezionabili). */
export const GHOST_MODEL_LAYERS: Record<Layer, ModelLayer[]> = {
  scheletro: [],
  organi: ['ossa'],
  muscoli: [],
  vasi: ['ossa'],
  nervi: ['ossa'],
  digerente: ['ossa'],
  respiratorio: ['ossa'],
  urinario: ['ossa'],
  riproduttivo: ['ossa'],
};

/** Strati del modello in un file a parte, nell'ordine in cui la scena li disegna. */
export const LAZY_MODEL_LAYERS: readonly LazyModelLayer[] = ['muscoli', 'vasi', 'nervi'];

/**
 * Muscoli, vasi e nervi stanno ciascuno in un file a parte, che si scarica solo quando serve (D55): lo strato
 * della barra lo mostra (pieno, in trasparenza o con alcune unità, come i muscoli dell'apparato digerente),
 * oppure è selezionata una sua struttura.
 */
export const needsModelLayer = (model: LazyModelLayer, layer: Layer, selection: string | null) =>
  VISIBLE_MODEL_LAYERS[layer].includes(model) ||
  GHOST_MODEL_LAYERS[layer].includes(model) ||
  VISIBLE_UNITS[layer].some((u) => lazyLayerOf(u) === model) ||
  (selection !== null && lazyLayerOf(selection) === model);

/** Strato della barra in cui una struttura del modello è piena e selezionabile. */
export const LAYER_OF_MODEL_LAYER: Record<Exclude<ModelLayer, 'pelle'>, Layer> = {
  ossa: 'scheletro',
  organi: 'organi',
  muscoli: 'muscoli',
  vasi: 'vasi',
  nervi: 'nervi',
};
