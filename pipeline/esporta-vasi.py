# Esporta da Startup.blend di Z-Anatomy i vasi che BodyParts3D non contiene (D44) e li allinea al suo corpo.
# BodyParts3D interrompe carotide comune e giugulare interna a metà del collo e non ha carotide esterna,
# vasi del viso, seni venosi del cranio e arteria fibulare.
#
# Uso: npm run modelli:vasi (dopo npm run modelli:scarica e npm run modelli:prepara), oppure
#   blender -b -Y dati-sorgente/z-anatomy/Z-Anatomy/Startup.blend --python pipeline/esporta-vasi.py -- \
#     --bp3d dati-sorgente/bodyparts3d/isa_BP3D_4.0_obj_99 --out dati-sorgente/z-anatomy/vasi
# -Y impedisce a Blender di eseguire gli script contenuti nel file.
#
# In Z-Anatomy i vasi sono curve ridisegnate, che non coincidono con i tubi di BodyParts3D (le arterie
# polmonari distano fino a 10 cm): si esporta quindi solo l'elenco MANCANTI, scritto a mano, e non si mescolano i
# due modelli sullo stesso tratto. to_mesh converte le curve in tubi. L'allineamento è un campo di spostamenti:
# ogni osso e muscolo presente nei due modelli, allineato da solo con ICP come in esporta-muscoli.py, dà lo
# spostamento dei suoi punti, e ogni vertice usa la media dei punti più vicini, pesata sulla distanza.
#
# Nei tessuti molli i percorsi dei due modelli differiscono (la carotide comune di 12–17 mm), e un vaso spostato
# non si raccorderebbe. I vasi di BodyParts3D accanto a quelli esportati (ANCORE) entrano quindi nel campo:
# ogni loro punto porta sul posto il punto più vicino dell'omonimo di Z-Anatomy, e con lui i rami che ne
# partono. Il rapporto conserva lo scarto prima delle ancore; il controllo misura i RACCORDI, cioè la distanza
# minima fra ogni vaso esportato e il vaso da cui parte. La distanza si misura dai punti di BodyParts3D, che
# ha tratti più corti (la giugulare si ferma a metà del collo).
#
# Licenza dei dati: Z-Anatomy, CC BY-SA 4.0 (derivato da BodyParts3D, DBCLS). Nessuno di questi vasi è fra
# i modelli di terzi con licenza NonCommercial contenuti nel file (orecchio interno, rene).

import json
import os
import re
import sys

import bpy
import numpy as np
from mathutils.kdtree import KDTree

