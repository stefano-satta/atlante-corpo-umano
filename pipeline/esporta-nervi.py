# Esporta da Startup.blend di Z-Anatomy il midollo spinale e i nervi, che BodyParts3D non contiene, e li allinea
# al suo corpo (strato Nervi, D46). BodyParts3D ha solo l'encefalo, il nervo ottico e i nervi dell'orbita.
#
# Uso: npm run modelli:nervi (dopo npm run modelli:scarica e npm run modelli:prepara), oppure
#   blender -b -Y dati-sorgente/z-anatomy/Z-Anatomy/Startup.blend --python pipeline/esporta-nervi.py -- \
#     --bp3d dati-sorgente/bodyparts3d/isa_BP3D_4.0_obj_99 --out dati-sorgente/z-anatomy/nervi
# -Y impedisce a Blender di eseguire gli script contenuti nel file.
#
# In Z-Anatomy i nervi sono curve con un raggio per punto (lo sciatico arriva a 6 mm, i rami digitali a
# 0,2 mm): to_mesh le converte in tubi con lo spessore del modello. Il midollo spinale è la superficie della
# sostanza bianca, i gangli spinali e del tronco simpatico sono superfici. Ogni oggetto diventa un elemento e
# appartiene all'unità del nervo principale da cui parte (UNITA): i rami minori non si scelgono da soli.
#
# L'allineamento è lo stesso campo di spostamenti di esporta-vasi.py: ossa e muscoli presenti nei due modelli,
# allineati ciascuno con ICP, danno lo spostamento dei loro punti, e ogni vertice usa la media dei punti più
# vicini, pesata sulla distanza. Il tronco encefalico di BodyParts3D fa da ancora, perché i nervi cranici vi
# si attaccano: ogni suo punto porta sul posto il punto più vicino del tronco di Z-Anatomy. Il controllo misura
# i RACCORDI (distanza minima fra l'origine di un nervo e la struttura da cui parte) e quanto il midollo
# entra nelle vertebre di BodyParts3D.
#
# Licenza dei dati: Z-Anatomy, CC BY-SA 4.0 (derivato da BodyParts3D, DBCLS); i nervi cranici di Z-Anatomy
# derivano da "Cranial Nerves and Foramina" dell'Università di Dundee, CC BY 4.0. Sono esclusi i nervi
# cocleare e vestibolare, che stanno nell'orecchio interno (modello di terzi CC BY-NC-SA, D6), e il nervo
# ottico, che c'è già in BodyParts3D.

import json
import os
import re
import sys

import bpy
import numpy as np
from mathutils.kdtree import KDTree

