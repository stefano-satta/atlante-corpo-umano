// Strutture (contenuti/strutture/): si leggono in due passate, perché le relazioni e i processi
// devono conoscere tutte le altre strutture.

import { compilaProcesso } from './processi.mjs';
import { DATA, FIGURE, STATI, TIPI, TIPI_RELAZIONE } from './regole.mjs';
import { ancora, controllaRimandi, dividiSezioni, fileMarkdown, leggiMarkdown, numeratore } from './testo.mjs';

function controllaIntestazione(d, file, { apparati, modello }, errore) {
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
}

/** Prima passata: intestazioni, per poter risolvere le relazioni tra strutture. */
export function leggiIntestazioni(contesto) {
  const { cartella, errorePer } = contesto;
  const grezze = [];
  for (const file of fileMarkdown(cartella, 'strutture')) {
    const errore = errorePer(`strutture/${file}`);
    const letto = leggiMarkdown(cartella, 'strutture', file, errore, 'manca l’intestazione YAML tra due righe ---');
    if (!letto) continue;
    controllaIntestazione(letto.dati, file, contesto, errore);
    grezze.push({ file, dati: letto.dati, corpo: letto.corpo });
  }
  return grezze;
}

/** Figura della scheda: sta in fondo a una sezione e la sua didascalia segue le regole del testo. */
function compilaFigura(f, rimandi, { lexer, compila }, errore) {
  if (!FIGURE.includes(f?.schema)) errore(`figura: schema deve essere uno tra ${FIGURE.join(', ')}`);
  if (typeof f?.titolo !== 'string' || !f.titolo) errore('figura: manca il titolo');
  const testo = typeof f?.didascalia === 'string' ? f.didascalia.trim() : '';
  if (!testo) errore('figura: manca la didascalia');
  controllaRimandi(lexer, testo, errore);
  return {
    schema: f?.schema,
    titolo: f?.titolo ?? '',
    sezione: f?.sezione,
    html: compila(testo, rimandi, errore),
  };
}

function compilaRelazioni(relazioni, strutture, nomi, numero, errore) {
  const compilate = (relazioni ?? []).map((r) => {
    if (!TIPI_RELAZIONE.includes(r.tipo)) errore(`tipo di relazione sconosciuto: ${r.tipo}`);
    const destinazione = strutture.get(r.id)?.dati;
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
  if (!compilate.some((r) => r.tipo === 'fa-parte-di')) errore('manca la relazione "fa-parte-di"');
  return compilate;
}

/** Seconda passata: corpo, rimandi, relazioni. */
export function compilaStruttura({ file, dati: d, corpo }, strutture, processiPer, contesto) {
  const { fonti, apparati, nomi, modello, lexer, compila, errorePer } = contesto;
  const errore = errorePer(`strutture/${file}`);
  const sezioni = dividiSezioni(corpo, errore);
  const { ordine, numero, rimandi, elenco } = numeratore(fonti, errore);

  // Le fonti si numerano nell'ordine della prima citazione; il cartellino mostra solo "In breve",
  // quindi le sue fonti sono le prime della lista.
  let fontiBreve = 0;
  // La figura si compila subito dopo la sua sezione, così le fonti restano numerate nell'ordine di lettura.
  let figura = null;
  const compilate = sezioni.map((s, i) => {
    controllaRimandi(lexer, s.testo, errore);
    const html = compila(s.testo, rimandi, errore);
    if (i === 0) fontiBreve = ordine.length;
    if (d.figura !== undefined && d.figura?.sezione === s.chiave)
      figura = compilaFigura(d.figura, rimandi, contesto, errore);
    return { chiave: s.chiave, titolo: s.titolo, ancora: ancora(s.chiave), html };
  });
  if (d.figura !== undefined && !figura)
    errore(`figura: sezione deve essere una delle sezioni della scheda (${sezioni.map((s) => s.chiave).join(', ')})`);

  const relazioni = compilaRelazioni(d.relazioni, strutture, nomi, numero, errore);
  const processi = (processiPer.get(d.id) ?? []).map((p) => compilaProcesso(p, d.id, rimandi, contesto));

  return {
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
  };
}