# Vasi assenti da BodyParts3D, con il nome dell'oggetto di Z-Anatomy senza il suffisso del lato. La carotide
# comune, la carotide interna e la giugulare interna ci sono ma con un vuoto a metà del collo: quelle di
# Z-Anatomy lo chiudono.
MANCANTI = [
    # Collo
    'Common carotid artery',
    'Internal carotid artery',
    'Internal jugular vein',
    'External carotid artery',
    'Ascending pharyngeal artery',
    'External jugular vein',
    'Anterior jugular vein',
    'Vertebral vein',
    'Superior thyroid vein',
    # Viso e cranio, arterie
    'Facial artery',
    'Angular artery',
    'Submental artery',
    'Superior labial artery',
    'Inferior labial artery',
    'Occipital artery',
    'Superficial temporal artery',
    'Frontal branch of superficial temporal artery',
    'Transverse facial artery',
    'Maxillary artery',
    'Middle meningeal artery',
    'Accessory branch of middle meningeal artery',
    'Inferior alveolar artery',
    'Mental branch of inferior alveolar artery',
    'Mylohyoid branch of inferior alveolar artery',
    'Buccal artery',
    'Anterior deep temporal artery',
    'Posterior deep temporal artery',
    'Posterior superior alveolar artery',
    'Infra-orbital artery',
    'Descending palatine artery',
    'Greater palatine artery',
    'Artery of pterygoid canal',
    'Supra-orbital artery',
    'Supratrochlear artery',
    'Lacrimal artery',
    'Anterior ethmoidal artery',
    'Posterior ethmoidal artery',
    'Central retinal artery',
    # Viso e cranio, vene
    'Facial vein',
    'Common facial vein',
    'Angular vein',
    'Submental vein',
    'Superior labial vein',
    'Inferior labial veins',
    'Lingual vein',
    'Retromandibular vein',
    'Anterior division of retromandibular vein',
    'Posterior division of retromandibular vein',
    'Superficial temporal veins',
    'Maxillary veins',
    'Occipital vein',
    'Posterior auricular vein',
    'Superior ophthalmic vein',
    'Inferior ophthalmic vein',
    # Seni venosi del cranio
    'Superior sagittal sinus',
    'Inferior sagittal sinus',
    'Straight sinus',
    'Occipital sinus',
    'Transverse sinus',
    'Sigmoid sinus',
    'Cavernous sinus',
    'Superior petrosal sinus',
    'Inferior petrosal sinus',
    'Anterior intercavernous sinus',
    'Posterior intercavernous sinus',
    'Basilar venous plexus',
    # Arti
    'Fibular artery',
    'Calcaneal branches of fibular artery',
    'Deep femoral artery',
    'Medial circumflex femoral artery',
    # Bacino
    'Superior gluteal artery',
    'Inferior gluteal artery',
    'Internal pudendal artery',
    'Anterior division of internal iliac artery',
    'Iliolumbar artery',
    'Median sacral artery',
]
# Vasi di BodyParts3D che agganciano quelli esportati, con un omonimo in Z-Anatomy.
ANCORE = [
    f'{lato} {vaso}'
    for lato in ('Right', 'Left')
    for vaso in (
        'internal carotid artery',
        'vertebral artery',
        'common carotid artery',
        'internal jugular vein',
        'ophthalmic artery',
        'posterior tibial artery',
        'femoral artery',
        'internal iliac artery',
    )
] + ['Abdominal aorta']
# Raccordi da controllare, senza lato: vaso esportato e vaso da cui parte. Il secondo è di BodyParts3D, oppure
# di Z-Anatomy se è esportato anch'esso e BodyParts3D non lo raggiunge.
RACCORDI = [
    ('common carotid artery', 'common carotid artery', 'bp3d'),
    ('internal carotid artery', 'internal carotid artery', 'bp3d'),
    ('internal carotid artery', 'common carotid artery', 'za'),
    ('external carotid artery', 'common carotid artery', 'za'),
    ('internal jugular vein', 'internal jugular vein', 'bp3d'),
    ('fibular artery', 'posterior tibial artery', 'bp3d'),
    ('deep femoral artery', 'femoral artery', 'bp3d'),
    ('superior gluteal artery', 'internal iliac artery', 'bp3d'),
    ('inferior gluteal artery', 'internal iliac artery', 'bp3d'),
    ('internal pudendal artery', 'internal iliac artery', 'bp3d'),
    ('anterior division of internal iliac artery', 'internal iliac artery', 'bp3d'),
]
CAMPIONE = 300
# Una struttura fa da riferimento solo se, allineata da sola, combacia entro questo scarto (mm).
RIFERIMENTO_MASSIMO_MM = 3.0
# Soglia oltre la quale un raccordo non è accettato, in mm.
SCARTO_MASSIMO_MM = 3.0
VICINI = 12
# Distanza (m) sotto la quale i punti pesano quasi allo stesso modo.
MORBIDEZZA = 0.005
VENA = re.compile(r'\b(veins?|sinus|venous)\b', re.I)
LATI = {'.r': 'Right', '.l': 'Left'}

argomenti = sys.argv[sys.argv.index('--') + 1 :] if '--' in sys.argv else []


