# Esporta i polmoni di Z-Anatomy da Startup.blend e li allinea al corpo di BodyParts3D.
#
# Uso: npm run modelli:polmoni (dopo npm run modelli:scarica e con Z-Anatomy estratto), oppure
#   blender -b -Y dati-sorgente/z-anatomy/Z-Anatomy/Startup.blend --python pipeline/esporta-polmoni.py -- \
#     --bp3d dati-sorgente/bodyparts3d/isa_BP3D_4.0_obj_99 --out dati-sorgente/z-anatomy/polmoni
# -Y impedisce a Blender di eseguire gli script contenuti nel file.
#
# Z-Anatomy usa lo stesso corpo di BodyParts3D, ma spostato e scalato (ispezione del 2026-10-24,
# DECISIONI.md, sezione 2b). Una sola similitudine (scala, rotazione, traslazione) si stima su
# strutture presenti in entrambi i modelli; i lobi trasformati si scrivono come OBJ in coordinate
# di BodyParts3D (millimetri, asse Z in alto), con un'intestazione nello stesso formato, così
# prepara-modelli.mjs li tratta come gli altri organi.
#
# Licenza dei dati: Z-Anatomy, CC BY-SA 4.0 (derivato da BodyParts3D, DBCLS). Il file contiene
# anche modelli di terzi con licenza NonCommercial (orecchio interno, rene): non vanno estratti (D6).

import json
import os
import sys

import bpy
import numpy as np
from mathutils.kdtree import KDTree

LOBI = [
    'Superior lobe of right lung',
    'Middle lobe of right lung',
    'Inferior lobe of right lung',
    'Superior lobe of left lung',
    'Inferior lobe of left lung',
]
# Oggetto di Z-Anatomy → OBJ di BodyParts3D con la stessa struttura (strutture attorno al torace).
RIFERIMENTI = {
    'Trachea': 'FJ2541',
    'Body of sternum': 'FJ3178',
    'Fifth rib.r': 'FJ3342',
    'Fifth rib.l': 'FJ3232',
    'Clavicle.r': 'FJ3362',
    'Scapula.r': 'FJ3384',
    'Diaphragm': 'FJ3131',
}
# Soglia oltre la quale l'allineamento non è accettato: scarto medio per struttura, in mm.
SCARTO_MASSIMO_MM = 5.0

argomenti = sys.argv[sys.argv.index('--') + 1 :] if '--' in sys.argv else []


def arg(nome, predefinito):
    return argomenti[argomenti.index(f'--{nome}') + 1] if f'--{nome}' in argomenti else predefinito


cartella_bp3d = arg('bp3d', 'dati-sorgente/bodyparts3d/isa_BP3D_4.0_obj_99')
uscita = arg('out', 'dati-sorgente/z-anatomy/polmoni')
os.makedirs(uscita, exist_ok=True)
grafo = bpy.context.evaluated_depsgraph_get()


def mesh_mondo(nome):
    """Vertici in coordinate del mondo (metri, modificatori applicati) e triangoli."""
    ob = bpy.data.objects[nome]
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


# Stima della similitudine con ICP sulle strutture di riferimento insieme (metodo di Umeyama).
za = {n: mesh_mondo(n)[0] for n in RIFERIMENTI}
bp = {n: vertici_obj(os.path.join(cartella_bp3d, f + '.obj')) for n, f in RIFERIMENTI.items()}
alberi = {n: albero(p) for n, p in bp.items()}
s, R = 1.0, np.eye(3)
t = np.mean([(bp[n].max(0) + bp[n].min(0) - za[n].max(0) - za[n].min(0)) / 2 for n in RIFERIMENTI], 0)
for _ in range(60):
    P = np.vstack([za[n] for n in RIFERIMENTI])
    Q = np.vstack([bp[n][[alberi[n].find(p)[1] for p in s * za[n] @ R.T + t]] for n in RIFERIMENTI])
    mp, mq = P.mean(0), Q.mean(0)
    U, S, Vt = np.linalg.svd((Q - mq).T @ (P - mp) / len(P))
    D = np.eye(3)
    D[2, 2] = np.sign(np.linalg.det(U @ Vt))
    R = U @ D @ Vt
    s = (S * np.diag(D)).sum() / ((P - mp) ** 2).sum(1).mean()
    t = mq - s * R @ mp

scarti = {}
for n in RIFERIMENTI:
    d = np.array([alberi[n].find(p)[2] for p in s * za[n] @ R.T + t]) * 1000
    scarti[n] = {'media_mm': round(float(d.mean()), 2), 'p95_mm': round(float(np.percentile(d, 95)), 2)}

rapporto = {
    'blender': bpy.app.version_string,
    'trasformazione': {
        'scala': s,
        'rotazione_gradi': float(np.degrees(np.arccos(min(1.0, (np.trace(R) - 1) / 2)))),
        'traslazione_mm': (t * 1000).tolist(),
        'rotazione': R.tolist(),
    },
    'scarti': scarti,
    'lobi': {},
}

for nome in LOBI:
    v, tri = mesh_mondo(nome)
    v = (s * v @ R.T + t) * 1000
    file = os.path.join(uscita, nome.replace(' ', '_') + '.obj')
    with open(file, 'w') as f:
        f.write('# Z-Anatomy - The libre 3D atlas of anatomy, CC BY-SA 4.0 (derivato da BodyParts3D, DBCLS)\n')
        f.write('# Allineato a BodyParts3D 4.0 da pipeline/esporta-polmoni.py; coordinate in mm, asse Z in alto\n')
        f.write(f'# English name : {nome}\n')
        for x in v:
            f.write(f'v {x[0]:.4f} {x[1]:.4f} {x[2]:.4f}\n')
        for a, b, c in tri:
            f.write(f'f {a + 1} {b + 1} {c + 1}\n')
    rapporto['lobi'][nome] = {'file': os.path.basename(file), 'vertici': len(v), 'triangoli': len(tri)}

with open(os.path.join(uscita, 'rapporto.json'), 'w') as f:
    json.dump(rapporto, f, indent=2)
print(json.dumps({k: rapporto[k] for k in ('trasformazione', 'scarti', 'lobi')}, indent=2))

peggiore = max(x['media_mm'] for x in scarti.values())
if peggiore > SCARTO_MASSIMO_MM:
    print(f'ERRORE: scarto medio di {peggiore} mm oltre la soglia di {SCARTO_MASSIMO_MM} mm')
    sys.exit(1)
