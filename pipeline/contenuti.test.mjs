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
    expect(r.strutture.map((s) => s.id)).toEqual(['cuore', 'diaframma', 'femore', 'polmoni']);
  });
});

describe('processi animati', () => {
  const passo =
    '{ atri: rilassati, ventricoli: rilassati, av: aperte, semilunari: chiuse, segnale: nessuno, tono: nessuno, flussi: [vene-atri] }';
  const processo = (passi, corpo) => `---
id: ciclo
struttura: cuore
titolo: Ciclo
passi: [${passi.join(', ')}]
stato: verificato
revisione: 2026-10-24
---
${corpo}`;
  const conProcesso = (testo) => {
    prepara('## In breve\n\nFrase [@a].\n');
    fs.mkdirSync(path.join(cartella, 'processi'));
    fs.writeFileSync(path.join(cartella, 'processi', 'ciclo.md'), testo);
    return leggiContenuti(cartella, MODELLO);
  };

  it('compila i passi con la numerazione delle fonti della struttura', () => {
    const r = conProcesso(processo([passo, passo], '## Uno\n\nFrase [@b].\n\n## Due\n\nFrase [@a].\n'));
    expect(r.errori).toEqual([]);
    const [p] = r.strutture[0].processi;
    expect(p.passi.map((x) => x.titolo)).toEqual(['Uno', 'Due']);
    expect(p.passi[0].html).toContain('href="#fonte-2"');
    expect(r.strutture[0].fonti.map((f) => f.id)).toEqual(['a', 'b']);
  });

  it('rifiuta stati del disegno non previsti, passi senza testo e didascalie senza fonte', () => {
    const errato = passo.replace('av: aperte', 'av: socchiuse');
    const errori = conProcesso(processo([errato, passo], '## Uno\n\nFrase senza fonte.\n')).errori.join();
    expect(errori).toMatch(/av deve essere uno tra aperte, chiuse/);
    expect(errori).toMatch(/passi nell'intestazione \(2\) e nel testo \(1\)/);
    expect(errori).toMatch(/paragrafo senza fonte/);
  });
});

describe('percorsi guidati', () => {
  const passo = (extra = '') => `{ strato: organi, evidenzia: { gruppi: [cuore] }, schema: torace${extra} }`;
  const percorso = (passi, corpo) => `---
id: giro
titolo: Un giro
passi: [${passi.join(', ')}]
stato: verificato
revisione: 2026-10-24
---
${corpo}`;
  const conPercorso = (testo) => {
    prepara('## In breve\n\nFrase [@a].\n');
    fs.mkdirSync(path.join(cartella, 'percorsi'));
    fs.writeFileSync(path.join(cartella, 'percorsi', 'giro.md'), testo);
    return leggiContenuti(cartella, MODELLO);
  };

  it('compila i passi con fonti numerate proprie e li segnala nella bibliografia', () => {
    const r = conPercorso(
      percorso(
        [passo(), passo(', inquadra: { fma: [FMA1] }')],
        '## Uno\n\nFrase [@b].\n\n## Due\n\nFrase [@a] [@b].\n',
      ),
    );
    expect(r.errori).toEqual([]);
    const [p] = r.percorsi;
    expect(p.passi.map((x) => x.titolo)).toEqual(['Uno', 'Due']);
    expect(p.fonti.map((f) => `${f.n}:${f.id}`)).toEqual(['1:b', '2:a']);
    expect(p.passi[1]).toMatchObject({ strato: 'organi', schema: 'torace', inquadra: { gruppi: [], fma: ['FMA1'] } });
    expect(p.passi[0].inquadra).toBeNull();
    expect(r.fonti.find((f) => f.id === 'b').citataDa).toContainEqual({
      id: 'percorsi/giro',
      nome: 'percorso “Un giro”',
    });
  });

  it('rifiuta schemi e strati sconosciuti, strutture assenti dal modello e paragrafi senza fonte', () => {
    const errori = conPercorso(
      percorso(
        [passo().replace('schema: torace', 'schema: cuore'), passo().replace('[cuore]', '[fegato]')],
        '## Uno\n\nFrase senza fonte.\n\n## Due\n\nFrase [@a].\n',
      ),
    ).errori.join();
    expect(errori).toMatch(/passo 1: schema deve essere uno tra/);
    expect(errori).toMatch(/passo 2: il gruppo 3D "fegato" non esiste nel modello/);
    expect(errori).toMatch(/paragrafo senza fonte/);
    expect(conPercorso(percorso([passo(), passo()], '## Uno\n\nFrase [@a].\n')).errori.join()).toMatch(
      /passi nell'intestazione \(2\) e nel testo \(1\)/,
    );
  });

  it('il percorso reale "Un respiro" ha sei passi con fonti', () => {
    const r = leggiContenuti('contenuti', leggiModello('public/modelli/strutture.json'));
    const [p] = r.percorsi;
    expect(p.id).toBe('respirazione');
    expect(p.passi).toHaveLength(6);
    expect(p.passi.every((x) => x.html.includes('href="#fonte-'))).toBe(true);
  });
});

describe('glossario', () => {
  const GLOSSARIO = `
alveolo:
  termine: alveolo
  varianti: [alveoli]
  definizione: Piccola sacca d'aria [@a].
  stato: approvato
  revisione: 2026-10-24
`;
  const conGlossario = (glossario, corpo) => {
    cartella = fs.mkdtempSync(path.join(os.tmpdir(), 'contenuti-'));
    cartelle.push(cartella);
    fs.mkdirSync(path.join(cartella, 'strutture'));
    fs.writeFileSync(path.join(cartella, 'fonti.yaml'), FONTI);
    fs.writeFileSync(path.join(cartella, 'riferimenti.yaml'), RIFERIMENTI);
    fs.writeFileSync(path.join(cartella, 'glossario.yaml'), glossario);
    fs.writeFileSync(path.join(cartella, 'strutture', 'cuore.md'), intestazione() + corpo);
    return leggiContenuti(cartella, MODELLO);
  };

  it('compila le definizioni con le fonti e trasforma i segni nei testi in collegamenti', () => {
    const r = conGlossario(GLOSSARIO, '## In breve\n\nGli [[alveoli|alveolo]] e l’[[alveolo]] [@a].\n');
    expect(r.errori).toEqual([]);
    expect(r.glossario[0]).toMatchObject({ id: 'alveolo', html: 'Piccola sacca d&#39;aria.', fonti: [{ id: 'a' }] });
    expect(r.strutture[0].sezioni[0].html).toContain(
      'Gli <a class="glossary-term" href="/indice#glossario-alveolo" data-term="alveolo">alveoli</a>',
    );
    expect(r.fonti.find((f) => f.id === 'a').citataDa).toContainEqual({ id: 'glossario/alveolo', nome: 'glossario' });
  });

  it('rifiuta voci senza fonte, fonti inesistenti e segni verso voci che non esistono', () => {
    const r = conGlossario(
      `${GLOSSARIO}senza:\n  termine: senza\n  definizione: Nessuna fonte.\n  stato: bozza\n  revisione: 2026-10-24\nfalsa:\n  termine: falsa\n  definizione: Testo [@zeta].\n  stato: bozza\n  revisione: 2026-10-24\n`,
      '## In breve\n\nIl [[bronco]] [@a].\n',
    );
    const errori = r.errori.join('\n');
    expect(errori).toContain('senza: la definizione non cita nessuna fonte');
    expect(errori).toContain('falsa: citazione di una fonte inesistente: [@zeta]');
    expect(errori).toContain('termine del glossario inesistente: [[bronco]]');
  });

  it('il glossario reale supera il controllo e ogni segno nei testi ha la sua voce', () => {
    const r = leggiContenuti('contenuti', leggiModello('public/modelli/strutture.json'));
    expect(r.errori).toEqual([]);
    expect(r.glossario.length).toBeGreaterThanOrEqual(20);
    expect(r.glossario.every((v) => v.fonti.length > 0)).toBe(true);
  });
});
