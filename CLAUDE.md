# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Atlante interattivo del corpo umano: sito statico (Vite + React 19 + TypeScript + three.js/R3F + camera-controls), a costo zero, con testi scientifici citati. Codice, commenti, commit e risposte all'utente sono in **italiano**; i nomi di file, funzioni e variabili seguono la stessa lingua (`stato`, `invia`, `seleziona`, `Scheda`…).

## Comandi

```bash
npm run dev            # sviluppo: include bozze e testi verificati
npm run build          # tsc --noEmit + vite build: in produzione solo contenuti "approvato"
npm test               # Vitest (src/**/*.test.ts[x] e pipeline/**/*.test.mjs)
npx vitest run src/indice/ricerca.test.ts      # un singolo file
npx vitest run -t "nome del test"              # un singolo test
npm run controlla      # Biome (lint + formato); correggere con: npx biome check --write .
npm run test:e2e       # Playwright: costruisce con ATLANTE_BOZZE=1 e serve su :4192 (SwiftShader)
npx playwright test -g "glossario"             # un singolo e2e
```

Su macOS manca `timeout`: lanciare Playwright direttamente. I modelli 3D in `public/modelli/` sono già nel repository; si rigenerano con `modelli:scarica` → `modelli:polmoni` (richiede Blender; avviarlo sempre con `-Y`) → `modelli:prepara`, che leggono da `dati-sorgente/` (escluso da git).

## Regole di progetto (vincolanti)

- **`docs/DECISIONI.md` è la fonte di verità** su stato del progetto, decisioni approvate (D1…D27), decisioni delegate e registro delle modifiche. Leggerlo prima di lavorare; registrarvi ogni decisione minore presa in autonomia e riferirla all'utente.
- **Lavoro a milestone:** per ogni milestone si presenta un piano con alternative e una raccomandazione, si attende un'approvazione esplicita (il silenzio non vale) e ci si ferma dopo averla completata.
- **Contenuti medici:** niente informazioni inventate. Solo fonti autorevoli (OpenStax A&P 2e, NHLBI, FIPAT TA2), verificate leggendole; ogni paragrafo ha una citazione; distinguere fatti e incertezze, dichiarare i limiti; non affermare mai una revisione medica. Un testo passa a `approvato` solo con l'approvazione dell'utente.
- **Licenze (D6):** niente licenze NC. Dal pacchetto Z-Anatomy non si estraggono i modelli NC (orecchio interno CC BY-NC-SA, rene CC BY-NC).
- Ogni download richiede il permesso dell'utente (nome del file, fonte, dimensione).
- **Git** solo in locale: nessun remote né push. I commit terminano con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Architettura

### Contenuti → moduli virtuali

`contenuti/` contiene i testi: `strutture/*.md`, `processi/`, `percorsi/` e `pagine/` (Markdown con intestazione YAML), insieme a `fonti.yaml`, `riferimenti.yaml` e `glossario.yaml`.

- **Compilazione:** in build, `pipeline/contenuti.mjs` li legge, li controlla e li compila in HTML (con `marked` e `yaml`, che non arrivano mai nel sito). La build si ferma su:
  - citazioni `[@id-fonte]` senza fonte e paragrafi senza citazione;
  - relazioni verso strutture sconosciute;
  - elementi 3D assenti da `public/modelli/strutture.json`;
  - voci del glossario sconosciute.
- **Plugin Vite:** `pipeline/plugin-contenuti.mjs` (usato anche da Vitest) espone moduli virtuali. `virtual:contenuti` è un indice leggero con i caricatori; `virtual:contenuti/struttura/<id>`, `/fonti`, `/pagina/<id>`, `/percorso/<id>` e `/glossario` si caricano su richiesta. I tipi sono in `src/contenuti/virtuali.d.ts` e `tipi.ts`; l'accesso passa da `src/contenuti/contenuti.ts`.
- **Stati** `bozza` → `verificato` → `approvato`: in produzione entra solo `approvato`, in `serve` o con `ATLANTE_BOZZE=1` entra tutto. `senzaVociMancanti` trasforma in testo semplice i link a voci del glossario non pubblicate.
- **Glossario:** nei testi si scrive `[[parola mostrata|id-voce]]`, che diventa `<a class="glossario" data-glossario="id">`. `src/pannello/Fonti.tsx` (`Testo`) intercetta il clic e apre `src/glossario/Definizione.tsx`.

### Stato e indirizzi

`src/app/stato.tsx` contiene un reducer unico (`useAtlante()` → `{stato, invia}`) sincronizzato con l'URL tramite `leggiUrl` e `indirizzo`. Rotte principali:

- `/` (soglia d'ingresso);
- `/esplora/<unità>` o `/organo/<id>`;
- `/percorsi/<id>/<passo>`;
- `/indice`, `/fonti`, `/informazioni`.

L'app è a pagina unica: le "pagine" sono stati, non router.

### Scena 3D

`src/scena/` è il motore 3D, caricato in un pacchetto separato: l'interfaccia deve restare leggera. La UI non deve importarlo.

- **Accesso dalla UI:** `src/scena/api.ts` (`scenaApi`, `vistaIniziale`) dà accesso alla telecamera senza React.
- **Inquadrature:** `Regia` in `Scena.tsx` gestisce telecamera e offset focale per selezione, percorso e soglia.
- **Modelli:** un `.glb` per strato (ossa, muscoli, organi, pelle). `strutture.json` mappa le unità del modello agli id FMA e ai gruppi; `VoceIndice.unita` collega un testo all'unità 3D.

### Interfaccia

Le cartelle di `src/` seguono le funzioni dell'interfaccia:

| Cartella | Funzione |
|---|---|
| `soglia/` | Ingresso |
| `tour/` | Guida iniziale (ricordata in `localStorage` `atlante.tour`) |
| `esplora/` | Barra dei comandi |
| `pannello/` | Cartellino e scheda |
| `processi/` | Ciclo cardiaco animato |
| `percorsi/` | Percorso guidato |
| `indice/` | Indice con ricerca |
| `pagine/` | Fonti e Informazioni |

- **Versione solo testo:** senza WebGL 2, `App.tsx` mostra `indice/AtlanteTestuale.tsx`, che usa gli stessi componenti con il contesto `Senza3d` (`src/app/senza3d.ts`).
- **Stili:** tutti in `src/stile/stile.css`, con token su `:root`. La direzione visiva "Istologia" (D16) usa colori come `--eosina`, `--nucleo`, `--vetrino` e `--inchiostro`, con i caratteri Bricolage Grotesque e Atkinson Hyperlegible Next.

### Test

- **Unitari e di componente:** accanto ai file; i test della pipeline sono in `pipeline/*.test.mjs` e lavorano su una copia temporanea di `contenuti/` con stati fissati, per non dipendere dalle approvazioni reali.
- **End-to-end:** `test/e2e/esplora.spec.ts` gira sulla build di produzione con axe-core. L'helper `entra(page, {tour})` supera la soglia.