COLLEZIONE = '7: Nervous system & Sense organs'
# Unità selezionabili: nome inglese del nervo principale, tessuto (colore) e nomi degli oggetti di Z-Anatomy,
# senza il suffisso del lato, che le compongono. Il primo oggetto dà il nome all'unità.
UNITA = [
    ('Spinal cord', 'centrale', [r'White matter of spinal cord']),
    ('Cauda equina', 'periferico', [r'Cauda equina']),
    ('Roots of spinal nerves', 'periferico', [r'(Anterior|Posterior) root of spinal nerve', r'Spinal ganglion']),
    # Nervi cranici (il II, ottico, viene da BodyParts3D)
    ('Olfactory nerve', 'periferico', [r'Olfactory nerve \(I\)']),
    ('Oculomotor nerve', 'periferico', [r'Oculomotor nerve \(III\)']),
    ('Trochlear nerve', 'periferico', [r'Trochlear nerve \(IV\)']),
    (
        'Trigeminal nerve',
        'periferico',
        [
            r'Trigeminal nerve \(V\)',
            r'(Motor|Sensory) root of trigeminal nerve',
            r'Ophthalmic nerve',
            r'Maxillary nerve',
            r'Meningeal branch of maxillary nerve',
            r'(Anterior|Posterior) division of mandibular nerve',
            r'Buccal nerve',
            r'Inferior alveolar nerve',
            r'Lingual nerve',
            r'Mental nerve',
            r'Nerve to mylohyoid muscle',
        ],
    ),
    ('Abducens nerve', 'periferico', [r'Abducens nerve \(VI\)']),
    ('Facial nerve', 'periferico', [r'Facial nerve \(VII\)', r'Chorda tympani']),
    ('Vestibulocochlear nerve', 'periferico', [r'Vestibulocochlear nerve \(VIII\)']),
    ('Glossopharyngeal nerve', 'periferico', [r'Glossopharyngeal nerve \(IX\)']),
    ('Vagus nerve', 'periferico', [r'Vagus nerve \(X\)']),
    ('Accessory nerve', 'periferico', [r'Accessory nerve \(XI\)']),
    ('Hypoglossal nerve', 'periferico', [r'Hypoglossal nerve \(XII\)']),
    # Arto superiore e torace
    (
        'Brachial plexus',
        'periferico',
        [
            r'Roots of brachial plexus',
            r'(Superior|Middle|Inferior) trunk of brachial plexus',
            r'(Anterior|Posterior) division of (superior|middle|inferior) trunk of brachial plexus',
            r'Posterior cord of brachial plexus',
            r'Dorsal scapular nerve',
            r'Long thoracic nerve',
            r'Suprascapular nerve',
            r'Subclavian nerve',
            r'(Lateral|Medial) pectoral nerve',
            r'(Superior|Inferior) subscapular nerve',
            r'Thoracodorsal nerve',
            r'Medial brachial cutaneous nerve',
            r'Medial antebrachial cutaneous nerve',
            r'(Anterior|Posterior) branch of medial antebrachial cutaneous nerve',
        ],
    ),
    (
        'Axillary nerve',
        'periferico',
        [r'Axillary nerve', r'Muscular branches of axillary nerve', r'Superior lateral brachial cutaneous nerve'],
    ),
    ('Musculocutaneous nerve', 'periferico', [r'Musculocutaneous nerve', r'Lateral antebrachial cutaneous nerve']),
    (
        'Radial nerve',
        'periferico',
        [
            r'Radial nerve',
            r'(Deep|Superficial) branch of radial nerve',
            r'(Muscular|Dorsal digital) branches of radial nerve',
            r'Posterior interosseous nerve of forearm',
            r'Inferior lateral brachial cutaneous nerve',
            r'Posterior antebrachial cutaneous nerve',
        ],
    ),
    (
        'Median nerve',
        'periferico',
        [
            r'Median nerve',
            r'Palmar branch of median nerve',
            r'(Muscular|Common palmar digital|Proper palmar digital) branches of median nerve',
            r'Anterior interosseous nerve of forearm',
            r'\(Communicating branch of median nerve with ulnar nerve\)',
        ],
    ),
    (
        'Ulnar nerve',
        'periferico',
        [
            r'Ulnar nerve',
            r'(Deep|Superficial|Dorsal|Palmar) branch of ulnar nerve',
            r'(Muscular|Common palmar digital|Proper palmar digital|Dorsal digital) branches of ulnar nerve',
        ],
    ),
    ('Intercostal nerves', 'periferico', [r'Intercostal nerves']),
    # Arto inferiore e bacino
    (
        'Lumbar plexus',
        'periferico',
        [
            r'Iliohypogastric nerve',
            r'Ilio-inguinal nerve',
            r'Genitofemoral nerve',
            r'(Femoral|Genital) branch of genitofemoral nerve',
            r'Lateral femoral cutaneous nerve',
        ],
    ),
    ('Femoral nerve', 'periferico', [r'Femoral nerve', r'Anterior cutaneous branches of femoral nerve']),
    (
        'Saphenous nerve',
        'periferico',
        [r'Saphenous nerve', r'Infrapatellar branch of saphenous nerve', r'Medial crural cutaneous branches of saphenous nerve'],
    ),
    ('Obturator nerve', 'periferico', [r'Obturator nerve', r'(Anterior|Posterior) branch of obturator nerve']),
    (
        'Sacral plexus',
        'periferico',
        [
            r'Superior gluteal nerve',
            r'Nerve to piriformis muscle',
            r'Nerve to quadratus femoris muscle',
            r'Posterior femoral cutaneous nerve',
            r'(Anterior|Posterior) root of posterior femoral cutaneous nerve',
        ],
    ),
    ('Pudendal nerve', 'periferico', [r'Pudendal nerve']),
    ('Sciatic nerve', 'periferico', [r'Sciatic nerve']),
    (
        'Tibial nerve',
        'periferico',
        [
            r'Tibial nerve',
            r'Medial sural cutaneous nerve',
            r'(Medial|Lateral) plantar nerve',
            r'(Common|Proper) plantar digital branches of (medial|lateral) plantar nerve',
        ],
    ),
    (
        'Common fibular nerve',
        'periferico',
        [
            r'Common fibular nerve',
            r'(Deep|Superficial) fibular nerve',
            r'Muscular branches of deep fibular nerve',
            r'Dorsal digital branches of (deep|superficial) fibular nerve',
            r'Sural communicating branch of common fibular nerve',
            r'(Intermediate|Medial) dorsal cutaneous nerve of foot',
        ],
    ),
    ('Sural nerve', 'periferico', [r'Sural nerve']),
    # Sistema nervoso autonomo
    ('Sympathetic trunk', 'autonomo', [r'Sympathetic trunk', r'Ganglia of sympathetic trunk', r'Sympathetic nerves']),
]
# Curve della collezione che non sono nervi o che non si usano.
ESCLUSE = {
    'Ciliary body-curve',  # guida del corpo ciliare dell'occhio
    "Central canal'",  # canale centrale del midollo, nascosto dentro la sostanza bianca
    'Optic nerve (II)',  # già in BodyParts3D
    'Cochlear nerve',  # orecchio interno (CC BY-NC-SA)
    'Vestibular nerve',  # orecchio interno (CC BY-NC-SA)
}
# Superfici della collezione che entrano: le altre sono encefalo, occhi, orecchi, meningi e sostanza grigia
# nascosta dentro il midollo.
SUPERFICI = {
    'White matter of spinal cord',
    'Spinal ganglion',
    'Ganglia of sympathetic trunk',
    'Sensory root of trigeminal nerve',
    'Motor root of trigeminal nerve',
}
# Tronco encefalico di BodyParts3D, ancora per i nervi cranici, con gli oggetti di Z-Anatomy corrispondenti.
TRONCO = {'Medulla oblongata': 'Medulla oblongata', 'Pons': 'Pons', 'Midbrain': 'Midbrain'}
# Raccordi da controllare: nervo esportato (senza lato) e struttura da cui parte, di BodyParts3D ('bp3d', per nome)
# o esportata anch'essa ('za', per unità).
RACCORDI = [
    ('Spinal cord', 'Medulla oblongata', 'bp3d'),
    ('Trigeminal nerve (V)', 'Pons', 'bp3d'),
    ('Facial nerve (VII)', 'Medulla oblongata', 'bp3d'),
    ('Vestibulocochlear nerve (VIII)', 'Medulla oblongata', 'bp3d'),
    ('Glossopharyngeal nerve (IX)', 'Medulla oblongata', 'bp3d'),
    ('Vagus nerve (X)', 'Medulla oblongata', 'bp3d'),
    ('Hypoglossal nerve (XII)', 'Medulla oblongata', 'bp3d'),
    ('Oculomotor nerve (III)', 'Midbrain', 'bp3d'),
    ('Roots of brachial plexus', 'Roots of spinal nerves', 'za'),
    ('Roots of spinal nerves', 'Spinal cord', 'za'),
    ('Sciatic nerve', 'Sacral plexus', 'za'),
]
CAMPIONE = 300
RIFERIMENTO_MASSIMO_MM = 3.0
SCARTO_MASSIMO_MM = 3.0
VICINI = 12
MORBIDEZZA = 0.005
LATI = {'.r': 'Right', '.l': 'Left'}

