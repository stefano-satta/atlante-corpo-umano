import { describe, expect, it } from 'vitest';
import { classifica, classificaNervo, classificaVaso, convertiVertice } from './classifica.mjs';

describe('convertiVertice', () => {
  it('passa da millimetri Z-alto a metri Y-alto, con la parte anteriore verso +Z', () => {
    // La testa (z alto) va verso +Y; la parte anteriore (y negativo in BodyParts3D) verso +Z.
    expect(convertiVertice(100, -200, 1600)).toEqual([0.1, 1.6, 0.2]);
  });
});

describe('classifica', () => {
  const ossa = new Set(['FJ-OSSO']);
  const muscoli = new Set(['FJ-MUSCOLO']);

  it('riconosce pelle, ossa, cartilagini costali e muscoli', () => {
    expect(classifica('X', 'Skin', ossa, muscoli)).toEqual({ strato: 'pelle', gruppo: null });
    expect(classifica('FJ-OSSO', 'Left femur', ossa, muscoli)).toEqual({ strato: 'ossa', gruppo: null });
    expect(classifica('Y', 'Left fifth costal cartilage', ossa, muscoli)?.strato).toBe('ossa');
    expect(classifica('FJ-MUSCOLO', 'Diaphragm', ossa, muscoli)?.strato).toBe('muscoli');
  });

  it('assegna le parti degli organi al loro gruppo', () => {
    expect(classifica('A', 'Wall of left atrium', ossa, muscoli)).toEqual({ strato: 'organi', gruppo: 'cuore' });
    expect(classifica('B', 'Hepatovenous segment VII', ossa, muscoli)?.gruppo).toBe('fegato');
    expect(classifica('C', 'Left superior frontal gyrus', ossa, muscoli)?.gruppo).toBe('encefalo');
  });

  it('riunisce i cinque lobi di Z-Anatomy nei polmoni, senza confonderli con le loro parti', () => {
    for (const lobo of ['Superior', 'Middle', 'Inferior'])
      expect(classifica('Z', `${lobo} lobe of right lung`, ossa, muscoli)?.gruppo).toBe('polmoni');
    expect(classifica('Z', 'Inferior lobe of left lung', ossa, muscoli)?.gruppo).toBe('polmoni');
    expect(classifica('Z', 'Apical segment of right lung (SI)', ossa, muscoli)).toBeNull();
  });

  it('esclude i nervi e porta i vasi nel loro strato anche se il nome cita un organo', () => {
    expect(classifica('D', 'Branch of left middle cerebral artery to left angular gyrus', ossa, muscoli)?.strato).toBe(
      'vasi',
    );
    expect(classifica('D', 'Left lacrimal nerve', ossa, muscoli)).toBeNull();
    expect(classifica('D', 'Medial superior tributary of left hepatic biliary tree', ossa, muscoli)?.strato).not.toBe(
      'vasi',
    );
  });

  it('riconosce arterie e vene, anche dai tronchi che non citano il tipo', () => {
    expect(classifica('V', 'Left femoral artery', ossa, muscoli)).toEqual({
      strato: 'vasi',
      gruppo: 'vaso-left-femoral-artery',
      vaso: 'arteria',
      sangue: 'ricco',
    });
    for (const nome of ['Inferior vena cava', 'Coronary sinus', 'Tributary of plantar venous arch'])
      expect(classifica('V', nome, ossa, muscoli)?.vaso).toBe('vena');
    for (const nome of ['Celiac trunk', 'Left plantar arch', 'Arch of aorta'])
      expect(classifica('V', nome, ossa, muscoli)?.vaso).toBe('arteria');
  });

  it('non scambia per vasi seni paranasali, dotti, parti del fegato e tronchi nervosi', () => {
    for (const nome of ['Frontal sinus', 'Common hepatic duct', 'Inferior branch of right oculomotor nerve'])
      expect(classifica('V', nome, ossa, muscoli)).toBeNull();
    expect(classifica('V', 'Hepatovenous segment VII', ossa, muscoli)?.gruppo).toBe('fegato');
    expect(classifica('V', 'Left ureter', ossa, muscoli)).toEqual({ strato: 'organi', gruppo: 'ureteri' });
  });

  it('nel circolo polmonare il sangue è invertito, nel fegato e nel rene no', () => {
    expect(classifica('V', 'Pulmonary trunk', ossa, muscoli)?.sangue).toBe('povero');
    expect(classifica('V', 'Left apical segmental artery', ossa, muscoli)?.sangue).toBe('povero');
    expect(classifica('V', 'Left superior pulmonary vein', ossa, muscoli)?.sangue).toBe('ricco');
    expect(classifica('V', 'Anterior superior segmental hepatic artery', ossa, muscoli)?.sangue).toBe('ricco');
    expect(classifica('V', 'Inferior segmental branch of left renal artery', ossa, muscoli)?.sangue).toBe('ricco');
    expect(classifica('V', 'Left renal vein', ossa, muscoli)?.sangue).toBe('povero');
  });

  it('accetta il tipo dichiarato dai vasi di Z-Anatomy e li riunisce agli omonimi di BodyParts3D', () => {
    expect(classificaVaso('V', 'Superior sagittal sinus', 'vena')).toEqual({
      strato: 'vasi',
      gruppo: 'vaso-superior-sagittal-sinus',
      vaso: 'vena',
      sangue: 'povero',
    });
    expect(classificaVaso('Z', 'Left common carotid artery', 'arteria')?.gruppo).toBe(
      classifica('F', 'Left common carotid artery', ossa, muscoli)?.gruppo,
    );
  });

  it('segna i vasi solo maschili e scarta i doppioni', () => {
    const v = classifica('V', 'Left testicular artery', ossa, muscoli);
    expect(v?.corpo).toBe('uomo');
    expect(v?.gruppo).toBe('vaso-uomo-left-testicular-artery');
    expect(classifica('FJ3427', 'Descending aorta', ossa, muscoli)).toBeNull();
  });

  it('ammette il nervo ottico, unico nervo fra gli organi, con il tratto ottico', () => {
    expect(classifica('E', 'Right optic nerve', ossa, muscoli)).toEqual({ strato: 'organi', gruppo: 'nervo-ottico' });
    expect(classifica('E', 'Left optic tract', ossa, muscoli)?.gruppo).toBe('nervo-ottico');
    expect(classifica('E', 'Right lateral geniculate body', ossa, muscoli)?.gruppo).toBe('nervo-ottico');
  });

  it('riunisce le parti dell’occhio e dell’apparato lacrimale', () => {
    for (const parte of ['sclera', 'cornea', 'iris', 'lens'])
      expect(classifica('F', `Left ${parte}`, ossa, muscoli)?.gruppo).toBe('occhi');
    expect(classifica('F', 'Optic part of left retina', ossa, muscoli)).toBeNull();
    expect(classifica('G', 'Right nasolacrimal duct', ossa, muscoli)?.gruppo).toBe('apparato-lacrimale');
  });

  it('degli orecchi riconosce l’orecchio esterno', () => {
    expect(classifica('H', 'External ear', ossa, muscoli)).toEqual({ strato: 'organi', gruppo: 'orecchi' });
  });
});

describe('classificaNervo', () => {
  it('riunisce nervo e rami nell’unità del nervo principale e ne indica il tessuto', () => {
    expect(classificaNervo('Right median nerve', 'periferico')).toEqual({
      strato: 'nervi',
      gruppo: 'nervo-right-median-nerve',
      nervo: 'periferico',
    });
    expect(classificaNervo('Spinal cord', 'centrale').gruppo).toBe('nervo-spinal-cord');
  });

  it('rifiuta un tessuto sconosciuto', () => {
    expect(() => classificaNervo('Right median nerve', 'osseo')).toThrow();
  });
});
