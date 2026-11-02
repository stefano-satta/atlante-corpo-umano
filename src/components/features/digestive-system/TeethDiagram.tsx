import { type FigurePart, PartLabel } from '@/components/features/panel/AnatomyFigure';

// Due disegni per l'atlante, come nelle figure 23.10 e 23.11 di OpenStax 23.3: a sinistra l'arcata
// superiore permanente vista dal basso, con gli incisivi in alto e i denti colorati per tipo; a destra
// la sezione lungo l'asse di un molare nel suo alveolo. Forme e proporzioni sono semplificate.

type Point = [number, number];
const f = (n: number) => n.toFixed(1);

type Kind = 'incisor' | 'canine' | 'premolar' | 'molar';

/** Un dente della mezza arcata, dal centro verso il fondo: larghezza lungo l'arcata e spessore, in mm circa. */
interface Tooth {
  kind: Kind;
  width: number;
  depth: number;
}

const HALF_ARCH: Tooth[] = [
  { kind: 'incisor', width: 8.5, depth: 7 },
  { kind: 'incisor', width: 6.5, depth: 6 },
  { kind: 'canine', width: 7.5, depth: 8 },
  { kind: 'premolar', width: 7, depth: 9 },
  { kind: 'premolar', width: 6.5, depth: 9 },
  { kind: 'molar', width: 10, depth: 11 },
  { kind: 'molar', width: 9, depth: 11 },
  { kind: 'molar', width: 8.5, depth: 10 },
];

/** Linea mediana della mezza arcata destra (curva di Bézier), dagli incisivi centrali ai terzi molari. */
const ARCH_X = 345;
const CURVE: Point[] = [
  [ARCH_X, 74],
  [ARCH_X + 72, 74],
  [ARCH_X + 112, 180],
  [ARCH_X + 114, 404],
];

const bezier = (t: number): Point => {
  const [a, b, c, d] = CURVE;
  const u = 1 - t;
  const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return [k[0] * a[0] + k[1] * b[0] + k[2] * c[0] + k[3] * d[0], k[0] * a[1] + k[1] * b[1] + k[2] * c[1] + k[3] * d[1]];
};

// Lunghezza lungo la curva, campionata: serve a mettere i denti uno accanto all'altro.
const SAMPLES = Array.from({ length: 401 }, (_, i) => bezier(i / 400));
const LENGTHS = [0];
for (let i = 1; i < SAMPLES.length; i++)
  LENGTHS.push(LENGTHS[i - 1] + Math.hypot(SAMPLES[i][0] - SAMPLES[i - 1][0], SAMPLES[i][1] - SAMPLES[i - 1][1]));
const TOTAL = LENGTHS[LENGTHS.length - 1];
const SCALE = TOTAL / HALF_ARCH.reduce((s, t) => s + t.width, 0);

/** Punto e direzione della curva a una certa distanza dall'inizio. */
function at(s: number) {
  const i = Math.max(
    1,
    LENGTHS.findIndex((l) => l >= s),
  );
  const [x0, y0] = SAMPLES[i - 1];
  const [x1, y1] = SAMPLES[i];
  const len = Math.hypot(x1 - x0, y1 - y0);
  return { point: [x0, y0] as Point, tangent: [(x1 - x0) / len, (y1 - y0) / len] as Point };
}

/** Arcata intera, dal terzo molare sinistro al destro: la gengiva su cui stanno i denti. */
const mirror = ([x, y]: Point) => `${f(2 * ARCH_X - x)} ${f(y)}`;
const plain = ([x, y]: Point) => `${f(x)} ${f(y)}`;
const ARCH_GUM = `M${mirror(CURVE[3])} C ${mirror(CURVE[2])} ${mirror(CURVE[1])} ${mirror(CURVE[0])} C ${CURVE.slice(1).map(plain).join(' ')}`;