argomenti = sys.argv[sys.argv.index('--') + 1 :] if '--' in sys.argv else []


def arg(nome, predefinito):
    return argomenti[argomenti.index(f'--{nome}') + 1] if f'--{nome}' in argomenti else predefinito


cartella_bp3d = arg('bp3d', 'dati-sorgente/bodyparts3d/isa_BP3D_4.0_obj_99')
file_strutture = arg('strutture', 'public/modelli/strutture.json')
uscita = arg('out', 'dati-sorgente/z-anatomy/nervi')
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


# Oggetti da esportare, con la loro unità.
collezione = bpy.data.collections[COLLEZIONE]
riconosciuti, sconosciuti = [], []
for ob in collezione.objects:
    if ob.type not in ('CURVE', 'MESH'):
        continue
    base = ob.name[:-2] if ob.name[-2:] in LATI else ob.name
    if ob.type == 'CURVE' and base in ESCLUSE:
        continue
    if ob.type == 'MESH' and base not in SUPERFICI:
        continue
    unita = next(
        ((u, tessuto, i) for u, tessuto, nomi in UNITA for i, n in enumerate(nomi) if re.fullmatch(n, base)), None
    )
    if unita:
        riconosciuti.append((ob, base, *unita))
    else:
        sconosciuti.append(ob.name)
