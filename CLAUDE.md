# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Atlante interattivo del corpo umano: sito statico (Vite + React 19 + TypeScript + three.js/R3F + camera-controls), a costo zero, con testi scientifici citati. Commenti, testi, commit e risposte all'utente sono in **italiano**. In `src/` i nomi di file, componenti, funzioni e variabili sono in **inglese** (`AtlasPage`, `atlasReducer`, `selection`, `dispatch`…); la pipeline (`pipeline/`, `contenuti/`, moduli `virtual:contenuti/…`, campo `stato`) resta in italiano.

## Comandi

```bash
npm run dev            # sviluppo: include bozze e testi verificati
npm run build          # tsc --noEmit + vite build: in produzione solo contenuti "approvato"
npm test               # Vitest: test/unit/ e test/pipeline/
npm run test:tutti     # tutti i test: Vitest e poi Playwright
npx vitest run test/unit/utils/search.test.ts  # un singolo file
npx vitest run -t "nome del test"              # un singolo test
npm run controlla      # Biome (lint + formato); correggere con: npx biome check --write .
npm run test:e2e       # Playwright: costruisce con ATLANTE_BOZZE=1 e serve su :4192 (SwiftShader)
npx playwright test -g "glossario"             # un singolo e2e
```

Su macOS manca `timeout`: lanciare Playwright direttamente. I modelli 3D in `public/modelli/` sono già nel repository; si rigenerano con `modelli:scarica` → `modelli:polmoni`, `modelli:tiroide`, `modelli:parotidi`, `modelli:naso`, `modelli:vasi` e `modelli:nervi` (da Z-Anatomy; richiedono Blender, avviato sempre con `-Y`) → `modelli:donna` (organi femminili dello Human Reference Atlas e vagina schematica, D29) → `modelli:prepara`, che leggono da `dati-sorgente/` (escluso da git).

## Regole di progetto (vincolanti)

- **`docs/DECISIONI.md`** è l'archivio delle decisioni approvate (D1…D53) e del registro delle modifiche. Non serve leggerlo per intero: cercarvi (`grep`) la decisione citata o l'area toccata quando una scelta potrebbe contraddirne una approvata. A fine lavoro si aggiunge una riga al registro (§ 6) per le modifiche di comportamento o di contenuto.
- **Modo di lavoro:** il lavoro a milestone è concluso. Le richieste puntuali si eseguono direttamente; si chiede prima solo per scelte ambigue o che cambiano una decisione approvata.
- **Contenuti medici:** niente informazioni inventate. Solo fonti autorevoli (OpenStax A&P 2e, NHLBI, FIPAT TA2; StatPearls per muscoli, vasi e nervi che OpenStax non descrive, D37, D45 e D46), verificate leggendole; ogni paragrafo ha una citazione; distinguere fatti e incertezze, dichiarare i limiti; non affermare mai una revisione medica. Un testo passa a `approvato` solo con l'approvazione dell'utente.
- **Licenze (D6):** niente licenze NC. Dal pacchetto Z-Anatomy non si estraggono i modelli NC (orecchio interno CC BY-NC-SA, rene CC BY-NC).
- Ogni download richiede il permesso dell'utente (nome del file, fonte, dimensione).
- **Git:** remote `origin` su GitHub (`stefano-satta/atlante-corpo-umano`); si fa push solo su richiesta dell'utente. I commit terminano con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Architettura

### Contenuti → moduli virtuali

`contenuti/` contiene i testi: `strutture/*.md`, `processi/`, `percorsi/` e `pagine/` (Markdown con intestazione YAML), insieme a `fonti.yaml`, `riferimenti.yaml` e `glossario.yaml`. `quiz/<apparato>.yaml` contiene le domande del quiz (D53): la prima risposta è quella giusta, e ogni domanda ha una struttura da evidenziare e una spiegazione con citazione.

- **Compilazione:** in build, `pipeline/contenuti.mjs` coordina la lettura, il controllo e la compilazione in HTML (con `marked` e `yaml`, che non arrivano mai nel sito). In `pipeline/contenuti/` stanno i valori ammessi (`regole.mjs`), gli strumenti per i testi (`testo.mjs`) e un modulo per tipo di contenuto. La build si ferma su:
  - citazioni `[@id-fonte]` senza fonte e paragrafi senza citazione;
  - relazioni verso strutture sconosciute;
  - elementi 3D assenti da `public/modelli/strutture.json`;
  - voci del glossario sconosciute.