/** Dente posato sull'arcata: centro, angolo e misure in pixel. */
const PLACED = HALF_ARCH.map((tooth, i) => {
  const start = HALF_ARCH.slice(0, i).reduce((s, t) => s + t.width, 0);
  const { point, tangent } = at((start + tooth.width / 2) * SCALE);
  return {
    ...tooth,
    center: point,
    tangent,
    angle: (Math.atan2(tangent[1], tangent[0]) * 180) / Math.PI,
    w: tooth.width * SCALE * 0.95,
    d: tooth.depth * SCALE,
  };
});

/** Punto sul lato esterno (verso le guance) di un dente della mezza arcata sinistra, per il richiamo. */
function outerEdgeLeft(i: number): Point {
  const { center, tangent, d } = PLACED[i];
  const out: Point = [tangent[1], -tangent[0]];
  const p: Point = [center[0] + out[0] * (d / 2 - 7), center[1] + out[1] * (d / 2 - 7)];
  return [Math.round(2 * ARCH_X - p[0]), Math.round(p[1])];
}

/**
 * Forma di un dente visto dalla superficie che mastica, nel suo sistema: x lungo l'arcata,
 * y negativa verso l'esterno (labbra e guance).
 */
function ToothShape({ kind, w, d }: { kind: Kind; w: number; d: number }) {
  const x = w / 2;
  const y = d / 2;
  if (kind === 'incisor')
    return (
      <>
        <path
          className="crown"
          d={`M${f(-x)} ${f(-y * 0.5)} C ${f(-x)} ${f(-y * 1.05)} ${f(x)} ${f(-y * 1.05)} ${f(x)} ${f(-y * 0.5)} C ${f(x)} ${f(y * 0.4)} ${f(x * 0.35)} ${f(y)} 0 ${f(y)} C ${f(-x * 0.35)} ${f(y)} ${f(-x)} ${f(y * 0.4)} ${f(-x)} ${f(-y * 0.5)} Z`}
        />
        <path
          className="groove"
          d={`M${f(-x * 0.75)} ${f(-y * 0.55)} Q 0 ${f(-y * 0.7)} ${f(x * 0.75)} ${f(-y * 0.55)}`}
        />
      </>
    );
  if (kind === 'canine')
    return (
      <>
        <path
          className="crown"
          d={`M${f(-x)} ${f(-y * 0.2)} C ${f(-x * 0.9)} ${f(-y * 0.9)} ${f(-x * 0.2)} ${f(-y * 1.05)} 0 ${f(-y)} C ${f(x * 0.2)} ${f(-y * 1.05)} ${f(x * 0.9)} ${f(-y * 0.9)} ${f(x)} ${f(-y * 0.2)} C ${f(x)} ${f(y * 0.5)} ${f(x * 0.4)} ${f(y)} 0 ${f(y)} C ${f(-x * 0.4)} ${f(y)} ${f(-x)} ${f(y * 0.5)} ${f(-x)} ${f(-y * 0.2)} Z`}
        />
        <path
          className="groove"
          d={`M${f(-x * 0.7)} ${f(-y * 0.25)} L 0 ${f(-y * 0.45)} L ${f(x * 0.7)} ${f(-y * 0.25)} M0 ${f(-y * 0.45)} L 0 ${f(y * 0.5)}`}
        />
      </>
    );
  if (kind === 'premolar')
    return (
      <>
        <path
          className="crown"
          d={`M${f(-x)} 0 C ${f(-x)} ${f(-y * 1.1)} ${f(x)} ${f(-y * 1.1)} ${f(x)} 0 C ${f(x)} ${f(y * 1.05)} ${f(-x)} ${f(y * 1.05)} ${f(-x)} 0 Z`}
        />
        <path
          className="groove"
          d={`M${f(-x * 0.6)} ${f(y * 0.05)} Q 0 ${f(-y * 0.12)} ${f(x * 0.6)} ${f(y * 0.05)}`}
        />
      </>
    );
  return (
    <>
      <rect className="crown" x={f(-x)} y={f(-y)} width={f(w)} height={f(d)} rx={f(w * 0.36)} />
      <path
        className="groove"
        d={`M${f(-x * 0.62)} ${f(-y * 0.05)} L ${f(-x * 0.1)} ${f(-y * 0.12)} L ${f(x * 0.12)} ${f(y * 0.12)} L ${f(x * 0.62)} ${f(y * 0.05)} M${f(-x * 0.1)} ${f(-y * 0.12)} L ${f(-x * 0.05)} ${f(-y * 0.65)} M${f(x * 0.12)} ${f(y * 0.12)} L ${f(x * 0.08)} ${f(y * 0.65)}`}
      />
    </>
  );
}

