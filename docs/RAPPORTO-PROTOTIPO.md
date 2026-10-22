# Rapporto del prototipo P1 — Esplora e scheda

Data: 2026-10-22 · Perimetro approvato: D12 · Cartella: `prototipo/`

## Cosa è stato realizzato

- **Pipeline dei modelli** (`prototipo/scripts/prepara-modelli.mjs`): legge gli OBJ di BodyParts3D, classifica le strutture in ossa (217, comprese le cartilagini costali), muscoli (323), organi (266 elementi in 14 organi) e pelle, converte le coordinate, semplifica e comprime in glTF (meshopt). Due livelli di dettaglio: 10% e 25% dei vertici.
- **Scena 3D**: tre strati (muscoli; scheletro e organi; scheletro), sagoma della pelle attivabile, illuminazione da "sala" (D10).
- **Selezione**: passaggio del mouse con evidenziazione, clic con volo della telecamera, isolamento della struttura (le altre al 13% di opacità). Gli organi si selezionano interi; ossa e muscoli singolarmente.
- **Cartellino** in stile C, con testo di prova dichiarato, "Fa parte di", "Collegato a" (in preparazione), "Apri la scheda" per il cuore.
- **Scheda del cuore**: il cartellino si allarga a metà schermo, l'organo si sposta nella metà libera della scena, sezioni di D11 solo impaginate, riquadro per la futura animazione.
- **Indirizzi**: `/esplora/<id>` e `/organo/cuore`, apribili direttamente; indietro e avanti del browser funzionano.
- **Tastiera**: frecce (rotazione), + e − (zoom), 1–3 (strati), 0 (vista iniziale), Esc (chiude scheda, poi cartellino). Annuncio della selezione per screen reader.
- **Smartphone**: cartellino come foglio dal basso con la struttura spostata nella metà superiore, comandi abbreviati, scheda a tutto schermo.
- **Pannello misure**: `?misure=1`; varianti confrontabili con `?dettaglio=10|25` e `?modo=unito|separato`.

## Misure

| Variante | Modelli scaricati | Triangoli disegnati | Chiamate di disegno | Interattivo dopo* |
|---|---|---|---|---|
| 10% · unito | 2.133 kB | 184.046 | 3 | 1,2 s |
| 10% · separato | 2.133 kB | 184.046 | 484 | 1,2 s |
| 25% · unito | 3.807 kB | 355.844 | 3 | 1,2 s |
| 25% · separato | 3.807 kB | 355.844 | 484 | 1,3 s |

\* Build di produzione servita in locale, senza latenza di rete. Il codice JavaScript pesa 350 kB compresso; con una connessione domestica da 20 Mbit/s il download totale (circa 2,6 MB nella variante 10%) aggiunge circa 1 s di trasferimento, valore stimato e non misurato.

- **Latenza della selezione** (dal rilascio del clic al fotogramma con il cartellino): 26–30 ms. La primissima selezione della sessione ha richiesto 205 ms per la compilazione dello shader delle strutture attenuate.
- **Fotogrammi al secondo** (misurati il 2026-10-22 con il pannello del browser visibile, build di produzione, sul Mac dell'utente; 3 s per situazione; lo schermo aggiorna a circa 75 Hz, quindi 75 fps è il massimo raggiungibile):

| Variante | Corpo fermo | Rotazione continua | Cuore selezionato e rotazione |
|---|---|---|---|
| 10% · unito | 75 fps (95° percentile 14,3 ms) | 75 fps (14,3 ms) | 75 fps (14,3 ms) |
| 10% · separato | 75 fps (14,3 ms) | 74 fps (un fotogramma da 27,6 ms) | 75 fps (14,3 ms)** |
| 25% · unito | 69 fps (14,3 ms; picchi fino a 133 ms) | 69 fps (picchi fino a 147 ms) | 70 fps (picchi fino a 147 ms) |
| 25% · separato | non misurato | non misurato | non misurato |

\*\* Per questa variante non è confermato che la selezione fosse attiva durante la misura.

La variante 25% separato non è stata misurata perché il pannello del browser è tornato nascosto durante la prova. I picchi della variante 25% potrebbero dipendere dal cambio di scheda avvenuto durante la misura: vanno ripetuti prima di trarne conclusioni. Il Mac usato non è un "computer medio" e su uno smartphone vero le prestazioni non sono state misurate.

## Criteri di accettazione (D12)

| Criterio | Esito |
|---|---|
| Interattivo in meno di 5 s | ✅ 1,2 s in locale; stimato circa 2,5 s su rete domestica |
| ≥ 50–60 fps su desktop | ✅ 75 fps (massimo dello schermo) nella variante consigliata 10% unito, su questo Mac; da ripetere su un computer meno potente |
| Cartellino in meno di 100 ms | ✅ 26–30 ms (205 ms solo alla prima selezione) |
| Tre strati funzionanti | ✅ Verificato |
| Scheda che conserva la vista | ✅ Verificato: la telecamera mantiene il bersaglio e si sposta solo lateralmente |
| Tastiera | ✅ Esc, 1–3 e 0 verificati; frecce e zoom solo nel codice |
| Movimento ridotto | ⚠️ Implementato (voli istantanei, transizioni CSS annullate), non verificato con l'impostazione di sistema attiva |
| Rapporto delle misure | ✅ Questo documento; mobile solo in emulazione, senza misure di prestazione |

## Indicazioni per le scelte tecniche (Fase 5)

- **Geometria unita per strato**: 3 chiamate di disegno contro 484, con la stessa selezione precisa (selezione via GPU). Consigliata.
- **Dettaglio**: il 10% pesa la metà del 25% e a distanza normale la differenza non si nota; da valutare visivamente da vicino (`?dettaglio=25`).

## Problemi aperti

1. **Polmoni assenti**: il torace appare vuoto. Servono Blender e Z-Anatomy.
2. **Nomi di ossa e muscoli in inglese** (FMA): la traduzione arriverà con i contenuti.
3. **Prima selezione lenta** (205 ms): si risolve precompilando gli shader al caricamento.
4. **JavaScript da 1,27 MB (350 kB compresso)**: da ridurre con la suddivisione del codice in Fase 5.
5. **Esc dalla scheda** aggiunge una voce alla cronologia invece di tornare indietro.
6. **Hover solo con il mouse**: su touch c'è solo il tocco per selezionare, come previsto.
7. **Nel prototipo i dati BodyParts3D sono letti da una cartella temporanea**: andranno archiviati in modo stabile (vedi Fase 5).
