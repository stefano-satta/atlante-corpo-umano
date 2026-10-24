import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contenuti } from './plugin-contenuti.mjs';

// Copia dei contenuti reali con il femore riportato in bozza, per provare il filtro di pubblicazione.
let radice;
beforeAll(() => {
  radice = fs.mkdtempSync(path.join(os.tmpdir(), 'atlante-'));
  fs.cpSync('contenuti', path.join(radice, 'contenuti'), { recursive: true });
  fs.mkdirSync(path.join(radice, 'public/modelli'), { recursive: true });
  fs.copyFileSync('public/modelli/strutture.json', path.join(radice, 'public/modelli/strutture.json'));
  const femore = path.join(radice, 'contenuti/strutture/femore.md');
  fs.writeFileSync(femore, fs.readFileSync(femore, 'utf8').replace(/^stato: .*$/m, 'stato: bozza'));
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
  });

  it('in sviluppo include anche bozze e testi verificati', () => {
    expect(caricaIndice('serve')).toContain('"id":"femore"');
  });
});