/** Mezza arcata destra; la sinistra è la stessa, specchiata. */
function HalfArch() {
  return (
    <>
      {PLACED.map((t) => (
        <g
          key={`${t.center[0]}-${t.center[1]}`}
          className={`tooth ${t.kind}`}
          transform={`translate(${f(t.center[0])} ${f(t.center[1])}) rotate(${f(t.angle)})`}
        >
          <ToothShape kind={t.kind} w={t.w} d={t.d} />
        </g>
      ))}
    </>
  );
}

/** Nome di ogni gruppo accanto ai suoi denti, sul lato destro dell'arcata. */
const GROUPS: { kind: Kind; label: string; teeth: number[] }[] = [
  { kind: 'incisor', label: 'incisivi', teeth: [0, 1] },
  { kind: 'canine', label: 'canino', teeth: [2] },
  { kind: 'premolar', label: 'premolari', teeth: [3, 4] },
  { kind: 'molar', label: 'molari', teeth: [5, 6, 7] },
];

function groupLabel(teeth: number[]): Point {
  const c = teeth.map((i) => PLACED[i]);
  const x = c.reduce((s, t) => s + t.center[0] + t.tangent[1] * (t.d / 2 + 12), 0) / c.length;
  const y = c.reduce((s, t) => s + t.center[1] - t.tangent[0] * (t.d / 2 + 12), 0) / c.length;
  return [x, y];
}

// Sezione del molare, disegnata attorno a x = 700 e spostata a sinistra nel suo riquadro.
const MOLAR_DX = -400;
const m = (x: number, y: number): Point => [x + MOLAR_DX, y];

/** Superficie esterna del dente: corona con due cuspidi, colletto e due radici. */
const TOOTH =
  'M630 190 C 615 170 608 140 612 115 C 616 85 630 68 645 66 C 665 64 685 80 700 84 C 715 80 735 64 755 66 C 770 68 784 85 788 115 C 792 140 785 170 770 190 C 772 260 765 360 752 432 Q 745 446 738 432 C 728 360 718 300 712 278 Q 700 262 688 278 C 682 300 672 360 662 432 Q 655 446 648 432 C 635 360 628 260 630 190 Z';
/** La sola superficie delle radici, sotto il colletto: cemento e legamento la seguono. */
const ROOTS =
  'M770 190 C 772 260 765 360 752 432 Q 745 446 738 432 C 728 360 718 300 712 278 Q 700 262 688 278 C 682 300 672 360 662 432 Q 655 446 648 432 C 635 360 628 260 630 190';
/** Smalto: dalla superficie della corona al confine con la dentina, che si assottiglia al colletto. */
const ENAMEL =
  'M630 190 C 615 170 608 140 612 115 C 616 85 630 68 645 66 C 665 64 685 80 700 84 C 715 80 735 64 755 66 C 770 68 784 85 788 115 C 792 140 785 170 770 190 C 768 165 768 140 764 122 C 758 100 748 92 738 94 C 722 98 712 104 700 106 C 688 104 678 98 662 94 C 652 92 642 100 636 122 C 632 140 632 165 630 190 Z';
/** Cavità della polpa: la camera nella corona e i due canali radicolari, aperti all'apice. */
const PULP =
  'M662 150 C 662 128 676 126 684 138 Q 700 150 716 138 C 724 126 738 128 738 150 L 740 215 C 742 290 748 370 746 436 L 742 436 C 738 370 730 300 722 248 Q 700 232 678 248 C 670 300 662 370 658 436 L 654 436 C 652 370 658 290 660 215 Z';
