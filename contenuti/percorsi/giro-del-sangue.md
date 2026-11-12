---
id: giro-del-sangue
titolo: Il giro del sangue
descrizione: >
  Dalle vene cave ai polmoni, dall'aorta a un rene e ritorno: il viaggio di una goccia di
  sangue attraverso i due circuiti che partono dal cuore e vi ritornano.
# Per ogni passo: strato mostrato, strutture evidenziate (gruppi di organi o FMA dei vasi; quelle di
# un altro strato si aggiungono da sole), inquadratura se diversa dalle evidenziate, e schema 2D.
# Vene cave superiore FMA4720 e inferiore FMA10951; tronco polmonare FMA8612; arterie polmonari
# destra FMA50872 e sinistra FMA50873; vene polmonari FMA49914, FMA49911, FMA49916, FMA49913; aorta
# ascendente FMA3736, arco FMA3768, toracica FMA87217, addominale FMA3789; arterie renali FMA14752,
# FMA14753, FMA66364, FMA66363; vene renali destra FMA14335 e sinistra FMA14336; coronarie destra
# FMA3802 e sinistra FMA3855; seno coronarico FMA4706.
passi:
  - { strato: vasi, evidenzia: { gruppi: [cuore], fma: [FMA4720, FMA10951, FMA8612, FMA50872, FMA50873, FMA49914, FMA49911, FMA49916, FMA49913, FMA3736, FMA3768, FMA87217, FMA3789] }, schema: circuiti }
  - { strato: vasi, evidenzia: { gruppi: [cuore], fma: [FMA4720, FMA10951] }, schema: vene-cave }
  - { strato: vasi, evidenzia: { gruppi: [cuore], fma: [FMA8612, FMA50872, FMA50873] }, schema: cuore-destro }
  - { strato: vasi, evidenzia: { gruppi: [polmoni], fma: [FMA50872, FMA50873] }, schema: alveolo }
  - { strato: vasi, evidenzia: { gruppi: [cuore], fma: [FMA49914, FMA49911, FMA49916, FMA49913] }, schema: cuore-sinistro }
  - { strato: vasi, evidenzia: { fma: [FMA3736, FMA3768, FMA87217, FMA3789] }, schema: aorta }
  - { strato: vasi, evidenzia: { gruppi: [reni], fma: [FMA3789, FMA14752, FMA14753, FMA66364, FMA66363, FMA14335, FMA14336, FMA10951] }, schema: rene }
  - { strato: vasi, evidenzia: { gruppi: [cuore], fma: [FMA3802, FMA3855, FMA4706] }, schema: coronarie }
limiti: >
  Il corpo 3D resta fermo: il percorso del sangue è mostrato solo negli schemi, che sono
  semplificati e non in scala. Nel modello il cuore è evidenziato tutto insieme: le sue cavità
  e le valvole si vedono solo nello schema. Capillari, arteriole e venule sono microscopici e
  non sono nel modello. Un solo organo, il rene, fa da esempio per tutti i tessuti del corpo,
  che il circolo sistemico raggiunge con molte altre arterie. Nel modello e negli schemi rosso
  indica il sangue ricco di ossigeno e blu quello povero: è una convenzione, e nel circolo
  polmonare i colori di arterie e vene si invertono.
stato: approvato
revisione: 2026-11-12
---

## Due circuiti

I vasi sanguigni formano due sistemi chiusi di tubi che iniziano e finiscono nel cuore [@seer-vasi-classificazione]. Il [[circolo polmonare|circolo-polmonare]] porta il sangue povero di ossigeno dal ventricolo destro ai polmoni e riporta il sangue ricco di ossigeno all'atrio sinistro. Il [[circolo sistemico|circolo-sistemico]] porta il sangue dal ventricolo sinistro a tutti i tessuti e lo riporta all'atrio destro [@seer-vie-circolatorie].

Il cuore ha quattro cavità: due [[atri|atrio]] in alto e due [[ventricoli|ventricolo]] in basso [@nhlbi-cuore-anatomia]. Il lato destro spinge il sangue verso i polmoni, il lato sinistro verso tutto il resto del corpo. Le [[arterie|arteria]] portano il sangue lontano dal cuore, le [[vene|vena]] lo riportano al cuore [@nhlbi-cuore-flusso].

Nel corpo 3D sono evidenziati il cuore e i grandi vasi dei due circuiti. Il rosso indica il sangue ricco di ossigeno e il blu quello povero [@seer-vasi-classificazione].

## Il ritorno al cuore

Seguiamo una goccia di sangue che ha appena attraversato i tessuti del corpo. Ha ceduto ossigeno e ha raccolto anidride carbonica, che porterà ai polmoni [@openstax-ap-20-5].

Torna al cuore con una delle due grandi vene, la vena cava superiore o la vena cava inferiore, ed entra nell'atrio destro [@nhlbi-cuore-flusso]. La vena cava superiore raccoglie il sangue di quasi tutto il corpo sopra il diaframma: testa, collo, torace, spalle e braccia. La vena cava inferiore raccoglie quello che arriva da sotto il diaframma: addome, bacino e gambe [@openstax-ap-20-5] [@seer-vie-circolatorie].

