# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Atlante interattivo del corpo umano: sito statico (Vite + React 19 + TypeScript + three.js/R3F + camera-controls), a costo zero, con testi scientifici citati. Commenti, testi, commit e risposte all'utente sono in **italiano**. In `src/` i nomi di file, componenti, funzioni e variabili sono in **inglese** (`AtlasPage`, `atlasReducer`, `selection`, `dispatch`…); la pipeline (`pipeline/`, `contenuti/`, moduli `virtual:contenuti/…`, campo `stato`) resta in italiano.

## Comandi

```bash
npm run dev            # sviluppo: include bozze e testi verificati
npm run build          # tsc --noEmit + vite build: in produzione solo contenuti "approvato"
npm test               # Vitest (src/**/*.test.ts[x] e pipeline/**/*.test.mjs)
npx vitest run src/utils/search.test.ts        # un singolo file
npx vitest run -t "nome del test"              # un singolo test
npm run controlla      # Biome (lint + formato); correggere con: npx biome check --write .
npm run test:e2e       # Playwright: costruisce con ATLANTE_BOZZE=1 e serve su :4192 (SwiftShader)
npx playwright test -g "glossario"             # un singolo e2e
```

Su macOS manca `timeout`: lanciare Playwright direttamente. I modelli 3D in `public/modelli/` sono già nel repository; si rigenerano con `modelli:scarica` → `modelli:polmoni` (richiede Blender; avviarlo sempre con `-Y`) → `modelli:donna` (organi femminili dello Human Reference Atlas e vagina schematica, D29) → `modelli:prepara`, che leggono da `dati-sorgente/` (escluso da git).

## Regole di progetto (vincolanti)

- **`docs/DECISIONI.md`** è l'archivio delle decisioni approvate (D1…D30) e del registro delle modifiche. Non serve leggerlo per intero: cercarvi (`grep`) la decisione citata o l'area toccata quando una scelta potrebbe contraddirne una approvata. A fine lavoro si aggiunge una riga al registro (§ 6) per le modifiche di comportamento o di contenuto.
- **Modo di lavoro:** il lavoro a milestone è concluso. Le richieste puntuali si eseguono direttamente; si chiede prima solo per scelte ambigue o che cambiano una decisione approvata.
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
- **Plugin Vite:** `pipeline/plugin-contenuti.mjs` (usato anche da Vitest) espone moduli virtuali. `virtual:contenuti` è un indice leggero con i caricatori; `virtual:contenuti/struttura/<id>`, `/fonti`, `/pagina/<id>`, `/percorso/<id>` e `/glossario` si caricano su richiesta. I tipi sono in `src/models/virtual-content.d.ts` e `src/models/content.ts`; l'accesso passa da `src/utils/content.ts` e dall'hook `useContent`.
- **Stati** `bozza` → `verificato` → `approvato`: in produzione entra solo `approvato`, in `serve` o con `ATLANTE_BOZZE=1` entra tutto. `senzaVociMancanti` trasforma in testo semplice i link a voci del glossario non pubblicate.
- **Glossario:** nei testi si scrive `[[parola mostrata|id-voce]]`, che diventa `<a class="glossary-term" data-term="id">`. `components/features/glossary/RichText.tsx` intercetta il clic e apre `GlossaryDefinition.tsx`.

### Struttura di `src/`

Alias `@/` → `src/` (in `tsconfig.json`, `vite.config.ts` e `vitest.config.ts`).

| Cartella | Contenuto |
|---|---|
| `pages/` | Una "pagina" per stato: `HomePage` (soglia), `AtlasPage`, `IndexPage`, `SourcesPage`, `InfoPage`, `ReadingPage`, `TextOnlyAtlasPage` |
| `components/common/` | UI generica (icone, fonti, avviso bozza, barra di caricamento…) |
| `components/features/<area>/` | `scene`, `panel`, `toolbar`, `tour`, `guided-path`, `cardiac-cycle`, `glossary`, `atlas-index`, `layout` |
| `contexts/` | `AtlasContext` (stato) e `TextOnlyContext` (versione senza 3D) |
| `hooks/` | Tutti gli hook (`useAtlas`, `useContent`, `useReducedMotion`, `useKeyboardShortcuts`…) |
| `models/` | Tipi condivisi |
| `utils/` | Logica pura senza React: reducer, URL, ricerca, scena, tour… (con i test accanto) |
| `styles/` | Un foglio per area, importati in ordine da `index.css`; token in `tokens.css` |

### Stato e indirizzi

`contexts/AtlasContext.tsx` contiene un reducer unico (`utils/atlasReducer.ts`; dalla UI `useAtlas()` → `{state, dispatch}`), sincronizzato con l'URL tramite `readUrl` e `writeUrl` in `utils/url.ts` (D11). Rotte principali:

- `/` (soglia d'ingresso; Indietro dall'atlante vi riporta);
- `/esplora` (atlante senza selezione: "Esplora il corpo", chiusura del cartellino o del percorso);
- `/esplora/<unità>` o `/organo/<id>`;
- `/percorsi/<id>/<passo>` (passo contato da 1);
- `/indice`, `/fonti`, `/informazioni` (`PAGE_IDS` in `utils/pages.ts`).

L'app è a pagina unica: le "pagine" sono stati, non router.

### Scena 3D

`components/features/scene/` è il motore 3D (three.js, R3F, camera-controls). `AtlasPage` lo carica con `lazy()` in un pacchetto separato: l'interfaccia deve restare leggera e non deve importarlo.

- **Accesso dalla UI:** `utils/sceneApi.ts` (`sceneApi`, `resetView`, `INITIAL_TARGET`/`INITIAL_POSITION`) dà accesso alla telecamera senza React.
- **Inquadrature:** `CameraDirector` in `Scene.tsx` gestisce telecamera e offset focale per selezione, percorso e soglia; `CalloutTracker` aggiorna la linea di richiamo verso il cartellino.
- **Modelli:** un `.glb` per strato (ossa, muscoli, organi, pelle) più `organi-donna.glb`. `strutture.json` mappa le unità del modello agli id FMA e ai gruppi, e con `corpo` segna gli organi di un solo corpo; la logica sta in `utils/sceneModel.ts` e `utils/sceneMaterials.ts`.
- **Corpo Uomo/Donna (D29):** `state.body`; `unitStates` nasconde gli organi dell'altro corpo e `bodyFor` (in `atlasReducer.ts`) passa al corpo giusto quando si sceglie un organo di un solo corpo.

### Interfaccia

- **Versione solo testo:** senza WebGL 2 (`utils/webgl.ts`), `App.tsx` mostra `TextOnlyAtlasPage`, che usa gli stessi componenti con `TextOnlyContext` (D26).
- **Tour:** ricordato in `localStorage` (`atlante.tour`, `utils/tour.ts`).
- **Stili:** token su `:root` in `styles/tokens.css`. La direzione visiva "Istologia" (D16) usa colori come `--eosin`, `--nucleus`, `--slide`, `--room` e `--ink`, con i caratteri Bricolage Grotesque e Atkinson Hyperlegible Next.

### Test

- **Unitari e di componente:** accanto ai file (`utils/*.test.ts`, `components/features/*/*.test.tsx`); i test della pipeline sono in `pipeline/*.test.mjs` e lavorano su una copia temporanea di `contenuti/` con stati fissati, per non dipendere dalle approvazioni reali.
- **End-to-end:** `test/e2e/atlas.spec.ts` gira sulla build di produzione con axe-core.
