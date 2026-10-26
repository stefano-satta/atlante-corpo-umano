# Piano: muscoli mancanti da Z-Anatomy

Stato: **approvato e realizzato** (2026-10-26), con le differenze descritte in § 8. Segue la correzione dei capi e delle parti di BodyParts3D, registrata in DECISIONI.md § 6 lo stesso giorno.

## 1. Perché

Alcuni muscoli non esistono in BodyParts3D 4.0, né come muscolo intero né come capi o parti:
- tutti i muscoli mimici;
- massetere, temporale e pterigoidei;
- gran dorsale;
- retto, piramidale, obliquo interno e trasverso dell'addome;
- quadrato dei lombi e multifido;
- quadrato della pianta, estensore breve delle dita, interossei dorsali del piede e della mano, interossei palmari.

Z-Anatomy (CC BY-SA 4.0, derivato da BodyParts3D) li contiene come mesh. Non sono fra i modelli di terzi con licenza NC (orecchio interno e rene), quindi sono compatibili con D6 e D8.

## 2. Cosa ho verificato (in sola lettura, Blender 5.2.3 avviato con `-Y`)

**Struttura degli oggetti in `Startup.blend`.**
- Le mesh dei muscoli stanno nella collezione "4: Muscular system", con suffisso `.l` o `.r`.
- `.el`, `.er`, `.ol`, `.or`, `.o1l`… sono le aree d'inserzione: piccole mesh nella collezione "2: Muscular insertions", figlie dell'osso su cui poggiano (per esempio `Latissimus dorsi muscle.ol` è figlia di `Hip bone.l`).
- `.g` e `.j` sono etichette e segnaposto, non geometria.

**Allineamento a BodyParts3D.** L'ho misurato su 340 strutture presenti in entrambi i modelli (114 ossa e 222 muscoli).
- Con una sola trasformazione per tutto il corpo lo scarto mediano è di 7 mm: 3,6 mm su testa e collo, 6,2 sul tronco, 10,4 sulle gambe. È troppo, perché la soglia usata per polmoni e tiroide è 3 mm.
- Con una trasformazione locale, stimata per ogni muscolo sulle 6 strutture accoppiate più vicine, l'ho validata "lasciandone fuori una": ho allineato un muscolo presente in entrambi i modelli senza usarlo come riferimento. Lo scarto mediano scende a 2,4 mm (1,8 su testa e collo, 2,4 sul tronco, 3,1 sulle gambe; 90° percentile 4,8 mm).
- Pochi casi restano alti, per esempio il costrittore medio della faringe (14 mm) e il grande gluteo (7 mm). Lì probabilmente Z-Anatomy ha rimodellato la forma: lo scarto misura la differenza di forma più che un errore di posizione.

**Doppioni.** Il riconoscimento automatico per geometria non è affidabile. Per esempio considera "nuovi" i capi del gastrocnemio, che BodyParts3D ha già. Per questo non si importa "tutto quello che manca", ma un **elenco esplicito**, controllato per nome sui dati di BodyParts3D (§ 3).

## 3. Elenco proposto (40 muscoli, 80 mesh, destro e sinistro)

| Regione | Muscoli (oggetti di Z-Anatomy) |
|---|---|
| Mimici (20) | frontale, occipitale, temporoparietale, orbicolare dell'occhio (parte orbitale e parte palpebrale), corrugatore del sopracciglio, procero, nasale, depressore del setto nasale, elevatore del labbro superiore, elevatore del labbro superiore e dell'ala del naso, elevatore dell'angolo della bocca, zigomatico maggiore e minore, risorio, orbicolare della bocca, depressore dell'angolo della bocca, depressore del labbro inferiore, mentale, buccinatore |
| Masticatori (6) | massetere (parte superficiale e profonda), temporale, pterigoideo mediale, pterigoideo laterale (capo superiore e inferiore) |
| Tronco (9) | gran dorsale, retto dell'addome, piramidale, obliquo interno, trasverso dell'addome, quadrato dei lombi, multifido del collo, del torace e dei lombi |
| Mano e piede (5) | quadrato della pianta, estensore breve delle dita, interossei dorsali del piede, interossei dorsali e palmari della mano |

Restano esclusi:
- fasce, borse, retinacoli, setti e aponeurosi (102 oggetti), perché non sono muscoli;
- l'obliquo esterno e il tratto ileotibiale, che BodyParts3D ha già;
- i muscoli auricolari, che in Z-Anatomy non sono mesh.

## 4. Implementazione

1. **`pipeline/esporta-muscoli.py`** (nuovo, sul modello di `esporta-tiroide.py`). Riusa `mesh_mondo`, `vertici_obj`, `albero` e la stima di Umeyama con ICP.
   - Le **coppie di riferimento** si costruiscono da sole: ossa e muscoli di `strutture.json` con un oggetto omonimo in Z-Anatomy. I nomi si convertono così: "Right X" diventa "X.r", e si prova anche il suffisso " muscle".
   - Per **ogni muscolo** si stima una similitudine sulle 6 coppie più vicine.
   - **Controllo d'accettazione**:
     - le aree d'inserzione (`.el`/`.ol`…) del muscolo, trasformate con la sua similitudine, devono stare entro 3 mm dall'osso corrispondente di BodyParts3D;
     - per i muscoli senza inserzioni vale lo scarto sulle strutture di riferimento;
     - oltre soglia lo script si ferma e indica il muscolo, come fa oggi per la tiroide.
   - Produce OBJ in `dati-sorgente/z-anatomy/muscoli/` con un nome in stile BodyParts3D ("Right latissimus dorsi") e un `rapporto.json` con trasformazione e scarti per muscolo.