if sconosciuti:
    print(f'ERRORE: curve del sistema nervoso senza unità: {sorted(sconosciuti)}')
    sys.exit(1)
for u, _, nomi in UNITA:
    for n in nomi:
        if not any(re.fullmatch(n, r[1]) for r in riconosciuti):
            print(f'ERRORE: nessun oggetto per {n} ({u})')
            sys.exit(1)

# Lato di un oggetto: dal suffisso, oppure dalla posizione per i pochi oggetti senza suffisso (un ramo plantare);
# gli oggetti sulla linea mediana (midollo, cauda equina) non hanno lato.
destro = bpy.data.objects['Sciatic nerve.r']
segno_destro = np.sign(np.mean(mesh_mondo(destro)[0][:, 0]))


def lato_di(ob, v):
    if ob.name[-2:] in LATI:
        return LATI[ob.name[-2:]]
    x = float(np.mean(v[:, 0]))
    if abs(x) < 0.02:
        return None
    return 'Right' if np.sign(x) == segno_destro else 'Left'


def con_lato(lato, nome):
    nome = nome.strip('() ')
    return f'{lato} {nome[0].lower()}{nome[1:]}' if lato else nome


# Ossa e muscoli presenti nei due modelli.
with open(file_strutture) as f:
    elementi = json.load(f)
per_nome = {}
for x in elementi:
    if x['id'].startswith('FJ'):
        per_nome.setdefault(x['nome'], []).append(x)
coppie = []
for x in elementi:
    if x['strato'] not in ('ossa', 'muscoli') or not x['id'].startswith('FJ'):
        continue
    ob = oggetto_za(x['nome'])
    if not ob or ob.type != 'MESH' or len(ob.data.vertices) < 30:
        continue
    q = vertici_obj(os.path.join(cartella_bp3d, x['id'] + '.obj'))
    coppie.append({'nome': x['nome'], 'strato': x['strato'], 'p': campione(mesh_mondo(ob)[0]), 'q': q, 'k': albero(q)})

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
insieme_punti, insieme_spostamenti = np.vstack(punti), np.vstack(spostamenti)
campo = albero(insieme_punti)


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


def punti_bp3d(nome):
    return np.vstack([vertici_obj(os.path.join(cartella_bp3d, x['id'] + '.obj')) for x in per_nome[nome]])


