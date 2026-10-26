# Esporta da Startup.blend di Z-Anatomy i muscoli che BodyParts3D non contiene e li allinea al corpo
# di BodyParts3D.
#
# Uso: npm run modelli:muscoli (dopo npm run modelli:scarica e npm run modelli:prepara), oppure
#   blender -b -Y dati-sorgente/z-anatomy/Z-Anatomy/Startup.blend --python pipeline/esporta-muscoli.py -- \
#     --bp3d dati-sorgente/bodyparts3d/isa_BP3D_4.0_obj_99 --out dati-sorgente/z-anatomy/muscoli
# -Y impedisce a Blender di eseguire gli script contenuti nel file.
#
# Una sola trasformazione per tutto il corpo lascerebbe scarti di 7 mm (10 mm sulle gambe), e anche una
# per muscolo non basta ai muscoli che vanno dal torace al bacino. Ogni muscolo si divide quindi in zone
# (punti distribuiti sulla sua estensione, più punti sulle aree d'inserzione, cioè gli oggetti .el,
# .ol, .o1l… figli dell'osso su cui poggiano). Ogni zona ha una trasformazione rigida, stimata con ICP
# come in esporta-tiroide.py sulle strutture vicine presenti nei due modelli (ossa e muscoli di
# BodyParts3D letti da public/modelli/strutture.json, con un oggetto omonimo in Z-Anatomy) e, per le
# zone d'inserzione, soprattutto sull'osso. Ogni vertice usa la media delle trasformazioni delle zone,
# pesata sulla distanza. Le trasformazioni sono rigide: fra i due modelli la scala è 1,0006, e stimata
# su poche strutture vicine deriverebbe (fino a 0,74 sui muscoli piccoli del viso).
#
# Il controllo misura lo scarto aggiunto dall'allineamento: quanto le aree d'inserzione, e le strutture
# di riferimento entro 2 cm dal muscolo, stanno più lontane da BodyParts3D che con la trasformazione
# stimata su ciascuna da sola. Lo scarto assoluto non basta: già in Z-Anatomy alcune aree stanno fino a
# 4,6 mm dal loro osso, e alcune ossa (l'osso dell'anca) hanno forma diversa nei due modelli.
#
# Licenza dei dati: Z-Anatomy, CC BY-SA 4.0 (derivato da BodyParts3D, DBCLS). Nessuno di questi
# muscoli è fra i modelli di terzi con licenza NonCommercial contenuti nel file (orecchio interno, rene).

import json
import os
import re
import sys

import bpy
import numpy as np
from mathutils.kdtree import KDTree

