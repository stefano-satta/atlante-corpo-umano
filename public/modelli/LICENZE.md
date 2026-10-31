# Licenze dei modelli 3D

I file di questa cartella (`ossa.glb`, `muscoli.glb`, `organi.glb`, `pelle.glb`, `organi-donna.glb`, `strutture.json`) sono **derivati da BodyParts3D**, semplificati e compressi con `pipeline/prepara-modelli.mjs`. I polmoni, la tiroide, le paratiroidi e le parotidi, contenuti in `organi.glb`, e 37 muscoli di `muscoli.glb` sono **derivati da Z-Anatomy**. Gli organi femminili, in `organi-donna.glb`, sono **derivati dallo Human Reference Atlas**, tranne la vagina, che è una ricostruzione schematica generata da `pipeline/organi-donna.mjs`.

## Fonte

**BodyParts3D**, © The Database Center for Life Science (DBCLS), release 4.0.
Archivio ufficiale: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/

- La pagina di licenza ufficiale (aggiornata al 27 febbraio 2025) indica la licenza **Creative Commons Attribution 4.0 International (CC BY 4.0)**: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html
- Le intestazioni dei singoli file OBJ riportano ancora la licenza precedente, **CC BY-SA 2.1 Japan**.

Attribuzione richiesta dal licenziante:

> BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International

**Z-Anatomy**, The libre 3D atlas of anatomy (Gauthier Kervyn e altri autori), solo per i cinque lobi dei polmoni, la tiroide, le quattro paratiroidi, le due parotidi e 37 muscoli (destro e sinistro: muscoli mimici e masticatori, gran dorsale, retto, piramidale, obliquo interno e trasverso dell'addome, quadrato dei lombi, multifido, estensore breve delle dita, interossei dorsali del piede), che BodyParts3D non contiene.
Repository ufficiale: https://github.com/Z-Anatomy/Models-of-human-anatomy (pacchetto `Z-Anatomy.zip`, impronta git f43cabc6f366b2a6058dd2ed4a2b3c7b9b2492cb).

- Licenza: **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**.
- Attribuzione richiesta: "Z-Anatomy - The libre 3D atlas of anatomy - CC-BY-SA 4.0". Z-Anatomy è a sua volta derivato da BodyParts3D.
- Il pacchetto contiene anche modelli di terzi con licenza NonCommercial (orecchio interno, rene), che non sono usati.

**Human Reference Atlas (HRA)**, 3D Reference Object Library (HuBMAP, Cyberinfrastructure for Network Science Center, Indiana University), solo per utero, tube uterine, ovaie e mammelle, che BodyParts3D non contiene. I modelli derivano dal Visible Human Project femminile della National Library of Medicine.
Pagina ufficiale: https://humanatlas.io/3d-reference-library (file da https://cdn.humanatlas.io/digital-objects/ref-organ/, versioni e impronte in `pipeline/organi-donna.mjs`).

- Licenza: **Creative Commons Attribution 4.0 International (CC BY 4.0)**.
- Citazione indicata dall'HRA: Browne, Kristen, Leonard E. Cross, Bruce W. Herr II, Elizabeth G. Record, Ellen M. Quardokus, Andreas Bueckle e Katy Börner. 2021. HuBMAP CCF 3D Reference Object Library; Schlehlein, Heidi, Bruce W. Herr II, Ellen M. Quardokus, Andreas Bueckle e Katy Börner. 2022. HuBMAP CCF 3D Reference Object Library.
- Pelvi, sterno e manubrio femminili dell'HRA servono solo all'allineamento e non sono distribuiti.

## Licenza dei file derivati

Per rispettare entrambe le indicazioni (D6, nota della verifica del 2026-10-22), i modelli derivati in questa cartella sono distribuiti con licenza **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**: https://creativecommons.org/licenses/by-sa/4.0/

Modifiche apportate: conversione delle coordinate (da millimetri a metri, asse verticale Y), raggruppamento degli elementi per strato e per organo, semplificazione al 10% dei vertici, compressione meshopt. Per polmoni, tiroide, paratiroidi e parotidi: esportazione da Blender con `pipeline/esporta-polmoni.py`, `pipeline/esporta-tiroide.py` e `pipeline/esporta-parotidi.py`, allineamento al corpo di BodyParts3D (scala, rotazione e traslazione stimate su strutture comuni ai due modelli: del torace per i polmoni, del collo per tiroide e paratiroidi, di mandibola e ghiandole sottomandibolari per le parotidi), semplificazione al 30% (le paratiroidi, di 128 triangoli, non sono semplificate). Per gli organi femminili: allineamento al corpo di BodyParts3D (similitudine stimata fra le pelvi dei due modelli; per le mammelle traslazione stimata fra gli sterni), scelta delle parti che formano la superficie degli organi, semplificazione a 3.000 triangoli per organo. Per i muscoli di Z-Anatomy: esportazione da Blender con `pipeline/esporta-muscoli.py` e allineamento al corpo di BodyParts3D con una deformazione morbida (per ogni zona del muscolo una trasformazione rigida stimata sulle strutture vicine e sulle ossa d'inserzione, mediate in base alla distanza), semplificazione a 2.000 triangoli per muscolo.

La licenza riguarda solo i modelli 3D, non il codice del sito.
