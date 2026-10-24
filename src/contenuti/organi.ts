// Dati provvisori degli organi del prototipo. Nomi italiani e termini anatomici
// sono quelli correnti; descrizioni, fonti e collegamenti arriveranno in Fase 6.

export type Apparato = 'cardiovascolare' | 'nervoso' | 'digerente' | 'urinario' | 'respiratorio' | 'linfatico';

export interface Organo {
  id: string;
  nome: string;
  termine: string;
  apparato: Apparato;
  colore: string;
}

export const NOMI_APPARATI: Record<Apparato, string> = {
  cardiovascolare: 'Apparato cardiovascolare',
  nervoso: 'Sistema nervoso',
  digerente: 'Apparato digerente',
  urinario: 'Apparato urinario',
  respiratorio: 'Apparato respiratorio',
  linfatico: 'Sistema linfatico',
};

export const ORGANI: Organo[] = [
  { id: 'cuore', nome: 'Cuore', termine: 'cor', apparato: 'cardiovascolare', colore: '#a9524b' },
  { id: 'encefalo', nome: 'Encefalo', termine: 'encephalon', apparato: 'nervoso', colore: '#c4aea2' },
  { id: 'fegato', nome: 'Fegato', termine: 'hepar', apparato: 'digerente', colore: '#7b3f37' },
  { id: 'colecisti', nome: 'Colecisti', termine: 'vesica biliaris', apparato: 'digerente', colore: '#6f7a4a' },
  { id: 'esofago', nome: 'Esofago', termine: 'oesophagus', apparato: 'digerente', colore: '#b98276' },
  { id: 'stomaco', nome: 'Stomaco', termine: 'gaster', apparato: 'digerente', colore: '#c08b7c' },
  {
    id: 'intestino-tenue',
    nome: 'Intestino tenue',
    termine: 'intestinum tenue',
    apparato: 'digerente',
    colore: '#c99a87',
  },
  {
    id: 'intestino-crasso',
    nome: 'Intestino crasso',
    termine: 'intestinum crassum',
    apparato: 'digerente',
    colore: '#a97e6c',
  },
  { id: 'pancreas', nome: 'Pancreas', termine: 'pancreas', apparato: 'digerente', colore: '#d0a57c' },
  { id: 'milza', nome: 'Milza', termine: 'splen', apparato: 'linfatico', colore: '#6c3a3e' },
  { id: 'rene-destro', nome: 'Rene destro', termine: 'ren dexter', apparato: 'urinario', colore: '#8b4a40' },
  { id: 'rene-sinistro', nome: 'Rene sinistro', termine: 'ren sinister', apparato: 'urinario', colore: '#8b4a40' },
  { id: 'vescica', nome: 'Vescica urinaria', termine: 'vesica urinaria', apparato: 'urinario', colore: '#c7a99a' },
  {
    id: 'trachea-bronchi',
    nome: 'Trachea e bronchi',
    termine: 'trachea et bronchi',
    apparato: 'respiratorio',
    colore: '#cfc4b6',
  },
];

export const ORGANI_PER_ID = new Map(ORGANI.map((o) => [o.id, o]));