# Muscoli assenti da BodyParts3D (docs/PIANO-MUSCOLI-Z-ANATOMY.md), con il nome dell'oggetto di
# Z-Anatomy senza il suffisso del lato.
MUSCOLI = [
    # Mimici
    'Frontalis muscle',
    'Occipitalis muscle',
    'Temporoparietalis muscle',
    'Orbital part of orbicularis oculi',
    'Palpebral part of orbicularis oculi',
    'Corrugator supercilii',
    'Procerus muscle',
    'Nasalis muscle',
    'Depressor septi nasi',
    'Levator labii superioris',
    'Levator nasolabialis',
    'Levator anguli oris',
    'Zygomaticus major muscle',
    'Zygomaticus minor muscle',
    'Risorius muscle',
    'Orbicularis oris muscle',
    'Depressor anguli oris',
    'Depressor labii inferioris',
    'Mentalis muscle',
    'Bucinator',
    # Masticatori
    'Superficial part of masseter',
    'Deep part of masseter',
    'Temporalis muscle',
    'Medial pterygoid muscle',
    'Superior head of lateral pterygoid muscle',
    'Inferior head of lateral pterygoid muscle',
    # Tronco
    'Latissimus dorsi muscle',
    'Rectus abdominis muscle',
    'Pyramidalis muscle',
    'Internal abdominal oblique muscle',
    'Transversus abdominis muscle',
    'Quadratus lumborum muscle',
    'Multifidus colli muscle',
    'Multifidus thoracis muscle',
    'Multifidus lumborum muscle',
    # Piede (quadrato della pianta, interossei e lombricali della mano sono già in BodyParts3D, con altri nomi)
    'Extensor digitorum brevis',
    'Dorsal interossei muscles of foot',
]
# Muscoli dell'arto libero: solo per questi le strutture degli arti fanno da riferimento.
MUSCOLI_ARTI = {'Extensor digitorum brevis', 'Dorsal interossei muscles of foot'}
# Ossa dell'arto libero. Gli arti hanno posa un po' diversa nei due modelli: per i muscoli del capo e del
# tronco non fanno da riferimento né loro né le strutture che hanno uno di loro come osso più vicino
# (braccio e coscia stanno accanto all'addome).
OSSA_ARTI = re.compile(
    r'humerus|radius|ulna|scaphoid|lunate|triquetr|pisiform|trapezi|capitate|hamate|metacarp|phalan|femur|'
    r'patella|tibia|fibula|talus|calcane|navicular|cuboid|cuneiform|metatars|sesamoid',
    re.I,
)
# Nomi inglesi d'uso dove Z-Anatomy ne usa un altro (refuso o variante).
NOMI = {'Bucinator': 'buccinator', 'Levator nasolabialis': 'levator labii superioris alaeque nasi'}
LATI = {'.r': 'right', '.l': 'left'}
# Strutture di BodyParts3D che in Z-Anatomy hanno un altro nome (senza lato), usate come riferimento.
SINONIMI = {
    'external oblique': 'External abdominal oblique muscle',
    'flexor accessorius': 'Quadratus plantae muscle',
    'Set of dorsal interossei of hand': 'Dorsal interossei muscles of hand',
    'Set of palmar interossei of hand': 'Palmar interossei muscles',
    'Set of lumbricals of hand': 'Lumbrical muscles of hand',
}
# Zone per muscolo e strutture di riferimento per zona.
ZONE = 12
VICINI = 6
# Distanza (m) entro cui una zona pesa quasi da sola sui vertici vicini.
MORBIDEZZA = 0.02
# Peso dell'osso nella trasformazione della zona di un'inserzione, rispetto a una struttura vicina.
PESO_INSERZIONI = 10
ZONE_INSERZIONE = 4
# Distanza (m) dal muscolo entro cui i punti delle strutture di riferimento entrano nel controllo.
VICINANZA = 0.02
CAMPIONE = 400
# Una struttura fa da riferimento solo se, allineata da sola, combacia entro questo scarto (mm): le parti
# del trapezio, per esempio, hanno forma diversa nei due modelli e bloccherebbero l'ICP.
RIFERIMENTO_MASSIMO_MM = 3.0
# Soglia oltre la quale l'allineamento non è accettato: scarto medio aggiunto sulle inserzioni, in mm.
SCARTO_MASSIMO_MM = 3.0
# Eccezioni accettate dall'utente il 2026-10-26, con lo scarto misurato (mm) come limite. Sono muscoli del
# tronco fra torace e bacino, dove già le ossa dei due modelli differiscono di 3–4 mm (l'osso dell'anca,
# allineato da solo, resta a 3,4 mm): obliquo interno sulla decima e dodicesima costa, piramidale (senza
# aree d'inserzione, sul pube), gran dorsale sinistro sulla scapola.
ECCEZIONI = {
    'Left internal abdominal oblique': 4.94,
    'Right internal abdominal oblique': 3.70,
    'Right pyramidalis': 4.86,
    'Left pyramidalis': 4.04,
    'Left latissimus dorsi': 3.26,
}

argomenti = sys.argv[sys.argv.index('--') + 1 :] if '--' in sys.argv else []


def arg(nome, predefinito):
    return argomenti[argomenti.index(f'--{nome}') + 1] if f'--{nome}' in argomenti else predefinito


