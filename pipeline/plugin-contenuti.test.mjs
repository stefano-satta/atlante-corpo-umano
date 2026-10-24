import { describe, expect, it } from 'vitest';
import { contenuti } from './plugin-contenuti.mjs';

function caricaIndice(comando) {
  const plugin = contenuti();
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
    expect(indice).not.toContain('"id":"femore"');
    expect(indice).not.toContain('virtual:contenuti/pagina/informazioni');
  });

  it('in sviluppo include anche bozze e testi verificati', () => {
    const indice = caricaIndice('serve');
    expect(indice).toContain('"id":"femore"');
    expect(indice).toContain('virtual:contenuti/pagina/informazioni');
  });
});
