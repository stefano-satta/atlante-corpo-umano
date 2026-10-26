# Atlante interattivo del corpo umano — Registro del progetto

## 1. Stato del progetto

- **Fase corrente:** Fase 7 — Implementazione incrementale. M1, M2 e M3 completate e approvate; M5 Ciclo cardiaco completata e approvata; M4 Polmoni completata e approvata. M6 Percorso "Un respiro" completata e approvata. M7 Soglia, tour e Indice completata e approvata. Resta M8 Pubblicazione.
- **Fasi completate:** Fasi 0–6 (tutte il 2026-10-22)
- **In sospeso:** piano della M8 Pubblicazione

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
| D19 | 2026-10-22 | 7 | Piano di implementazione | Approvate le milestone M1 Fondazione, M2 Design Istologia, M3 Contenuti reali, M4 Polmoni, M5 Ciclo cardiaco, M6 Percorso "Un respiro", M7 Soglia, tour e Indice, M8 Pubblicazione; poi Fase 8. Approvata e avviata M1. M2 approvata il 2026-10-22; M3 il 2026-10-24. |
| D20 | 2026-10-24 | 7 | Contenuti | Approvati la correzione del termine latino del femore in "os femoris" (TA2 1360) e il testo della pagina Informazioni, inclusa la dichiarazione che i testi non sono stati rivisti da un medico o da un anatomista. Femore e Informazioni passano allo stato "approvato". |
| D21 | 2026-10-24 | 7 | M5 Ciclo cardiaco | Approvato il piano con l'opzione A: schema 2D in sezione frontale disegnato per l'atlante (SVG con transizioni CSS), 5 passi, riproduzione che parte ferma, passo per passo con il movimento ridotto, nessun valore numerico, nessun suono, schema dichiarato come semplificato e non in scala. |
| D22 | 2026-10-24 | 7 | Contenuti | Didascalie del ciclo cardiaco approvate a condizione che provengano da fonti ufficiali verificate. Ogni frase nuova è stata ricontrollata sul testo di OpenStax 19.3; tolta l'unica frase senza riscontro esplicito ("Poi il ciclo ricomincia"). Processo in stato "approvato" e incluso nella build di produzione. |
| D23 | 2026-10-24 | 7 | M4 Polmoni | Approvati forma e posizione dei polmoni di Z-Anatomy allineati a BodyParts3D, il testo dei polmoni (cartellino e scheda; fonti NHLBI e OpenStax 22.2; termine *pulmones*, TA2 3265) e la nuova versione della pagina Informazioni (origine dei polmoni e crediti di Z-Anatomy). Polmoni e Informazioni passano allo stato "approvato" e tornano nella build di produzione. |
| D24 | 2026-10-24 | 7 | M6 Percorso "Un respiro" | Approvato il piano con le scelte A1–F1: corpo 3D fermo con telecamera che inquadra ed evidenzia, movimento in uno schema 2D del torace e dell'alveolo (A1); percorso nel pannello a destra, foglio in basso su smartphone (B1); esplorazione libera con "Torna al percorso" dopo la selezione di una struttura (C1); ogni passo sceglie lo strato e può aggiungere singole strutture di un altro strato (D1); indirizzi `/percorsi/respirazione/1`…`6` e voce Percorsi attiva che apre il passo 1 (E1); con il movimento ridotto niente volo della telecamera, schema fermo e niente Riproduci (F1). Sei passi: Un respiro, Le vie dell'aria, I bronchi, Inspirazione, Negli alveoli, Espirazione. |
| D25 | 2026-10-24 | 7 | Contenuti | Approvato il testo del percorso "Un respiro" (6 passi; fonti OpenStax 22.1, 22.3, 22.4 e NHLBI). Il percorso passa allo stato "approvato" ed entra nella build di produzione. M6 completata. |
| D26 | 2026-10-24 | 7 | M7 Soglia, tour e Indice | Approvato il piano con le scelte A1, B1, C1, D1, E1: soglia d'ingresso sopra l'atlante su `/`, con "Esplora il corpo", "Segui un percorso", Indice, Informazioni e l'avvertenza già approvata, mentre il modello si carica dietro (A1); tour di 4 passi sugli elementi veri, automatico alla prima visita dopo "Esplora il corpo", con "Salta", ricordato nel browser e riaperto dal nuovo pulsante Aiuto (B1); Indice `/indice` con ricerca, strutture con testo, percorsi, processi e organi del modello per apparato; ossa e muscoli senza testo esclusi, con nota (C1); glossario in `contenuti/glossario.yaml` con fonti e stati, sezione dell'Indice e definizioni sul posto con il segno `[[testo\|termine]]`, testo da approvare a parte (D1); senza WebGL 2 si apre l'Indice con lettura dei testi, del ciclo cardiaco e del percorso (E1). |
| D27 | 2026-10-24 | 7 | Contenuti | Approvato il testo delle 25 voci del glossario (`contenuti/glossario.yaml`), portate in stato "approvato" e incluse nella build di produzione: i termini segnati nei testi aprono la definizione sul posto. M7 completata. |
| D28 | 2026-10-24 | 7 | Contenuti | Approvati i testi delle sette schede dell'apparato genitale maschile (testicoli, epididimi, dotti deferenti, vescichette seminali, prostata, pene, uretra; fonti OpenStax 27.1 e SEER; termini latini verificati sulla TA2), portate in stato "approvato" e incluse nella build di produzione. |
| D29 | 2026-10-24 | 7 | Modello 3D | Selettore Uomo/Donna. Il corpo resta quello di BodyParts3D (maschile); il corpo femminile nasconde gli organi genitali maschili e l'uretra maschile e aggiunge utero, tube uterine, ovaie e mammelle dello Human Reference Atlas (CC BY 4.0, allineati alla pelvi e allo sterno di BodyParts3D) e una vagina come **ricostruzione schematica** dichiarata, perché l'HRA non la contiene. Vulva e uretra femminile mancano e sono dichiarate nei limiti; nel corpo femminile la sagoma della pelle, maschile, non si mostra. Prima eccezione alla regola che ogni forma venga da dati anatomici. |
| D30 | 2026-10-25 | 7 | Contenuti | Approvati i testi delle cinque schede del corpo femminile (utero, tube uterine, ovaie, vagina, mammelle; fonti OpenStax 27.2 e SEER; termini latini verificati sulla TA2), portate in stato "approvato" e incluse nella build di produzione. |
| D31 | 2026-10-25 | 7 | Contenuti | Approvati i testi dei due schemi animati degli apparati genitali ("Il percorso degli spermatozoi" e "Dall'ovulazione alle mestruazioni"), che riprendono fatti e fonti delle schede approvate; portati in stato "approvato" e inclusi nella build di produzione. |
| D32 | 2026-10-25 | 7 | Contenuti | Approvati dall'utente tutti i testi ancora in stato "bozza" o "verificato": 69 contenuti (schede e cartellini di organi e ossa, tra cui reni, vescica, uretra, prostata, pene e vagina, e lo schema "Dal sangue all'urina") e le 23 nuove voci del glossario sui genitali esterni e sull'uretra; portati in stato "approvato" e inclusi nella build di produzione. |
| D33 | 2026-10-26 | 7 | Contenuti | Approvati dall'utente i testi del sistema endocrino: schede di tiroide, paratiroidi, ipotalamo e ipofisi, lo schema animato "Come lavora la tiroide, passo per passo" e la nuova versione della pagina Informazioni (crediti di Z-Anatomy per tiroide e paratiroidi); portati in stato "approvato" e inclusi nella build di produzione. |
| D34 | 2026-10-26 | 7 | Contenuti | Approvati dall'utente i testi dell'apparato visivo: schede di occhi, nervo e tratto ottico e apparato lacrimale, lo schema animato "Come funziona la vista, passo per passo" e le 13 voci del glossario per le parti dell'occhio e il chiasma ottico (fonti NEI e OpenStax 14.1 e 14.2; termini latini verificati sulla TA2); portati in stato "approvato" e inclusi nella build di produzione. |
| D8 | 2026-10-22 | 1 | Modelli 3D | Autorizzato l'uso di BodyParts3D / Z-Anatomy (o equivalenti) purché gratuiti e con licenza aperta verificata e compatibile con D6. |