cartella_bp3d = arg('bp3d', 'dati-sorgente/bodyparts3d/isa_BP3D_4.0_obj_99')
file_strutture = arg('strutture', 'public/modelli/strutture.json')
uscita = arg('out', 'dati-sorgente/z-anatomy/muscoli')
os.makedirs(uscita, exist_ok=True)
grafo = bpy.context.evaluated_depsgraph_get()
casuale = np.random.default_rng(0)


def mesh_mondo(ob):
    """Vertici in coordinate del mondo (metri, modificatori applicati) e triangoli."""
    valutato = ob.evaluated_get(grafo)
    mesh = valutato.to_mesh()
    mesh.calc_loop_triangles()
    m = np.array(ob.matrix_world)
    v = np.array([list(x.co) for x in mesh.vertices]) @ m[:3, :3].T + m[:3, 3]
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


def campione(p):
    return p[casuale.choice(len(p), min(CAMPIONE, len(p)), replace=False)]


def lontani(punti, quanti):
    """Il baricentro e i punti via via più lontani da quelli già scelti (campionamento del punto più lontano)."""
    scelti = [punti.mean(0)]
    for _ in range(quanti - 1):
        scelti.append(punti[np.argmax(np.min([np.linalg.norm(punti - z, axis=1) for z in scelti], 0))])
    return scelti


def oggetto_za(nome_bp3d):
    """Oggetto di Z-Anatomy con lo stesso nome di una struttura di BodyParts3D ("Right X" → "X.r")."""
    m = re.match(r'(Right|Left) (.+)', nome_bp3d) or re.match(r'(.+) of (right|left) (.+)', nome_bp3d)
    if m and m.lastindex == 3:
        base, lato = f'{m.group(1)} of {m.group(3)}', '.' + m.group(2)[0]
    else:
        base, lato = (m.group(2), '.r' if m.group(1) == 'Right' else '.l') if m else (nome_bp3d, '')
    base = SINONIMI.get(base, base[0].upper() + base[1:])
    for nome in (base + lato, base + ' muscle' + lato, base + ' bone' + lato):
        ob = bpy.data.objects.get(nome)
        if ob and ob.type == 'MESH' and len(ob.data.vertices) > 30:
            return ob
    return None


def nome_inglese(base, lato):
    """Nome nello stile di BodyParts3D: "Right latissimus dorsi", "Deep part of left masseter"."""
    base = NOMI.get(base, re.sub(r' muscle$', '', base))
    m = re.match(r'(.+ (?:part|head) of )(.+)', base)
    nome = f'{m.group(1)}{LATI[lato]} {m.group(2)}' if m else f'{LATI[lato]} {base[0].lower()}{base[1:]}'
    return nome[0].upper() + nome[1:]


def stima(coppie, partenza=None):
    """Trasformazione rigida con ICP sulle coppie di riferimento insieme (metodo di Kabsch)."""
    R, t = partenza or (np.eye(3), np.mean([(q.max(0) + q.min(0) - p.max(0) - p.min(0)) / 2 for p, q, _ in coppie], 0))
    for _ in range(40):
        P = np.vstack([p for p, _, _ in coppie])
        Q = np.vstack([q[[k.find(x)[1] for x in p @ R.T + t]] for p, q, k in coppie])
        mp, mq = P.mean(0), Q.mean(0)
        U, _, Vt = np.linalg.svd((Q - mq).T @ (P - mp) / len(P))
        D = np.eye(3)
        D[2, 2] = np.sign(np.linalg.det(U @ Vt))
        R = U @ D @ Vt
        t = mq - R @ mp
    return R, t


def scarto_mm(p, k, R, t):
    return float(np.mean([k.find(x)[2] for x in p @ R.T + t]) * 1000)


# Strutture presenti nei due modelli: punti di Z-Anatomy, vertici e albero di BodyParts3D.
with open(file_strutture) as f:
    bp3d = [x for x in json.load(f) if x['strato'] in ('ossa', 'muscoli') and x['id'].startswith('FJ')]
coppie = {}
for x in bp3d:
    ob = oggetto_za(x['nome'])
    if ob:
        q = vertici_obj(os.path.join(cartella_bp3d, x['id'] + '.obj'))
        p = campione(mesh_mondo(ob)[0])
        coppie[ob.name] = {'bp3d': x['nome'], 'strato': x['strato'], 'p': p, 'q': q, 'k': albero(q), 'centro': p.mean(0)}