def arg(nome, predefinito):
    return argomenti[argomenti.index(f'--{nome}') + 1] if f'--{nome}' in argomenti else predefinito


cartella_bp3d = arg('bp3d', 'dati-sorgente/bodyparts3d/isa_BP3D_4.0_obj_99')
file_strutture = arg('strutture', 'public/modelli/strutture.json')
uscita = arg('out', 'dati-sorgente/z-anatomy/vasi')
os.makedirs(uscita, exist_ok=True)
for vecchio in os.listdir(uscita):
    if vecchio.endswith('.obj'):
        os.remove(os.path.join(uscita, vecchio))
grafo = bpy.context.evaluated_depsgraph_get()
casuale = np.random.default_rng(0)


def mesh_mondo(ob):
    """Vertici in coordinate del mondo (metri, modificatori e spessore delle curve applicati) e triangoli."""
    valutato = ob.evaluated_get(grafo)
    mesh = valutato.to_mesh()
    mesh.calc_loop_triangles()
    m = np.array(ob.matrix_world)
    v = np.array([list(x.co) for x in mesh.vertices]).reshape(-1, 3) @ m[:3, :3].T + m[:3, 3]
    t = [list(x.vertices) for x in mesh.loop_triangles]
    # Gli oggetti specchiati (scala negativa) invertono il verso delle facce.
    if np.linalg.det(m[:3, :3]) < 0:
        t = [[a, c, b] for a, b, c in t]
    valutato.to_mesh_clear()
    return v, t


def vertici_obj(file):
    with open(file) as f:
        return np.array([[float(x) for x in r.split()[1:4]] for r in f if r.startswith('v ')]) / 1000


def albero(punti):
    k = KDTree(len(punti))
    for i, p in enumerate(punti):
        k.insert(p, i)
    k.balance()
    return k


def campione(p, quanti=CAMPIONE):
    return p[casuale.choice(len(p), min(quanti, len(p)), replace=False)]


def oggetto_za(nome_bp3d):
    """Oggetto di Z-Anatomy con lo stesso nome di una struttura di BodyParts3D ("Right X" → "X.r")."""
    if bpy.data.objects.get(nome_bp3d):
        return bpy.data.objects[nome_bp3d]
    m = re.match(r'(Right|Left) (.+)', nome_bp3d)
    base, lato = (m.group(2), '.r' if m.group(1) == 'Right' else '.l') if m else (nome_bp3d, '')
    base = base[0].upper() + base[1:]
    for nome in (base + lato, base + ' muscle' + lato, base + ' bone' + lato):
        if bpy.data.objects.get(nome):
            return bpy.data.objects[nome]
    return None


def nome_inglese(nome):
    """Nome nello stile di BodyParts3D: "Fibular artery.l" → "Left fibular artery"."""
    nome = nome.strip("' ")
    lato = LATI.get(nome[-2:])
    return f'{lato} {nome[0].lower()}{nome[1:-2]}' if lato else nome


def stima(p, q, k, partenza):
    """Trasformazione rigida con ICP (metodo di Kabsch)."""
    R, t = partenza
    for _ in range(25):
        Q = q[[k.find(x)[1] for x in p @ R.T + t]]
        mp, mq = p.mean(0), Q.mean(0)
        U, _, Vt = np.linalg.svd((Q - mq).T @ (p - mp) / len(p))
        D = np.eye(3)
        D[2, 2] = np.sign(np.linalg.det(U @ Vt))
        R = U @ D @ Vt
        t = mq - R @ mp
    return R, t


# Ossa e muscoli presenti nei due modelli.
with open(file_strutture) as f:
    elementi = json.load(f)
per_nome = {x['nome']: x for x in elementi if x['id'].startswith('FJ')}
coppie = []
for x in elementi:
    if x['strato'] not in ('ossa', 'muscoli') or not x['id'].startswith('FJ'):
        continue
    ob = oggetto_za(x['nome'])
    if not ob or ob.type != 'MESH' or len(ob.data.vertices) < 30:
        continue
    q = vertici_obj(os.path.join(cartella_bp3d, x['id'] + '.obj'))
    coppie.append({'nome': x['nome'], 'strato': x['strato'], 'p': campione(mesh_mondo(ob)[0]), 'q': q, 'k': albero(q)})

