// Lettura, controllo e compilazione dei contenuti (D17).
//
// Ogni struttura è un file Markdown in contenuti/strutture/ con intestazione YAML;
// le fonti stanno in contenuti/fonti.yaml, i nomi delle strutture senza scheda in
// contenuti/riferimenti.yaml e le definizioni del glossario in contenuti/glossario.yaml. Il controllo automatico ferma la build se trova un
// errore: una citazione senza fonte, un paragrafo senza rimando, una relazione verso
// una struttura sconosciuta, un elemento 3D che non esiste nel modello.
//
// yaml e marked si usano solo qui, in build: nel sito arriva HTML già pronto.

import fs from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';
import { parse as leggiYaml } from 'yaml';

export const STATI = ['bozza', 'verificato', 'approvato'];
const TIPI = { organo: 'organi', osso: 'ossa', muscolo: 'muscoli' };
const TIPI_RELAZIONE = ['fa-parte-di', 'collegato-a'];
const TIPI_FONTE = ['istituzionale', 'manuale', 'terminologia'];

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
const SCHEMI_PROCESSO = ['cuore', ...Object.keys(FASI_SCHEMA)];

/** Figure disegnate che una scheda può mostrare in una sua sezione, con titolo e didascalia. */
export const FIGURE = ['vulva', 'orecchio', 'mammella'];

/** Schemi 2D che un passo di percorso può mostrare, e strati che può scegliere (D24). */
export const SCHEMI_PERCORSO = ['nessuno', 'torace', 'inspirazione', 'espirazione', 'alveolo'];
const STRATI_PERCORSO = ['muscoli', 'organi', 'scheletro'];

const DATA = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CITAZIONE = /\[@([^\]\s]+)\]/g;
const GRUPPO_CITAZIONI = /(?:\s*\[@[^\]\s]+\])+/g;
// Termine del glossario nel testo: [[alveoli|alveolo]] mostra "alveoli" e rimanda alla voce "alveolo";
// [[alveolo]] usa la voce con lo stesso nome.
const SEGNO_GLOSSARIO = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export function separaIntestazione(testo) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(testo.replace(/\r\n/g, '\n'));
  if (!m) return null;
  return { dati: leggiYaml(m[1]) ?? {}, corpo: m[2] };
}

const ancora = (titolo) =>
  titolo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Divide il corpo nelle sezioni introdotte da "## Titolo". */
