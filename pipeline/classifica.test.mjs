import { describe, expect, it } from 'vitest';
import { classifica, convertiVertice } from './classifica.mjs';

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

  it('esclude vasi e nervi anche se il nome cita un organo', () => {
    expect(classifica('D', 'Branch of left middle cerebral artery to left angular gyrus', ossa, muscoli)).toBeNull();
  });
});