const GUMS = [
  'M552 232 C 572 206 604 184 627 176 L 640 262 L 552 262 Z',
  'M848 232 C 828 206 796 184 773 176 L 760 262 L 848 262 Z',
];
/** Spazi dell'osso spugnoso. */
const BONE_HOLES: [number, number, number, number][] = [
  [575, 270, 9, 6],
  [598, 300, 7, 10],
  [572, 335, 10, 7],
  [600, 372, 8, 6],
  [578, 410, 7, 9],
  [602, 448, 9, 6],
  [572, 470, 6, 5],
  [700, 312, 5, 7],
  [698, 350, 6, 5],
  [702, 388, 5, 8],
  [700, 430, 6, 6],
  [825, 270, 9, 6],
  [802, 300, 7, 10],
  [828, 335, 10, 7],
  [800, 372, 8, 6],
  [822, 410, 7, 9],
  [798, 448, 9, 6],
  [828, 470, 6, 5],
];

/** Parentesi a sinistra del molare: corona, colletto e radice. */
const BRACKETS: { from: number; to: number }[] = [
  { from: 66, to: 172 },
  { from: 178, to: 236 },
  { from: 242, to: 440 },
];
const BRACKET_X = 140;

const tooth = (name: string, lines: string[], i: number, y: number): FigurePart => ({
  term: '',
  name,
  lines,
  target: outerEdgeLeft(i),
  side: 'left',
  y,
});

const ARCH_PARTS: FigurePart[] = [
  tooth('Incisivo centrale (7-8 anni)', ['Incisivo centrale', '7-8 anni'], 0, 52),
  tooth('Incisivo laterale (8-9 anni)', ['Incisivo laterale', '8-9 anni'], 1, 104),
  tooth('Canino (11-12 anni)', ['Canino', '11-12 anni'], 2, 156),
  tooth('Primo premolare (9-10 anni)', ['Primo premolare', '9-10 anni'], 3, 208),
  tooth('Secondo premolare (10-12 anni)', ['Secondo premolare', '10-12 anni'], 4, 260),
  tooth('Primo molare (6-7 anni)', ['Primo molare', '6-7 anni'], 5, 312),
  tooth('Secondo molare (12-13 anni)', ['Secondo molare', '12-13 anni'], 6, 364),
  tooth('Terzo molare, o dente del giudizio', ['Terzo molare', 'o dente del giudizio'], 7, 420),
];

const MOLAR_PARTS: FigurePart[] = [
  ...(['Corona', 'Colletto', 'Radice'] as const).map(
    (name, i): FigurePart => ({
      term: '',
      name,
      target: [BRACKET_X, Math.round((BRACKETS[i].from + BRACKETS[i].to) / 2)],
      side: 'left',
      y: Math.round((BRACKETS[i].from + BRACKETS[i].to) / 2),
      x: 110,
    }),
  ),
  { term: '', name: 'Smalto', target: m(755, 78), side: 'right', y: 66 },
  { term: '', name: 'Dentina', target: m(754, 168), side: 'right', y: 122 },
  {
    term: '',
    name: 'Cavità della polpa, con vasi e nervi',
    lines: ['Cavità della polpa', 'con vasi e nervi'],
    target: m(722, 165),
    side: 'right',
    y: 180,
  },
  { term: '', name: 'Gengiva', target: m(818, 222), side: 'right', y: 238 },
  { term: '', name: 'Cemento', target: m(770, 290), side: 'right', y: 292 },
  {
    term: '',
    name: 'Legamento periodontale',
    lines: ['Legamento', 'periodontale'],
    target: m(770, 345),
    side: 'right',
    y: 346,
  },
  {
    term: '',
    name: 'Canale radicolare',
    lines: ['Canale', 'radicolare'],
    target: m(744, 385),
    side: 'right',
    y: 402,
  },
  { term: '', name: 'Osso', target: m(818, 425), side: 'right', y: 456 },
];

export const TEETH_PARTS = [...ARCH_PARTS, ...MOLAR_PARTS];

