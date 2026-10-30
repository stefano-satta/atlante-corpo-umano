import { type FigurePart, PartLabel } from '@/components/features/panel/AnatomyFigure';

// Sezione verticale della mammella destra vista di lato, disegnata per l'atlante: a sinistra la
// parete del torace, a destra il capezzolo, la testa in alto. Le parti indicate sono quelle descritte
// dalle fonti della scheda delle mammelle (SEER, OpenStax 27.2); il numero dei lobi tagliati, le
// loro forme e le proporzioni sono semplificati e non in scala.

/** Capezzolo: le aperture dei dotti stanno sulla sua punta. */
const NIPPLE = { tip: 610, base: 586, y: 262 };

/** Un lobo: direzione dal capezzolo (gradi, 180 = verso il torace) e lunghezza del dotto principale. */
interface Lobe {
  angle: number;
  length: number;
}

const LOBES: Lobe[] = [
  { angle: 204, length: 150 },
  { angle: 195, length: 195 },
  { angle: 182, length: 200 },
  { angle: 169, length: 195 },
  { angle: 157, length: 180 },
  { angle: 147, length: 140 },
];

type Point = [number, number];

const along = ([x, y]: Point, angle: number, d: number): Point => [
  x + d * Math.cos((angle * Math.PI) / 180),
  y + d * Math.sin((angle * Math.PI) / 180),
];
const f = (n: number) => n.toFixed(1);

/** Ingresso nel capezzolo del dotto di un lobo: i dotti si aprono uno accanto all'altro sulla punta. */
const entry = (i: number): Point => [NIPPLE.base, NIPPLE.y - 10 + (20 * i) / (LOBES.length - 1)];

/** Punti di partenza dei rami terminali di un lobo e loro direzioni. */
function branchesOf(i: number) {
  const { angle, length } = LOBES[i];
  const start = entry(i);
  const end = along(start, angle, length);
  const mid = along(start, angle, length * 0.62);
  return {
    start,
    end,
    branches: [
      { from: end, angle: angle - 26, length: 40 },
      { from: end, angle: angle - 6, length: 46 },
      { from: end, angle: angle + 16, length: 42 },
      { from: mid, angle: angle - 48, length: 30 },
      { from: mid, angle: angle + 46, length: 30 },
      { from: along(start, angle, length * 0.82), angle: angle + 40, length: 26 },
    ],
  };
}

/** Lobulo: un grappolo di piccoli alveoli in fondo a un dotto terminale. */
function Lobule({ at }: { at: Point }) {
  const [x, y] = at;
  return (
    <g className="lobule">
      <circle cx={f(x)} cy={f(y)} r="3.4" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const [px, py] = along(at, a, 6.2);
        return <circle key={a} cx={f(px)} cy={f(py)} r="3.2" />;
      })}
    </g>
  );
}

function LobeDrawing({ i }: { i: number }) {
  const { angle, length } = LOBES[i];
  const { start, end, branches } = branchesOf(i);
  const tip: Point = [NIPPLE.tip - 2, start[1] + (start[1] - NIPPLE.y) * 0.25];
  // Seno galattoforo: il dotto si allarga poco prima del capezzolo, poi si restringe.
  const s0 = along(start, angle, 10);
  const s1 = along(start, angle, 34);
  const s2 = along(start, angle, 50);
  const n = along([0, 0], angle + 90, 1);
  const w = (p: Point, k: number): Point => [p[0] + n[0] * k, p[1] + n[1] * k];
  const sinus = `M${f(s0[0])} ${f(s0[1])} Q ${f(w(s1, 7.5)[0])} ${f(w(s1, 7.5)[1])} ${f(s2[0])} ${f(s2[1])} Q ${f(w(s1, -7.5)[0])} ${f(w(s1, -7.5)[1])} ${f(s0[0])} ${f(s0[1])} Z`;
  // Contorno del lobo: un fuso attorno ai suoi rami, separato dagli altri dal tessuto adiposo.
  const a = along(start, angle, length * 0.42);
  const b = along(start, angle, length + 52);
  const c = along(start, angle, length * 0.78);
  const sp = 20 + length * 0.04;
  const lobe = `M${f(a[0])} ${f(a[1])} Q ${f(w(c, sp)[0])} ${f(w(c, sp)[1])} ${f(w(b, sp * 0.55)[0])} ${f(w(b, sp * 0.55)[1])} Q ${f(b[0])} ${f(b[1])} ${f(w(b, -sp * 0.55)[0])} ${f(w(b, -sp * 0.55)[1])} Q ${f(w(c, -sp)[0])} ${f(w(c, -sp)[1])} ${f(a[0])} ${f(a[1])} Z`;
  return (
    <g>
      <path className="lobe" d={lobe} />
      <path
        className="duct"
        d={`M${f(tip[0])} ${f(tip[1])} L ${f(start[0])} ${f(start[1])} L ${f(end[0])} ${f(end[1])}`}
      />
      <path className="sinus" d={sinus} />
      {branches.map((br) => {
        const to = along(br.from, br.angle, br.length);
        return (
          <g key={`${br.angle}-${br.length}`}>
            <path className="duct small" d={`M${f(br.from[0])} ${f(br.from[1])} L ${f(to[0])} ${f(to[1])}`} />
            <Lobule at={along(br.from, br.angle, br.length + 6)} />
          </g>
        );
      })}
    </g>
  );
}