- **Plugin Vite:** `pipeline/plugin-contenuti.mjs` (usato anche da Vitest) espone moduli virtuali. `virtual:contenuti` è un indice leggero con i caricatori; `virtual:contenuti/struttura/<id>`, `/fonti`, `/pagina/<id>`, `/percorso/<id>`, `/glossario` e `/quiz/<apparato>` si caricano su richiesta. `virtual:contenuti/modello` dice quali unità sono vasi e quali stanno in un solo corpo, prima che la scena sia scaricata (`utils/modelIndex.ts`): non si deduce dalla forma degli id. I tipi sono in `src/models/virtual-content.d.ts` e `src/models/content.ts`; l'accesso passa da `src/utils/content.ts` e dall'hook `useContent`.
- **Stati** `bozza` → `verificato` → `approvato`: in produzione entra solo `approvato`, in `serve` o con `ATLANTE_BOZZE=1` entra tutto. `senzaVociMancanti` trasforma in testo semplice i link a voci del glossario non pubblicate.
- **Glossario:** nei testi si scrive `[[parola mostrata|id-voce]]`, che diventa `<a class="glossary-term" data-term="id">`. `components/features/glossary/RichText.tsx` intercetta il clic e apre `GlossaryDefinition.tsx`; "Tutto il glossario" porta a `/glossario#glossario-<voce>` (`utils/glossaryRequest.ts`).

### Struttura di `src/`

Alias `@/` → `src/` (in `tsconfig.json`, `vite.config.ts` e `vitest.config.ts`).

| Cartella | Contenuto |
|---|---|
| `pages/` | Una "pagina" per stato: `HomePage` (soglia), `AtlasPage`, `IndexPage`, `GlossaryPage`, `SourcesPage`, `InfoPage`, `ReadingPage`, `TextOnlyAtlasPage` |
| `components/common/` | UI generica (icone, fonti, avviso bozza, barra di caricamento…) |
| `components/features/<area>/` | `scene`, `panel`, `toolbar`, `tour`, `guided-path`, `quiz`, `cardiac-cycle`, `glossary`, `atlas-index`, `layout` |
| `contexts/` | `AtlasContext` (stato) e `TextOnlyContext` (versione senza 3D) |
| `hooks/` | Tutti gli hook (`useAtlas`, `useContent`, `useReducedMotion`, `useKeyboardShortcuts`…) |
| `models/` | Tipi condivisi |
| `utils/` | Logica pura senza React: reducer, URL, ricerca, scena, tour… |
| `styles/` | Un foglio per area, importati in ordine da `index.css`; token in `tokens.css` |

### Stato e indirizzi

`contexts/AtlasContext.tsx` espone `useAtlas()` → `{state, dispatch}` (React Router, modalità dichiarativa con `BrowserRouter` in `main.tsx`; D11, D47). L'indirizzo è l'unica fonte della parte navigabile:
- **Lettura:** strato, struttura, scheda, pagina, percorso, soglia e tema del quiz si leggono dall'indirizzo (`readUrl` in `utils/url.ts`). Quello che l'indirizzo non dice sta nella voce di cronologia (`location.state`, `utils/atlasHistory.ts`): lo strato di percorsi e quiz completo, il percorso attivo dietro una struttura, l'atlante sotto una pagina. Una voce senza questi dati (collegamento, `?q=`, indirizzo diretto) tiene la vista di prima.
- **Scrittura:** `dispatch` applica le regole di `utils/atlasReducer.ts` e porta il router al nuovo indirizzo (`urlFor`, `urlChange`) in un solo `useLayoutEffect`, con una sola navigazione per gestore. Corpo, pelle, battito, guida e domanda del quiz sono stato effimero.
- **Riscrittura:** un effetto riscrive senza voce di cronologia gli indirizzi non canonici (di prima, sconosciuti).

Le rotte sono dichiarate in `App.tsx`:

- `/` (soglia d'ingresso; Indietro dall'atlante vi riporta);
- `/esplora/<apparato>` (atlante senza selezione: "Esplora il corpo", chiusura del cartellino o del percorso); l'apparato è lo strato della barra (`LAYER_SLUGS`: `organi`, `scheletro`, `muscoli`, `cardiocircolatorio`, `nervoso`, `digerente`, `respiratorio`, `urinario`, `riproduttivo`, D47, D48, D49 e D51);
- `/esplora/<apparato>/<unità>` (cartellino) e `/esplora/<apparato>/<unità>/scheda` (scheda); gli indirizzi di prima `/esplora`, `/esplora/<unità>` e `/organo/<id>` si riscrivono senza voce di cronologia, come il cambio del solo apparato;
- `/percorsi/<id>/<passo>` (passo contato da 1);
- `/quiz`, `/quiz/<apparato>` e `/quiz/completa` (D53): quiz nel pannello, con `state.quiz` (tema e struttura della domanda, evidenziata come un passo di percorso); nell'indirizzo c'è solo il tema;
- `/indice`, `/glossario`, `/fonti`, `/informazioni`, `/come-circola-il-sangue` (`PAGE_PATHS` in `utils/pages.ts`; `/circolazione` è l'indirizzo di prima e si riscrive); Indice e Glossario tengono la ricerca in `?q=` (`useSearchQuery`), che `searchFor` toglie passando ad altri indirizzi.

Tutte le rotte stanno sotto una rotta di layout (`AtlasPage` o `TextOnlyAtlasPage`) che resta montata. Le rotte con il corpo 3D (soglia, esplorazione, percorsi a passi, quiz) non hanno un elemento: si leggono nello stato e le mostra l'atlante (`AtlasView`), montato alla prima visita e poi tenuto nascosto sotto le pagine, così la scena non si ricarica. Le pagine di lettura sono pagine a sé (D54): rotte sorelle sotto il guscio `components/features/layout/ReadingShell.tsx` (barra, contenuto, crediti), senza l'atlante sotto. Atlante e pagina seguono la rotta (`readUrl(location)`), non lo stato. Nei test di componente `AtlasProvider` va dentro un router (`MemoryRouter`, o `BrowserRouter` se il test controlla `location`).

### Scena 3D

`components/features/scene/` è il motore 3D (three.js, R3F, camera-controls). `AtlasPage` lo carica con `lazy()` in un pacchetto separato e lo monta la prima volta che l'atlante si vede (aprendo direttamente una pagina di lettura non si scaricano né three.js né i modelli): l'interfaccia deve restare leggera e non deve importarlo. Solo la scena usa gli hook `useBodyModel`, `useUnitVisibility`, `useUnitPicking` e `useHeartbeatAnimation`, che importano three.js: non vanno usati dall'interfaccia.

- **Accesso dalla UI:** `utils/sceneApi.ts` (`sceneApi`, `resetView`, `INITIAL_TARGET`/`INITIAL_POSITION`) dà accesso alla telecamera senza React.
- **Inquadrature:** `CameraDirector` in `Scene.tsx` gestisce telecamera e offset focale per selezione, percorso e soglia; `CalloutTracker` aggiorna la linea di richiamo verso il cartellino.
- **Modelli:** un `.glb` per strato. All'avvio si scaricano `ossa.glb`, `organi.glb`, `pelle.glb` e `organi-donna.glb` (le ossa servono in trasparenza a quasi ogni apparato). `muscoli.glb` (D55), `vasi.glb` (D44) e `nervi.glb` (D46) si scaricano solo quando lo strato, la selezione o una struttura evidenziata ne mostrano un'unità (`needsModelLayer`, `lazyLayerOf`, i passaggi di `useUnitVisibility`), ciascuno dentro un proprio `Suspense` (`LazyLayer`). `strutture.json` mappa le unità del modello agli id FMA e ai gruppi, e con `corpo` segna gli organi di un solo corpo; la logica sta in `utils/sceneModel.ts` e `utils/sceneMaterials.ts`.
- **Corpo Uomo/Donna (D29):** `state.body`; `unitStates` nasconde gli organi dell'altro corpo e `bodyFor` (in `atlasReducer.ts`) passa al corpo giusto quando si sceglie un organo di un solo corpo.

### Interfaccia

- **Pulsanti:** sempre `Button` da `components/common/Button.tsx` (mai `<button>`): `type="button"` predefinito, `variant` (`action`, `back`, `close`, `nav`, `cycle`, `text`) dà la classe di stile, il resto passa al `<button>`.
- **Schemi delle schede:** `components/features/panel/schemaRegistry.tsx` associa ogni schema di processo e ogni figura al suo disegno e al suo apparato. Un nuovo schema si aggiunge lì e in `pipeline/contenuti/regole.mjs`: il tipo e un test controllano che i due elenchi coincidano.
- **Versione solo testo:** senza WebGL 2 (`utils/webgl.ts`), `App.tsx` mostra `TextOnlyAtlasPage`, che usa gli stessi componenti con `TextOnlyContext` (D26).
- **Percorsi su smartphone:** sotto i 760 px lo schema del passo sta sul "palco" in alto (interruttore Schema/Corpo 3D) e testo e comandi in un foglio con maniglia; mentre lo schema copre il corpo la scena si ferma (`utils/sceneCover.ts`, `useCoverScene`).
- **Tour:** ricordato in `localStorage` (`atlante.tour`, `utils/tour.ts`).
- **Quiz (D53):** `components/features/quiz/QuizPanel.tsx`, caricato con `lazy()`; logica pura in `utils/quiz.ts`, miglior risultato in `localStorage` (`atlante.quiz`, `utils/quizScore.ts`). Durante il quiz le strutture non si selezionano.
- **Viaggio del cibo:** un file per schema in `components/features/guided-path/digestion/` (registro in `diagrams.ts`), stili in `styles/digestion/`, con le regole comuni in `common.css`.
- **Stili:** token su `:root` in `styles/tokens.css`. La direzione visiva "Istologia" (D16) usa colori come `--eosin`, `--nucleus`, `--slide`, `--room` e `--ink`, con i caratteri Bricolage Grotesque e Atkinson Hyperlegible Next.

### Test

Tutti i test stanno in `test/`, mai accanto ai file. `test/dom-setup.ts` prepara jsdom e va importato dai test di componente.

- **Unitari e di componente:** in `test/unit/`, che ricalca le cartelle di `src/` (`test/unit/utils/url.test.ts` prova `src/utils/url.ts`) e importa da `@/…`.
- **Pipeline:** in `test/pipeline/*.test.mjs`; lavorano su una copia temporanea di `contenuti/` con stati fissati, per non dipendere dalle approvazioni reali.
- **End-to-end:** `test/e2e/atlas.spec.ts` gira sulla build di produzione con axe-core.