function dividiSezioni(corpo, errore) {
  const parti = corpo.split(/^## (.+)$/m);
  if (parti[0].trim()) errore('c’è del testo prima della prima sezione');
  const sezioni = [];
  for (let i = 1; i < parti.length; i += 2) {
    const titolo = parti[i].trim();
    const chiave = SEZIONI.find((s) => titolo === s || titolo.startsWith(`${s}:`));
    if (!chiave) errore(`sezione non ammessa: "${titolo}" (ammesse: ${SEZIONI.join(', ')})`);
    sezioni.push({ chiave: chiave ?? titolo, titolo, testo: parti[i + 1].trim() });
  }
  if (sezioni[0]?.chiave !== 'In breve') errore('la prima sezione deve essere "In breve"');
  const ordine = sezioni.map((s) => SEZIONI.indexOf(s.chiave));
  if (ordine.some((n, i) => i > 0 && n <= ordine[i - 1])) errore('sezioni ripetute o fuori ordine');
  return sezioni;
}

/**
 * Ogni paragrafo deve citare almeno una fonte. Fanno eccezione i paragrafi che
 * introducono un elenco (finiscono con i due punti); in quel caso le voci dell'elenco
 * devono avere un rimando, a meno che non lo abbia già il paragrafo introduttivo.
 */
function controllaRimandi(lexer, testo, errore) {
  let introduzioneCitata = false;
  const token = lexer(testo);
  controllaHtml(token, errore);
  for (const t of token) {
    if (t.type === 'paragraph') {
      const citato = CITAZIONE.test(t.text);
      CITAZIONE.lastIndex = 0;
      const introduce = t.text.trimEnd().endsWith(':');
      if (!citato && !introduce) errore(`paragrafo senza fonte: "${t.text.slice(0, 60)}…"`);
      introduzioneCitata = introduce && citato;
    } else if (t.type === 'list') {
      for (const voce of t.items) {
        const citata = CITAZIONE.test(voce.text);
        CITAZIONE.lastIndex = 0;
        if (!citata && !introduzioneCitata) errore(`voce di elenco senza fonte: "${voce.text.slice(0, 60)}…"`);
      }
      introduzioneCitata = false;
    } else if (t.type !== 'space') {
      introduzioneCitata = false;
    }
  }
}

/** Il testo è solo Markdown: nessun HTML grezzo, né a blocchi né dentro una frase. */
function controllaHtml(token, errore) {
  for (const t of token) {
    if (t.type === 'html') return errore('HTML non ammesso nel testo');
    const figli = [...(t.tokens ?? []), ...(t.items ?? [])];
    if (figli.length) controllaHtml(figli, errore);
  }
}

/**
 * Numerazione delle fonti di un contenuto, nell'ordine della prima citazione, e
 * trasformazione dei gruppi [@id] in rimandi numerati.
 */
function numeratore(fonti, errore) {
  const ordine = [];
  const numero = (id) => {
    if (!fonti[id]) {
      errore(`citazione di una fonte inesistente: [@${id}]`);
      return 0;
    }
    if (!ordine.includes(id)) ordine.push(id);
    return ordine.indexOf(id) + 1;
  };
  const rimandi = (testo) =>
    testo.replace(GRUPPO_CITAZIONI, (gruppo) => {
      const numeri = [...gruppo.matchAll(CITAZIONE)].map((m) => numero(m[1]));
      const link = numeri.map((n) => `<a href="#fonte-${n}">${n}</a>`).join(', ');
      return `<sup class="citation"><span class="visually-hidden">fonti </span>${link}</sup>`;
    });
  const elenco = () => ordine.map((id, i) => ({ n: i + 1, id, ...fonti[id] }));
  return { ordine, numero, rimandi, elenco };
}

/**
 * Trasforma i segni [[testo|voce]] in collegamenti alla voce del glossario, che l'interfaccia
 * apre sul posto. Una voce che non esiste nel glossario è un errore.
 */
function segniGlossario(voci, errore) {
  return (testo) =>
    testo.replace(SEGNO_GLOSSARIO, (_, mostrato, voce) => {
      const id = (voce ?? mostrato).trim().toLowerCase().replace(/\s+/g, '-');
      if (!voci.has(id)) errore(`termine del glossario inesistente: [[${mostrato}${voce ? `|${voce}` : ''}]]`);
      return `[${mostrato.trim()}](/glossario#glossario-${id})`;
    });
}

/** Aggiunge classe e voce ai collegamenti del glossario prodotti da marked. */
const marcaGlossario = (html) =>
  html.replace(
    /<a href="\/glossario#glossario-([a-z0-9-]+)">/g,
    '<a class="glossary-term" href="/glossario#glossario-$1" data-term="$1">',
  );

function controllaFonte(id, f, errore) {
  if (!ID.test(id)) errore(`identificativo non valido: ${id}`);
  if (!TIPI_FONTE.includes(f?.tipo)) errore(`${id}: tipo deve essere uno tra ${TIPI_FONTE.join(', ')}`);
  if (typeof f?.titolo !== 'string' || !f.titolo) errore(`${id}: manca il titolo`);
  if (!f?.ente && !(Array.isArray(f?.autori) && f.autori.length)) errore(`${id}: servono ente o autori`);
  if (typeof f?.url !== 'string' || !f.url.startsWith('https://'))
    errore(`${id}: l'indirizzo deve iniziare con https://`);
  if (!DATA.test(String(f?.consultata))) errore(`${id}: manca la data di consultazione (AAAA-MM-GG)`);
  if (f?.aggiornata !== undefined && !DATA.test(String(f.aggiornata)))
    errore(`${id}: data di aggiornamento non valida`);
}

/**
 * Legge e controlla tutti i contenuti. Restituisce i dati compilati e l'elenco degli
 * errori; con almeno un errore la build si ferma.
 *
 * @param {string} cartella cartella contenuti/
 * @param {{ gruppi: Set<string>, fma: Set<string> }} modello strutture presenti nel modello 3D
 */
export function leggiContenuti(cartella, modello) {
  const errori = [];
  const errorePer = (file) => (messaggio) => errori.push(`${file}: ${messaggio}`);

  const fonti = leggiYaml(fs.readFileSync(path.join(cartella, 'fonti.yaml'), 'utf8')) ?? {};
  for (const [id, f] of Object.entries(fonti)) controllaFonte(id, f, errorePer('fonti.yaml'));

  const riferimenti = leggiYaml(fs.readFileSync(path.join(cartella, 'riferimenti.yaml'), 'utf8')) ?? {};
  const apparati = riferimenti.apparati ?? {};
  const nomi = riferimenti.nomi ?? {};

  const marked = new Marked({ gfm: true, breaks: false });
  const lexer = (testo) => marked.lexer(testo);

  // Glossario (D26): una voce per termine, con una definizione breve che cita le sue fonti.
  const glossario = [];
  const fileGlossario = path.join(cartella, 'glossario.yaml');
  const vociGlossario = fs.existsSync(fileGlossario) ? (leggiYaml(fs.readFileSync(fileGlossario, 'utf8')) ?? {}) : {};
  for (const [id, v] of Object.entries(vociGlossario)) {
    const errore = (m) => errori.push(`glossario.yaml: ${id}: ${m}`);
    if (!ID.test(id)) errore('identificativo non valido');
    if (typeof v?.termine !== 'string' || !v.termine) errore('manca il termine');
    if (v?.varianti !== undefined && !(Array.isArray(v.varianti) && v.varianti.every((x) => typeof x === 'string')))
      errore('varianti deve essere un elenco di parole');
    if (!STATI.includes(v?.stato)) errore(`stato deve essere uno tra ${STATI.join(', ')}`);
    if (!DATA.test(String(v?.revisione))) errore('manca la data di revisione (AAAA-MM-GG)');
    const definizione = typeof v?.definizione === 'string' ? v.definizione.trim() : '';
    if (!definizione) errore('manca la definizione');
    const citate = [...definizione.matchAll(CITAZIONE)].map((m) => m[1]);
    if (definizione && !citate.length) errore('la definizione non cita nessuna fonte');
    for (const f of citate) if (!fonti[f]) errore(`citazione di una fonte inesistente: [@${f}]`);
    controllaHtml(lexer(definizione), errore);
    if (SEGNO_GLOSSARIO.test(definizione)) errore('una definizione non può rimandare ad altre voci');
    SEGNO_GLOSSARIO.lastIndex = 0;
    // Termine latino della TA2, facoltativo ma sempre con il suo numero.
    if ((v?.latino === undefined) !== (v?.ta2 === undefined)) errore('latino e ta2 vanno indicati insieme');
    if (v?.latino !== undefined && (typeof v.latino !== 'string' || !v.latino)) errore('latino non valido');
    if (v?.ta2 !== undefined && !Number.isInteger(v.ta2)) errore('ta2 deve essere un numero');
    if (v?.nelModello !== undefined && (typeof v.nelModello !== 'boolean' || !v?.parteDi))
      errore('nelModello va indicato (vero o falso) solo con parteDi');
    glossario.push({
      id,
      termine: v?.termine ?? id,
      varianti: v?.varianti ?? [],
      latino: v?.latino ?? null,
      ta2: v?.ta2 ?? null,
      // Struttura che descrive la parte: l'Indice la elenca lì. Di solito la parte non è nel modello
      // 3D; con nelModello c'è, ma unita alla struttura e non si sceglie da sola (le parti dell'occhio).
      parteDi: v?.parteDi ?? null,
      nelModello: v?.nelModello ?? false,
      html: marked.parseInline(definizione.replace(GRUPPO_CITAZIONI, '').trim()),
      fonti: [...new Set(citate)].filter((f) => fonti[f]).map((f) => ({ id: f, ...fonti[f] })),
      stato: v?.stato,
      revisione: String(v?.revisione),
    });
  }
  glossario.sort((a, b) => a.termine.localeCompare(b.termine, 'it'));
  const idGlossario = new Set(glossario.map((v) => v.id));
  // Testo Markdown di un contenuto → HTML, con i rimandi alle fonti e i termini del glossario.
  const compila = (testo, rimandi, errore) =>
    marcaGlossario(marked.parse(rimandi(segniGlossario(idGlossario, errore)(testo))));

  // Prima passata: intestazioni, per poter risolvere le relazioni tra strutture.
  const cartellaStrutture = path.join(cartella, 'strutture');
  const grezze = [];
  for (const file of fs
    .readdirSync(cartellaStrutture)
    .filter((f) => f.endsWith('.md'))
    .sort()) {
    const errore = errorePer(`strutture/${file}`);
    const letto = separaIntestazione(fs.readFileSync(path.join(cartellaStrutture, file), 'utf8'));
    if (!letto) {
      errore('manca l’intestazione YAML tra due righe ---');
      continue;
    }
    const d = letto.dati;
    if (`${d.id}.md` !== file) errore(`l'id "${d.id}" deve coincidere con il nome del file`);
    if (!TIPI[d.tipo]) errore(`tipo deve essere uno tra ${Object.keys(TIPI).join(', ')}`);
    else if (d.strato !== TIPI[d.tipo]) errore(`per il tipo ${d.tipo} lo strato è ${TIPI[d.tipo]}`);
    if (!apparati[d.apparato]) errore(`apparato sconosciuto: ${d.apparato} (vedi riferimenti.yaml)`);
    if (typeof d.nome !== 'string' || !d.nome) errore('manca il nome');
    if (typeof d.termine !== 'string' || !d.termine) errore('manca il termine latino');
    if (!Number.isInteger(d.ta2)) errore('manca il numero TA2 del termine latino (ta2)');
    if (!STATI.includes(d.stato)) errore(`stato deve essere uno tra ${STATI.join(', ')}`);
    if (!DATA.test(String(d.revisione))) errore('manca la data di revisione (AAAA-MM-GG)');
    const e3d = d.elementi3d ?? {};
    if (e3d.gruppo !== undefined && !modello.gruppi.has(e3d.gruppo))
      errore(`il gruppo 3D "${e3d.gruppo}" non esiste nel modello`);
    for (const fma of e3d.fma ?? []) if (!modello.fma.has(fma)) errore(`l'elemento ${fma} non esiste nel modello`);
    // Elementi senza FMA (i muscoli di Z-Anatomy) si indicano con l'id dell'unità del modello.
    for (const id of e3d.id ?? []) if (!modello.id?.has(id)) errore(`l'unità ${id} non esiste nel modello`);
    if (e3d.gruppo === undefined && !(e3d.fma ?? []).length && !(e3d.id ?? []).length)
      errore('elementi3d deve indicare un gruppo, degli FMA o degli id');
    grezze.push({ file, dati: d, corpo: letto.corpo });
  }
  const perId = new Map(grezze.map((g) => [g.dati.id, g]));
  for (const v of glossario)
    if (v.parteDi !== null && !perId.has(v.parteDi))
      errori.push(`glossario.yaml: ${v.id}: parteDi indica una struttura sconosciuta: ${v.parteDi}`);

  // Processi animati (contenuti/processi/): un passo per sezione "## Titolo", con lo stato del
  // disegno nell'intestazione. Si compilano insieme alla struttura a cui appartengono, così i
  // rimandi usano la stessa numerazione delle fonti della scheda.
  const processiPer = new Map();
  const cartellaProcessi = path.join(cartella, 'processi');
  const fileProcessi = fs.existsSync(cartellaProcessi)
    ? fs
        .readdirSync(cartellaProcessi)
        .filter((f) => f.endsWith('.md'))
        .sort()
    : [];
  for (const file of fileProcessi) {
    const errore = errorePer(`processi/${file}`);
    const letto = separaIntestazione(fs.readFileSync(path.join(cartellaProcessi, file), 'utf8'));
    if (!letto) {
      errore('manca l’intestazione YAML');
      continue;
    }
    const d = letto.dati;
    if (`${d.id}.md` !== file) errore(`l'id "${d.id}" deve coincidere con il nome del file`);
    // Un processo appartiene a una struttura (struttura) o a tutte quelle di un apparato (strutture):
    // compare nella scheda di ognuna.
    const proprietarie = d.strutture ?? [d.struttura];
    if (!Array.isArray(proprietarie) || !proprietarie.length) errore('strutture deve essere un elenco');
    for (const id of proprietarie) if (!perId.has(id)) errore(`struttura sconosciuta: ${id}`);
    const schema = d.schema ?? 'cuore';
    if (!SCHEMI_PROCESSO.includes(schema)) errore(`schema deve essere uno tra ${SCHEMI_PROCESSO.join(', ')}`);
    if (typeof d.titolo !== 'string' || !d.titolo) errore('manca il titolo');
    if (!STATI.includes(d.stato)) errore(`stato deve essere uno tra ${STATI.join(', ')}`);
    if (!DATA.test(String(d.revisione))) errore('manca la data di revisione');
    const passi = Array.isArray(d.passi) ? d.passi : [];
    if (passi.length < 2) errore('servono almeno due passi');
    passi.forEach((passo, i) => {
      if (schema !== 'cuore') {
        const fasi = FASI_SCHEMA[schema] ?? [];
        if (!fasi.includes(passo?.fase)) errore(`passo ${i + 1}: fase deve essere una tra ${fasi.join(', ')}`);
        return;
      }
      for (const [campo, valori] of Object.entries(CAMPI_PASSO))
        if (!valori.includes(passo?.[campo]))
          errore(`passo ${i + 1}: ${campo} deve essere uno tra ${valori.join(', ')}`);
      for (const f of passo?.flussi ?? []) if (!FLUSSI.includes(f)) errore(`passo ${i + 1}: flusso sconosciuto ${f}`);
    });
    const sezioni = letto.corpo.split(/^## (.+)$/m);
    if (sezioni[0].trim()) errore('c’è del testo prima del primo passo');
    const testi = [];
    for (let i = 1; i < sezioni.length; i += 2) testi.push({ titolo: sezioni[i].trim(), testo: sezioni[i + 1].trim() });
    if (testi.length !== passi.length)
      errore(`i passi nell'intestazione (${passi.length}) e nel testo (${testi.length}) non coincidono`);
    for (const id of Array.isArray(proprietarie) ? proprietarie : []) {
      if (!processiPer.has(id)) processiPer.set(id, []);
      processiPer.get(id).push({ errore, dati: d, schema, principale: proprietarie[0], passi, testi });
    }
  }

  // Seconda passata: corpo, rimandi, relazioni.
  const strutture = [];
  for (const { file, dati: d, corpo } of grezze) {
    const errore = errorePer(`strutture/${file}`);
    const sezioni = dividiSezioni(corpo, errore);
    const { ordine, numero, rimandi, elenco } = numeratore(fonti, errore);

    // Le fonti si numerano nell'ordine della prima citazione; il cartellino mostra solo "In breve",
    // quindi le sue fonti sono le prime della lista.
    let fontiBreve = 0;
    // Figura della scheda: sta in fondo a una sezione e la sua didascalia segue le regole del testo.
    // Si compila subito dopo quella sezione, così le fonti restano numerate nell'ordine di lettura.
    const f = d.figura;
    let figura = null;
    const compilaFigura = () => {
      if (!FIGURE.includes(f?.schema)) errore(`figura: schema deve essere uno tra ${FIGURE.join(', ')}`);
      if (typeof f?.titolo !== 'string' || !f.titolo) errore('figura: manca il titolo');
      const testo = typeof f?.didascalia === 'string' ? f.didascalia.trim() : '';
      if (!testo) errore('figura: manca la didascalia');
      controllaRimandi(lexer, testo, errore);
      figura = {
        schema: f?.schema,
        titolo: f?.titolo ?? '',
        sezione: f?.sezione,
        html: compila(testo, rimandi, errore),
      };
    };
    const compilate = sezioni.map((s, i) => {
      controllaRimandi(lexer, s.testo, errore);
      const html = compila(s.testo, rimandi, errore);
      if (i === 0) fontiBreve = ordine.length;
      if (f !== undefined && f?.sezione === s.chiave) compilaFigura();
      return { chiave: s.chiave, titolo: s.titolo, ancora: ancora(s.chiave), html };
    });
    if (f !== undefined && !figura)
      errore(`figura: sezione deve essere una delle sezioni della scheda (${sezioni.map((s) => s.chiave).join(', ')})`);

    const relazioni = (d.relazioni ?? []).map((r) => {
      if (!TIPI_RELAZIONE.includes(r.tipo)) errore(`tipo di relazione sconosciuto: ${r.tipo}`);
      const destinazione = perId.get(r.id)?.dati;
      const nome = destinazione?.nome ?? nomi[r.id];
      if (!nome) errore(`relazione verso "${r.id}", che non ha contenuto né un nome in riferimenti.yaml`);
      if (r.tipo === 'collegato-a' && !r.fonte) errore(`la relazione verso "${r.id}" non indica la fonte`);
      return {
        tipo: r.tipo,
        id: r.id,
        nome: nome ?? r.id,
        conContenuto: !!destinazione,
        fonte: r.fonte ? numero(r.fonte) : null,
      };
    });
    if (!relazioni.some((r) => r.tipo === 'fa-parte-di')) errore('manca la relazione "fa-parte-di"');

    const processi = (processiPer.get(d.id) ?? []).map((p) => ({
      id: p.dati.id,
      titolo: p.dati.titolo,
      schema: p.schema,
      // La struttura da cui l'Indice apre il processo.
      principale: p.principale,
      stato: p.dati.stato,
      revisione: String(p.dati.revisione),
      passi: p.passi.map((passo, i) => {
        const testo = p.testi[i]?.testo ?? '';
        // Un processo di più strutture si compila per ognuna: l'errore si segnala una volta sola.
        if (d.id === p.principale) controllaRimandi(lexer, testo, p.errore);
        const titolo = p.testi[i]?.titolo ?? '';
        const html = compila(testo, rimandi, d.id === p.principale ? p.errore : () => {});
        if (p.schema !== 'cuore') return { titolo, html, fase: passo.fase };
        return {
          titolo,
          html,
          ...Object.fromEntries(Object.keys(CAMPI_PASSO).map((c) => [c, passo[c]])),
          flussi: passo.flussi ?? [],
        };
      }),
    }));

    strutture.push({
      id: d.id,
      tipo: d.tipo,
      strato: d.strato,
      apparato: d.apparato,
      nomeApparato: apparati[d.apparato] ?? d.apparato,
      nome: d.nome,
      termine: d.termine,
      ta2: d.ta2,
      sinonimi: d.sinonimi ?? [],
      elementi3d: { gruppo: d.elementi3d?.gruppo ?? null, fma: d.elementi3d?.fma ?? [], id: d.elementi3d?.id ?? [] },
      // Unità del modello da selezionare per mostrare la struttura (Indice, indirizzi senza 3D).
      unita: d.elementi3d?.gruppo ?? modello.unita?.get(d.elementi3d?.fma?.[0]) ?? d.elementi3d?.id?.[0] ?? null,
      stato: d.stato,
      revisione: String(d.revisione),
      limiti: typeof d.limiti === 'string' ? d.limiti.trim() : null,
      sezioni: compilate,
      figura,
      scheda: d.tipo === 'organo' && compilate.length > 1,
      relazioni,
      processi,
      fonti: elenco(),
      fontiBreve,
    });
  }

  // Pagine editoriali (Informazioni): Markdown semplice, con le stesse regole sugli stati.
  const pagine = [];
  const cartellaPagine = path.join(cartella, 'pagine');
  for (const file of fs.existsSync(cartellaPagine)
    ? fs.readdirSync(cartellaPagine).filter((f) => f.endsWith('.md'))
    : []) {
    const errore = errorePer(`pagine/${file}`);
    const letto = separaIntestazione(fs.readFileSync(path.join(cartellaPagine, file), 'utf8'));
    if (!letto) {
      errore('manca l’intestazione YAML');
      continue;
    }
    const d = letto.dati;
    if (`${d.id}.md` !== file) errore(`l'id "${d.id}" deve coincidere con il nome del file`);
    if (!STATI.includes(d.stato)) errore(`stato deve essere uno tra ${STATI.join(', ')}`);
    if (!DATA.test(String(d.revisione))) errore('manca la data di revisione');
    controllaHtml(lexer(letto.corpo), errore);
    pagine.push({
      id: d.id,
      titolo: d.titolo,
      stato: d.stato,
      revisione: String(d.revisione),
      html: marked.parse(letto.corpo),
    });
  }

  // Percorsi guidati (contenuti/percorsi/, D24): un passo per sezione "## Titolo", con strato,
  // strutture evidenziate, inquadratura e schema nell'intestazione. Hanno fonti numerate proprie.
  const percorsi = [];
  const cartellaPercorsi = path.join(cartella, 'percorsi');
  for (const file of fs.existsSync(cartellaPercorsi)
    ? fs
        .readdirSync(cartellaPercorsi)
        .filter((f) => f.endsWith('.md'))
        .sort()
    : []) {
    const errore = errorePer(`percorsi/${file}`);
    const letto = separaIntestazione(fs.readFileSync(path.join(cartellaPercorsi, file), 'utf8'));
    if (!letto) {
      errore('manca l’intestazione YAML');
      continue;
    }
    const d = letto.dati;
    if (`${d.id}.md` !== file) errore(`l'id "${d.id}" deve coincidere con il nome del file`);
    if (typeof d.titolo !== 'string' || !d.titolo) errore('manca il titolo');
    if (!STATI.includes(d.stato)) errore(`stato deve essere uno tra ${STATI.join(', ')}`);
    if (!DATA.test(String(d.revisione))) errore('manca la data di revisione');
    const passi = Array.isArray(d.passi) ? d.passi : [];
    if (passi.length < 2) errore('servono almeno due passi');
    const sezioni = letto.corpo.split(/^## (.+)$/m);
    if (sezioni[0].trim()) errore('c’è del testo prima del primo passo');
    const testi = [];
    for (let i = 1; i < sezioni.length; i += 2) testi.push({ titolo: sezioni[i].trim(), testo: sezioni[i + 1].trim() });
    if (testi.length !== passi.length)
      errore(`i passi nell'intestazione (${passi.length}) e nel testo (${testi.length}) non coincidono`);

    // Strutture del modello indicate per gruppo (organi) o per FMA (ossa e muscoli).
    const elementi = (valore, campo, i) => {
      const gruppi = valore?.gruppi ?? [];
      const fma = valore?.fma ?? [];
      for (const g of gruppi)
        if (!modello.gruppi.has(g)) errore(`passo ${i + 1}: il gruppo 3D "${g}" non esiste nel modello`);
      for (const f of fma) if (!modello.fma.has(f)) errore(`passo ${i + 1}: l'elemento ${f} non esiste nel modello`);
      if (!gruppi.length && !fma.length) errore(`passo ${i + 1}: ${campo} deve indicare dei gruppi o degli FMA`);
      return { gruppi, fma };
    };
    const { rimandi, elenco } = numeratore(fonti, errore);
    const compilati = passi.map((passo, i) => {
      if (!STRATI_PERCORSO.includes(passo?.strato))
        errore(`passo ${i + 1}: strato deve essere uno tra ${STRATI_PERCORSO.join(', ')}`);
      if (!SCHEMI_PERCORSO.includes(passo?.schema))
        errore(`passo ${i + 1}: schema deve essere uno tra ${SCHEMI_PERCORSO.join(', ')}`);
      const testo = testi[i]?.testo ?? '';
      controllaRimandi(lexer, testo, errore);
      return {
        titolo: testi[i]?.titolo ?? '',
        html: compila(testo, rimandi, errore),
        strato: passo?.strato,
        evidenzia: elementi(passo?.evidenzia, 'evidenzia', i),
        inquadra: passo?.inquadra ? elementi(passo.inquadra, 'inquadra', i) : null,
        schema: passo?.schema,
      };
    });
    percorsi.push({
      id: d.id,
      titolo: d.titolo,
      stato: d.stato,
      revisione: String(d.revisione),
      limiti: typeof d.limiti === 'string' ? d.limiti.trim() : null,
      passi: compilati,
      fonti: elenco(),
    });
  }

  const citataDa = (idFonte) => [
    ...strutture.filter((s) => s.fonti.some((f) => f.id === idFonte)).map((s) => ({ id: s.id, nome: s.nome })),
    ...percorsi
      .filter((p) => p.fonti.some((f) => f.id === idFonte))
      .map((p) => ({ id: `percorsi/${p.id}`, nome: `percorso “${p.titolo}”` })),
    ...glossario
      .filter((v) => v.fonti.some((f) => f.id === idFonte))
      .map((v) => ({ id: `glossario/${v.id}`, nome: 'glossario' })),
  ];
  const elencoFonti = Object.entries(fonti).map(([id, f]) => ({ id, ...f, citataDa: citataDa(id) }));

  return { strutture, pagine, percorsi, glossario, fonti: elencoFonti, errori };
}

/** Strutture e gruppi presenti nel modello 3D, da public/modelli/strutture.json. */
export function leggiModello(file) {
  const elementi = JSON.parse(fs.readFileSync(file, 'utf8'));
  return {
    gruppi: new Set(elementi.map((e) => e.gruppo).filter(Boolean)),
    fma: new Set(elementi.map((e) => e.fma).filter(Boolean)),
    id: new Set(elementi.map((e) => e.id)),
    // FMA → unità selezionabile: il gruppo per gli organi, l'elemento stesso per ossa e muscoli.
    unita: new Map(elementi.filter((e) => e.fma).map((e) => [e.fma, e.gruppo ?? e.id])),
  };
}