Lungo la strada il sangue passa da vene sempre più grandi. Quelle medie e grandi hanno [[valvole|valvola-venosa]] che lo fanno avanzare verso il cuore, soprattutto in braccia e gambe, dove deve salire contro la gravità [@seer-vasi-classificazione].

## Verso i polmoni

Dall'atrio destro il sangue passa nel ventricolo destro attraverso la valvola tricuspide [@nhlbi-cuore-flusso]. Le [[valvole|valvola]] del cuore si aprono per far uscire il sangue da una cavità e si chiudono per impedire che torni indietro [@nhlbi-cuore-flusso].

Il ventricolo destro spinge il sangue nel tronco polmonare, il solo vaso che ne esce, attraverso la valvola polmonare che si trova alla sua base [@openstax-ap-20-5]. Il tronco si divide subito nelle arterie polmonari destra e sinistra, una per polmone [@openstax-ap-20-5].

Le [[arterie polmonari|arteria-polmonare]] sono un'eccezione: come tutte le arterie portano il sangue lontano dal cuore, ma il loro sangue è povero di ossigeno [@seer-vasi-classificazione]. Per questo nel corpo 3D sono blu.

## Nei polmoni

Dentro i polmoni le arterie polmonari si ramificano più volte, fino ai [[capillari|capillare]] che avvolgono gli [[alveoli|alveolo]] [@openstax-ap-20-5]. I capillari sono i vasi più piccoli e più numerosi, e collegano le arterie alle vene [@seer-vasi-classificazione].

Qui l'anidride carbonica passa dal sangue all'aria degli alveoli e, nello stesso momento, l'ossigeno passa dall'aria al sangue [@nhlbi-polmoni-sistema]. I gas attraversano la sottile parete dell'alveolo e del capillare per semplice [[diffusione]] [@openstax-ap-22-1]. Lo scambio è raccontato più da vicino nel percorso "Un respiro".

## Di nuovo al cuore

Il sangue, ora ricco di ossigeno, lascia i capillari dei polmoni e torna al cuore con quattro [[vene polmonari|vene-polmonari]], due per lato, che sboccano nell'atrio sinistro [@openstax-ap-20-5]. Così si chiude il circolo polmonare [@seer-vie-circolatorie].

Anche le vene polmonari sono un'eccezione: portano sangue ricco di ossigeno, appena ossigenato nei polmoni [@seer-vasi-classificazione]. Per questo nel corpo 3D sono rosse.

Dall'atrio sinistro il sangue passa nel ventricolo sinistro attraverso la valvola mitrale [@nhlbi-cuore-flusso].

## La grande arteria

Il ventricolo sinistro produce la pressione alta che serve a spingere il sangue in tutto il corpo [@nhlbi-cuore-flusso]. Lo spinge nell'[[aorta]], l'arteria più grande del corpo. Alla sua base la valvola aortica impedisce che il sangue torni nel ventricolo [@openstax-ap-20-5].

L'aorta sale per circa 5 cm, poi piega verso sinistra nell'arco aortico [@openstax-ap-20-5]. Dall'arco partono tre grandi rami, il tronco brachiocefalico, la carotide comune sinistra e la succlavia sinistra, che portano il sangue alla testa e alle braccia [@seer-vie-circolatorie].

Poi l'aorta scende nel torace come aorta toracica e, sotto il diaframma, nell'addome come aorta addominale. All'altezza della quarta vertebra lombare si divide nelle due arterie iliache comuni [@openstax-ap-20-5], i cui rami portano il sangue al bacino e alle gambe [@seer-vie-circolatorie]. Con i suoi rami l'aorta raggiunge quasi ogni organo [@openstax-ap-20-5].

## Al rene e ritorno

Seguiamo la goccia verso un organo, il rene. Dall'aorta addominale nasce l'arteria renale, che porta il sangue al rene e dentro si ramifica più volte [@openstax-ap-20-5]. Le arterie diventano sempre più piccole, fino alle [[arteriole|arteriola]], che regolano quanto sangue entra nei capillari [@seer-vasi-classificazione].

Nei capillari dei tessuti il sangue cede alle cellule ossigeno e sostanze nutritive e raccoglie anidride carbonica e scorie [@seer-vie-circolatorie]. Nel rene i capillari dei glomeruli fanno anche un altro lavoro: filtrano il sangue, ed è da qui che comincia a formarsi l'urina [@niddk-reni].

Dai capillari il sangue passa nelle [[venule|venula]] e poi in vene sempre più grandi [@seer-vasi-classificazione]. La vena renale lo porta alla vena cava inferiore [@openstax-ap-25-3], che lo riporta all'atrio destro: il giro è completo, e ricomincia [@seer-vie-circolatorie].

## Il cuore nutre se stesso

Anche il muscolo del cuore ha bisogno di sangue: lo ricevono le arterie coronarie, che nascono dall'aorta [@nhlbi-cuore-flusso]. La coronaria destra e la sinistra sono i primi rami dell'aorta ascendente e nascono appena sopra la valvola aortica [@openstax-ap-20-5].

Le due coronarie circondano il cuore come un anello e si dividono nei rami che portano il sangue ai suoi tessuti [@openstax-ap-20-5].

Le vene del cuore riportano il sangue povero di ossigeno all'atrio destro [@nhlbi-cuore-flusso]. La maggior parte arriva prima al seno coronarico, che lo versa direttamente nell'atrio destro [@openstax-ap-20-5].
