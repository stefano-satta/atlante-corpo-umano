import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { leggiContenuti } from '../../pipeline/contenuti.mjs';

// Contenuti minimi: una struttura (cuore) e un file di quiz da provare.
const MODELLO = { gruppi: new Set(['cuore']), fma: new Set(), id: new Set(), unita: new Map() };
const FONTI = `
a:
  tipo: istituzionale
  titolo: Fonte A
  ente: Ente A
  url: https://esempio.org/a
  consultata: 2026-10-22
`;
const RIFERIMENTI = `
apparati: { cardiovascolare: Apparato cardiovascolare }
nomi: { apparato-cardiovascolare: Apparato cardiovascolare }
`;
const CUORE = `---
id: cuore
tipo: organo
strato: organi
apparato: cardiovascolare
nome: Cuore
termine: cor
ta2: 3932
elementi3d: { gruppo: cuore }
relazioni:
  - { tipo: fa-parte-di, id: apparato-cardiovascolare }
stato: approvato
revisione: 2026-10-22
---

## In breve

Il cuore ha quattro camere [@a].
`;
const domanda = (extra = {}) => ({
  id: 'cuore-camere',
  tipo: 'testo',
  domanda: 'Quante camere ha il cuore?',
  risposte: ['Quattro', 'Due', 'Tre', 'Sei'],
  struttura: 'cuore',
  spiegazione: 'Due atri e due ventricoli [@a].',
  stato: 'bozza',
  ...extra,
});

const cartelle = [];
function leggi(domande, file = 'organi.yaml') {
  const cartella = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-'));
  cartelle.push(cartella);
  fs.mkdirSync(path.join(cartella, 'strutture'));
  fs.mkdirSync(path.join(cartella, 'quiz'));
  fs.writeFileSync(path.join(cartella, 'fonti.yaml'), FONTI);
  fs.writeFileSync(path.join(cartella, 'riferimenti.yaml'), RIFERIMENTI);
  fs.writeFileSync(path.join(cartella, 'strutture', 'cuore.md'), CUORE);
  fs.writeFileSync(path.join(cartella, 'quiz', file), JSON.stringify(domande));
  return leggiContenuti(cartella, MODELLO);
}
afterEach(() => {
  for (const c of cartelle.splice(0)) fs.rmSync(c, { recursive: true, force: true });
});

describe('quiz (D53)', () => {
  it('compila la domanda con la struttura da evidenziare e le fonti numerate', () => {
    const { quiz, errori } = leggi([domanda()]);
    expect(errori).toEqual([]);
    const [q] = quiz.organi;
    expect(q).toMatchObject({ tema: 'organi', nomeStruttura: 'Cuore', unita: 'cuore' });
    expect(q.evidenzia).toEqual({ gruppi: ['cuore'], fma: [] });
    expect(q.spiegazione).toContain('href="#fonte-1"');
    expect(q.fonti.map((f) => f.id)).toEqual(['a']);
  });

  it('vuole esattamente quattro risposte diverse', () => {
    expect(leggi([domanda({ risposte: ['Quattro', 'Due', 'Tre'] })]).errori.join()).toMatch(/quattro risposte/);
    expect(leggi([domanda({ risposte: ['A', 'B', 'C', 'D', 'E'] })]).errori.join()).toMatch(/quattro risposte/);
    expect(leggi([domanda({ risposte: ['Due', 'due', 'Tre', 'Sei'] })]).errori.join()).toMatch(/diverse/);
  });

  it('ferma la build su struttura sconosciuta, spiegazione senza fonte, id ripetuti e tema sconosciuto', () => {
    expect(leggi([domanda({ struttura: 'milza' })]).errori.join()).toMatch(/struttura sconosciuta/);
    expect(leggi([domanda({ spiegazione: 'Senza fonte.' })]).errori.join()).toMatch(/senza fonte/);
    expect(leggi([domanda({ spiegazione: 'Fonte falsa [@zeta].' })]).errori.join()).toMatch(/inesistente/);
    expect(leggi([domanda(), domanda()]).errori.join()).toMatch(/id ripetuto/);
    expect(leggi([domanda()], 'pelle.yaml').errori.join()).toMatch(/tema sconosciuto/);
  });

  it('in una domanda "indica" la risposta giusta è il nome della struttura', () => {
    const indica = { tipo: 'indica', domanda: 'Quale struttura è evidenziata?' };
    expect(leggi([domanda({ ...indica, risposte: ['Cuore', 'Fegato', 'Milza', 'Rene'] })]).errori).toEqual([]);
    expect(leggi([domanda({ ...indica, risposte: ['Fegato', 'Cuore', 'Milza', 'Rene'] })]).errori.join()).toMatch(
      /nome della struttura/,
    );
  });
});
