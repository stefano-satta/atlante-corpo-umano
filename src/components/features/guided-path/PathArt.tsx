import type { ReactNode } from 'react';

// Illustrazioni delle card della pagina Percorsi: disegni d'atmosfera nei colori della colorazione
// ematossilina-eosina (D16), come un vetrino visto al microscopio. Sono decorative (aria-hidden):
// il titolo e la descrizione della card dicono già di che cosa parla il percorso.

/** Campo del microscopio: fondo della sala, alone e bordo del vetrino. */
function Field({ id, children }: { id: string; children: ReactNode }) {
  return (
    <svg className="path-art-svg" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-glow`} cx="50%" cy="46%" r="62%">
          <stop offset="0" className="art-glow" />
          <stop offset="1" className="art-room" />
        </radialGradient>
        <radialGradient id={`${id}-vignette`} cx="50%" cy="50%" r="50%">
          <stop offset="0.7" stopOpacity="0" />
          <stop offset="1" stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${id}-glow)`} />
      {children}
      <rect width="400" height="240" fill={`url(#${id}-vignette)`} className="art-vignette" />
      <circle className="art-field" cx="200" cy="120" r="150" />
    </svg>
  );
}

/** Rami dell'albero bronchiale fino ai grappoli di alveoli, generati sempre uguali. */
function bronchialTree() {
  const branches: string[] = [];
  const alveoli: [number, number, number][] = [];
  const grow = (x: number, y: number, angle: number, length: number, depth: number) => {
    const x2 = x + Math.sin(angle) * length;
    const y2 = y + Math.cos(angle) * length;
    branches.push(`M${x.toFixed(1)} ${y.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}|${depth}`);
    if (depth === 0) {
      for (let k = 0; k < 5; k++) {
        const a = angle + (k - 2) * 0.55;
        alveoli.push([x2 + Math.sin(a) * 7, y2 + Math.cos(a) * 7, 5.5 - (k % 2)]);
      }
      return;
    }
    // Variazione fissa, calcolata dalla posizione: i rami non sono tutti uguali, ma il disegno non cambia.
    const jitter = Math.sin(x2 * 0.37 + y2 * 0.21);
    const spread = 0.26 + depth * 0.07 + jitter * 0.08;
    grow(x2, y2, angle - spread, length * (0.74 + jitter * 0.1), depth - 1);
    grow(x2, y2, angle + spread * (0.9 - jitter * 0.15), length * (0.78 - jitter * 0.08), depth - 1);
  };
  grow(200, -14, 0, 64, 5);
  return { branches, alveoli };
}
const TREE = bronchialTree();

/** "Un respiro": l'albero bronchiale che si apre negli alveoli, con l'ossigeno che entra. */
function BreathArt() {
  return (
    <Field id="art-breath">
      <g className="art-airways">
        {TREE.branches.map((b) => {
          const [d, depth] = b.split('|');
          return <path key={d} d={d} style={{ strokeWidth: 2 + Number(depth) * 2.4 }} />;
        })}
      </g>
      <g className="art-alveoli">
        {TREE.alveoli.map(([cx, cy, r]) => (
          <circle key={`${cx.toFixed(1)}-${cy.toFixed(1)}`} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <g className="art-oxygen">
        {[
          [62, 40],
          [96, 78],
          [318, 52],
          [346, 96],
          [140, 30],
          [272, 26],
          [54, 150],
          [352, 168],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" />
        ))}
      </g>
    </Field>
  );
}

const GUT =
  'M-20 54 C60 20 120 30 150 62 C180 94 120 128 160 150 C200 172 250 96 292 112 C334 128 300 186 344 200 C372 210 400 196 430 176';

/** "Il viaggio del cibo": un'ansa intestinale con il cibo che la percorre e i villi sul fondo. */
function FoodArt() {
  const villi = Array.from({ length: 22 }, (_, i) => 6 + i * 18.5);
  return (
    <Field id="art-food">
      <g className="art-villi">
        {villi.map((x, i) => {
          const h = 34 + ((i * 37) % 23);
          return <path key={x} d={`M${x} 244 C${x} ${244 - h} ${x + 14} ${244 - h} ${x + 14} 244 Z`} />;
        })}
      </g>
      <path className="art-gut-wall" d={GUT} />
      <path className="art-gut" d={GUT} />
      <path className="art-gut-folds" d={GUT} />
      <path className="art-food-dots" d={GUT} />
      <g className="art-mouth">
        <circle cx="72" cy="186" r="5" />
        <circle cx="94" cy="200" r="3" />
        <circle cx="330" cy="40" r="4" />
        <circle cx="352" cy="58" r="2.5" />
      </g>
    </Field>
  );
}

/** Illustrazione e apparato di ogni percorso; un percorso nuovo senza disegno usa quello del cibo. */
export const PATH_ART: Record<string, { art: () => ReactNode; system: string }> = {
  respirazione: { art: BreathArt, system: 'Apparato respiratorio' },
  'viaggio-del-cibo': { art: FoodArt, system: 'Apparato digerente' },
};