## 2b. Verifica di fattibilità dei modelli 3D (2026-10-22)

| Risorsa | Licenza verificata | Note |
|---|---|---|
| [BodyParts3D](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html) (DBCLS) | CC BY 4.0 (pagina licenza aggiornata al 2025-02-27). Attribuzione: "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International". | Release 4.0 del 2013; file OBJ (isa_BP3D_4.0_obj_99.zip, 136 MB); nomi inglesi e ID FMA. Il README contiene ancora un link alla vecchia CC BY-SA 2.1 JP: fa fede la pagina di licenza. Copertura di ossa e muscoli da confermare ispezionando i file. |
| [Z-Anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy) | CC BY-SA 4.0 | Template Blender derivato da BodyParts3D; definizioni basate su Wikipedia (escluse come fonte); traduzioni italiane dei nomi presenti (solo come confronto, da verificare); stato di manutenzione incerto. |
| Open 3D Model (anatomytool.org) | CC BY-SA (solo da risultati di ricerca) | Sito non raggiungibile durante la verifica; stato e formato sconosciuti. |

**Ispezione dei file BodyParts3D (albero is_a, release 4.0, scaricato il 2026-10-22):**
- 2.234 mesh OBJ, 462 MB non compressi, circa 6,7 milioni di triangoli (la mesh più pesante è la pelle, ~203.000 triangoli). Serve una riduzione drastica per il web.
- Ossa: 203 elementi. Muscoli: 323 elementi, separati destra/sinistra e spesso per capo. Altri 84 elementi muscolari sono descritti solo come capi o parti (concetti "head of muscle organ", "zone of muscle organ" e, per due parti del trapezio, "organ zone"), recuperati il 2026-10-26.
- Organi presenti: cuore (pareti e cavità di atri e ventricoli, valvole), fegato (lobi e segmenti), encefalo (giri frontali e temporali, lobi occipitali, lobulo parietale superiore, insula, sostanza bianca, cervelletto, mesencefalo), reni, stomaco, intestino tenue e crasso, pancreas, milza, vescica, timo, diaframma, trachea, albero bronchiale, pelle.
- **Lacuna: i polmoni (parenchima) e la pleura non sono presenti nell'albero is_a.** Ci sono solo bronchi e vasi polmonari.
- **Licenza nei file:** l'intestazione di ogni OBJ cita ancora CC BY-SA 2.1 Japan, mentre la pagina di licenza ufficiale indica CC BY 4.0. Approccio prudente proposto: attribuzione e ridistribuzione del modello derivato sotto CC BY-SA (compatibile con D6; non riguarda il codice del sito).
- Ogni struttura ha ID FMA, nome inglese, volume e ingombro in mm.

**Albero part_of di BodyParts3D (scaricato il 2026-10-22):** l'elenco cita polmoni, lobi e segmenti broncopolmonari come concetti, ma l'archivio (1.258 OBJ, 210 MB) non contiene nessuna mesh di polmoni: i polmoni mancano del tutto come geometria in BodyParts3D 4.0.

**Z-Anatomy (verifica 2026-10-22):** progetto attivo (ultimo commit 2026-10-21). Pacchetto Z-Anatomy.zip di 87 MB (template Blender) più TA2.csv (1,5 MB, Terminologia Anatomica 2). Ispezionarlo richiede Blender, non installato su questa macchina.

**Ispezione di Z-Anatomy.zip (scaricato il 2026-10-22):** contiene un unico Startup.blend (307 MB, Blender 3.5, file datato 2023-05-02) con circa 7.400 oggetti nominati in inglese secondo la Terminologia Anatomica. Dall'analisi dei nomi degli oggetti (senza Blender) risultano: lobi superiore e inferiore del polmone sinistro, lobi superiore, medio e inferiore del polmone destro, pleura, segmenti broncopolmonari, scissure. Nessun nome italiano nel pacchetto. **Da confermare in Blender:** che questi oggetti siano mesh e che siano allineati al resto del corpo.

**Ispezione in Blender dei polmoni di Z-Anatomy (2026-10-24, Blender 5.2.3 LTS, script `pipeline/esporta-polmoni.py`, script interni del file disattivati):**

*Il file*
- Z-Anatomy.zip riscaricato dal repository ufficiale (86,7 MB); impronta git verificata uguale a quella pubblicata (f43cabc…).
- I cinque lobi sono mesh vere, ciascuna con un modificatore di suddivisione e 7.400–9.300 triangoli dopo la suddivisione: lobi superiore, medio e inferiore del polmone destro; superiore e inferiore del sinistro.
- Le superfici morbide e poco dense fanno pensare a forme modellate a mano dal progetto Z-Anatomy (Gauthier Kervyn), non a dati misurati. È una deduzione: il file non lo dice.

*Licenza*
- I polmoni non compaiono tra i modelli di terzi che Z-Anatomy dichiara di aver incluso. Quindi ricadono nella licenza del progetto, CC BY-SA 4.0.
- Due modelli inclusi hanno licenza NonCommercial: l'orecchio interno (CC BY-NC-SA) e un rene (CC BY-NC). **Non vanno mai estratti** (D6).

*Allineamento*
- Z-Anatomy usa lo stesso corpo di BodyParts3D, con la stessa convenzione destra/sinistra. È però spostato di circa 10 cm in verticale e circa 7 cm in profondità, e ingrandito di circa il 4%. Inoltre molte strutture sono rese simmetriche con una copia specchiata.
- La trasformazione unica è stata stimata su sette strutture di riferimento: trachea, corpo dello sterno, quinte coste destra e sinistra, clavicola e scapola destre, diaframma.
  - Valori: scala 0,960, rotazione 0,8°, traslazione (−11,8; −102,1; −17,2) mm.
  - Scarto residuo medio: 2,4–3,7 mm per struttura.

*Controlli sui polmoni allineati, rispetto a BodyParts3D*

| Struttura | Esito |
|---|---|
| Alberi bronchiali segmentali | Il 92,5% dei punti è dentro i polmoni |
| Coste | Lo 0,9% dei punti è dentro, per al massimo 2 mm |
| Pareti del cuore | Il 15% dei punti è dentro, per al massimo 8 mm (mediana 1 mm) |
| Fegato | La cupola entra nella base del polmone destro (mediana 18 mm, massimo 89 mm) |

La compenetrazione con il fegato resta nascosta: dall'esterno si vede una linea di contatto pulita. Diventerebbe visibile solo con i polmoni trasparenti.

*Immagini di controllo:* `dati-sorgente/z-anatomy/controllo/`, fuori da git.

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
- **2026-10-22** — M2 Design Istologia completata. Risultati:
  - palette ematossilina-eosina e caratteri Bricolage Grotesque e Atkinson Hyperlegible Next (variabili, ospitati localmente); Spectral, IBM Plex Mono e Atkinson Hyperlegible tolti;
  - barra in basso adattata come da D16, centrata nello spazio libero della scena; interruttore Sagoma con indicatore pieno/vuoto;
  - pannello unico ancorato a destra a tutta altezza (`src/pannello/`): cartellino che si allarga nella scheda; fuoco gestito in apertura e chiusura;
  - linea di richiamo dalla struttura al titolo del pannello, aggiornata a ogni fotogramma e tracciata all'apertura; nascosta su schermo stretto e con movimento ridotto non animata;
  - velo sfumato in alto per la leggibilità di titolo, menu e crediti;
  - motore 3D in un pacchetto separato (D14): interfaccia 74,5 kB gzip invece di 349; il motore (277 kB) si carica in parallelo;
  - test: 23 unitari e di componente (Vitest, Testing Library), 5 end-to-end (Playwright, Chromium con SwiftShader) con controllo axe-core WCAG 2.1 AA senza violazioni.
