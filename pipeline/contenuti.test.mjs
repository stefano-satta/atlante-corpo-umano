import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { leggiContenuti, leggiModello } from './contenuti.mjs';

const MODELLO = { gruppi: new Set(['cuore']), fma: new Set(['FMA1']) };

const FONTI = `
a:
  tipo: istituzionale
  titolo: Fonte A
  ente: Ente A
  url: https://esempio.org/a
  consultata: 2026-10-22
b:
  tipo: manuale
  titolo: Fonte B
  autori: [Autore B]
  url: https://esempio.org/b
  consultata: 2026-10-22
`;
const RIFERIMENTI = `
apparati: { cardiovascolare: Apparato cardiovascolare }
nomi: { apparato-cardiovascolare: Apparato cardiovascolare, polmoni: Polmoni }
`;
const intestazione = (extra = '') => `---
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
  - { tipo: collegato-a, id: polmoni, fonte: b }
stato: approvato
revisione: 2026-10-22
${extra}---
`;

let cartella;
const cartelle = [];
function prepara(corpo, extra) {
  cartella = fs.mkdtempSync(path.join(os.tmpdir(), 'contenuti-'));
  cartelle.push(cartella);
  fs.mkdirSync(path.join(cartella, 'strutture'));
  fs.writeFileSync(path.join(cartella, 'fonti.yaml'), FONTI);
  fs.writeFileSync(path.join(cartella, 'riferimenti.yaml'), RIFERIMENTI);
  fs.writeFileSync(path.join(cartella, 'strutture', 'cuore.md'), intestazione(extra) + corpo);
  return leggiContenuti(cartella, MODELLO);
}
afterEach(() => {
  for (const c of cartelle.splice(0)) fs.rmSync(c, { recursive: true, force: true });
});

describe('controllo automatico dei contenuti', () => {
  it('numera le fonti nell’ordine della prima citazione e le collega ai rimandi', () => {
    const r = prepara('## In breve\n\nPrima frase [@b]. Seconda frase [@a] [@b].\n');
    expect(r.errori).toEqual([]);
    const [s] = r.strutture;
    expect(s.fonti.map((f) => `${f.n}:${f.id}`)).toEqual(['1:b', '2:a']);
    expect(s.sezioni[0].html).toContain('<a href="#fonte-2">2</a>, <a href="#fonte-1">1</a>');
    expect(s.relazioni.find((x) => x.id === 'polmoni')).toMatchObject({ nome: 'Polmoni', fonte: 1 });
    expect(s.fontiBreve).toBe(2);
  });

  it('rifiuta una citazione verso una fonte che non esiste', () => {
    expect(prepara('## In breve\n\nFrase [@inventata].\n').errori.join()).toMatch(/fonte inesistente: \[@inventata\]/);
  });

  it('rifiuta un paragrafo senza fonte', () => {
    expect(prepara('## In breve\n\nFrase con fonte [@a].\n\nFrase senza fonte.\n').errori.join()).toMatch(
      /paragrafo senza fonte/,
    );
  });

  it('accetta un elenco introdotto da un paragrafo citato, rifiuta voci senza fonte altrimenti', () => {
    expect(prepara('## In breve\n\nLe parti [@a]:\n\n- una;\n- due.\n').errori).toEqual([]);
    expect(prepara('## In breve\n\nLe parti:\n\n- una [@a];\n- due.\n').errori.join()).toMatch(
      /voce di elenco senza fonte/,
    );
  });

  it('rifiuta sezioni non previste, HTML grezzo e una prima sezione diversa da "In breve"', () => {
    expect(prepara('## Curiosità\n\nFrase [@a].\n').errori.join()).toMatch(/sezione non ammessa/);
    expect(prepara('## In breve\n\n<b>Frase</b> [@a].\n').errori.join()).toMatch(/HTML non ammesso/);
    expect(prepara('## Cosa fa\n\nFrase [@a].\n').errori.join()).toMatch(/prima sezione deve essere "In breve"/);
  });

  it('controlla elementi 3D, relazioni e numero TA2', () => {
    const errori = prepara('## In breve\n\nFrase [@a].\n')
      .errori.concat(leggiContenuti(cartella, { gruppi: new Set(), fma: new Set() }).errori)
      .join();
    expect(errori).toMatch(/il gruppo 3D "cuore" non esiste nel modello/);
    fs.writeFileSync(
      path.join(cartella, 'strutture', 'cuore.md'),
      intestazione().replace('ta2: 3932\n', '').replace('id: polmoni', 'id: milza') + '## In breve\n\nFrase [@a].\n',
    );
    const altri = leggiContenuti(cartella, MODELLO).errori.join();
    expect(altri).toMatch(/manca il numero TA2/);
    expect(altri).toMatch(/relazione verso "milza"/);
  });
});

describe('contenuti reali dell’atlante', () => {
  it('superano il controllo automatico', () => {
    const r = leggiContenuti('contenuti', leggiModello('public/modelli/strutture.json'));
    expect(r.errori).toEqual([]);
    expect(r.strutture.map((s) => s.id)).toEqual(['cuore', 'diaframma', 'femore']);
  });
});
