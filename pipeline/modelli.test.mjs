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

describe('sistema endocrino: tiroide e paratiroidi da Z-Anatomy, ipotalamo e ipofisi da BodyParts3D', () => {
  const nomi = (gruppo) =>
    strutture
      .filter((s) => s.gruppo === gruppo)
      .map((s) => s.nome)
      .sort();

  it('la tiroide è un solo elemento, nello strato degli organi, comune ai due corpi', () => {
    const tiroide = strutture.filter((s) => s.gruppo === 'tiroide');
    expect(tiroide).toEqual([
      { id: 'ZA-thyroid-gland', nome: 'Thyroid gland', fma: null, strato: 'organi', gruppo: 'tiroide' },
    ]);
  });

  it('ci sono le quattro paratiroidi', () => {
    expect(nomi('paratiroidi')).toEqual([
      'Left inferior parathyroid gland',
      'Left superior parathyroid gland',
      'Right inferior parathyroid gland',
      'Right superior parathyroid gland',
    ]);
  });

  it('ipotalamo e ipofisi sono organi a sé, e l’ipotalamo non fa più parte dell’encefalo', () => {
    expect(nomi('ipotalamo')).toEqual(['Hypothalamus', 'Hypothalamus']);
    expect(nomi('ipofisi')).toEqual(['Pituitary gland']);
    expect(nomi('encefalo')).not.toContain('Hypothalamus');
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

describe('corpo femminile dallo Human Reference Atlas (D29)', () => {
  const femminili = strutture.filter((s) => s.corpo === 'donna');

  it('ogni organo ha i suoi elementi nello strato degli organi, segnati come femminili', () => {
    const nomi = (gruppo) =>
      femminili
        .filter((s) => s.gruppo === gruppo)
        .map((s) => s.nome)
        .sort();
    expect(nomi('utero')).toEqual(['Uterus']);
    expect(nomi('tube-uterine')).toEqual(['Left uterine tube', 'Right uterine tube']);
    expect(nomi('ovaie')).toEqual(['Left ovary', 'Right ovary']);
    expect(nomi('vagina')).toEqual(['Vagina']);
    expect(nomi('mammelle')).toEqual(['Left breast', 'Right breast']);
    expect(new Set(femminili.map((s) => s.strato))).toEqual(new Set(['organi']));
  });

  it('gli organi genitali maschili e l’uretra maschile sono segnati come maschili', () => {
    const maschili = new Set(strutture.filter((s) => s.corpo === 'uomo').map((s) => s.gruppo));
    expect([...maschili].sort()).toEqual(
      ['dotti-deferenti', 'epididimi', 'pene', 'prostata', 'testicoli', 'uretra', 'vescichette-seminali'].sort(),
    );
  });

  it('stanno in un file a parte, leggero, fuori da quello degli organi comuni', () => {
    expect(riepilogo['organi-donna'].strutture).toBe(femminili.length);
    expect(riepilogo['organi-donna'].kB).toBeLessThanOrEqual(120);
    expect(riepilogo.organi.strutture).toBe(
      strutture.filter((s) => s.strato === 'organi' && s.corpo !== 'donna').length,
    );
  });

  it('le licenze dei modelli citano lo Human Reference Atlas', () => {
    expect(fs.readFileSync('public/modelli/LICENZE.md', 'utf8')).toMatch(/Human Reference Atlas.*CC BY 4\.0/s);
  });
});
