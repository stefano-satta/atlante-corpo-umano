import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contenuti, senzaVociMancanti } from './plugin-contenuti.mjs';

// Copia dei contenuti reali con stati fissati, per provare il filtro di pubblicazione senza
// dipendere da quali testi sono approvati oggi: femore in bozza, cuore e Informazioni approvati,
// percorsi "Un respiro" e "Il viaggio del cibo" verificati; nel glossario alveolo in bozza, le altre voci approvate.
let radice;
beforeAll(() => {
  radice = fs.mkdtempSync(path.join(os.tmpdir(), 'atlante-'));
  fs.cpSync('contenuti', path.join(radice, 'contenuti'), { recursive: true });
  fs.mkdirSync(path.join(radice, 'public/modelli'), { recursive: true });
  fs.copyFileSync('public/modelli/strutture.json', path.join(radice, 'public/modelli/strutture.json'));
  const fissa = (file, stato) => {
    const f = path.join(radice, 'contenuti', file);
    fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(/^stato: .*$/m, `stato: ${stato}`));
  };
  fissa('strutture/femore.md', 'bozza');
  fissa('strutture/cuore.md', 'approvato');
  fissa('pagine/informazioni.md', 'approvato');
  fissa('percorsi/respirazione.md', 'verificato');
  fissa('percorsi/viaggio-del-cibo.md', 'verificato');
  const glossario = path.join(radice, 'contenuti/glossario.yaml');
  fs.writeFileSync(
    glossario,
    fs
      .readFileSync(glossario, 'utf8')
      .replace(/^ {2}stato: .*$/gm, '  stato: approvato')
      .replace(/^(alveolo:\n(?: {2}.*\n)*?) {2}stato: approvato$/m, '$1  stato: bozza'),
  );
});
afterAll(() => fs.rmSync(radice, { recursive: true, force: true }));

function caricaIndice(comando) {
  const plugin = contenuti({ radice });
  plugin.configResolved({ command: comando });
  plugin.buildStart.call({ addWatchFile() {} });
  return plugin.load.call(
    {
      error: (m) => {
        throw new Error(m);
      },
    },
    '\0virtual:contenuti',
  );
}

describe('pubblicazione dei contenuti', () => {
  it('in produzione include solo i contenuti approvati', () => {
    const indice = caricaIndice('build');
    expect(indice).toContain('"id":"cuore"');
    expect(indice).toContain('virtual:contenuti/pagina/informazioni');
    expect(indice).not.toContain('"id":"femore"');
    expect(indice).toContain('export const PERCORSI = [];');
  });

  it('toglie i collegamenti ai termini del glossario non pubblicati, lasciando la parola', () => {
    const html =
      '<p>Gli <a class="glossary-term" href="/glossario#glossario-alveolo" data-term="alveolo">alveoli</a>.</p>';
    expect(senzaVociMancanti({ sezioni: [{ html }] }, new Set())).toEqual({
      sezioni: [{ html: '<p>Gli alveoli.</p>' }],
    });
    expect(senzaVociMancanti({ html }, new Set(['alveolo']))).toEqual({ html });
  });

  it('in produzione il glossario contiene solo le voci approvate', () => {
    const voci = (comando) => JSON.parse(/GLOSSARIO = (\[.*\]);/.exec(caricaIndice(comando))[1]).map((v) => v.id);
    expect(voci('build')).not.toContain('alveolo');
    expect(voci('build')).toContain('aorta');
    expect(voci('serve')).toContain('alveolo');
  });

  it('in sviluppo include anche bozze e testi verificati', () => {
    const indice = caricaIndice('serve');
    expect(indice).toContain('"id":"femore"');
    expect(indice).toContain('virtual:contenuti/percorso/respirazione');
  });
});
