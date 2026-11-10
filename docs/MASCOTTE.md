# Globo, la mascotte dell'atlante

Globo (nome provvisorio) è un globulo rosso che accompagna le video spiegazioni. È un omaggio allo spirito di "Esplorando il corpo umano", ma il disegno è originale: non riprende tratti, nome, abiti od oggetti dei personaggi della serie.

Nei video compare intero. Nel sito compare **solo come logo** (D56, vedi sotto); altri usi (percorsi, stati vuoti) si decideranno più avanti.

## File

Tutti in `contenuti/mascotte/`, fuori da `public/`: non entrano nel sito.

| File | Contenuto |
|---|---|
| `globo.svg` | posa di riferimento (uguale a `espressioni/neutro.svg`) |
| `espressioni/*.svg` | neutro, felice, spiega, sorpreso, pensieroso, preoccupato |
| `bocche/*.svg` | chiusa, media, aperta: per il labiale, da sostituire al livello `bocca` |
| `oggetti/ossigeno.svg` | molecola di O2, oggetto di scena |

Ogni SVG usa lo stesso riquadro (`viewBox="0 0 200 200"`, l'ossigeno `0 0 100 60`) e gli stessi livelli, dal fondo verso l'alto, ognuno in un `<g id="…">`:

`gambe` · `corpo` · `braccio-sx` · `braccio-dx` · `guance` · `occhi` · `pupille` · `sopracciglia` · `bocca`

Le espressioni cambiano solo i livelli del viso e delle braccia, quindi nei video si possono scambiare uno alla volta (per esempio battere le ciglia sostituendo `occhi` e `pupille`, parlare alternando le tre bocche). `braccio-sx` e `braccio-dx` sono a sinistra e a destra di chi guarda.

## Forma e proporzioni

- **Corpo:** ovale verticale, 92 × 116 nel riquadro di 200 (rapporto circa 4 : 5), centro in (100, 110). Sempre intero, mai schiacciato in orizzontale.
- **Niente concavità scura:** il globulo rosso reale è un disco biconcavo, ma l'ombra scura al centro, intorno alla bocca, è stata tolta su scelta dell'utente. Il disegno è stilizzato e non va usato per spiegare la forma vera del globulo rosso: quando serve, i video mostrano uno schema a parte.
- **Viso:** occhi tondi bianchi (raggio 11) con pupilla scura senza riflesso, sopracciglia in **tutte** le pose, guance rosa, bocca a tratto.
- **Arti:** braccia e gambe a tratto scuro di spessore 3 con un bordo chiaro di 1,5 per lato, piedi ovali scuri bordati allo stesso modo. Niente mani disegnate: un punto quando indica.
- **Niente accessori fissi:** niente casco, zainetto o ossigeno addosso. La molecola di O2 entra in scena solo nei video sulla respirazione.

## Colori

Dai token dell'atlante (`src/styles/tokens.css`):

| Parte | Colore | Origine |
|---|---|---|
| Corpo | `#b8434b` | sangue ricco di ossigeno negli schemi del ciclo cardiaco |
| Tratto, pupille, piedi | `#221a33` | `--ink` |
| Bordo degli arti | `#f4f1f5` | `--slide` |
| Bocca | `#3a1420` | bordeaux scuro, legato al corpo |
| Guance, lingua | `#ef8fac` | `--eosin-room` |
| Ossigeno | `#8fd3c3` | `--gas-oxygen` |

Globo usa gli stessi colori sul fondo chiaro (`--slide #f4f1f5`) e su quello scuro (`--room #16131f`). Un colore piatto unico non basterebbe: per vedersi su entrambi i fondi dovrebbe avere la stessa luminosità del corpo rosso e sparirebbe dove le braccia passano davanti alla pancia. Per questo gli arti hanno il bordo chiaro, che sul fondo chiaro quasi non si nota e su quello scuro e sul corpo li stacca.

## Espressioni

| Espressione | Quando |
|---|---|
| Neutro | presentazione, ascolto, pause |
| Felice | fine di un passo o di un video |
| Spiega | indica uno schema o una struttura |
| Sorpreso | un dato che colpisce ("ogni giorno respiri…") |
| Pensieroso | prima di una domanda che il video si pone e poi risolve |
| Preoccupato | quando qualcosa nel corpo non funziona come dovrebbe (senza drammatizzare) |

## Logo (D56)

Il logo è il viso di Globo nel campo di un vetrino: cerchio `--room` (`#16131f`), anello `--eosin-room`, corpo, occhi con pupille e sorriso a tratto. Sorgente unica: `public/favicon.svg`, ripetuto in `src/components/common/Logo.tsx`; le icone PNG e ICO si rigenerano con `npm run icone`.

- Il fondo del vetrino c'è sempre: è quello che lo rende leggibile su ogni sfondo.
- Niente arti, guance, oggetti o altre espressioni: il logo è sempre il viso sorridente.
- A 16 px (solo nel `favicon.ico`) restano campo, corpo e occhi: anello, pupille fini e sorriso si impasterebbero.
- Accanto c'è sempre il nome dell'atlante; il logo è decorativo (`aria-hidden`).

## Tono di voce

Amichevole e chiaro: dà del tu, usa frasi brevi, qualche battuta leggera, ma sui contenuti è rigoroso come il resto dell'atlante.

- Ogni affermazione medica nei video segue le stesse regole dei testi: solo fonti autorevoli, citate.
- Distingue i fatti dalle incertezze e lo dice.
- Non dà consigli medici e non fa diagnosi; quando serve rimanda al medico.
- Non fa quiz né interrogazioni (D4): può porre una domanda solo per rispondere subito.

Frasi d'esempio:

- "Ciao, sono Globo. Oggi seguiamo l'aria fino agli alveoli."
- "Guarda qui: questo è il diaframma. Quando si abbassa, l'aria entra."
- "Fermiamoci un attimo, perché questo passaggio è il più importante."
- "Su questo punto gli studi non sono ancora d'accordo, e preferisco dirtelo."
- "Io ti spiego come funziona il corpo, ma per un dubbio sulla tua salute chiedi al tuo medico."
- "Fatto! Hai visto il cibo passare dallo stomaco all'intestino."

## Da evitare

- Tratti, nomi, abiti e oggetti dei personaggi della serie originale.
- Globo che "cura", prescrive o rassicura su sintomi.
- Sfondi e colori fuori dalla palette dell'atlante.
- Deformare il corpo o cambiarne il colore per esprimere un'emozione: le emozioni passano da occhi, sopracciglia, bocca e braccia.
