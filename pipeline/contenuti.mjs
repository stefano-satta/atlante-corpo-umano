// Lettura, controllo e compilazione dei contenuti (D17).
//
// Ogni struttura è un file Markdown in contenuti/strutture/ con intestazione YAML;
// le fonti stanno in contenuti/fonti.yaml e i nomi delle strutture senza scheda in
// contenuti/riferimenti.yaml. Il controllo automatico ferma la build se trova un
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

const DATA = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CITAZIONE = /\[@([^\]\s]+)\]/g;
const GRUPPO_CITAZIONI = /(?:\s*\[@[^\]\s]+\])+/g;

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
    if (e3d.gruppo === undefined && !(e3d.fma ?? []).length) errore('elementi3d deve indicare un gruppo o degli FMA');
    grezze.push({ file, dati: d, corpo: letto.corpo });
  }
  const perId = new Map(grezze.map((g) => [g.dati.id, g]));

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
    if (!perId.has(d.struttura)) errore(`struttura sconosciuta: ${d.struttura}`);
    if (typeof d.titolo !== 'string' || !d.titolo) errore('manca il titolo');
    if (!STATI.includes(d.stato)) errore(`stato deve essere uno tra ${STATI.join(', ')}`);
    if (!DATA.test(String(d.revisione))) errore('manca la data di revisione');
    const passi = Array.isArray(d.passi) ? d.passi : [];
    if (passi.length < 2) errore('servono almeno due passi');
    passi.forEach((passo, i) => {
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
    if (!processiPer.has(d.struttura)) processiPer.set(d.struttura, []);
    processiPer.get(d.struttura).push({ errore, dati: d, passi, testi });
  }

  // Seconda passata: corpo, rimandi, relazioni.
  const strutture = [];
  for (const { file, dati: d, corpo } of grezze) {
    const errore = errorePer(`strutture/${file}`);
    const sezioni = dividiSezioni(corpo, errore);
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
        return `<sup class="rimando"><span class="solo-lettori">fonti </span>${link}</sup>`;
      });

    // Le fonti si numerano nell'ordine della prima citazione; il cartellino mostra solo "In breve",
    // quindi le sue fonti sono le prime della lista.
    let fontiBreve = 0;
    const compilate = sezioni.map((s, i) => {
      controllaRimandi(lexer, s.testo, errore);
      const html = marked.parse(rimandi(s.testo));
      if (i === 0) fontiBreve = ordine.length;
      return { chiave: s.chiave, titolo: s.titolo, ancora: ancora(s.chiave), html };
    });

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
      stato: p.dati.stato,
      revisione: String(p.dati.revisione),
      passi: p.passi.map((passo, i) => {
        const testo = p.testi[i]?.testo ?? '';
        controllaRimandi(lexer, testo, p.errore);
        return {
          titolo: p.testi[i]?.titolo ?? '',
          html: marked.parse(rimandi(testo)),
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
      elementi3d: { gruppo: d.elementi3d?.gruppo ?? null, fma: d.elementi3d?.fma ?? [] },
      stato: d.stato,
      revisione: String(d.revisione),
      limiti: typeof d.limiti === 'string' ? d.limiti.trim() : null,
      sezioni: compilate,
      scheda: d.tipo === 'organo' && compilate.length > 1,
      relazioni,
      processi,
      fonti: ordine.map((id, i) => ({ n: i + 1, id, ...fonti[id] })),
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

  const citataDa = (idFonte) =>
    strutture.filter((s) => s.fonti.some((f) => f.id === idFonte)).map((s) => ({ id: s.id, nome: s.nome }));
  const elencoFonti = Object.entries(fonti).map(([id, f]) => ({ id, ...f, citataDa: citataDa(id) }));

  return { strutture, pagine, fonti: elencoFonti, errori };
}

/** Strutture e gruppi presenti nel modello 3D, da public/modelli/strutture.json. */
export function leggiModello(file) {
  const elementi = JSON.parse(fs.readFileSync(file, 'utf8'));
  return {
    gruppi: new Set(elementi.map((e) => e.gruppo).filter(Boolean)),
    fma: new Set(elementi.map((e) => e.fma).filter(Boolean)),
  };
}
