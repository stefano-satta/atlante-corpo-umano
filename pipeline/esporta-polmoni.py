# Esporta i polmoni di Z-Anatomy (e alcune strutture di riferimento) da Startup.blend.
#
# Uso, da riga di comando, senza interfaccia e senza eseguire gli script contenuti nel file (-Y):
#   blender -b -Y dati-sorgente/z-anatomy/Z-Anatomy/Startup.blend \
#     --python pipeline/esporta-polmoni.py -- --out dati-sorgente/z-anatomy/esportati
#
# Per ogni oggetto scrive un OBJ con i vertici in coordinate del mondo (modificatori applicati)
# e un rapporto.json con tipo, triangoli, ingombro, trasformazione, genitore e collezioni.
# Le coordinate restano quelle di Blender; l'allineamento a BodyParts3D si calcola dopo,
# confrontando le strutture di riferimento con gli OBJ originali.
#
# Licenza dei dati: Z-Anatomy, CC BY-SA 4.0 (derivato da BodyParts3D, DBCLS).

import json
import os
import sys

import bpy

LOBI = [
    'Superior lobe of right lung',
    'Middle lobe of right lung',
    'Inferior lobe of right lung',
    'Superior lobe of left lung',
    'Inferior lobe of left lung',
]
# Strutture presenti anche in BodyParts3D, per misurare l'allineamento attorno al torace.
# La pleura si esporta solo per ispezionarla (nella v1 non compare nel sito).
RIFERIMENTI = [
    'Trachea',
    'Body of sternum',
    'Fifth rib.r',
    'Fifth rib.l',
    'Clavicle.r',
    'Scapula.r',
    'Diaphragm',
    'Pleura',
]

argomenti = sys.argv[sys.argv.index('--') + 1 :] if '--' in sys.argv else []
uscita = argomenti[argomenti.index('--out') + 1] if '--out' in argomenti else 'esportati'
os.makedirs(uscita, exist_ok=True)

grafo = bpy.context.evaluated_depsgraph_get()
rapporto = {'blender': bpy.app.version_string, 'file': bpy.data.filepath, 'oggetti': {}}


def esporta(nome):
    ob = bpy.data.objects.get(nome)
    if ob is None:
        return {'presente': False}
    voce = {
        'presente': True,
        'tipo': ob.type,
        'genitore': ob.parent.name if ob.parent else None,
        'collezioni': [c.name for c in ob.users_collection],
        'nascosto': ob.hide_get() or ob.hide_viewport,
        'modificatori': [m.type for m in ob.modifiers],
        'matrice': [list(r) for r in ob.matrix_world],
    }
    if ob.type != 'MESH':
        return voce
    valutato = ob.evaluated_get(grafo)
    mesh = valutato.to_mesh()
    mesh.calc_loop_triangles()
    mondo = ob.matrix_world
    vertici = [mondo @ v.co for v in mesh.vertices]
    minimo = [min(v[i] for v in vertici) for i in range(3)]
    massimo = [max(v[i] for v in vertici) for i in range(3)]
    voce.update(
        vertici=len(vertici),
        triangoli=len(mesh.loop_triangles),
        ingombro={'min': minimo, 'max': massimo},
    )
    file = os.path.join(uscita, nome.replace(' ', '_') + '.obj')
    with open(file, 'w') as f:
        f.write(f'# {nome} - Z-Anatomy, CC BY-SA 4.0 - coordinate del mondo di Blender\n')
        for v in vertici:
            f.write(f'v {v.x:.6f} {v.y:.6f} {v.z:.6f}\n')
        for t in mesh.loop_triangles:
            a, b, c = (i + 1 for i in t.vertices)
            f.write(f'f {a} {b} {c}\n')
    valutato.to_mesh_clear()
    voce['file'] = os.path.basename(file)
    return voce


for nome in LOBI + RIFERIMENTI:
    rapporto['oggetti'][nome] = esporta(nome)

with open(os.path.join(uscita, 'rapporto.json'), 'w') as f:
    json.dump(rapporto, f, indent=2)
print(json.dumps({n: {k: v for k, v in o.items() if k != 'matrice'} for n, o in rapporto['oggetti'].items()}, indent=2))