# Punto di partenza comune: le ossa insieme.
ossa = [c for c in coppie if c['strato'] == 'ossa']
P, Q = np.vstack([c['p'] for c in ossa]), np.vstack([c['q'] for c in ossa])
partenza = stima(P, Q, albero(Q), (np.eye(3), Q.mean(0) - P.mean(0)))

punti, spostamenti = [], []
scartati = 0
for c in coppie:
    R, t = stima(c['p'], c['q'], c['k'], partenza)
    mappati = c['p'] @ R.T + t
    if np.mean([c['k'].find(x)[2] for x in mappati]) * 1000 > RIFERIMENTO_MASSIMO_MM:
        scartati += 1
        continue
    punti.append(c['p'])
    spostamenti.append(mappati - c['p'])
campo = albero(np.vstack(punti))
insieme_punti, insieme_spostamenti = np.vstack(punti), np.vstack(spostamenti)


def deforma(v):
    """Applica il campo di spostamenti: media dei punti più vicini, pesata sulla distanza."""
    allineati = np.empty_like(v)
    for i, x in enumerate(v):
        pesi, somma = 0.0, np.zeros(3)
        for _, j, d in campo.find_n(x, VICINI):
            w = 1 / (d * d + MORBIDEZZA * MORBIDEZZA)
            pesi += w
            somma += w * insieme_spostamenti[j]
        allineati[i] = x + somma / pesi
    return allineati


# Ancore: per ogni punto di BodyParts3D, lo scarto dal punto più vicino dell'omonimo di Z-Anatomy allineato alle
# ossa; punti che ricevono più scarti ne prendono la media, così il tubo sottile finisce al centro di quello largo.
scarto_prima = {}
nuovi_punti, nuovi_spostamenti = [], []
for nome in ANCORE:
    ob = oggetto_za(nome)
    if not ob or nome not in per_nome:
        print(f'vaso di ancoraggio assente: {nome}')
        continue
    z = mesh_mondo(ob)[0]
    za = deforma(z)
    k = albero(za)
    q = vertici_obj(os.path.join(cartella_bp3d, per_nome[nome]['id'] + '.obj'))
    scarti = {}
    distanze = []
    for x in q:
        _, j, d = k.find(x)
        scarti.setdefault(j, []).append(x - za[j])
        distanze.append(d)
    scarto_prima[nome] = round(float(np.mean(distanze) * 1000), 2)
    for j, lista in scarti.items():
        nuovi_punti.append(z[j])
        nuovi_spostamenti.append(za[j] - z[j] + np.mean(lista, 0))
insieme_punti = np.vstack([insieme_punti, np.array(nuovi_punti)])
insieme_spostamenti = np.vstack([insieme_spostamenti, np.array(nuovi_spostamenti)])
campo = albero(insieme_punti)

