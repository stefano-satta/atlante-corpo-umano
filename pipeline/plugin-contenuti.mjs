// Plugin di Vite che espone i contenuti compilati come moduli virtuali.
//
//   virtual:contenuti                    indice leggero delle strutture, con i caricatori
//   virtual:contenuti/struttura/<id>     testo, relazioni e fonti di una struttura (caricato su richiesta)
//   virtual:contenuti/fonti              bibliografia completa per la pagina Fonti
//   virtual:contenuti/pagina/<id>        pagine editoriali (Informazioni)
//   virtual:contenuti/percorso/<id>      percorsi guidati, come "Un respiro" (caricati su richiesta)
//   virtual:contenuti/glossario          definizioni del glossario (caricate su richiesta)
//
// In produzione entrano solo i contenuti "approvato" (D17); con ATLANTE_BOZZE=1, e sempre
// in sviluppo, entrano anche bozze e testi verificati, segnalati nell'interfaccia.

import path from 'node:path';
import { leggiContenuti, leggiModello } from './contenuti.mjs';

const PREFISSO = 'virtual:contenuti';

/**
 * Toglie il collegamento ai termini del glossario non pubblicati: resta la parola, senza
 * definizione. Agisce su ogni campo html, a qualunque profondità.
 */
export function senzaVociMancanti(valore, pubblicate) {
  if (Array.isArray(valore)) return valore.map((v) => senzaVociMancanti(v, pubblicate));
  if (!valore || typeof valore !== 'object') return valore;
  return Object.fromEntries(
    Object.entries(valore).map(([k, v]) => [
      k,
      k === 'html' && typeof v === 'string'
        ? v.replace(
            /<a class="glossary-term" href="[^"]*" data-term="([a-z0-9-]+)">([\s\S]*?)<\/a>/g,
            (tutto, id, testo) => (pubblicate.has(id) ? tutto : testo),
          )
        : senzaVociMancanti(v, pubblicate),
    ]),
  );
}

export function contenuti({ radice = process.cwd() } = {}) {
  const cartella = path.join(radice, 'contenuti');
  const fileModello = path.join(radice, 'public/modelli/strutture.json');
  let bozze = false;
  let cache = null;

  const dati = () => {
    if (cache) return cache;
    const letti = leggiContenuti(cartella, leggiModello(fileModello));
    if (letti.errori.length) throw new Error(`Controllo dei contenuti non superato:\n- ${letti.errori.join('\n- ')}`);
    const pubblicabile = (c) => bozze || c.stato === 'approvato';
    const glossario = letti.glossario.filter(pubblicabile);
    const voci = new Set(glossario.map((v) => v.id));
    cache = senzaVociMancanti(
      {
        strutture: letti.strutture
          .filter(pubblicabile)
          .map((s) => ({ ...s, processi: s.processi.filter(pubblicabile) })),
        pagine: letti.pagine.filter(pubblicabile),
        percorsi: letti.percorsi.filter(pubblicabile),
        glossario,
        fonti: letti.fonti,
      },
      voci,
    );
    return cache;
  };

  return {
    name: 'atlante-contenuti',
    configResolved(config) {
      bozze = config.command === 'serve' || process.env.ATLANTE_BOZZE === '1';
    },
    buildStart() {
      cache = null;
      this.addWatchFile(fileModello);
    },
    resolveId(id) {
      if (id === PREFISSO || id.startsWith(`${PREFISSO}/`)) return `\0${id}`;
    },
    load(id) {
      if (!id.startsWith(`\0${PREFISSO}`)) return;
      const d = dati();
      const percorso = id.slice(PREFISSO.length + 1);
      if (percorso === '') {
        const indice = d.strutture.map(
          ({ sezioni, figura, relazioni, fonti, limiti, fontiBreve, processi, ...resto }) => resto,
        );
        const caricatori = (elenco, tipo) =>
          `{${elenco.map((c) => `${JSON.stringify(c.id)}: () => import(${JSON.stringify(`${PREFISSO}/${tipo}/${c.id}`)})`).join(',')}}`;
        return [
          `export const STRUTTURE = ${JSON.stringify(indice)};`,
          `export const caricaStruttura = ${caricatori(d.strutture, 'struttura')};`,
          `export const caricaPagina = ${caricatori(d.pagine, 'pagina')};`,
          `export const PERCORSI = ${JSON.stringify(d.percorsi.map(({ id, titolo, descrizione, stato, passi }) => ({ id, titolo, descrizione, stato, passi: passi.length })))};`,
          `export const caricaPercorso = ${caricatori(d.percorsi, 'percorso')};`,
          `export const PROCESSI = ${JSON.stringify(d.strutture.flatMap((s) => s.processi.filter((p) => p.principale === s.id).map(({ id, titolo, stato }) => ({ id, titolo, stato, struttura: s.id }))))};`,
          `export const GLOSSARIO = ${JSON.stringify(d.glossario.map(({ id, termine, varianti, latino, ta2, parteDi, nelModello }) => ({ id, termine, varianti, latino, ta2, parteDi, nelModello })))};`,
          `export const caricaGlossario = () => import(${JSON.stringify(`${PREFISSO}/glossario`)});`,
          `export const caricaFonti = () => import(${JSON.stringify(`${PREFISSO}/fonti`)});`,
        ].join('\n');
      }
      if (percorso === '/fonti') return `export default ${JSON.stringify(d.fonti)};`;
      if (percorso === '/glossario') return `export default ${JSON.stringify(d.glossario)};`;
      const [, tipo, chiave] = percorso.split('/');
      const elenco = { struttura: d.strutture, pagina: d.pagine, percorso: d.percorsi }[tipo] ?? [];
      const voce = elenco.find((c) => c.id === chiave);
      if (!voce) this.error(`Contenuto inesistente: ${percorso}`);
      return `export default ${JSON.stringify(voce)};`;
    },
    configureServer(server) {
      // In sviluppo: ogni modifica a contenuti/ ricarica la pagina con i testi aggiornati.
      server.watcher.add(cartella);
      server.watcher.on('all', (_evento, file) => {
        if (!file.startsWith(cartella)) return;
        cache = null;
        for (const m of server.moduleGraph.idToModuleMap.values())
          if (m.id?.startsWith(`\0${PREFISSO}`)) server.moduleGraph.invalidateModule(m);
        server.ws.send({ type: 'full-reload' });
      });
    },
  };
}
