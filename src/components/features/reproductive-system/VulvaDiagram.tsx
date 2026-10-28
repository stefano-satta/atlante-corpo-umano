import { type FigurePart, PartLabel } from '@/components/features/panel/AnatomyFigure';

// Schema della vulva vista dal davanti, con le grandi labbra divaricate, disegnato per l'atlante:
// in alto il pube, in basso l'ano. Forme e proporzioni sono semplificate e non in scala. Le parti
// indicate sono quelle descritte dalle fonti della scheda della vagina (OpenStax 27.2, SEER).

export const VULVA_PARTS: FigurePart[] = [
  { term: 'monte-del-pube', name: 'Monte del pube', target: [292, 92], side: 'left', y: 92 },
  { term: 'prepuzio-del-clitoride', name: 'Prepuzio del clitoride', target: [326, 164], side: 'left', y: 150 },
  { term: 'glande-del-clitoride', name: 'Glande del clitoride', target: [333, 184], side: 'left', y: 186 },
  {
    term: 'ghiandole-vestibolari-minori',
    name: 'Ghiandole vestibolari minori',
    lines: ['Ghiandole vestibolari', 'minori'],
    target: [360, 212],
    side: 'right',
    y: 196,
  },
  {
    term: 'orifizio-uretrale-esterno-femminile',
    name: 'Orifizio uretrale esterno',
    target: [337, 234],
    side: 'left',
    y: 226,
  },
  {
    term: 'ghiandole-parauretrali',
    name: 'Sbocchi delle ghiandole parauretrali',
    lines: ['Ghiandole parauretrali', '(sbocchi)'],
    target: [352, 242],
    side: 'right',
    y: 236,
  },
  { term: 'orifizio-vaginale', name: 'Orifizio vaginale', target: [328, 296], side: 'left', y: 266 },
  { term: 'vestibolo-della-vagina', name: 'Vestibolo della vagina', target: [362, 266], side: 'right', y: 274 },
  { term: 'imene', name: 'Imene', target: [319, 310], side: 'left', y: 306 },
  { term: 'piccole-labbra', name: 'Piccole labbra', target: [384, 304], side: 'right', y: 304 },
  { term: 'grandi-labbra', name: 'Grandi labbra', target: [434, 330], side: 'right', y: 334 },
  {
    term: 'ghiandole-vestibolari-maggiori',
    name: 'Sbocchi delle ghiandole vestibolari maggiori',
    lines: ['Ghiandole vestibolari', 'maggiori (sbocchi)'],
    target: [358, 336],
    side: 'right',
    y: 366,
  },
  { term: 'perineo', name: 'Perineo (tratteggio)', target: [196, 478], side: 'left', y: 478 },
  { term: '', name: 'Ano', target: [350, 470], side: 'right', y: 470 },
];

const mirror = (x: number) => 680 - x;
const mirrored = (d: string) => d.replace(/(\d+) (\d+)/g, (_, x, y) => `${mirror(Number(x))} ${y}`);

const LABIUM_MAJUS =
  'M332 138 C 250 150 220 220 228 280 C 234 340 280 395 332 402 C 300 380 272 330 270 275 C 268 215 290 165 332 138 Z';
const LABIUM_MINUS =
  'M338 160 C 300 175 282 230 286 285 C 290 335 312 368 336 378 C 320 360 308 330 306 285 C 304 235 316 190 338 160 Z';
const VESTIBULE =
  'M340 180 C 320 200 308 240 308 285 C 308 330 322 360 340 372 C 358 360 372 330 372 285 C 372 240 360 200 340 180 Z';
const COLUMNS = { left: 200, right: 480 };

export function VulvaDiagram() {
  return (
    <svg className="anatomy-diagram vulva-diagram" viewBox="0 0 680 560" aria-hidden="true">
      <text className="orientation" x="340" y="16" textAnchor="middle">
        Verso il pube
      </text>
      <text className="orientation" x="340" y="554" textAnchor="middle">
        Verso il coccige
      </text>

      {/* Perineo: il rombo tra sinfisi pubica, tuberosità ischiatiche e coccige, diviso nei due triangoli. */}
      <path className="perineum" d="M340 40 L 610 420 L 340 540 L 70 420 Z" />
      <path className="perineum divide" d="M70 420 L 610 420" />
      <text className="region" x="96" y="412">
        triangolo urogenitale
      </text>
      <text className="region" x="96" y="438">
        triangolo anale
      </text>

      <ellipse className="skin mons" cx="340" cy="118" rx="128" ry="70" />
      {/* Fondo tra le grandi e le piccole labbra: il lato interno delle grandi labbra. */}
      <path
        className="skin inner"
        d="M340 134 C 250 142 222 220 230 280 C 236 340 282 400 340 404 C 398 400 444 340 450 280 C 458 220 430 142 340 134 Z"
      />
      <path className="skin" d={LABIUM_MAJUS} />
      <path className="skin" d={mirrored(LABIUM_MAJUS)} />
      <path className="vestibule" d={VESTIBULE} />
      <path className="minus" d={LABIUM_MINUS} />
      <path className="minus" d={mirrored(LABIUM_MINUS)} />
      <path className="minus" d="M314 176 Q 340 136 366 176 Q 340 162 314 176 Z" />
      <circle className="glans" cx="340" cy="184" r="8" />

      {/* Sbocchi delle ghiandole vestibolari minori, vicino al clitoride. */}
      <g className="gland-openings">
        <circle cx="324" cy="210" r="2" />
        <circle cx="356" cy="210" r="2" />
        <circle cx="320" cy="220" r="2" />
        <circle cx="360" cy="220" r="2" />
      </g>
      <ellipse className="opening" cx="340" cy="234" rx="3" ry="6" />
      <g className="gland-openings">
        <circle cx="328" cy="242" r="1.8" />
        <circle cx="352" cy="242" r="1.8" />
      </g>
      <ellipse className="opening current" cx="340" cy="296" rx="22" ry="34" />
      <ellipse className="hymen" cx="340" cy="298" rx="18" ry="29" />
      <g className="gland-openings">
        <circle cx="322" cy="336" r="2.4" />
        <circle cx="358" cy="336" r="2.4" />
      </g>

      <g className="anus">
        <circle cx="340" cy="470" r="9" />
        <path d="M340 456 L 340 450 M340 484 L 340 490 M326 470 L 320 470 M354 470 L 360 470" />
      </g>

      {VULVA_PARTS.map((p, i) => (
        <PartLabel key={p.name} part={p} n={i + 1} columns={COLUMNS} />
      ))}
    </svg>
  );
}