- **2026-10-22** — Decisioni minori della M2: niente numero davanti all'apparato nel cartellino (il mockup lo mostrava, ma non porta informazione); icone disegnate in SVG invece dei caratteri × e →; il bordo del pannello resta di 3 px in eosina come nella tavola approvata; l'avviso "Prototipo" in alto è sostituito da "Versione in sviluppo: nomi e testi sono in preparazione" sotto il titolo.
- **2026-10-24** — M3 Contenuti reali completata. Risultati:
  - plugin di build (`pipeline/plugin-contenuti.mjs`, `pipeline/contenuti.mjs`) che legge i file Markdown con `yaml` e `marked` e li controlla. La build si ferma se trova: una fonte citata ma inesistente; un paragrafo o una voce di elenco senza fonte; HTML grezzo; una sezione non prevista o fuori ordine; una relazione verso una struttura sconosciuta; un elemento 3D assente nel modello; un numero TA2 mancante; un campo obbligatorio mancante o scritto male;
  - in produzione entrano solo i contenuti "approvato"; in sviluppo, e con `ATLANTE_BOZZE=1`, anche quelli in bozza, segnalati nell'interfaccia;
  - ogni struttura è un pacchetto caricato su richiesta (cuore 2,6 kB gzip, diaframma 1,4 kB);
  - cartellino con testo "In breve", rimandi numerati, Fa parte di e Collegato a con la fonte, note sulle fonti, elenco delle fonti; scheda del cuore con le sezioni del file, Collegamenti, Fonti, note e data di revisione;
  - nuovi file `contenuti/riferimenti.yaml` (nomi di apparati e strutture senza contenuto) e `contenuti/pagine/informazioni.md`;
  - pagine `/fonti` (generata da `fonti.yaml`) e `/informazioni` sopra l'atlante; la scena si ferma mentre sono aperte;
  - un indirizzo diretto a una struttura di uno strato nascosto ora mostra quello strato invece di annullare la selezione;
  - test: 36 unitari e di componente, 9 end-to-end con axe-core senza violazioni.