2. **`package.json`**: nuovo comando `modelli:muscoli` (`node pipeline/z-anatomy.mjs esporta-muscoli.py`). Il pacchetto e la sua impronta restano quelli già ispezionati: nessun download nuovo.
3. **`pipeline/prepara-modelli.mjs`**:
   - aggiunge la cartella `--muscoli` al ciclo di Z-Anatomy, con strato `muscoli`, id `ZA-…` e `fma: null`;
   - riduce ogni mesh a un **massimo di 2000 triangoli**, come per gli organi femminili. Le mesh più pesanti (obliquo interno e trasverso, circa 30.000 triangoli) altrimenti peserebbero troppo, e i muscoli mimici piccoli (170–900 triangoli) restano interi.
4. **Interfaccia** (`InfoCard.tsx:66`): la nota "Nome provvisorio in inglese, dalla Foundational Model of Anatomy" diventa "…da Z-Anatomy" per le unità `ZA-`. Il cartellino non mostra l'identificativo FMA, perché manca (già gestito alla riga 114).
5. **Licenze e crediti**:
   - `public/modelli/LICENZE.md` e la pagina Informazioni citano i muscoli fra i modelli di Z-Anatomy;
   - il testo di Informazioni è un contenuto `approvato`: la modifica richiede la tua approvazione (D17).
6. **Test** (`pipeline/modelli.test.mjs`):
   - l'elenco dei 40 muscoli c'è, per lato, nello strato `muscoli`;
   - nessun doppione per nome con BodyParts3D;
   - nuovo budget di peso;
   - `rapporto.json` sotto soglia.
7. **Documentazione**: riga nel registro di DECISIONI.md e, dopo la tua approvazione dell'aspetto, una nuova decisione D35 (come D23 per i polmoni).

## 5. Peso

Con il tetto di 2000 triangoli si aggiungono circa 93.000 triangoli. Stima: `muscoli.glb` da 1189 a circa 1650 kB. Se serve meno peso:
- un tetto di 1000 triangoli porta la stima a circa 1450 kB;
- in alternativa i muscoli di Z-Anatomy vanno in un file a parte, caricato dopo il primo disegno dello strato.

## 6. Verifica

1. Lo script si ferma se un muscolo supera la soglia. Gli scarti per muscolo restano in `rapporto.json`.
2. Controllo visivo in Blender o nell'anteprima, con immagini salvate in `dati-sorgente/z-anatomy/controllo/` come per i polmoni:
   - viso di fronte e di lato con lo strato Ossa visibile: i muscoli mimici e masticatori poggiano sul cranio senza staccarsene né attraversarlo;
   - tronco dietro (gran dorsale sopra trapezio e dentati);
   - addome di fronte (retto e obliqui senza compenetrazioni con l'obliquo esterno di BodyParts3D);
   - mano e piede.
3. `npm test`, `npm run build`, `npm run controlla`, `npx playwright test`.
4. Approvazione dell'aspetto da parte tua prima di registrare D35.

## 7. Decisioni da prendere

1. **Elenco** (§ 3): va bene così, o aggiungo o tolgo qualcosa? Per esempio i rotatori o il lungo del collo destro, che in BodyParts3D c'è solo a sinistra.
2. **Peso** (§ 5): tetto di 2000 triangoli (circa 1650 kB), di 1000 (circa 1450 kB) o file a parte?
3. **Soglia** di accettazione: 3 mm, come per tiroide e polmoni, misurata sulle aree d'inserzione.

## 8. Esito (2026-10-26)

- **Elenco:** 37 muscoli invece di 40. Quadrato della pianta e interossei dorsali e palmari della mano sono già in BodyParts3D, con altri nomi ("flexor accessorius", "Set of … interossei of … hand"): nella prima verifica il controllo per nome li aveva persi. Gli interossei e i lombricali della mano non erano nel modello perché BodyParts3D li classifica come "musculature", ora compresa in `prepara-modelli.mjs` insieme agli altri gruppi (18 elementi).
- **Metodo:** la trasformazione rigida per muscolo non bastava ai muscoli fra torace e bacino. Lo script usa una deformazione a zone (descritta nell’intestazione di `pipeline/esporta-muscoli.py`) e misura lo scarto aggiunto dall'allineamento, non quello assoluto.
- **Controllo:** passano 69 mesh su 74. Le 5 oltre soglia sono eccezioni accettate dall'utente, dichiarate nello script con il loro scarto (obliquo interno 4,94 e 3,70 mm, piramidale 4,86 e 4,04, gran dorsale sinistro 3,26).
- **Peso:** `muscoli.glb` 1614 kB.
- **Pagina Informazioni:** aggiornata con il testo approvato dall'utente.
- **Ancora da fare:** registrazione di una decisione D35 dopo l'approvazione dell'aspetto nel sito.
