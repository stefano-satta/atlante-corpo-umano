import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

// Controlli sui modelli già preparati in public/modelli (npm run modelli:prepara).
const strutture = JSON.parse(fs.readFileSync('public/modelli/strutture.json', 'utf8'));
const { riepilogo } = JSON.parse(fs.readFileSync('public/modelli/riepilogo.json', 'utf8'));

describe('polmoni da Z-Anatomy (M4)', () => {
  const lobi = strutture.filter((s) => s.gruppo === 'polmoni');

  it('ci sono tutti e cinque i lobi, nello strato degli organi', () => {
    expect(lobi.map((s) => s.nome).sort()).toEqual([
      'Inferior lobe of left lung',
      'Inferior lobe of right lung',
      'Middle lobe of right lung',
      'Superior lobe of left lung',
      'Superior lobe of right lung',
    ]);
    expect(new Set(lobi.map((s) => s.strato))).toEqual(new Set(['organi']));
  });

  it('restano dentro il budget di peso dello strato degli organi', () => {
    expect(riepilogo.organi.kB).toBeLessThanOrEqual(700);
  });

  it('le licenze dei modelli citano Z-Anatomy', () => {
    expect(fs.readFileSync('public/modelli/LICENZE.md', 'utf8')).toMatch(/Z-Anatomy.*CC BY-SA 4\.0/s);
  });
});

describe('apparato genitale maschile (BodyParts3D)', () => {
  it('ogni organo ha i suoi elementi nello strato degli organi', () => {
    const nomi = (gruppo) =>
      strutture
        .filter((s) => s.gruppo === gruppo)
        .map((s) => s.nome)
        .sort();
    expect(nomi('testicoli')).toEqual(['Left testis', 'Right testis']);
    expect(nomi('epididimi')).toEqual(['Left epididymis', 'Right epididymis']);
    expect(nomi('dotti-deferenti')).toEqual(['Left deferent duct', 'Right deferent duct']);
    expect(nomi('vescichette-seminali')).toEqual(['Left seminal vesicle', 'Right seminal vesicle']);
    expect(nomi('prostata')).toEqual(['Prostate']);
    expect(nomi('pene')).toEqual(['Corpus cavernosum of penis', 'Corpus spongiosum of penis', 'Glans penis']);
    expect(nomi('uretra')).toEqual(['Urethra']);
  });
});
