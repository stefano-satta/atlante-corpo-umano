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
    id: 'trachea-bronchi',
    name: 'Trachea e bronchi',
    latinTerm: 'arbor tracheobronchialis',
    system: 'respiratorio',
    color: '#cfc4b6',
  },
  // Polmoni da Z-Anatomy (M4): rosa tenue, distinto dal cuore e lontano da rosso e blu dei vasi.
  { id: 'polmoni', name: 'Polmoni', latinTerm: 'pulmones', system: 'respiratorio', color: '#c99ea4' },
];

export const ORGANS_BY_ID = new Map(ORGANS.map((o) => [o.id, o]));
