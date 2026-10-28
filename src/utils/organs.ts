import type { BodySystem, Organ } from '@/models/organs';

// Organi del modello 3D. Nomi italiani e termini anatomici sono quelli correnti; il testo
// verificato, quando c'è, arriva dai contenuti.

export const BODY_SYSTEM_NAMES: Record<BodySystem, string> = {
  cardiovascolare: 'Apparato cardiovascolare',
  nervoso: 'Sistema nervoso',
  digerente: 'Apparato digerente',
  urinario: 'Apparato urinario',
  respiratorio: 'Apparato respiratorio',
  linfatico: 'Sistema linfatico',
  endocrino: 'Sistema endocrino',
  visivo: 'Apparato visivo',
  uditivo: 'Apparato uditivo',
  'genitale-maschile': 'Apparato genitale maschile',
  'genitale-femminile': 'Apparato genitale femminile',
};

export const ORGANS: Organ[] = [
  { id: 'cuore', name: 'Cuore', latinTerm: 'cor', system: 'cardiovascolare', color: '#a9524b' },
  { id: 'encefalo', name: 'Encefalo', latinTerm: 'encephalon', system: 'nervoso', color: '#c4aea2' },
  { id: 'fegato', name: 'Fegato', latinTerm: 'hepar', system: 'digerente', color: '#7b3f37' },
  { id: 'colecisti', name: 'Colecisti', latinTerm: 'vesica biliaris', system: 'digerente', color: '#6f7a4a' },
  { id: 'esofago', name: 'Esofago', latinTerm: 'oesophagus', system: 'digerente', color: '#b98276' },
  { id: 'stomaco', name: 'Stomaco', latinTerm: 'gaster', system: 'digerente', color: '#c08b7c' },
  {
    id: 'intestino-tenue',
    name: 'Intestino tenue',
    latinTerm: 'intestinum tenue',
    system: 'digerente',
    color: '#c99a87',
  },
  {
    id: 'intestino-crasso',
    name: 'Intestino crasso',
    latinTerm: 'intestinum crassum',
    system: 'digerente',
    color: '#a97e6c',
  },
  { id: 'pancreas', name: 'Pancreas', latinTerm: 'pancreas', system: 'digerente', color: '#d0a57c' },
  { id: 'milza', name: 'Milza', latinTerm: 'splen', system: 'linfatico', color: '#6c3a3e' },
  { id: 'reni', name: 'Reni', latinTerm: 'ren', system: 'urinario', color: '#8b4a40' },
  { id: 'vescica', name: 'Vescica urinaria', latinTerm: 'vesica urinaria', system: 'urinario', color: '#c7a99a' },
  {
    id: 'uretra',
    name: 'Uretra',
    latinTerm: 'urethra masculina',
    system: 'urinario',
    color: '#d6bcae',
    body: 'uomo',
  },
  // Apparato genitale maschile (BodyParts3D riproduce un corpo maschile): toni carne e ocra, distinti da vescica e reni.
  {
    id: 'testicoli',
    name: 'Testicoli',
    latinTerm: 'testis',
    system: 'genitale-maschile',
    body: 'uomo',
    color: '#d2b4a2',
  },
  {
    id: 'epididimi',
    name: 'Epididimi',
    latinTerm: 'epididymis',
    system: 'genitale-maschile',
    body: 'uomo',
    color: '#a9786a',
  },
  {
    id: 'dotti-deferenti',
    name: 'Dotti deferenti',
    latinTerm: 'ductus deferens',
    system: 'genitale-maschile',
    body: 'uomo',
    color: '#d9c4ae',
  },
  {
    id: 'vescichette-seminali',
    name: 'Vescichette seminali',
    latinTerm: 'glandula seminalis',
    system: 'genitale-maschile',
    body: 'uomo',
    color: '#bf9f7e',
  },
  {
    id: 'prostata',
    name: 'Prostata',
    latinTerm: 'prostata',
    system: 'genitale-maschile',
    body: 'uomo',
    color: '#a26c62',
  },
  { id: 'pene', name: 'Pene', latinTerm: 'penis', system: 'genitale-maschile', body: 'uomo', color: '#b98a7c' },
  // Apparato genitale femminile e mammelle dallo Human Reference Atlas (D29); la vagina è una
  // ricostruzione schematica. Toni rosati, distinti da quelli maschili e da vescica e intestino.
  { id: 'utero', name: 'Utero', latinTerm: 'uterus', system: 'genitale-femminile', body: 'donna', color: '#b0686c' },
  {
    id: 'tube-uterine',
    name: 'Tube uterine',
    latinTerm: 'tuba uterina',
    system: 'genitale-femminile',
    body: 'donna',
    color: '#d5a59b',
  },
  { id: 'ovaie', name: 'Ovaie', latinTerm: 'ovarium', system: 'genitale-femminile', body: 'donna', color: '#dcc6a8' },
  { id: 'vagina', name: 'Vagina', latinTerm: 'vagina', system: 'genitale-femminile', body: 'donna', color: '#c78d91' },
  {
    id: 'mammelle',
    name: 'Mammelle',
    latinTerm: 'mamma',
    system: 'genitale-femminile',
    body: 'donna',
    color: '#e2c0a8',
  },
  {
    id: 'trachea-bronchi',
    name: 'Trachea e bronchi',
    latinTerm: 'arbor tracheobronchialis',
    system: 'respiratorio',
    color: '#cfc4b6',
  },
  // Polmoni da Z-Anatomy (M4): rosa tenue, distinto dal cuore e lontano da rosso e blu dei vasi.
  { id: 'polmoni', name: 'Polmoni', latinTerm: 'pulmones', system: 'respiratorio', color: '#c99ea4' },
  // Tiroide da Z-Anatomy: bruno rossastro di organo molto vascolarizzato, distinto da trachea e muscoli del collo.
  {
    id: 'tiroide',
    name: 'Tiroide',
    latinTerm: 'glandula thyreoidea',
    system: 'endocrino',
    color: '#a0604f',
  },
  // Paratiroidi da Z-Anatomy, ipotalamo e ipofisi da BodyParts3D: toni ocra e malva, distinti dalla
  // tiroide e, per l'ipotalamo, dall'encefalo che lo circonda.
  {
    id: 'paratiroidi',
    name: 'Paratiroidi',
    latinTerm: 'glandulae parathyreoideae',
    system: 'endocrino',
    color: '#d1ab6e',
  },
  { id: 'ipotalamo', name: 'Ipotalamo', latinTerm: 'hypothalamus', system: 'endocrino', color: '#8f7a96' },
  { id: 'ipofisi', name: 'Ipofisi', latinTerm: 'hypophysis', system: 'endocrino', color: '#b98468' },
  // Apparato visivo da BodyParts3D: avorio per il bianco dell'occhio, giallo paglia per il nervo
  // ottico (lontano dall'encefalo che attraversa), verde salvia per l'apparato lacrimale, senza il
  // blu riservato alle vene.
  { id: 'occhi', name: 'Occhi', latinTerm: 'bulbus oculi', system: 'visivo', color: '#ddd3c4' },
  {
    id: 'nervo-ottico',
    name: 'Nervo e tratto ottico',
    latinTerm: 'nervus opticus',
    system: 'visivo',
    color: '#d6b85a',
  },
  {
    id: 'apparato-lacrimale',
    name: 'Apparato lacrimale',
    latinTerm: 'apparatus lacrimalis',
    system: 'visivo',
    color: '#8fa682',
  },
  // Apparato uditivo da BodyParts3D: solo i padiglioni, color carne chiaro come la pelle che li
  // riveste, distinto dal rosa degli organi digerenti.
  { id: 'orecchi', name: 'Orecchi', latinTerm: 'auris', system: 'uditivo', color: '#e2b49c' },
];

export const ORGANS_BY_ID = new Map(ORGANS.map((o) => [o.id, o]));
