# Atlante interattivo del corpo umano — Registro del progetto

## 1. Stato del progetto

- **Fase corrente:** Fase 7 — Implementazione incrementale. M1 Fondazione completata; M2 Design Istologia in attesa di approvazione.
- **Fasi completate:** Fasi 0–6 (tutte il 2026-10-22)
- **In sospeso:** conferma in Blender dei polmoni di Z-Anatomy (l'utente installa Blender)

## 2. Decisioni approvate

| # | Data | Fase | Ambito | Decisione |
|---|---|---|---|---|
| D1 | 2026-10-22 | 0 | Pubblico | A (curiosi, pubblico generale) primario; D (appassionati di scienza) secondario. Modello dati predisposto per un futuro livello "studio" (C, studenti universitari). |
| D2 | 2026-10-22 | 0 | Obiettivo | Esplorazione libera come porta d'ingresso, comprensione dei processi come destinazione; consultazione solo di supporto. |
| D3 | 2026-10-22 | 0 | Visione (ipotesi guida) | Corpo umano 3D ruotabile e zoomabile; strati: solo muscoli, scheletro + organi, solo scheletro; pannello laterale al clic; scheda completa per gli organi; esperienza immersiva. |
| D4 | 2026-10-22 | 0 | Esclusioni | Nessun quiz né funzione di apprendimento attivo. |
| D5 | 2026-10-22 | 0 | Budget | Costo zero: asset a licenza aperta, librerie open source, font liberi, sito statico su hosting gratuito, nessun backend. |
| D6 | 2026-10-22 | 0 | Licenze | Uso potenzialmente commerciale e accesso libero: ammesse solo CC0, CC BY, CC BY-SA o equivalenti; escluse le licenze NonCommercial (NC). |
| D7 | 2026-10-22 | 0 | Perimetro v1 | Corpo completo con i tre strati; strutture principali cliccabili con nome italiano verificato; circa 6 schede organo; 1–2 processi animati; descrizioni mancanti dichiarate come "in preparazione", mai sostituite da testo fittizio. |
| D9 | 2026-10-22 | 1 | Concept | **C leggero:** corpo 3D come spazio unico e continuo; strati per tessuto come controllo principale, apparati come filtro secondario; navigazione per relazioni anatomiche ("Fa parte di", "Collegato a"); pannello al clic, scheda organo aperta nello spazio 3D. Processi nella v1: ciclo cardiaco come animazione nella scheda del cuore; respirazione come percorso guidato con telecamera narrante. |
| D10 | 2026-10-22 | 2 | Direzione artistica | **C · Sala e cartellino** ([tavola di confronto](https://claude.ai/artifact/E63Jd4rXcyoRWPPEZJmau1)): scena 3D scura e profonda (sala, #0e1216); pannelli e schede chiari (cartellino, #f4f3ef; inchiostro #1f2328); accento blu di Prussia #23408e solo per l'interfaccia. Caratteri: Spectral (titoli), Atkinson Hyperlegible (testo), IBM Plex Mono (etichette), tutti OFL. Regole comuni: selezione che rende semitrasparenti le altre strutture; rosso e blu solo per arterie e vene; volo della telecamera di circa 0,7 s; alternativa per movimento ridotto; contrasto WCAG AA; pannello laterale su desktop, sovrapposto su tablet, foglio dal basso su smartphone. |
| D11 | 2026-10-22 | 3 | Architettura e UX | Esperienza a pagina unica con stati indirizzabili: `/`, `/esplora/<struttura>`, `/organo/<organo>`, `/percorsi/respirazione/<passo>`, `/fonti`, `/informazioni`. Soglia d'ingresso al posto della home (caricamento, "Esplora il corpo", "Segui un percorso"). Barra in alto (Percorsi, Indice, Fonti, Informazioni) e barra dei comandi in basso (strati, sagoma della pelle, filtro apparato, vista iniziale, aiuto). Tour iniziale di 4–5 passi. Cartellino con apparato, nome, termine anatomico, testo, riferimenti, "Fa parte di", "Collegato a", "Apri la scheda". Scheda organo a metà schermo con sezioni In breve, Dove si trova, Come è fatto, Cosa fa, Il processo, Collegamenti, Fonti, e glossario sul posto. Percorso "Un respiro" a passi con comandi e libertà di esplorazione; alveoli in un riquadro 2D. Indice come alternativa accessibile, con ricerca e glossario. Pagine Fonti e Informazioni (metodo, avvertenze, crediti e licenze). Comandi da tastiera, annunci per screen reader, movimento ridotto, ripiego senza WebGL. Escluse dalla v1: account, preferiti, trasparenza per strato, sezioni anatomiche, altre lingue, tema alternativo. |
| D12 | 2026-10-22 | 4 | Prototipo | **P1 — Esplora e scheda**: modello reale con tre strati e sagoma della pelle; hover, clic, volo della telecamera, isolamento; cartellino in stile C; apertura e chiusura della scheda del cuore (solo impaginazione, testo di prova dichiarato); tastiera di base e movimento ridotto; misure di prestazione desktop e mobile. Tecnologie: Vite, React, TypeScript, three.js, React Three Fiber, drei, gltf-transform; glTF compresso; animazioni solo CSS; caratteri ospitati localmente. Cartella `atlante-corpo-umano/prototipo/`. Criteri: interattivo in < 5 s, ≥ 50–60 fps su desktop, cartellino in < 100 ms, tre strati funzionanti, scheda che conserva la vista, tastiera e movimento ridotto funzionanti, rapporto delle misure. |
| D13 | 2026-10-22 | 4 | Esito prototipo | Prototipo P1 approvato ([rapporto](RAPPORTO-PROTOTIPO.md)). Indicazioni tecniche emerse: geometria unita per strato con selezione via GPU; dettaglio dei modelli al 10%; 75 fps (massimo dello schermo) sul Mac dell'utente. Restano da verificare: movimento ridotto con impostazione di sistema attiva, prestazioni su smartphone reale, variante 25% separata. |
| D14 | 2026-10-22 | 5 | Architettura tecnica | Approvata integralmente: Vite, React, TypeScript; three.js e React Three Fiber; `camera-controls` al posto di drei; geometria unita per strato e selezione via GPU; modelli al 10% con meshopt; stato con contesto e reducer; animazioni UI in CSS; animazioni didattiche 2D in SVG con Web Animations API (ciclo cardiaco, alveoli); motore 3D caricato in un pacchetto separato; precompilazione degli shader; contenuti in `contenuti/` validati a ogni build e caricati su richiesta (formato in Fase 6); pagine statiche generate in build per schede, Fonti e Informazioni; pipeline riproducibile (download DBCLS, script Blender per i polmoni); test con Vitest, Testing Library, Playwright e axe-core; Biome; pubblicazione su Cloudflare Pages (limiti da verificare); git; struttura delle cartelle come da proposta; il prototipo evolve nell'applicazione. |
| D15 | 2026-10-22 | 5 | Requisito di design | Richiesta dell'utente: migliorare il design rispetto al prototipo, renderlo moderno, con colori e caratteri in linea con l'argomento, evitando interfacce tipiche dell'AI. Comporta una revisione di D10 da proporre e approvare prima dell'implementazione. |
| D16 | 2026-10-22 | 5 | Direzione visiva (sostituisce palette, caratteri e componenti di D10) | **A · Istologia** ([tavola](https://claude.ai/artifact/SXyNxdti76sUAxzmzWXs9b)). Palette da colorazione ematossilina-eosina: sala #16131f, vetrino #f4f1f5, inchiostro #221a33, eosina #b23d62 (selezione e azioni; #ef8fac sulla sala), nucleo #4a3c8c (termini e collegamenti). Caratteri: Bricolage Grotesque (titoli), Atkinson Hyperlegible Next (testo ed etichette in maiuscoletto); niente monospazio. Componenti: barra dei comandi orizzontale in basso al centro, mantenuta dal prototipo su richiesta dell'utente e adattata (segmenti Muscoli · Scheletro e organi · Scheletro, poi Sagoma e Vista iniziale; testo in Atkinson Hyperlegible Next maiuscoletto al posto del monospazio; fondo ematossilina pieno senza sfocatura, bordo sottile, angoli di 3 px; segmento attivo in vetrino con inchiostro; focus in eosina), al posto della stratigrafia verticale proposta; richiamo con linea dalla struttura al cartellino, cartellino ancorato al bordo destro a tutta altezza che si allarga nella scheda. Restano validi da D10: rosso e blu riservati ad arterie e vene, volo della telecamera, movimento ridotto, contrasto WCAG AA, comportamento su tablet e smartphone. |
| D17 | 2026-10-22 | 6 | Contenuti | Approvati: processo in sei passi (affermazioni, fonti, verifica, scrittura, controllo automatico, approvazione dell'utente) con stati bozza → verificato → approvato; modello dati Struttura e Fonte; un file Markdown con intestazione YAML per struttura, bibliografia unica, rimandi `[@id]`; librerie `yaml` e `marked` solo in build; nomi italiani di ossa e muscoli derivati dal termine TA2 e dall'uso corrente, con metodo dichiarato. Contenuti pilota: cuore (cartellino e scheda), femore (cartellino), diaframma (cartellino). |
| D18 | 2026-10-22 | 6 | Contenuti pilota | Approvati cuore, femore e diaframma (stato "approvato") e le scelte sulle incertezze: strati della parete secondo OpenStax e SEER con differenza dichiarata; termini latini da verificare sulla TA2 prima della pubblicazione; diaframma con funzione nell'apparato respiratorio e appartenenza al sistema muscolare; relazioni verso strutture senza contenuto come testo semplice. Fonti: NHLBI, NCI SEER, OpenStax A&P 2e (citata, mai riprodotta). |
| D19 | 2026-10-22 | 7 | Piano di implementazione | Approvate le milestone M1 Fondazione, M2 Design Istologia, M3 Contenuti reali, M4 Polmoni, M5 Ciclo cardiaco, M6 Percorso "Un respiro", M7 Soglia, tour e Indice, M8 Pubblicazione; poi Fase 8. Approvata e avviata M1. |
| D8 | 2026-10-22 | 1 | Modelli 3D | Autorizzato l'uso di BodyParts3D / Z-Anatomy (o equivalenti) purché gratuiti e con licenza aperta verificata e compatibile con D6. |

## 2b. Verifica di fattibilità dei modelli 3D (2026-10-22)

| Risorsa | Licenza verificata | Note |
|---|---|---|
| [BodyParts3D](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html) (DBCLS) | CC BY 4.0 (pagina licenza aggiornata al 2025-02-27). Attribuzione: "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International". | Release 4.0 del 2013; file OBJ (isa_BP3D_4.0_obj_99.zip, 136 MB); nomi inglesi e ID FMA. Il README contiene ancora un link alla vecchia CC BY-SA 2.1 JP: fa fede la pagina di licenza. Copertura di ossa e muscoli da confermare ispezionando i file. |
| [Z-Anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy) | CC BY-SA 4.0 | Template Blender derivato da BodyParts3D; definizioni basate su Wikipedia (escluse come fonte); traduzioni italiane dei nomi presenti (solo come confronto, da verificare); stato di manutenzione incerto. |
| Open 3D Model (anatomytool.org) | CC BY-SA (solo da risultati di ricerca) | Sito non raggiungibile durante la verifica; stato e formato sconosciuti. |

**Ispezione dei file BodyParts3D (albero is_a, release 4.0, scaricato il 2026-10-22):**
- 2.234 mesh OBJ, 462 MB non compressi, circa 6,7 milioni di triangoli (la mesh più pesante è la pelle, ~203.000 triangoli). Serve una riduzione drastica per il web.
- Ossa: 203 elementi. Muscoli: 323 elementi, separati destra/sinistra e spesso per capo.
- Organi presenti: cuore (pareti e cavità di atri e ventricoli, valvole), fegato (lobi e segmenti), encefalo (giri frontali e temporali, lobi occipitali, lobulo parietale superiore, insula, sostanza bianca, cervelletto, mesencefalo), reni, stomaco, intestino tenue e crasso, pancreas, milza, vescica, timo, diaframma, trachea, albero bronchiale, pelle.
- **Lacuna: i polmoni (parenchima) e la pleura non sono presenti nell'albero is_a.** Ci sono solo bronchi e vasi polmonari.
- **Licenza nei file:** l'intestazione di ogni OBJ cita ancora CC BY-SA 2.1 Japan, mentre la pagina di licenza ufficiale indica CC BY 4.0. Approccio prudente proposto: attribuzione e ridistribuzione del modello derivato sotto CC BY-SA (compatibile con D6; non riguarda il codice del sito).
- Ogni struttura ha ID FMA, nome inglese, volume e ingombro in mm.

**Albero part_of di BodyParts3D (scaricato il 2026-10-22):** l'elenco cita polmoni, lobi e segmenti broncopolmonari come concetti, ma l'archivio (1.258 OBJ, 210 MB) non contiene nessuna mesh di polmoni: i polmoni mancano del tutto come geometria in BodyParts3D 4.0.

**Z-Anatomy (verifica 2026-10-22):** progetto attivo (ultimo commit 2026-10-21). Pacchetto Z-Anatomy.zip di 87 MB (template Blender) più TA2.csv (1,5 MB, Terminologia Anatomica 2). Ispezionarlo richiede Blender, non installato su questa macchina.

**Ispezione di Z-Anatomy.zip (scaricato il 2026-10-22):** contiene un unico Startup.blend (307 MB, Blender 3.5, file datato 2023-05-02) con circa 7.400 oggetti nominati in inglese secondo la Terminologia Anatomica. Dall'analisi dei nomi degli oggetti (senza Blender) risultano: lobi superiore e inferiore del polmone sinistro, lobi superiore, medio e inferiore del polmone destro, pleura, segmenti broncopolmonari, scissure. Nessun nome italiano nel pacchetto. **Da confermare in Blender:** che questi oggetti siano mesh e che siano allineati al resto del corpo.

**Possibili fonti per i polmoni, ancora da verificare:** Z-Anatomy (stesso corpo di origine, quindi allineamento automatico, se li contiene); dataset TotalSegmentator (CC BY 4.0 secondo fonti secondarie, da confermare sul record Zenodo ufficiale; soggetto diverso, richiede allineamento).

## 3. Decisioni delegate

| # | Data | Ambito | Decisione | Motivazione |
|---|---|---|---|---|
| G1 | 2026-10-22 | Livelli di contenuto | Pannello (nome italiano, termine anatomico secondario, 2–4 frasi, fonte) per ogni struttura con contenuto; scheda completa solo per gli organi; muscoli e ossa solo pannello nella v1 (modello dati pronto per schede future); glossario contestuale. | Regola semplice e prevedibile per l'utente; volume di contenuti sostenibile. |
| G2 | 2026-10-22 | UX scheda organo | La scheda si apre nello spazio 3D (avvicinamento della telecamera) ma ha un indirizzo proprio: condivisibile, apribile da link, chiudibile con "indietro". | Continuità spaziale e immersività senza perdere condivisibilità e navigazione del browser. |
| G3 | 2026-10-22 | Accessibilità | Navigazione testuale (elenco per apparato e ricerca) sincronizzata con il 3D; animazioni controllabili; rispetto di prefers-reduced-motion. | Il 3D da solo non è accessibile da tastiera o con screen reader. |

## 4. Questioni aperte

| Questione | Fase prevista |
|---|---|
| Mobile: progettazione desktop-first. L'utente valuta di non implementare la versione smartphone se l'esperienza non risulta fluida, supportando solo tablet e schermi più grandi. Decisione dopo una prova su smartphone reale. | Fase 7 |
| Collocazione di processi e animazioni (scheda organo e/o percorsi guidati). | Fase 1 |
| Organi e processi della v1 (proposta: cuore, polmoni, encefalo, fegato, stomaco, reni; ciclo cardiaco e respirazione). | Fase 6 |
| Criterio di selezione delle strutture "principali" cliccabili nella v1. | Fasi 3–6 |
| Revisione dei contenuti: nessuno specialista; dichiarazione esplicita nel sito (da confermare). | Fase 6 |
| Codice sorgente open source: sì o no. | Non urgente |
| Fonte autorevole per i nomi italiani di ossa e muscoli. | Fase 6 |

## 5. Rischi

1. **Modello 3D gratuito:** disponibilità, accuratezza anatomica, licenza effettiva, peso e ottimizzazione. Rischio principale.
2. **Nomi italiani delle strutture:** i modelli scientifici usano nomi inglesi/latini; traduzione e verifica richiedono tempo.
3. **Verifica dei contenuti** senza revisore esperto.
4. **Prestazioni del 3D**, in particolare su mobile e con i limiti dell'hosting gratuito.

## 6. Registro delle modifiche

- **2026-10-22** — Creazione del file. Registrate le decisioni della Fase 0.
- **2026-10-22** — Aggiunta D8 e risultati della verifica documentale sui modelli 3D.
- **2026-10-22** — Aggiunti i risultati dell'ispezione dei file BodyParts3D (lacuna polmoni, nota sulla licenza nei file).
- **2026-10-22** — Albero part_of verificato: niente polmoni. Aggiunti i dati su Z-Anatomy.
- **2026-10-22** — Z-Anatomy ispezionato: lobi polmonari e pleura presenti come oggetti (conferma geometrica in attesa di Blender).
- **2026-10-22** — Registrate D10 (direzione artistica), D11 (architettura e UX), D12 (prototipo P1).
- **2026-10-22** — Prototipo P1 realizzato in `prototipo/`; esito in [RAPPORTO-PROTOTIPO.md](RAPPORTO-PROTOTIPO.md).
- **2026-10-22** — Registrate D13–D17. Contenuti pilota (cuore, femore, diaframma) e bibliografia scritti in `contenuti/`, stato "verificato"; revisione in [REVISIONE-PILOTA.md](REVISIONE-PILOTA.md). StatPearls/NCBI non leggibile in automatico (reCAPTCHA): usate NHLBI, NCI SEER e OpenStax A&P 2e.
- **2026-10-22** — Registrate D18 (contenuti pilota approvati) e D19 (piano delle milestone, avvio M1).
- **2026-10-22** — M1 Fondazione completata. Il codice è passato da `prototipo/` alla struttura definitiva (`src/app`, `src/scena`, `src/esplora`, `src/scheda`, `src/contenuti`, `src/stile`, `pipeline/`). Risultati:
  - drei sostituito da camera-controls;
  - solo la variante di modello 10% (r25 rimossa);
  - Biome, Vitest e 12 test (stato, geometria, classificazione);
  - script `modelli:scarica` e `modelli:prepara`. La preparazione è deterministica: i sei file rigenerati sono identici byte per byte a quelli in `public/modelli/`;
  - attribuzione BodyParts3D in `public/modelli/LICENZE.md`;
  - bundle JS 349 kB gzip, invariato: drei era già escluso dal tree-shaking. La riduzione vera richiede il caricamento differito del motore 3D (D14, da M2/M8);
  - dipendenze di sviluppo aggiunte: jsdom e @testing-library/dom, per i test dei componenti da M2.