const ARCH_COLUMNS = { left: 165, right: 0 };
const MOLAR_COLUMNS = { left: 110, right: 480 };

/** I due disegni uno sopra l'altro: l'arcata superiore e la sezione di un molare. */
export function TeethDiagram() {
  return (
    <>
      <svg className="anatomy-diagram teeth-diagram" viewBox="0 0 580 470" aria-hidden="true">
        <text className="panel-title" x={ARCH_X} y="20" textAnchor="middle">
          Arcata superiore, vista dal basso
        </text>
        {/* Arcata: gengiva sotto i denti, poi le due metà; in alto il davanti della bocca. */}
        <path className="arch-gum" d={ARCH_GUM} />
        <HalfArch />
        <g transform={`translate(${2 * ARCH_X} 0) scale(-1 1)`}>
          <HalfArch />
        </g>
        {GROUPS.map((g) => {
          const [x, y] = groupLabel(g.teeth);
          return (
            <text key={g.kind} className={`region group ${g.kind}`} x={f(x)} y={f(y)} dy="0.35em">
              {g.label}
            </text>
          );
        })}
        {ARCH_PARTS.map((p, i) => (
          <PartLabel key={p.name} part={p} n={i + 1} columns={ARCH_COLUMNS} />
        ))}
      </svg>
      <svg className="anatomy-diagram teeth-diagram molar-section" viewBox="0 0 610 500" aria-hidden="true">
        <text className="panel-title" x={700 + MOLAR_DX} y="20" textAnchor="middle">
          Sezione di un molare
        </text>
        {/* Molare nel suo alveolo: osso, legamento periodontale, gengiva, poi il dente. */}
        <g transform={`translate(${MOLAR_DX} 0)`}>
          <clipPath id="teeth-socket">
            <rect x="540" y="236" width="320" height="264" />
          </clipPath>
          <g clipPath="url(#teeth-socket)">
            <path
              className="bone"
              d="M552 250 C 600 236 640 238 700 270 C 760 238 800 236 848 250 L 848 500 L 552 500 Z"
            />
            {BONE_HOLES.map(([x, y, rx, ry]) => (
              <ellipse key={`${x}-${y}`} className="bone-hole" cx={x} cy={y} rx={rx} ry={ry} />
            ))}
            <path className="ligament" d={ROOTS} />
          </g>
          {GUMS.map((d) => (
            <path key={d} className="gum" d={d} />
          ))}
          <path className="dentin" d={TOOTH} />
          <path className="enamel" d={ENAMEL} />
          <clipPath id="teeth-root">
            <rect x="600" y="192" width="200" height="300" />
          </clipPath>
          <path className="cementum" d={ROOTS} clipPath="url(#teeth-root)" />
          <path className="pulp" d={PULP} />
          {/* Vasi e nervo entrano dall'apice di ogni radice e si ramificano nella camera della polpa. */}
          <g className="pulp-contents">
            <path
              className="vessel artery"
              d="M657 500 L 657 436 C 660 370 664 300 668 230 C 670 190 672 165 676 145 M668 200 L 690 160"
            />
            <path
              className="vessel vein"
              d="M744 500 L 744 436 C 740 370 735 300 731 230 C 729 190 728 165 726 145 M731 205 L 712 162"
            />
            <path
              className="vessel nerve"
              d="M661 500 L 660 436 C 664 370 668 300 673 230 C 676 195 684 170 694 150 M748 500 L 747 436 C 743 370 737 300 734 230 C 732 195 720 170 706 150"
            />
          </g>
        </g>
        {BRACKETS.map(({ from, to }) => (
          <path
            key={from}
            className="bracket"
            d={`M${BRACKET_X + 8} ${from} L ${BRACKET_X} ${from} L ${BRACKET_X} ${to} L ${BRACKET_X + 8} ${to}`}
          />
        ))}

        {MOLAR_PARTS.map((p, i) => (
          <PartLabel key={p.name} part={p} n={ARCH_PARTS.length + i + 1} columns={MOLAR_COLUMNS} />
        ))}
      </svg>
    </>
  );
}