// Contorno della pelle: torace sopra la mammella, pendio superiore quasi diritto, areola e
// capezzolo, polo inferiore pieno e tondo (un solo arco dal capezzolo al solco), solco sottomammario, torace sotto.
// Le curve si raccordano con la stessa tangente, così il contorno non ha spigoli.
const SKIN =
  'M296 0 L 296 64 C 296 84 306 96 330 106 C 420 140 540 180 574 222 C 580 229 584 238 586 246 L 600 248 C 608 249 613 256 613 262 C 613 268 608 275 600 276 L 586 278 C 600 330 530 432 440 432 C 380 432 330 426 306 414 C 298 410 296 424 296 460';
const BREAST = `${SKIN} L 286 460 L 286 0 Z`;

// Coste tagliate di traverso e muscoli intercostali tra l'una e l'altra.
const RIBS = [58, 138, 218, 298, 378, 452];
const MUSCLE = 'M240 0 L 286 0 L 286 460 L 272 460 C 262 380 246 200 240 0 Z';

export const BREAST_PARTS: FigurePart[] = [
  { term: 'capezzolo', name: 'Capezzolo', target: [606, 262], side: 'right', y: 262 },
  { term: 'areola', name: 'Areola', target: [580, 236], side: 'right', y: 196 },
  {
    term: 'seno-galattoforo',
    name: 'Seno galattoforo',
    lines: ['Seno', 'galattoforo'],
    target: [553, 270],
    side: 'right',
    y: 324,
  },
  {
    term: 'dotto-galattoforo',
    name: 'Dotto galattoforo',
    lines: ['Dotto', 'galattoforo'],
    target: [494, 305],
    side: 'right',
    y: 392,
  },
  { term: 'lobulo-mammario', name: 'Lobulo', target: [372, 342], side: 'left', y: 330 },
  { term: 'lobo-mammario', name: 'Lobo', target: [435, 216], side: 'right', y: 110, x: 520 },
  {
    term: 'tessuto-adiposo-mammella',
    name: 'Tessuto adiposo',
    lines: ['Tessuto', 'adiposo'],
    target: [430, 410],
    side: 'left',
    y: 420,
  },
  {
    term: 'legamenti-sospensori',
    name: 'Legamento sospensore',
    lines: ['Legamento', 'sospensore'],
    target: [331, 163],
    side: 'left',
    y: 150,
  },
  {
    term: 'muscolo-grande-pettorale',
    name: 'Muscolo grande pettorale',
    lines: ['Muscolo grande', 'pettorale'],
    target: [270, 236],
    side: 'left',
    y: 236,
  },
];

const COLUMNS = { left: 156, right: 664 };

// Legamenti sospensori: dalla fascia del muscolo, tra i lobi, fino alla pelle.
// Corrono tra un lobo e l'altro e poi piegano verso la pelle, attraverso il tessuto.
const LIGAMENTS = [
  'M290 120 C 322 126 356 128 387 127',
  'M290 148 C 340 168 390 180 420 186 C 442 178 458 170 473 161',
  'M290 206 C 360 214 420 216 470 214 C 502 210 526 202 544 197',
  'M290 312 C 360 312 430 320 480 330 C 520 336 550 340 573 344',
  'M290 360 C 340 380 400 396 440 404 C 466 408 486 412 503 415',
  'M290 400 C 318 412 340 422 360 427',
];

export function BreastDiagram() {
  return (
    <svg className="anatomy-diagram breast-diagram" viewBox="0 0 780 470" aria-hidden="true">
      <text className="orientation" x="4" y="462">
        Verso la schiena
      </text>
      <text className="orientation" x="776" y="462" textAnchor="end">
        Verso il davanti
      </text>

      {/* Parete del torace: coste, muscoli intercostali e muscolo grande pettorale. */}
      <rect className="intercostal" x="200" y="0" width="86" height="460" />
      {RIBS.map((y) => (
        <ellipse key={y} className="rib" cx="222" cy={y} rx="17" ry="24" />
      ))}
      <text className="region" x="222" y="24" textAnchor="middle">
        coste
      </text>
      {/* Il grande pettorale è spesso in alto e si assottiglia verso il basso. */}
      <clipPath id="breast-muscle-shape">
        <path d={MUSCLE} />
      </clipPath>
      <path className="muscle" d={MUSCLE} />
      <g className="muscle-fibres" clipPath="url(#breast-muscle-shape)">
        {[30, 70, 110, 150, 190, 230, 270, 310, 350, 390, 430].map((y) => (
          <path key={y} d={`M236 ${y} L 286 ${y - 14}`} />
        ))}
      </g>

      {/* Mammella: tessuto adiposo con i lobi, i dotti e i legamenti sospensori. */}
      <path className="fat" d={BREAST} />
      <g className="ligament">
        {LIGAMENTS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {LOBES.map((l, i) => (
        <LobeDrawing key={l.angle} i={i} />
      ))}
      <path className="skin" d={SKIN} />
      <path className="areola" d="M558 207 C 565 212 570 217 574 222 C 580 229 584 238 586 246 M586 278 C 589 289 588 303 584 318" />
      <path className="nipple" d="M586 246 L 600 248 C 608 249 613 256 613 262 C 613 268 608 275 600 276 L 586 278 Z" />
      <path className="fascia" d="M286 0 L 286 460" />

      {BREAST_PARTS.map((p, i) => (
        <PartLabel key={p.name} part={p} n={i + 1} columns={COLUMNS} />
      ))}
    </svg>
  );
}