# Ancore: il tronco encefalico. Per ogni punto di BodyParts3D, lo scarto dal punto più vicino del tronco di
# Z-Anatomy (le due metà insieme) allineato alle ossa.
scarto_prima = {}
nuovi_punti, nuovi_spostamenti = [], []
for nome_bp3d, nome_za in TRONCO.items():
    oggetti = [bpy.data.objects[n] for n in (nome_za + '.r', nome_za + '.l', nome_za) if n in bpy.data.objects]
    if not oggetti or nome_bp3d not in per_nome:
        print(f'ERRORE: ancora assente: {nome_bp3d}')
        sys.exit(1)
    z = np.vstack([mesh_mondo(ob)[0] for ob in oggetti])
    za = deforma(z)
    k = albero(za)
    scarti = {}
    distanze = []
    for x in punti_bp3d(nome_bp3d):
        _, j, d = k.find(x)
        scarti.setdefault(j, []).append(x - za[j])
        distanze.append(d)
    scarto_prima[nome_bp3d] = round(float(np.mean(distanze) * 1000), 2)
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
    'midollo_nelle_vertebre': {},
    'unita': {},
}
# Il nervo principale prima dei suoi rami: il primo elemento di un'unità le dà il nome nel modello.
riconosciuti.sort(key=lambda r: ([u for u, _, _ in UNITA].index(r[2]), r[4], r[0].name))
allineati_per_base = {}
for ob, base, unita, tessuto, _ in riconosciuti:
    v, tri = mesh_mondo(ob)
    lato = lato_di(ob, v)
    mm = deforma(v) * 1000
    nome = con_lato(lato, base)
    nome_unita = con_lato(lato, unita)
    allineati_per_base.setdefault(base, []).append(mm)
    allineati_per_base.setdefault(f'unità {unita}', []).append(mm)
    file = os.path.join(uscita, re.sub(r'[^A-Za-z0-9]+', '_', nome).strip('_') + '.obj')
    if os.path.exists(file):
        print(f'ERRORE: due oggetti con lo stesso nome: {nome}')
        sys.exit(1)
    with open(file, 'w') as f:
        f.write('# Z-Anatomy - The libre 3D atlas of anatomy, CC BY-SA 4.0 (derivato da BodyParts3D, DBCLS)\n')
        f.write('# Allineato a BodyParts3D 4.0 da pipeline/esporta-nervi.py; coordinate in mm, asse Z in alto\n')
        f.write(f'# English name : {nome}\n')
        f.write(f'# Nerve unit : {nome_unita}\n')
        f.write(f'# Nerve tissue : {tessuto}\n')
        for x in mm:
            f.write(f'v {x[0]:.4f} {x[1]:.4f} {x[2]:.4f}\n')
        for a, b, c in tri:
            f.write(f'f {a + 1} {b + 1} {c + 1}\n')
    voce = rapporto['unita'].setdefault(nome_unita, {'tessuto': tessuto, 'elementi': 0, 'triangoli': 0})
    voce['elementi'] += 1
    voce['triangoli'] += len(tri)

for esportato, origine, modello in RACCORDI:
    k = albero(punti_bp3d(origine) * 1000 if modello == 'bp3d' else np.vstack(allineati_per_base[f'unità {origine}']))
    parti = allineati_per_base.get(esportato) or allineati_per_base[f'unità {esportato}']
    for i, parte in enumerate(parti):
        chiave = f'{esportato} [{i + 1}] → {origine} ({modello})'
        rapporto['raccordi_mm'][chiave] = round(min(k.find(x)[2] for x in campione(parte, 2000)), 2)

# Midollo nelle vertebre: quota dei vertici del midollo a meno di 1 mm da un osso della colonna di BodyParts3D.
vertebre = albero(
    np.vstack(
        [
            vertici_obj(os.path.join(cartella_bp3d, x['id'] + '.obj'))
            for x in elementi
            if x['strato'] == 'ossa' and x['id'].startswith('FJ') and re.search(r'vertebra|sacrum|atlas|axis', x['nome'], re.I)
        ]
    )
    * 1000
)
midollo = np.vstack(allineati_per_base['White matter of spinal cord'])
vicini = [vertebre.find(x)[2] for x in campione(midollo, 3000)]
rapporto['midollo_nelle_vertebre'] = {
    'distanza_minima_mm': round(float(min(vicini)), 2),
    'quota_sotto_1_mm': round(float(np.mean(np.array(vicini) < 1.0)), 4),
    'quota_mm': [round(float(midollo[:, 2].min())), round(float(midollo[:, 2].max()))],
}

with open(os.path.join(uscita, 'rapporto.json'), 'w') as f:
    json.dump(rapporto, f, indent=2)
print(
    json.dumps(
        {k: rapporto[k] for k in ('strutture_comuni', 'riferimenti_scartati', 'scarto_prima_delle_ancore_mm', 'raccordi_mm', 'midollo_nelle_vertebre')},
        indent=2,
    )
)
print(f'unità esportate: {len(rapporto["unita"])}, elementi: {len(riconosciuti)}')

peggiori = {n: d for n, d in rapporto['raccordi_mm'].items() if d > SCARTO_MASSIMO_MM}
if peggiori:
    print(f'ATTENZIONE: raccordi oltre la soglia di {SCARTO_MASSIMO_MM} mm: {peggiori}')