- **2026-10-24** — Verifica dei termini latini sulla TA2 (TA2 Viewer ufficiale FIPAT/Open Anatomy, versione 2.07, https://ta2viewer.openanatomy.org/, consultato il 2026-10-24). Esiti:
  - cuore: "cor", TA2 3932, confermato;
  - diaframma: "diaphragma", TA2 2327, confermato;
  - femore: nella TA2 "femur" (160) indica la coscia; l'osso è "os femoris" (1360). Il termine del femore è stato corretto. Per questo il file è tornato a "verificato": serve una nuova approvazione;
  - aggiunte la fonte `fipat-ta2` in `fonti.yaml` e il campo obbligatorio `ta2` nelle strutture; il numero rimanda alla voce ufficiale.

  Il sito fipat.library.dal.ca non era raggiungibile (errore DNS); la verifica usa il visualizzatore ufficiale, che la stessa FIPAT indica.
- **2026-10-24** — Decisioni minori della M3:
  - il femore mostra "Femore" sia per il destro sia per il sinistro, come nel contenuto approvato;
  - le relazioni verso strutture senza contenuto restano testo semplice (D18);
  - il numero TA2 compare accanto al termine latino;
  - l'avviso "Versione in sviluppo" ora dice "alcuni nomi e testi sono in preparazione".
- **2026-10-24** — Registrata D20: femore e pagina Informazioni approvati e inclusi nella build di produzione. Chiusa la questione aperta sulla dichiarazione di revisione dei contenuti.
- **2026-10-24** — M5 Ciclo cardiaco realizzata. Risultati:
  - nuovo file `contenuti/processi/ciclo-cardiaco.md`: 5 passi; per ognuno lo stato del disegno (atri, ventricoli, valvole, segnale, tono, flussi) e una didascalia con i rimandi;
  - il controllo automatico ora verifica anche i processi: valori ammessi per ogni parte del disegno, stesso numero di passi tra intestazione e testo, una fonte per ogni paragrafo; la numerazione delle fonti è quella della scheda;
  - componente `src/processi/` (schema, comandi, riproduzione), caricato solo con la scheda: 2,3 kB gzip;
  - comandi Riproduci/Pausa, Precedente, Successivo e passi da 1 a 5; la didascalia viene annunciata solo fuori dalla riproduzione; con il movimento ridotto il pulsante Riproduci non compare;
  - test: 44 unitari e di componente, 11 end-to-end con axe-core senza violazioni.
- **2026-10-24** — Verifica sulle fonti per le didascalie, su OpenStax 19.3 letto direttamente il 2026-10-24:
  - le valvole semilunari si chiudono quando la pressione nei ventricoli scende sotto quella del tronco polmonare e dell'aorta, all'inizio del rilassamento;
  - il secondo tono è la chiusura delle valvole semilunari durante la diastole ventricolare;
  - nella diastole le valvole atrioventricolari si aprono e il sangue passa dagli atri ai ventricoli;
  - la contrazione degli atri completa il riempimento;
  - gli atri si rilassano quando si contraggono i ventricoli.

  Queste affermazioni sono nuove rispetto al testo approvato del cuore. Il file del processo è in stato "verificato": fuori dalla build di produzione fino all'approvazione.
- **2026-10-24** — Decisioni minori della M5:
  - colori del sangue in tono con la palette (#4362a8 povero, #b8434b ricco di ossigeno);
  - segnale elettrico in giallo (#f2c14e), distinto da selezione e azioni;
  - frecce di flusso ferme in pausa;
  - su schermo stretto le etichette del disegno sono più grandi e quelle dei due nodi sono nascoste: i nodi restano nominati nelle didascalie;
  - il percorso del segnale nei ventricoli non è disegnato (le fonti approvate non nominano fascio di His e fibre di Purkinje): il segnale è mostrato colorando la parete delle cavità che raggiunge.
- **2026-10-24** — Registrata D22: didascalie del ciclo cardiaco approvate dopo un nuovo controllo frase per frase su OpenStax 19.3; tolta la frase "Poi il ciclo ricomincia", priva di riscontro esplicito.
- **2026-10-24** — Corretto un difetto segnalato dall'utente ("Too many active WebGL contexts", poi "Context Lost"). Il controllo del supporto WebGL creava un contesto di prova a ogni aggiornamento dell'interfaccia e non lo rilasciava mai. Dopo circa 16 contesti il browser chiudeva il più vecchio, quello della scena 3D.
  - Ora il controllo si fa una volta sola e il contesto di prova viene rilasciato subito.
  - Aggiunto un test end-to-end che conta i contesti creati durante l'uso. Con il codice precedente, 30 cambi di strato creavano 30 contesti in più.
- **2026-10-24** — M4: riscaricato Z-Anatomy, installato Blender (dall'utente), ispezionati e allineati i polmoni. Esito nella sezione 2b; in attesa della conferma dell'utente.
- **2026-10-24** — L'utente conferma forma e posizione dei polmoni.
- **2026-10-24** — M4 implementata:
  - **Pipeline:** `npm run modelli:polmoni` scarica Z-Anatomy, ne controlla l'impronta, esporta e allinea i lobi in Blender; `prepara-modelli.mjs` li aggiunge allo strato Organi come gruppo `polmoni`.
  - **Testo dei polmoni:** cartellino e scheda (In breve, Dove si trova, Come è fatto, Cosa fa), con due fonti nuove lette il 2026-10-24: NHLBI "The Respiratory System" e OpenStax 22.2. Termine *pulmones* verificato nel visualizzatore TA2 (numero 3265). Il testo è in stato "verificato".
  - **Pagina Informazioni:** aggiornata (origine dei polmoni e crediti di Z-Anatomy) e riportata in stato "verificato" fino all'approvazione. Nel frattempo manca dalla build di produzione.
  - **Licenze:** LICENZE.md dei modelli e piè di pagina citano Z-Anatomy (CC BY-SA 4.0) da subito, perché il modello 3D dei polmoni è già incluso.
- **2026-10-24** — Decisioni minori della M4:
  - colore dei polmoni #c99ea4, rosa tenue distinto dal cuore e lontano da rosso e blu dei vasi;
  - lobi semplificati al 30% e non al 10%, perché sono già superfici leggere. Pesano 52 kB in più su organi.glb, sotto il limite di 150 kB del piano;
  - la linea di richiamo arriva a un punto della superficie rivolta verso chi guarda, vicino al centro della struttura, e non più al centro dell'ingombro: nei polmoni il centro cadeva sul cuore;
  - nei cartellini e nelle schede, un collegamento verso una struttura che ha un testo è un link che la seleziona nel corpo (completa D18);
  - il link alla pagina Informazioni nelle schede diventa testo semplice se la pagina non è pubblicata;
  - i test della pubblicazione fissano gli stati dei contenuti nella copia di prova, così non dipendono da quali testi sono approvati.
- **2026-10-24** — Registrata D23: testo dei polmoni e pagina Informazioni approvati, inclusi nella build di produzione. M4 completata.
- **2026-10-24** — Registrata D24: approvato il piano della M6 Percorso "Un respiro" (scelte A1–F1).
- **2026-10-24** — M6 realizzata:
  - **Testo:** nuovo file `contenuti/percorsi/respirazione.md`, con 6 passi: Un respiro, Le vie dell'aria, I bronchi, Inspirazione, Negli alveoli, Espirazione. Ogni frase rimanda a una fonte letta il 2026-10-24.
  - **Fonti nuove:** OpenStax 22.1 (organi e strutture dell'apparato respiratorio) e 22.4 (scambio dei gas).
  - **Fonti rilette per il percorso:** OpenStax 22.3 e le pagine NHLBI "The Respiratory System" e "How Your Body Controls Breathing". La loro data di consultazione resta quella originale, perché le citano anche testi già approvati che non ho ricontrollato.
  - **Differenza tra le fonti:** per OpenStax gli intercostali esterni lavorano nell'inspirazione normale; per NHLBI gli intercostali servono durante l'attività fisica. Il percorso segue OpenStax e la differenza è nelle note sulle fonti.
  - **Stato:** il testo è "verificato", quindi fuori dalla build di produzione fino all'approvazione.
  - **Controllo automatico:** ora copre anche i percorsi:
    - strato e schema ammessi;
    - strutture evidenziate e inquadrate presenti nel modello;
    - stesso numero di passi tra intestazione e testo;
    - una fonte per ogni paragrafo.

    I percorsi hanno fonti numerate proprie e compaiono nella pagina Fonti ("Citata per: percorso “Un respiro”").
  - **Scena:** ogni unità ha uno stato (nascosta, attenuata o piena) letto dagli shader da una texture. Così si possono evidenziare più strutture insieme e mostrare singole strutture di un altro strato, come il diaframma accanto ai polmoni. Le unità nascoste non si possono selezionare.
  - **Telecamera narrante:** a ogni passo inquadra di fronte le strutture del passo, nello spazio libero accanto al pannello.
  - **Interfaccia:**
    - percorso nel pannello a destra (foglio in basso su smartphone);
    - indirizzi `/percorsi/respirazione/1`…`6`;
    - la voce Percorsi del menu è attiva;
    - in ogni passo si può aprire una struttura e tornare con "Torna al percorso";
    - Esc chiude il percorso;
    - il pannello del percorso si scarica solo quando lo si apre (3,1 kB gzip), il testo pesa 2,6 kB gzip.
  - **Schemi 2D:**
    - torace in inspirazione ed espirazione, con diaframma, costole, polmoni e frecce;
    - un alveolo con il capillare;
    - la riproduzione parte ferma e manca con il movimento ridotto.
  - **Test:** 58 unitari e di componente, 15 end-to-end con axe-core senza violazioni.
- **2026-10-24** — Decisioni minori della M6:
  - del naso, che non è nel modello 3D, si evidenziano le ossa nasali e le conche nasali inferiori, descritte da OpenStax 22.1;
  - nello schema dell'alveolo i due gas si distinguono per colore (ossigeno verde acqua, anidride carbonica ambra) e i loro nomi stanno nella legenda, perché sul disegno si sovrapponevano alle forme;
  - nello schema del torace i movimenti sono accentuati, e l'avvertenza lo dice;
  - i passi di un percorso non creano voci nella cronologia: "Indietro" del browser esce dal percorso;
  - la voce Percorsi resta "In preparazione" finché nessun percorso è pubblicato;
  - i comandi Indietro e Avanti restano fissi in fondo al pannello, così non si perdono scorrendo il testo;
  - sotto ogni passo compaiono solo le fonti citate in quel passo;
  - su smartphone il foglio del percorso occupa metà schermo e la telecamera inquadra le strutture nella metà alta;
  - anche durante il percorso le strutture attenuate si possono selezionare, come accade già con la selezione.
- **2026-10-24** — Registrata D25: testo del percorso "Un respiro" approvato e incluso nella build di produzione. M6 completata.
- **2026-10-24** — Registrata D26 e implementata la M7. Risultati:
  - **Soglia** su `/`: titolo, presentazione, "Esplora il corpo" (attivo a modello caricato), "Segui un percorso", Indice, Informazioni, avvertenza e crediti. Il corpo gira piano dietro il testo, spostato a destra su schermo largo; con il movimento ridotto resta fermo. Gli indirizzi diretti non passano dalla soglia, e tornando indietro su `/` non ricompare.
  - **Tour** di 4 passi (Ruota e avvicinati, Scegli una struttura, Strati e sagoma, Percorsi, Indice e Fonti), con riquadro sull'elemento indicato. Parte alla prima visita dopo "Esplora il corpo", si ricorda nella memoria del browser e si riapre con il nuovo pulsante Aiuto o con il tasto `?`.
  - **Indice** `/indice`: ricerca senza librerie (maiuscole, accenti, inizio di parola), percorsi, processi, organi e strutture con testo per apparato, glossario. La voce Indice del menu è attiva.
  - **Glossario**: `contenuti/glossario.yaml` controllato a ogni build (fonte obbligatoria, fonti esistenti, niente HTML). Nei testi i termini segnati con `[[parola|voce]]` aprono la definizione sul posto; in produzione le voci non approvate tornano testo semplice. Le fonti citate dal glossario compaiono nella pagina Fonti.
  - **Versione testuale** senza WebGL 2: Indice, schede delle strutture con il ciclo cardiaco, percorso con testo e schemi, Fonti e Informazioni, con gli stessi indirizzi.
  - **Test:** 71 unitari e di componente, 19 end-to-end con axe-core senza violazioni.
- **2026-10-24** — Decisioni minori della M7:
  - testi dell'interfaccia di soglia e tour scritti per l'atlante; l'avvertenza della soglia è la frase già approvata della pagina Informazioni;
  - su smartphone il menu in alto resta visibile in una riga sotto il titolo (prima era nascosto, e Indice e Percorsi non erano raggiungibili);
  - il pulsante Aiuto è "?" su schermo stretto; sotto i 380 px la barra dei comandi si stringe per stare su una riga;
  - le ossa e i muscoli con testo (femore, diaframma) compaiono nell'Indice nel loro apparato;
  - nei testi approvati (cuore, ciclo cardiaco, polmoni, percorso "Un respiro") sono stati aggiunti solo i segni del glossario: senza i segni il testo è identico parola per parola, verificato automaticamente; gli stati restano "approvato";
  - un termine è segnato una sola volta per sezione o passo;
  - l'avviso grigio su fondo grigio aveva contrasto insufficiente: il testo ora è in inchiostro pieno.
- **2026-10-24** — Angoli superiori squadrati sotto la barra d'accento della guida e della definizione del glossario (correzione visiva).
- **2026-10-24** — Registrata D27: glossario approvato (25 voci) e incluso nella build di produzione. M7 completata.
- **2026-10-24** — Riorganizzazione del codice di `src/` con nomi inglesi, senza cambiare il comportamento:
  - cartelle `pages/`, `components/common/`, `components/features/<area>/`, `contexts/`, `hooks/`, `models/`, `utils/`, `styles/`, al posto di `app/`, `scena/`, `esplora/`, `pannello/`, `indice/`, `glossario/`, `contenuti/`, `stile/`…; alias `@/` per `src/`;
  - nomi di file, componenti, funzioni e variabili in inglese; commenti e testi restano in italiano, la pipeline (`pipeline/`, `contenuti/`) resta in italiano;
  - un foglio di stile per area in `src/styles/` (token in `tokens.css`) al posto di `stile.css`; segno del glossario `glossary-term`/`data-term` e classi `citation`/`visually-hidden`;
  - `test/ambiente-dom.ts` → `test/dom-setup.ts`, `test/e2e/esplora.spec.ts` → `test/e2e/atlas.spec.ts`;
  - `CLAUDE.md` aggiornato alla nuova struttura. Verifica: build, 71 test unitari e di componente, Biome senza errori.
- **2026-10-24** — Il lavoro a milestone è concluso (indicazione dell'utente): le richieste puntuali si eseguono direttamente. `CLAUDE.md` aggiornato di conseguenza; `.impeccable/config.json` punta al nuovo `src/styles/panel.css`.
- **2026-10-24** — Soglia e atlante hanno indirizzi distinti (richiesta dell'utente; modifica il comportamento di D26 per cui la soglia non ricompariva tornando su `/`):
  - `/` è la soglia; "Esplora il corpo" porta a `/esplora`, che apre l'atlante senza soglia anche come indirizzo diretto;
  - chiudendo il cartellino o il percorso si torna a `/esplora`, non più a `/`;
  - Indietro dall'atlante riporta alla soglia, Avanti all'atlante; il tour non riparte.
  - Test: 72 unitari e di componente, 19 end-to-end.
- **2026-10-24** — Completati i testi degli organi del modello e di tutte le ossa (richiesta dell'utente). Scelte dell'utente: una scheda unica per i reni, cartellini per tutte le ossa del modello, scheda completa per gli organi. Risultati:
  - **Reni:** i gruppi 3D `rene-destro` e `rene-sinistro` sono uniti nel gruppo `reni` (`pipeline/gruppi-organi.mjs`, `src/utils/organs.ts`); cambia solo `strutture.json`, i `.glb` rigenerati sono identici;
  - **Organi:** 12 schede nuove (In breve, Dove si trova, Come è fatto, Cosa fa): encefalo, trachea e bronchi, esofago, stomaco, intestino tenue, intestino crasso, fegato, colecisti, pancreas, milza, reni, vescica urinaria;
  - **Ossa:** 52 cartellini nuovi, che con il femore coprono tutte le 217 ossa del modello. Ossa ripetute dello stesso tipo sono riunite in una voce (vertebre per regione, coste, cartilagini costali, metacarpali, metatarsali, falangi della mano e del piede);
  - **Fonti nuove**, lette il 2026-10-24: OpenStax A&P 2e 7.1–7.4, 8.1–8.3, 13.2, 13.3, 21.1, 23.3–23.6, 25.2, 25.3; NCI SEER (milza, stomaco, reni, vescica); NIDDK (reni, vie urinarie). La pagina NINDS sull'encefalo non era leggibile (errore 403);
  - **Termini latini** verificati sui dati del visualizzatore ufficiale TA2 2.07 (numero nel campo `ta2`);
  - `riferimenti.yaml`: nomi per gli apparati e le strutture citate nelle relazioni, così le relazioni restano leggibili anche quando la destinazione non è ancora approvata;
  - tutti i testi nuovi sono in stato "verificato": fuori dalla build di produzione fino all'approvazione dell'utente;
  - nota: le pagine OpenStax ora dichiarano che il libro non può essere usato per addestrare modelli linguistici né "ingerito" in servizi di AI generativa senza permesso scritto. Da valutare con l'utente.
- **2026-10-24** — Nella sezione "Collegamenti" della scheda completa l'etichetta compare una sola volta per tipo ("Fa parte di", "Collegato a"), seguita dalle strutture separate da virgola, come nel cartellino (richiesta dell'utente). Componente comune `RelatedNames` in `panel/Relations.tsx`.
- **2026-10-24** — Strati della barra riordinati in Scheletro · Organi · Muscoli, uno per tessuto (richiesta dell'utente; modifica D3, D11 e D16, dove il segmento era "Scheletro e organi"). Motivo: nella vista con scheletro e organi le ossa piene coprivano organi come l'encefalo, che col clic non si raggiungeva. Risultati:
  - **Organi:** le ossa restano come contesto in uno stato nuovo, "fantasma": semitrasparenti come le strutture attenuate (un po' di più) e non selezionabili, quindi il clic arriva all'organo dietro. Valgono anche nei passi del percorso "Un respiro", che così conservano le coste;
  - **Scheletro** e **Muscoli** invariati; tasti 1, 2, 3 nello stesso ordine della barra; testo del tour aggiornato;
  - un indirizzo diretto a un osso apre lo strato Scheletro (prima Scheletro e organi);
  - Test: 73 unitari e di componente, 20 end-to-end.
- **2026-10-24** — Apparato genitale maschile (richiesta dell'utente, primo passo verso un selettore Uomo/Donna). Verifica preliminare: BodyParts3D e Z-Anatomy contengono solo un corpo maschile; non ci sono modelli di organi genitali femminili né della mammella, e anche pelle e bacino sono maschili. Risultati:
  - sette nuovi organi selezionabili, dagli OBJ di BodyParts3D già presenti in `dati-sorgente/` (nessun download): testicoli, epididimi, dotti deferenti, vescichette seminali, prostata, pene (corpi cavernosi, corpo spongioso, glande) e uretra (maschile, nell'apparato urinario); strato degli organi da 649 a 669 kB;
  - nuovo apparato "Apparato genitale maschile" (`genitale-maschile`) nell'Indice, dopo l'urinario;
  - termini latini e numeri verificati sul TA2 Viewer: testis 3576, epididymis 3603, ductus deferens 3621, glandula seminalis 3631, prostata 3637, penis 3662, urethra masculina 3442;
  - sette schede in stato "verificato" (fuori dalla produzione fino all'approvazione), con fonti nuove OpenStax 27.1 e SEER (Testes, Duct System, Accessory Glands, Penis, Male Sexual Response and Hormonal Control); le differenze tra le fonti sono dichiarate nei limiti;
  - Test: 74 unitari e di componente, 20 end-to-end.
  - testi approvati dall'utente lo stesso giorno (D28): le sette schede entrano nella build di produzione.
- **2026-10-24** — Selettore Uomo/Donna (D29; richiesta dell'utente, che ha scelto lo Human Reference Atlas e una vagina schematica creata dalla pipeline, senza vulva). Ricerca dei modelli: lo Human Reference Atlas (HuBMAP, CC BY 4.0) ha utero, tube, ovaie, mammelle, pelvi e pelle femminili, ma non vagina né genitali esterni; scartati un modello da risonanza magnetica su Sketchfab (CC BY, senza pubblicazione né revisione, download con account), modelli Sketchfab disegnati a mano senza fonti, modelli con licenza Standard o NC e l'atlante pelvico di Open Anatomy (licenza non dichiarata). Risultati:
  - **Download** autorizzati dall'utente, in `dati-sorgente/hra/` (esclusa da git): utero, tube e ovaie sinistre e destre, mammelle sinistra e destra, pelvi, sterno e manubrio femminili (circa 41 MB; la mammella destra pesa 24 MB e non 13,7 come stimato nel resoconto). Pelvi, sterno e manubrio servono solo all'allineamento;
  - **Pipeline:** `npm run modelli:donna` (`pipeline/organi-donna.mjs`, con `geometria.mjs`) controlla le impronte SHA-256, allinea gli organi a BodyParts3D con ICP e una similitudine (pelvi: scarto medio 5,5 mm, scala 0,825, rotazione 4,3°; mammelle: traslazione sugli sterni, scarto 4,7 mm) e scrive OBJ in `dati-sorgente/hra/allineati/` con un rapporto. Dell'utero si usano corpo, fondo, segmento inferiore, cervice e corni (le pareti ricoprono le stesse zone); della mammella la forma esterna, l'areola e il capezzolo. `prepara-modelli.mjs` li riduce a 3.000 triangoli per organo e li scrive in `organi-donna.glb` (67 kB, caricato sempre insieme agli altri strati); gli altri file restano identici. In `strutture.json` il campo `corpo` segna gli organi di un solo corpo;
  - **Vagina schematica:** tubo a sezione ellittica dalla giunzione cervico-vaginale dell'HRA (che ne dà larghezza e spessore), perpendicolare all'asse della cervice e inclinato in avanti scendendo (SEER, Genital Tract); lunghezza di 10 cm portata alla scala del corpo (8,3 cm) e accorciata a 6,1 cm al piano delle tuberosità ischiatiche, perché non sporga fra le cosce;
  - **Interfaccia:** gruppo Uomo · Donna all'inizio della barra (♂ e ♀ su schermo stretto, dove "Scheletro" diventa "Ossa"); in Donna la Sagoma è disattivata; scegliere un organo di un solo corpo, dall'Indice o da un indirizzo, porta a quel corpo, e cambiare corpo chiude la selezione di un organo dell'altro. Il corpo scelto non è nell'indirizzo, come lo strato;
  - **Schede** in stato "bozza": utero (TA2 3500), tube uterine (3486), ovaie (3470), vagina (3523), mammelle (mamma, 7097: la TA2 la classifica nel tegumento comune, l'atlante la mostra con l'apparato genitale femminile come SEER e OpenStax). Fonti nuove: OpenStax 27.2 e SEER (Ovaries, Genital Tract, Mammary Glands). Nuovo apparato "Apparato genitale femminile" nell'Indice, dopo il maschile;
  - **Attribuzioni** aggiornate nel piè di pagina, nella soglia, in `public/modelli/LICENZE.md` e nella pagina Informazioni (testo già approvato: la modifica va rivista dall'utente); tour aggiornato.
  - Test: 85 unitari e di componente (nuovi: geometria, corpo nel riduttore e negli stati delle unità, modelli femminili), 21 end-to-end (nuovo: selettore Uomo/Donna con axe).
  - testi approvati dall'utente il 2026-10-25 (D30): le cinque schede entrano nella build di produzione.
- **2026-10-25** — Selettore Uomo/Donna separato dalla barra dei comandi (richiesta dell'utente): `BodySwitch` è un riquadro a sé, affiancato alla barra in basso (`.view-controls`) e sopra di essa su schermo stretto; il passo del tour "Strati e sagoma" evidenzia entrambi.
- **2026-10-25** — Schema animato di tutto l'apparato genitale nelle schede dei suoi organi (richiesta dell'utente): sezione "L'apparato al lavoro" dopo il testo, con uno schema frontale che colora a ogni passo gli organi al lavoro e contorna l'organo della scheda aperta.
  - Uomo: "Il percorso degli spermatozoi" (5 passi, dai testicoli all'uretra) nelle schede di testicoli, epididimi, dotti deferenti, vescichette seminali, prostata, uretra e pene. Donna: "Dall'ovulazione alle mestruazioni" (5 passi) nelle schede di ovaie, tube uterine, utero e vagina; le mammelle, fuori dalla pelvi, non sono nello schema.
  - Testi che riprendono solo fatti e fonti delle schede già approvate; approvati dall'utente il 2026-10-25 (D31), entrano nella build di produzione.
  - Pipeline: un processo può appartenere a più strutture (`strutture`) e avere uno `schema` (`cuore`, predefinito, o `genitale-maschile`/`genitale-femminile`, con un campo `fase` per passo); l'Indice lo apre dalla prima struttura. I comandi dei processi sono in `components/common/StepPlayer.tsx`, condivisi con il ciclo cardiaco.
- **2026-10-25** — Selettore degli strati (Scheletro/Organi/Muscoli) separato dalla barra dei comandi (richiesta dell'utente): `LayerSwitch` è un riquadro a sé tra `BodySwitch` e la barra (Sagoma, Vista iniziale, Aiuto); su schermo stretto i tre riquadri stanno uno sopra l'altro.
- **2026-10-25** — Apparato urinario nelle schede e sottosezioni per apparato (richiesta dell'utente, che ha scelto le opzioni proposte): la sezione "L'apparato al lavoro" diventa "Gli apparati al lavoro" quando un organo ne ha due, con una sottosezione per apparato ("Apparato urinario", "Apparato riproduttivo"), prima quella dell'organo.
  - Nuovo schema animato "Dal sangue all'urina" (5 passi: filtrazione, riassorbimento, ureteri, riempimento, minzione) nelle schede di reni, vescica, uretra, prostata, pene e vagina (gli ultimi due aggiunti su richiesta dell'utente; nello schema femminile l'apertura della vagina è un organo che si contorna). Mostra il corpo scelto nell'atlante (un primo selettore Uomo/Donna interno allo schema è stato tolto su richiesta dell'utente): l'uretra femminile, assente dal modello 3D, c'è solo nello schema; gli ureteri, assenti dal modello, sono solo disegnati.
  - Fonti: solo NIDDK e SEER (l'utente ha escluso nuove letture di OpenStax per la clausola sull'AI generativa; le citazioni OpenStax esistenti restano). Fonti nuove: SEER "Introduction to the Urinary System", "Ureters", "Urethra".
  - Schede riviste: reni (posizione T12-L3, quantità filtrate convertite in litri, percorso dell'urina, eritropoietina), vescica (ureteri, valvole del trigono, sfinteri), uretra (ora descrive uretra maschile e femminile; da "approvato" torna a "verificato" ed esce dalla produzione fino all'approvazione). Le schede genitali sono state rilette: nessuna modifica necessaria.
  - Testi in stato "verificato", da approvare: reni, vescica, uretra e processo `formazione-urina`.
  - Pipeline: schema `urinario` con le sue fasi; `StepPlayer` accetta comandi sopra il disegno (`header`).
  - Test: 92 unitari e di componente, 21 end-to-end.
- **2026-10-25** — Cartellini degli organi che riguardano sia l'apparato urinario sia quello genitale (richiesta dell'utente): rivisti "In breve" e collegamenti di uretra (lunghezze nella donna e nell'uomo), prostata (attraversata dal primo tratto dell'uretra, via di urina e sperma), pene (l'uretra lo percorre e si apre sulla punta) e vagina (non fa parte dell'apparato urinario; l'uretra si apre appena davanti alla sua apertura; nuovo collegamento all'uretra, che apre il corpo maschile, dichiarato nelle note). Fonte SEER "Urethra". Prostata, pene e vagina tornano da "approvato" a "verificato" ed escono dalla produzione fino all'approvazione.
- **2026-10-25** — Genitali esterni nella scheda della vagina e parti senza modello 3D nell'Indice e nel glossario (richiesta dell'utente):
  - nella sezione "Dove si trova" della scheda della vagina (prima era una sezione a sé, "Genitali esterni", tolta su richiesta dell'utente): schema della vulva vista dal davanti, disegnato per l'atlante (semplificato e non in scala), con 14 parti numerate (monte del pube, prepuzio e glande del clitoride, ghiandole vestibolari minori, orifizio uretrale esterno, ghiandole parauretrali, orifizio vaginale, vestibolo, imene, piccole e grandi labbra, ghiandole vestibolari maggiori, perineo con i due triangoli, ano come riferimento), elenco dei nomi collegato al glossario e didascalia con le fonti. Non indica commessure, frenulo delle labbra, parti interne del clitoride e bulbi del vestibolo (dichiarato nelle note della scheda);
  - 23 nuove voci del glossario, in stato "verificato": vulva e le sue parti, perineo, uretra, uretra femminile e maschile, i tre tratti dell'uretra maschile e i due orifizi uretrali esterni. Termini latini e numeri verificati sui dati del TA2 Viewer (versione 2.07);
  - pipeline: le voci del glossario possono avere `latino` e `ta2` (insieme) e `parteDi` (una struttura esistente); le strutture possono avere una `figura` (`schema`, `titolo`, `sezione` che la contiene, `didascalia` con rimandi numerati dopo quelli della sezione). L'Indice elenca le parti con `parteDi` nell'apparato di quella scheda, come "Non nel modello 3D", con i pulsanti per aprire la scheda e la definizione; il glossario mostra il termine latino;
  - fonti: nuova SEER "External Genitalia"; lette di nuovo OpenStax 27.2 (sezione sui genitali esterni e figura 27.10) e 11.4 (perineo). L'utente, che per l'apparato urinario aveva escluso nuove letture di OpenStax, ha confermato di tenere queste definizioni;
  - vagina e uretra: segni del glossario nel testo e un paragrafo sul vestibolo nella vagina; restano "verificato".
- **2026-10-25** — Registrata D32: l'utente approva tutti i testi non ancora approvati (69 contenuti in `contenuti/strutture/` e `contenuti/processi/`, 23 voci del glossario), che entrano nella build di produzione. Nessun testo resta in bozza o verificato.
- **2026-10-26** — Tiroide nel modello 3D e nella sua scheda (richiesta dell'utente). Verifica: BodyParts3D non contiene la ghiandola (solo cartilagine tiroidea, muscoli e vasi tiroidei); Z-Anatomy sì, come oggetto "Thyroid gland", non fra i modelli di terzi NC, quindi CC BY-SA 4.0 come i polmoni (D8, D23). Risultati:
  - **Pipeline:** `pipeline/esporta-tiroide.py` esporta la tiroide da Startup.blend e la allinea a BodyParts3D con una similitudine stimata sulle strutture del collo (cartilagini tiroidea e cricoidea, ioide, trachea, muscoli sternotiroidei): scala 0,984, rotazione 2,1°, scarto medio 0,5–1,9 mm per struttura (soglia 3 mm). `polmoni.mjs` diventa `z-anatomy.mjs` e riceve lo script da eseguire (`modelli:polmoni`, nuovo `modelli:tiroide`); `prepara-modelli.mjs` aggiunge la tiroide allo strato Organi come gruppo `tiroide` (`ZA-thyroid-gland`), semplificata al 30%. Cambiano solo `organi.glb` (673 kB), `strutture.json` e `riepilogo.json`;
  - **Interfaccia:** nuovo apparato "Sistema endocrino" (Indice: dopo il sistema nervoso); colore della tiroide bruno rossastro (#a0604f);
  - **Scheda** in stato "verificato": termine *glandula thyreoidea*, TA2 3863 (sinonimo *glandula thyroidea*), lobo piramidale incostante (TA2 3867) dichiarato nei limiti. Fonti nuove: SEER "Thyroid & Parathyroid Glands", NIDDK "Hypothyroidism (Underactive Thyroid)" e "Thyroid Tests" (la vecchia pagina NIDDK "thyroid-tests" risponde 404; si usa quella in "diagnostic-tests"). Nessuna nuova lettura di OpenStax;
  - **Crediti:** LICENZE.md, piè di pagina e pagina Informazioni citano la tiroide fra gli organi di Z-Anatomy; Informazioni torna da "approvato" a "verificato" ed esce dalla produzione fino all'approvazione.
- **2026-10-26** — Paratiroidi, ipotalamo e ipofisi (richiesta dell'utente, che ha scelto l'ipotalamo come organo a sé e ha autorizzato la lettura di OpenStax 17.3):
  - **Modello 3D:** le quattro paratiroidi vengono da Z-Anatomy (`esporta-tiroide.py`, stessa trasformazione della tiroide): ellissoidi di 3-4 mm sulla faccia posteriore della tiroide, non semplificati (128 triangoli). Ipotalamo (due metà) e ipofisi vengono da BodyParts3D: l'ipofisi prima era scartata, l'ipotalamo esce dal gruppo `encefalo` e diventa il gruppo `ipotalamo` (scegliendo l'encefalo non si evidenzia più). `organi.glb` passa a 681 kB;
  - **Schede** in stato "verificato", nel Sistema endocrino: paratiroidi (*glandulae parathyreoideae*, TA2 3870), ipotalamo (*hypothalamus*, 5714), ipofisi (*hypophysis*, 3853). Fonti nuove: SEER "Pituitary & Pineal Glands", NIDDK "Primary Hyperparathyroidism", OpenStax A&P 2e 17.3. Differenze dichiarate nei limiti: dimensioni dell'ipofisi (SEER: un pisello, circa 1 cm; OpenStax: un fagiolo) e posizione delle paratiroidi (SEER: nella capsula della tiroide; NIDDK: sulla tiroide o vicino); la scheda della tiroide ora rimanda alle paratiroidi. La scheda dell'encefalo non cambia;
  - **Crediti:** LICENZE.md, piè di pagina e Informazioni citano anche le paratiroidi fra gli organi di Z-Anatomy.
- **2026-10-26** — Schema animato "Come lavora la tiroide, passo per passo" (richiesta dell'utente), nelle schede di tiroide, ipofisi e ipotalamo, nella sezione "Il sistema al lavoro" (sottosezione "Sistema endocrino"; per il sistema endocrino il titolo dice "sistema", non "apparato"):
  - processo `regolazione-tiroide` in stato "verificato", 5 passi: TRH dall'ipotalamo all'ipofisi attraverso il sistema portale, TSH nel sangue, iodio e produzione di T4 e T3, ormoni agli organi (solo le cellule con i recettori), retroazione negativa. Fonti: OpenStax 17.3, NIDDK, SEER; nuova SEER "Introduction to the Endocrine System";
  - disegno `ThyroidDiagram` (encefalo con ipotalamo e ipofisi, tiroide davanti alla trachea, sangue, organi simbolici), schema `tiroide` nella pipeline con le sue fasi; le paratiroidi non partecipano e non sono disegnate.
- **2026-10-26** — Registrata D33: l'utente approva le quattro schede del sistema endocrino, il processo `regolazione-tiroide` e la pagina Informazioni, che entrano nella build di produzione. Nessun testo resta in bozza o verificato.
- **2026-10-26** — Spostamento del corpo nella scena (richiesta dell'utente): oltre a ruotare e avvicinarsi, il corpo si sposta trascinando con il tasto destro, con Maiusc + trascinamento (per i trackpad), con due dita sullo schermo e con Maiusc + frecce da tastiera (passo proporzionale alla distanza). Il punto guardato resta in un riquadro attorno al corpo, che non esce mai dalla vista; Vista iniziale e la scelta di una struttura ricentrano come prima. Il primo passo della guida diventa "Ruota, avvicinati e sposta".
- **2026-10-26** — Apparato visivo: occhi, nervo e tratto ottico, apparato lacrimale e schema animato della vista (richiesta dell'utente, che ha scelto tre schede e ha autorizzato la lettura di OpenStax 14.1 e 14.2). Risultati:
  - **Modello 3D:** tutto da BodyParts3D, già scaricato (nessun nuovo download). Gruppo `occhi`: sclera, cornea, iride e cristallino dei due lati (coroide, corpo ciliare, retina, corpo vitreo e camera anteriore restano fuori, nascosti dalla sclera), semplificati al 3% (`--ratio-occhi`). Gruppo `nervo-ottico`: nervi ottici (due tratti per lato), tratti ottici e corpi genicolati laterali; il chiasma non è un elemento a sé, ma i nervi si toccano sulla linea mediana. `classifica.mjs` ammette i nervi dei gruppi marcati `nervo` (solo il nervo ottico). Gruppo `apparato-lacrimale`: ghiandola, canalicoli, sacco e dotto nasolacrimale. I muscoli extraoculari erano già nello strato Muscoli. `organi.glb` passa da 681 a 728 kB e il limite del test sale da 700 a 750 kB;
  - **Interfaccia:** nuovo apparato "Apparato visivo" (Indice: dopo il sistema nervoso); colori avorio (#ddd3c4), giallo paglia (#d6b85a) e verde salvia (#8fa682), senza il blu riservato alle vene;
  - **Schede** in stato "verificato": occhi (*bulbus oculi*, TA2 6735), nervo e tratto ottico (*nervus opticus*, 6183; nei limiti chiasma 5668, tratto 5669, corpo genicolato laterale 5666), apparato lacrimale (*apparatus lacrimalis*, 6845). Termini verificati sui dati del TA2 Viewer 2.07. Fonti nuove: National Eye Institute "How the Eyes Work" e "How Tears Work", OpenStax A&P 2e 14.1 e 14.2. SEER non ha moduli sull'occhio; la pagina NEI "parts-eye" risponde 404. Non riportati: il passaggio di OpenStax 14.2 sulla posizione della fovea nella corteccia (probabilmente impreciso) e il caso clinico del chiasma;
  - **Schema animato** "Come funziona la vista, passo per passo" (processo `come-funziona-la-vista`, stato "verificato", schema `vista`, 6 passi: cornea, pupilla, cristallino, retina, chiasma, corteccia), nelle schede di occhi e nervo ottico. Disegno `VisionDiagram` in due pannelli: occhio di lato con i raggi di luce e l'immagine capovolta, vie ottiche dall'alto con le fibre colorate per metà del campo visivo.
- **2026-10-26 — Parti dell'occhio nel glossario e nell'Indice.** Tredici voci nuove del glossario, in stato "verificato", per le parti che nel modello non si scelgono da sole: sclera (*sclera*, TA2 6750), cornea (6744), coroide (*chorioidea*, 6774), corpo ciliare (6765), iride (*iris*, 6753), pupilla (6754), cristallino (*lens*, 6798), retina (6776), umor acqueo (*humor aquosus*, 6791), corpo vitreo (6809), disco ottico (*discus nervi optici*, 6788), fovea (*fovea centralis*, 6785), con `parteDi: occhi`, e chiasma ottico (5668) con `parteDi: nervo-ottico`. Definizioni da NEI "How the Eyes Work" e OpenStax 14.1 e 14.2, rilette il 2026-10-26; la macula non c'è perché le fonti non la descrivono. I termini sono collegati al glossario nei testi di occhi, nervo ottico e "Come funziona la vista". Nuovo campo facoltativo `nelModello` del glossario (solo con `parteDi`): segna le parti che sono nel modello ma unite a un'altra struttura (sclera, cornea, iride, cristallino, chiasma), che l'Indice indica "Nel modello 3D con …" invece di "Non nel modello 3D". Nuovo `PartOfLink`: nelle definizioni sul posto e nel glossario dell'Indice, le voci con `parteDi` hanno il collegamento "Apri la scheda: …", nascosto quando quella scheda è già aperta.
- **2026-10-26** — Registrata D34: l'utente approva le tre schede dell'apparato visivo, il processo `come-funziona-la-vista` e le 13 voci del glossario delle parti dell'occhio e del chiasma ottico, che entrano nella build di produzione. Nessun testo resta in bozza o verificato.
- **2026-10-26** — Muscoli mancanti nello strato Muscoli (segnalazione dell'utente). Causa: `prepara-modelli.mjs` considerava muscoli solo gli elementi sotto "muscle organ", mentre BodyParts3D descrive diversi muscoli solo per capi o parti. Risultati:
  - **Pipeline:** l'insieme dei muscoli comprende anche "head of muscle organ" e "zone of muscle organ", più le "organ zone" di un muscolo che ha già un'altra parte fra i muscoli (parte ascendente e discendente del trapezio). Nessun nuovo download;
  - **Modello:** 84 elementi in più (da 323 a 407): deltoide, trapezio e grande pettorale (3 parti ciascuno), bicipite e tricipite brachiale, retto femorale e i tre vasti, bicipite femorale, gastrocnemio, pronatore rotondo, flessore ulnare del carpo, adduttori e flessori brevi di pollice e alluce, pubococcigeo, ileococcigeo e puborettale, cricotiroideo, ariepiglottico, parti del lungo del collo (presenti nei dati solo a sinistra). Restano fuori muscoli papillari (organo cuore), tenie del colon, tendini e legamenti. `muscoli.glb` passa da 1020 a 1189 kB (nuovo limite di test 1200 kB); gli altri strati non cambiano;
  - **Ancora mancanti:** muscoli assenti da BodyParts3D (gran dorsale, retto, obliquo interno e trasverso dell'addome, massetere, temporale, pterigoidei, muscoli mimici, multifido, quadrato dei lombi, quadrato della pianta). Presenti in Z-Anatomy (CC BY-SA 4.0): da pianificare a parte, con ispezione e allineamento in Blender come per la tiroide.
- **2026-10-26** — Routing con React Router (richiesta dell'utente; attua D11 senza cambiarne gli indirizzi). Risultati:
  - **Dipendenza:** `react-router` 8.4.0, la stessa versione di utility-hub;
  - **Rotte:** dichiarate in `App.tsx` (`/`, `/esplora/:id?`, `/organo/:id`, `/percorsi/:pathId/:step?`, `/indice`, `/fonti`, `/informazioni`, `*`) sotto una rotta di layout con la vista 3D o testuale, che resta montata: la scena non si ricarica cambiando indirizzo. Le pagine di lettura sono elementi di rotta e compaiono nell'`Outlet`;
  - **Stato:** `AtlasContext` legge l'indirizzo con `useLocation` (allineando lo stato nello stesso disegno) e lo scrive con `useNavigate`, al posto di `history.pushState` e `popstate`; `writeUrl` diventa la funzione pura `urlChange`. `PageLink` usa `Link`.
- **2026-10-26** — Muscoli assenti da BodyParts3D, da Z-Anatomy ([piano](PIANO-MUSCOLI-Z-ANATOMY.md), approvato dall'utente con elenco, tetto di 2.000 triangoli e soglia di 3 mm). Risultati:
  - **Altri 18 elementi di BodyParts3D:** i gruppi sotto "musculature" (interossei dorsali e palmari e lombricali della mano, elevatori brevi e lunghi delle coste, interspinali, intertrasversari cervicali) erano scartati come i capi e le parti; `prepara-modelli.mjs` li comprende. Per lo stesso controllo tre muscoli dell'elenco approvato sono doppioni e sono tolti: quadrato della pianta ("flexor accessorius" in BodyParts3D), interossei dorsali e palmari della mano. Restano 37 muscoli, 74 mesh;
  - **Pipeline:** nuovo `pipeline/esporta-muscoli.py` (`npm run modelli:muscoli`, stesso pacchetto Z-Anatomy, nessun download). Allineamento a zone: per ogni zona del muscolo e delle sue aree d'inserzione una trasformazione rigida stimata sulle strutture vicine presenti nei due modelli (solo quelle che allineate da sole combaciano entro 3 mm; per capo e tronco esclusi gli arti), mediata sui vertici in base alla distanza. Il controllo misura lo scarto aggiunto dall'allineamento su inserzioni e strutture vicine, perché già in Z-Anatomy alcune inserzioni distano fino a 4,6 mm dal loro osso. Passano 69 mesh su 74; 5 sono eccezioni accettate dall'utente con lo scarto misurato: obliquo interno sinistro 4,94 mm e destro 3,70, piramidale destro 4,86 e sinistro 4,04, gran dorsale sinistro 3,26. `prepara-modelli.mjs` li aggiunge allo strato Muscoli (id `ZA-…`, senza FMA), ridotti a 2.000 triangoli ciascuno;
  - **Modello:** strato Muscoli da 425 a 499 elementi, `muscoli.glb` da 1225 a 1614 kB (limite di test 1650 kB). Controllo visivo con render di Blender: muscoli del viso sul cranio, gran dorsale sotto il trapezio; difetto noto: il retto dell'addome affiora a chiazze attraverso l'obliquo esterno di BodyParts3D vicino al margine costale;
  - **Interfaccia e crediti:** il cartellino dei muscoli di Z-Anatomy dice "Nome provvisorio in inglese, da Z-Anatomy" e non mostra l'identificativo FMA; i crediti dell'atlante e della soglia e `LICENZE.md` citano i 37 muscoli. La pagina Informazioni cita i muscoli presi da Z-Anatomy, con il testo approvato dall'utente.
