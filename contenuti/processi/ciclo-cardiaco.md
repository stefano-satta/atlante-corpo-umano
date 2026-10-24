---
id: ciclo-cardiaco
struttura: cuore
titolo: Il ciclo cardiaco, passo per passo
# Stato del disegno in ogni passo. av = valvole tra atri e ventricoli (tricuspide e mitrale);
# semilunari = valvole polmonare e aortica. I tempi dell'animazione non sono in scala.
passi:
  - { atri: rilassati, ventricoli: rilassati, av: aperte, semilunari: chiuse, segnale: nessuno, tono: nessuno, flussi: [vene-atri, atri-ventricoli] }
  - { atri: rilassati, ventricoli: rilassati, av: aperte, semilunari: chiuse, segnale: senoatriale, tono: nessuno, flussi: [vene-atri, atri-ventricoli] }
  - { atri: contratti, ventricoli: rilassati, av: aperte, semilunari: chiuse, segnale: atrioventricolare, tono: nessuno, flussi: [atri-ventricoli] }
  - { atri: rilassati, ventricoli: contratti, av: chiuse, semilunari: aperte, segnale: ventricoli, tono: primo, flussi: [ventricoli-arterie] }
  - { atri: rilassati, ventricoli: rilassati, av: chiuse, semilunari: chiuse, segnale: nessuno, tono: secondo, flussi: [vene-atri] }
stato: approvato
revisione: 2026-10-24
---

## Le cavità si riempiono

Nella [[diastole]] il cuore è rilassato e le sue cavità si riempiono [@openstax-ap-19-3]. Il sangue povero di ossigeno arriva all'atrio destro dalle vene cave, quello ricco di ossigeno arriva all'atrio sinistro dalle vene polmonari [@nhlbi-cuore-flusso]. La pressione nei ventricoli è più bassa che negli atri: le valvole tra atri e ventricoli si aprono e il sangue scende nei ventricoli [@openstax-ap-19-3].

## Parte il segnale

Ogni battito comincia con un segnale elettrico prodotto da un gruppo di cellule nel [[nodo senoatriale|nodo-senoatriale]], nell'atrio destro [@nhlbi-cuore-battito].

## Si contraggono gli atri

Il segnale fa contrarre gli atri [@nhlbi-cuore-battito], che spingono nei ventricoli l'ultima parte del sangue [@openstax-ap-19-3]. Raggiunto il [[nodo atrioventricolare|nodo-atrioventricolare]], il segnale rallenta leggermente, e i ventricoli hanno il tempo di finire di riempirsi [@nhlbi-cuore-battito].

## Si contraggono i ventricoli

Poi si contraggono i ventricoli [@nhlbi-cuore-battito], mentre gli atri si rilassano [@openstax-ap-19-3]. Le valvole tra atri e ventricoli si chiudono: è il primo tono del battito [@openstax-ap-19-3]. La pressione apre le valvole polmonare e aortica [@openstax-ap-19-3], e il sangue esce: dal ventricolo destro verso i polmoni, dal ventricolo sinistro nell'aorta [@nhlbi-cuore-flusso].

## I ventricoli si rilassano

Quando i ventricoli si rilassano, la pressione al loro interno scende sotto quella delle grandi arterie: le valvole aortica e polmonare si chiudono e impediscono al sangue di tornare indietro. È il secondo tono del battito [@openstax-ap-19-3].