# Trasformazione globale stimata sulle ossa: il punto di partenza di ogni stima locale.
globale = stima([(r['p'], r['q'], r['k']) for r in coppie.values() if r['strato'] == 'ossa'])
ossa = [r for r in coppie.values() if r['strato'] == 'ossa']
for r in coppie.values():
    piu_vicino = min(ossa, key=lambda o: np.mean([o['k'].find(x)[2] for x in r['q'][:: max(1, len(r['q']) // 50)]]))
    r['arto'] = bool(OSSA_ARTI.search(piu_vicino['bp3d']))
riferimenti, scartati = {}, {}
for nome, r in coppie.items():
    # Trasformazione e scarto della struttura allineata da sola: la base del controllo.
    r['proprio'] = stima([(r['p'], r['q'], r['k'])], globale)
    r['proprio_mm'] = scarto_mm(r['p'], r['k'], *r['proprio'])
    if r['proprio_mm'] <= RIFERIMENTO_MASSIMO_MM:
        riferimenti[nome] = r
    else:
        scartati[r['bp3d']] = round(r['proprio_mm'], 2)

rapporto = {
    'blender': bpy.app.version_string,
    'riferimenti': len(riferimenti),
    'riferimenti_scartati_mm': scartati,
    'muscoli': {},
}
fuori_soglia = []
for base in MUSCOLI:
    for lato in LATI:
        ob = bpy.data.objects[base + lato]
        v, tri = mesh_mondo(ob)
        schema = re.compile(rf'^{re.escape(base)}\.[eo]\d*{lato[1]}$')
        aree = [x for x in bpy.data.objects if x.type == 'MESH' and schema.match(x.name)]
        aree = [x for x in aree if x.parent and x.parent.name in coppie]
        # Zone del muscolo: punti lontani fra loro. Ogni zona ha una trasformazione rigida, stimata sulle
        # strutture più vicine.
        zone = lontani(v, ZONE)
        punti_aree = {x.name: mesh_mondo(x)[0] for x in aree}
        trasformazioni, usati = [], set()

        candidati = [n for n in riferimenti if base in MUSCOLI_ARTI or not riferimenti[n]['arto']]

        def vicini_a(z):
            vicini = sorted(candidati, key=lambda n: np.linalg.norm(riferimenti[n]['p'] - z, axis=1).min())[:VICINI]
            usati.update(vicini)
            return [coppie[n] for n in vicini]

        for z in zone:
            trasformazioni.append(stima([(r['p'], r['q'], r['k']) for r in vicini_a(z)], globale))
        # Anche le aree d'inserzione hanno le loro zone, distribuite sull'area perché quelle lunghe (lungo
        # una costa, sul margine della scapola) restino agganciate per intero, con la trasformazione
        # stimata soprattutto sul loro osso (anche se, per forma un po' diversa, l'osso non fa da
        # riferimento altrove).
        for ins in aree:
            osso = coppie[ins.parent.name]
            for z in lontani(punti_aree[ins.name], ZONE_INSERZIONE):
                scelte = vicini_a(z) + [osso] * PESO_INSERZIONI
                trasformazioni.append(stima([(r['p'], r['q'], r['k']) for r in scelte], globale))
                zone.append(z)
        zone = np.array(zone)

        def deforma(punti):
            """Media delle trasformazioni delle zone, pesata sulla distanza: rigida sui muscoli piccoli,
            morbida su quelli che vanno dal torace al bacino (trasverso, obliquo interno, gran dorsale)."""
            d2 = ((punti[:, None, :] - zone[None, :, :]) ** 2).sum(2)
            w = 1 / (d2 + MORBIDEZZA**2)
            w /= w.sum(1, keepdims=True)
            return sum(w[:, [i]] * (punti @ R.T + t) for i, (R, t) in enumerate(trasformazioni))

        def scarto_deformato_mm(punti, k):
            return float(np.mean([k.find(x)[2] for x in deforma(punti)]) * 1000)

        # Aree d'inserzione sulle ossa che hanno una controparte in BodyParts3D.
        inserzioni = {}
        for ins in aree:
            r = coppie[ins.parent.name]
            punti = punti_aree[ins.name]
            assoluto = scarto_deformato_mm(punti, r['k'])
            inserzioni[ins.name] = {
                'osso': r['bp3d'],
                'media_mm': round(assoluto, 2),
                'aggiunto_mm': round(assoluto - scarto_mm(punti, r['k'], *r['proprio']), 2),
            }
        # Strutture di riferimento, solo nei punti vicini al muscolo: altrove la deformazione non vale.
        vicino = albero(v)
        assoluti, aggiunti = [], []
        for n in usati:
            r = riferimenti[n]
            punti = np.array([x for x in r['p'] if vicino.find(x)[2] < VICINANZA])
            if len(punti):
                assoluto = scarto_deformato_mm(punti, r['k'])
                assoluti += [assoluto] * len(punti)
                aggiunti += [assoluto - scarto_mm(punti, r['k'], *r['proprio'])] * len(punti)
        scarto_vicini, aggiunto_vicini = np.mean(assoluti), np.mean(aggiunti)
        controllo = round(max([float(aggiunto_vicini)] + [x['aggiunto_mm'] for x in inserzioni.values()]), 2)
        # Massima differenza di rotazione fra le zone: misura quanto il muscolo è stato deformato.
        divergenza = max(
            np.degrees(np.arccos(np.clip((np.trace(Ra.T @ Rb) - 1) / 2, -1, 1)))
            for Ra, _ in trasformazioni
            for Rb, _ in trasformazioni
        )

        nome = nome_inglese(base, lato)
        v = deforma(v) * 1000
        file = os.path.join(uscita, nome.replace(' ', '_') + '.obj')
        with open(file, 'w') as f:
            f.write('# Z-Anatomy - The libre 3D atlas of anatomy, CC BY-SA 4.0 (derivato da BodyParts3D, DBCLS)\n')
            f.write('# Allineato a BodyParts3D 4.0 da pipeline/esporta-muscoli.py; coordinate in mm, asse Z in alto\n')
            f.write(f'# English name : {nome}\n')
            for x in v:
                f.write(f'v {x[0]:.4f} {x[1]:.4f} {x[2]:.4f}\n')
            for a, b, c in tri:
                f.write(f'f {a + 1} {b + 1} {c + 1}\n')
        rapporto['muscoli'][nome] = {
            'oggetto': ob.name,
            'file': os.path.basename(file),
            'triangoli': len(tri),
            'divergenza_zone_gradi': round(float(divergenza), 2),
            'riferimenti': sorted(riferimenti[n]['bp3d'] for n in usati),
            'scarto_riferimenti_mm': round(float(scarto_vicini), 2),
            'aggiunto_riferimenti_mm': round(float(aggiunto_vicini), 2),
            'inserzioni': inserzioni,
            'controllo_mm': controllo,
            'soglia_mm': ECCEZIONI.get(nome, SCARTO_MASSIMO_MM),
            'eccezione': nome in ECCEZIONI,
        }
        if controllo > ECCEZIONI.get(nome, SCARTO_MASSIMO_MM):
            fuori_soglia.append(f'{nome}: {controllo} mm')

with open(os.path.join(uscita, 'rapporto.json'), 'w') as f:
    json.dump(rapporto, f, indent=2)
for nome, x in rapporto['muscoli'].items():
    eccezione = f" (eccezione, limite {x['soglia_mm']} mm)" if x['eccezione'] else ''
    print(f"{x['controllo_mm']:6.2f} mm  {nome}  ({len(x['inserzioni'])} inserzioni){eccezione}")

if fuori_soglia:
    print(f'ERRORE: {len(fuori_soglia)} muscoli oltre la soglia di {SCARTO_MASSIMO_MM} mm o il limite della loro eccezione')
    print('\n'.join(fuori_soglia))
    sys.exit(1)
