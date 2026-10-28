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

  // Budget alzato da 700 a 750 kB con l'apparato visivo (occhi, nervo ottico, apparato lacrimale).
  it('restano dentro il budget di peso dello strato degli organi', () => {
    expect(riepilogo.organi.kB).toBeLessThanOrEqual(750);
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

describe('apparato visivo (BodyParts3D)', () => {
  const nomi = (gruppo) =>
    strutture
      .filter((s) => s.gruppo === gruppo)
      .map((s) => s.nome)
      .sort();

  it('gli occhi hanno sclera, cornea, iride e cristallino, senza le parti nascoste dalla sclera', () => {
    expect(nomi('occhi')).toEqual(
      ['cornea', 'iris', 'lens', 'sclera'].flatMap((p) => [`Left ${p}`, `Right ${p}`]).sort(),
    );
  });

  it('il nervo ottico arriva al corpo genicolato laterale attraverso il tratto ottico', () => {
    expect(nomi('nervo-ottico')).toEqual([
      'Left lateral geniculate body',
      'Left optic nerve',
      'Left optic nerve',
      'Left optic tract',
      'Right lateral geniculate body',
      'Right optic nerve',
      'Right optic nerve',
      'Right optic tract',
    ]);
  });

  it('l’apparato lacrimale va dalla ghiandola al dotto nasolacrimale, e nessun altro nervo entra fra gli organi', () => {
    expect(nomi('apparato-lacrimale')).toHaveLength(8);
    const nervi = strutture.filter((s) => s.strato === 'organi' && /nerve/i.test(s.nome));
    expect(new Set(nervi.map((s) => s.gruppo))).toEqual(new Set(['nervo-ottico']));
  });
});

describe('apparato uditivo (BodyParts3D)', () => {
  it('gli orecchi sono il solo orecchio esterno, nello strato degli organi, senza parti di Z-Anatomy', () => {
    expect(strutture.filter((s) => s.gruppo === 'orecchi')).toEqual([
      { id: 'FJ2811', nome: 'External ear', fma: 'FMA52781', strato: 'organi', gruppo: 'orecchi' },
    ]);
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

describe('muscoli descritti da BodyParts3D solo per capi o parti', () => {
  const muscoli = strutture.filter((s) => s.strato === 'muscoli').map((s) => s.nome);
  const parti = (muscolo) => muscoli.filter((n) => new RegExp(`(part|head) of (right|left) ${muscolo}$`).test(n));

  it('deltoide, trapezio, grande pettorale, bicipite, tricipite e gastrocnemio ci sono, per capi e per lato', () => {
    expect(parti('deltoid')).toHaveLength(6);
    expect(parti('trapezius')).toHaveLength(6);
    expect(parti('pectoralis major')).toHaveLength(6);
    expect(parti('biceps brachii')).toHaveLength(4);
    expect(parti('triceps brachii')).toHaveLength(6);
    expect(parti('gastrocnemius')).toHaveLength(4);
  });

  it('il quadricipite e l’elevatore dell’ano ci sono per i due lati', () => {
    for (const lato of ['Right', 'Left'])
      for (const m of ['rectus femoris', 'vastus lateralis', 'vastus medialis', 'vastus intermedius', 'puborectalis'])
        expect(muscoli).toContain(`${lato} ${m}`);
  });

  it('muscoli papillari, tenie del colon e tendine calcaneale restano fuori dallo strato', () => {
    expect(muscoli.filter((n) => /papillary|Taenia|calcaneal tendon/.test(n))).toEqual([]);
  });

  it('i gruppi di muscoli della mano e del dorso ci sono per i due lati', () => {
    for (const lato of ['right', 'left'])
      for (const m of [
        `dorsal interossei of ${lato} hand`,
        `palmar interossei of ${lato} hand`,
        `lumbricals of ${lato} hand`,
      ])
        expect(muscoli).toContain(`Set of ${m}`);
  });

  // Budget alzato da 1020 a 1250 kB con gli 84 capi e parti e i 18 gruppi recuperati, poi a 1650 kB
  // con i muscoli di Z-Anatomy.
  it('restano dentro il budget di peso dello strato dei muscoli', () => {
    expect(riepilogo.muscoli.kB).toBeLessThanOrEqual(1650);
  });
});

describe('muscoli assenti da BodyParts3D, da Z-Anatomy', () => {
  const za = strutture.filter((s) => s.id.startsWith('ZA-') && s.strato === 'muscoli');
  const nomi = za.map((s) => s.nome);

  it('ci sono 37 muscoli, ciascuno per i due lati, senza identificativo FMA', () => {
    expect(za).toHaveLength(74);
    for (const m of ['latissimus dorsi', 'rectus abdominis', 'temporalis', 'buccinator', 'frontalis'])
      for (const lato of ['Right', 'Left']) expect(nomi).toContain(`${lato} ${m}`);
    expect(nomi).toContain('Deep part of left masseter');
    expect(new Set(za.map((s) => s.fma))).toEqual(new Set([null]));
  });

  it('non doppiano muscoli di BodyParts3D', () => {
    const bp3d = new Set(strutture.filter((s) => s.id.startsWith('FJ')).map((s) => s.nome.toLowerCase()));
    expect(nomi.filter((n) => bp3d.has(n.toLowerCase()))).toEqual([]);
  });

  it('le licenze dei modelli citano i muscoli di Z-Anatomy', () => {
    expect(fs.readFileSync('public/modelli/LICENZE.md', 'utf8')).toMatch(/37 muscoli di `muscoli\.glb`/);
  });
});