rapporto = {
    'blender': bpy.app.version_string,
    'strutture_comuni': len(coppie),
    'riferimenti_scartati': scartati,
    'scarto_prima_delle_ancore_mm': scarto_prima,
    'raccordi_mm': {},
    'vasi': {},
}
allineati_per_nome = {}
for base in MANCANTI:
    oggetti = [bpy.data.objects[n] for n in (base + '.r', base + '.l', base) if n in bpy.data.objects]
    # Z-Anatomy nomina le carotidi comuni per lato all'inizio del nome.
    oggetti += [bpy.data.objects[f'{lato} {base[0].lower()}{base[1:]}'] for lato in LATI.values() if f'{lato} {base[0].lower()}{base[1:]}' in bpy.data.objects]
    if not oggetti:
        print(f'ERRORE: vaso non trovato in Z-Anatomy: {base}')
        sys.exit(1)
    for ob in oggetti:
        v, tri = mesh_mondo(ob)
        mm = deforma(v) * 1000
        allineati_per_nome[nome_inglese(ob.name)] = mm
        nome = nome_inglese(ob.name)
        tipo = 'vena' if VENA.search(nome) else 'arteria'
        file = os.path.join(uscita, re.sub(r'[^A-Za-z0-9]+', '_', nome) + '.obj')
        with open(file, 'w') as f:
            f.write('# Z-Anatomy - The libre 3D atlas of anatomy, CC BY-SA 4.0 (derivato da BodyParts3D, DBCLS)\n')
            f.write('# Allineato a BodyParts3D 4.0 da pipeline/esporta-vasi.py; coordinate in mm, asse Z in alto\n')
            f.write(f'# English name : {nome}\n')
            f.write(f'# Vessel type : {tipo}\n')
            for x in mm:
                f.write(f'v {x[0]:.4f} {x[1]:.4f} {x[2]:.4f}\n')
            for a, b, c in tri:
                f.write(f'f {a + 1} {b + 1} {c + 1}\n')
        rapporto['vasi'][nome] = {
            'tipo': tipo,
            'triangoli': len(tri),
            'quota_mm': [round(float(mm[:, 2].min())), round(float(mm[:, 2].max()))],
        }

for esportato, origine, modello in RACCORDI:
    for lato in ('Right', 'Left'):
        nome_e, nome_o = f'{lato} {esportato}', f'{lato} {origine}'
        if modello == 'za':
            k = albero(allineati_per_nome[nome_o])
        else:
            k = albero(vertici_obj(os.path.join(cartella_bp3d, per_nome[nome_o]['id'] + '.obj')) * 1000)
        chiave = f'{nome_e} → {nome_o} ({modello})'
        rapporto['raccordi_mm'][chiave] = round(min(k.find(x)[2] for x in allineati_per_nome[nome_e]), 2)

# Vasi isolati: nessun punto entro la soglia di un vaso di BodyParts3D o di un altro vaso esportato.
vasi_bp3d = albero(
    np.vstack(
        [vertici_obj(os.path.join(cartella_bp3d, x['id'] + '.obj')) for x in elementi if x['strato'] == 'vasi' and x['id'].startswith('FJ')]
    )
    * 1000
)
nomi_esportati = list(allineati_per_nome)
tutti = np.vstack([allineati_per_nome[n] for n in nomi_esportati])
proprietari = np.concatenate([np.full(len(allineati_per_nome[n]), i) for i, n in enumerate(nomi_esportati)])
esportati = albero(tutti)
rapporto['isolati_mm'] = {}
for i, n in enumerate(nomi_esportati):
    prova = campione(allineati_per_nome[n], 400)
    if min(vasi_bp3d.find(x)[2] for x in prova) <= SCARTO_MASSIMO_MM:
        continue
    if any(proprietari[j] != i for x in prova for _, j, _ in esportati.find_range(x, SCARTO_MASSIMO_MM)):
        continue
    rapporto['isolati_mm'][n] = round(float(min(vasi_bp3d.find(x)[2] for x in prova)), 1)

with open(os.path.join(uscita, 'rapporto.json'), 'w') as f:
    json.dump(rapporto, f, indent=2)
print(
    json.dumps(
        {k: rapporto[k] for k in ('strutture_comuni', 'riferimenti_scartati', 'raccordi_mm', 'isolati_mm')}, indent=2
    )
)
print(f'vasi esportati: {len(rapporto["vasi"])}')

peggiori = {n: d for n, d in rapporto['raccordi_mm'].items() if d > SCARTO_MASSIMO_MM}
if peggiori:
    print(f'ERRORE: raccordi oltre la soglia di {SCARTO_MASSIMO_MM} mm: {peggiori}')
    sys.exit(1)
