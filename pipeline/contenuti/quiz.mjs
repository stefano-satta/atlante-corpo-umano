// Quiz di autoverifica (contenuti/quiz/<tema>.yaml, D53): domande a quattro risposte, una per
// apparato della barra laterale. Ogni domanda nomina la struttura che il corpo 3D evidenzia e
// spiega la risposta con una fonte citata, come ogni altro testo dell'atlante.

import fs from 'node:fs';
import path from 'node:path';
import { parse as leggiYaml } from 'yaml';
import { ID, STATI, TEMI_QUIZ, TIPI_DOMANDA } from './regole.mjs';
import { controllaRimandi, numeratore } from './testo.mjs';

/** Unità del modello che mostrano una struttura: gruppi (organi, vasi, nervi, muscoli senza FMA) e FMA. */
const evidenziaDi = (s) => ({
  gruppi: [...(s.elementi3d.gruppo ? [s.elementi3d.gruppo] : []), ...s.elementi3d.id],
  fma: s.elementi3d.fma,
});

function compilaDomanda(q, tema, strutture, contesto, errore) {
  const { fonti, lexer, compila } = contesto;
  const e = (m) => errore(`domanda "${q?.id ?? '?'}": ${m}`);
  if (!ID.test(String(q?.id))) e('id mancante o non valido');
  if (!TIPI_DOMANDA.includes(q?.tipo)) e(`tipo deve essere uno tra ${TIPI_DOMANDA.join(', ')}`);
  if (typeof q?.domanda !== 'string' || !q.domanda.trim()) e('manca il testo della domanda');
  const risposte = Array.isArray(q?.risposte) ? q.risposte.map((r) => String(r).trim()) : [];
  if (risposte.length !== 4) e('servono esattamente quattro risposte (la prima è quella giusta)');
  if (new Set(risposte.map((r) => r.toLowerCase())).size !== risposte.length) e('le risposte devono essere diverse');
  if (risposte.some((r) => !r)) e('una risposta è vuota');
  if (!STATI.includes(q?.stato)) e(`stato deve essere uno tra ${STATI.join(', ')}`);
  const struttura = strutture.get(q?.struttura);
  if (!struttura) e(`struttura sconosciuta: "${q?.struttura}"`);
  else if (q.tipo === 'indica' && risposte[0] !== struttura.nome)
    e(`in una domanda "indica" la risposta giusta è il nome della struttura ("${struttura.nome}")`);
  const testo = typeof q?.spiegazione === 'string' ? q.spiegazione.trim() : '';
  if (!testo) e('manca la spiegazione');
  // Ogni domanda numera le sue fonti da 1: la spiegazione si legge da sola.
  const { rimandi, elenco } = numeratore(fonti, e);
  controllaRimandi(lexer, testo, e);
  return {
    id: q?.id,
    tema,
    tipo: q?.tipo,
    domanda: q?.domanda?.trim?.() ?? '',
    risposte,
    struttura: q?.struttura,
    nomeStruttura: struttura?.nome ?? '',
    unita: struttura?.unita ?? null,
    evidenzia: struttura ? evidenziaDi(struttura) : { gruppi: [], fma: [] },
    spiegazione: compila(testo, rimandi, e),
    fonti: elenco(),
    stato: q?.stato,
  };
}

/**
 * Legge i file del quiz. Restituisce le domande compilate di ogni tema; gli errori fermano la build.
 *
 * @param {Map<string, object>} strutture strutture compilate, per id
 */
export function leggiQuiz(contesto, strutture) {
  const { cartella, errorePer } = contesto;
  const dir = path.join(cartella, 'quiz');
  const temi = {};
  if (!fs.existsSync(dir)) return temi;
  const visti = new Set();
  for (const file of fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .sort()) {
    const errore = errorePer(`quiz/${file}`);
    const tema = file.replace(/\.yaml$/, '');
    if (!TEMI_QUIZ.includes(tema)) {
      errore(`tema sconosciuto: il file deve chiamarsi come un apparato (${TEMI_QUIZ.join(', ')})`);
      continue;
    }
    let domande;
    try {
      domande = leggiYaml(fs.readFileSync(path.join(dir, file), 'utf8')) ?? [];
    } catch (e) {
      errore(`YAML non valido: ${e.message.split('\n')[0]}`);
      continue;
    }
    if (!Array.isArray(domande)) {
      errore('il file deve essere un elenco di domande');
      continue;
    }
    temi[tema] = domande.map((q) => {
      if (visti.has(q?.id)) errore(`id ripetuto: "${q?.id}"`);
      visti.add(q?.id);
      return compilaDomanda(q, tema, strutture, contesto, errore);
    });
  }
  return temi;
}
