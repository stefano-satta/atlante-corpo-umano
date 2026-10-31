import { type CSSProperties, useEffect, useRef, useState } from 'react';
import type { DigestionDiagramId } from '@/models/digestion';

// Schemi del percorso "Il viaggio del cibo", disegnati per l'atlante. Il corpo intero, lo stomaco,
// il duodeno e il colon sono visti di fronte (il lato destro del corpo è a sinistra di chi guarda);
// bocca e gola sono viste di lato, con il viso a sinistra. Forme e proporzioni non sono in scala, e
// lo dichiara l'avvertenza sotto il disegno. Ogni schema riceve la fase e la mostra con attributi
// data-* e posizioni calcolate qui; il movimento tra una fase e l'altra è affidato al CSS.

interface DiagramProps {
  phase: string;
  /** Riproduzione in corso: accende i movimenti continui (flussi, onde, masticazione). */
  playing: boolean;
  reducedMotion: boolean;
}

/** Spostamento di un elemento disegnato nell'origine, animato dal CSS (`.moving`). */
const at = (x: number, y: number, scale = 1, opacity = 1): CSSProperties => ({
  transform: `translate(${x}px, ${y}px) scale(${scale})`,
  opacity,
});

function Arrowhead({ id, className }: { id: string; className: string }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0 0 L10 5 L0 10 Z" className={className} />
    </marker>
  );
}

/* 1 · Il canale digerente intero, con il bolo che lo percorre. */

// Tratti del viaggio, ciascuno fino al punto in cui il bolo si ferma nella fase corrispondente.
const TRACT_SEGMENTS = [
  'M180 50 C181 80 183 100 186 118',
  'M186 118 C190 148 194 162 204 172 C226 182 250 192 238 206',
  'M238 206 C230 222 210 226 194 226 C176 228 170 238 170 250 C170 264 186 270 202 268 C216 266 222 258 222 252 C240 262 244 284 226 290 C206 296 156 286 146 300 C142 306 160 302 190 300',
  'M190 300 C220 302 240 310 232 330 C220 342 160 334 140 336 C128 338 120 344 118 350 L116 300 L114 268 C114 262 118 258 124 258 C150 261 168 274 182 276',
  'M182 276 C200 280 226 274 240 262 C246 258 252 262 252 268 L252 332 C252 350 236 356 214 358 C196 360 184 364 182 372 L182 386',
];
const TRAVEL_MS = 1500;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** Posizione del bolo lungo i tratti: si muove dal punto della fase precedente a quello della nuova. */
function useTractPosition(stop: number, reducedMotion: boolean) {
  const segments = useRef<(SVGPathElement | null)[]>([]);
  const distance = useRef(0);
  const [point, setPoint] = useState({ x: 180, y: 50 });

  useEffect(() => {
    const paths = segments.current.filter((p): p is SVGPathElement => !!p && 'getTotalLength' in p);
    if (paths.length !== TRACT_SEGMENTS.length) return;
    const lengths = paths.map((p) => p.getTotalLength());
    const target = lengths.slice(0, stop).reduce((a, b) => a + b, 0);
    const pointAt = (d: number) => {
      let rest = d;
      for (let i = 0; i < paths.length; i++) {
        if (rest <= lengths[i] || i === paths.length - 1) {
          const p = paths[i].getPointAtLength(Math.min(rest, lengths[i]));
          return { x: p.x, y: p.y };
        }
        rest -= lengths[i];
      }
      return { x: 180, y: 50 };
    };
    const from = distance.current;
    if (reducedMotion || from === target) {
      distance.current = target;
      setPoint(pointAt(target));
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / TRAVEL_MS);
      distance.current = from + (target - from) * easeInOut(t);
      setPoint(pointAt(distance.current));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [stop, reducedMotion]);

  return { segments, point };
}

const TRACT_STOPS = ['bocca', 'esofago', 'stomaco', 'tenue', 'crasso', 'retto'];
// Organi accesi in ogni fase: quelli che il bolo attraversa e quelli che vi versano i loro succhi.
const TRACT_ACTIVE: Record<string, string[]> = {
  bocca: ['bocca', 'ghiandole'],
  esofago: ['esofago'],
  stomaco: ['stomaco'],
  tenue: ['tenue', 'fegato', 'colecisti', 'pancreas'],
  crasso: ['crasso'],
  retto: ['crasso'],
};

export function TractDiagram({ phase, reducedMotion }: DiagramProps) {
  const stop = Math.max(0, TRACT_STOPS.indexOf(phase));
  const { segments, point } = useTractPosition(stop, reducedMotion);
  const active = TRACT_ACTIVE[phase] ?? [];
  const organ = (id: string) => ({ 'data-organ': id, 'data-active': active.includes(id) });

  return (
    <svg className="digestion-diagram tract-diagram" viewBox="0 0 360 420" aria-hidden="true" data-phase={phase}>
      <text className="orientation" x="8" y="16">
        Destra del corpo
      </text>
      <text className="orientation" x="352" y="16" textAnchor="end">
        Sinistra del corpo
      </text>
      <g className="silhouette">
        <circle cx="180" cy="34" r="28" />
        <path d="M166 62 L166 78 C120 84 86 100 80 140 L72 410 M194 62 L194 78 C240 84 274 100 280 140 L288 410" />
      </g>
      <path className="diaphragm" d="M86 166 C130 140 230 140 274 166" />

      <g {...organ('ghiandole')}>
        <ellipse className="gland" cx="152" cy="38" rx="6" ry="9" />
        <ellipse className="gland" cx="208" cy="38" rx="6" ry="9" />
        <ellipse className="gland" cx="164" cy="56" rx="6" ry="4" />
        <ellipse className="gland" cx="196" cy="56" rx="6" ry="4" />
      </g>
      <g {...organ('bocca')}>
        <path className="mouth" d="M171 50 Q180 55 189 50" />
      </g>
      <g {...organ('esofago')}>
        <path className="tube" d="M180 56 C182 90 186 130 196 168" />
      </g>
      <g {...organ('fegato')}>
        <path
          className="liver"
          d="M92 176 C112 158 196 158 214 172 C204 190 168 206 120 210 C102 206 92 194 92 176 Z"
        />
      </g>
      <g {...organ('colecisti')}>
        <ellipse className="gallbladder" cx="158" cy="208" rx="9" ry="6" />
      </g>
      <g {...organ('stomaco')}>
        <path
          className="organ-fill"
          d="M194 166 C206 154 248 156 260 178 C272 202 258 232 228 238 C214 240 202 236 194 230 L196 220 C208 224 226 222 234 210 C240 198 230 186 216 184 C204 182 196 176 194 166 Z"
        />
      </g>
      <g {...organ('pancreas')}>
        <path
          className="pancreas"
          d="M184 246 C190 238 214 240 240 238 C258 236 272 236 274 242 C276 250 256 252 238 252 C218 254 206 262 192 262 C182 262 178 254 184 246 Z"
        />
      </g>
      <g {...organ('tenue')}>
        <path
          className="tube thin"
          d="M194 226 C178 228 170 236 170 250 C170 264 184 272 200 270 C214 268 220 260 222 252"
        />
        <path
          className="tube thin"
          d="M222 252 C240 262 244 284 226 290 C206 296 156 286 146 300 C138 312 168 316 204 312 C236 308 244 322 230 332 C214 342 162 334 140 336 C130 337 124 338 120 340"
        />
      </g>
      <g {...organ('crasso')}>
        <path
          className="tube wide"
          d="M118 352 L114 268 C114 262 118 258 124 258 C160 262 200 290 240 262 C246 258 252 262 252 268 L252 332 C252 350 236 356 214 358 C196 360 184 364 182 372 L182 396"
        />
        <path className="tube thin" d="M114 356 C110 366 102 370 96 364" />
      </g>

      <g className="tract-path">
        {TRACT_SEGMENTS.map((d, i) => (
          <path
            key={d}
            d={d}
            ref={(el) => {
              segments.current[i] = el;
            }}
          />
        ))}
      </g>
      <g className="bolus-marker" transform={`translate(${point.x} ${point.y})`}>
        <circle className="halo" r="11" />
        <circle className="bolus" r="6" />
      </g>

      <g className="labels">
        <text x="40" y="44">
          Bocca
        </text>
        <text x="226" y="112">
          Esofago
        </text>
        <text x="40" y="186">
          Fegato
        </text>
        <text className="minor" x="100" y="226">
          Colecisti
        </text>
        <text x="282" y="196">
          Stomaco
        </text>
        <text className="minor" x="282" y="248">
          Pancreas
        </text>
        <text x="152" y="324" textAnchor="middle" className="minor">
          Tenue
        </text>
        <text x="28" y="300">
          Crasso
        </text>
        <text x="200" y="392">
          Retto
        </text>
      </g>
    </svg>
  );
}

/* 2 · La bocca, vista di lato. */

// Pezzi di cibo: posizione e grandezza nella masticazione, con la saliva e raccolti nel bolo.
const CRUMBS: { chew: [number, number, number]; saliva: [number, number, number]; bolus: [number, number] }[] = [
  { chew: [76, 128, 2], saliva: [72, 127, 1], bolus: [194, 126] },
  { chew: [102, 128, 1.8], saliva: [88, 130, 1.1], bolus: [202, 124] },
  { chew: [128, 128, 2.2], saliva: [104, 126, 1], bolus: [208, 129] },
  { chew: [154, 128, 1.9], saliva: [118, 130, 1.1], bolus: [198, 133] },
  { chew: [76, 128, 0], saliva: [132, 127, 1], bolus: [206, 134] },
  { chew: [102, 128, 0], saliva: [146, 130, 1], bolus: [212, 127] },
  { chew: [128, 128, 0], saliva: [158, 127, 0.9], bolus: [201, 129] },
  { chew: [154, 128, 0], saliva: [166, 130, 0.9], bolus: [192, 131] },
];

// Denti di un'arcata vista di lato, dagli incisivi ai molari: la corona superiore scende fino a 124,
// quella inferiore sale fino a 132; nel mezzo si mastica il cibo.
const TOOTH_X = [60, 74, 88, 103, 119, 136, 154];
function Teeth({ lower }: { lower?: boolean }) {
  return (
    <g className="teeth">
      {TOOTH_X.map((x, i) => {
        const h = i > 3 ? 12 : 14;
        return <rect key={x} x={x} y={lower ? 132 : 124 - h} width={i > 3 ? 15 : 12} height={h} rx="3" />;
      })}
    </g>
  );
}

export function MouthDiagram({ phase, playing }: DiagramProps) {
  const crumb = (c: (typeof CRUMBS)[number]) => {
    if (phase === 'masticazione') return at(c.chew[0], c.chew[1], c.chew[2], c.chew[2] ? 1 : 0);
    if (phase === 'saliva') return at(c.saliva[0], c.saliva[1], c.saliva[2], c.saliva[2] ? 1 : 0);
    return at(c.bolus[0], c.bolus[1], 1.5);
  };
  return (
    <svg
      className="digestion-diagram mouth-diagram"
      viewBox="0 0 360 280"
      aria-hidden="true"
      data-phase={phase}
      data-moving={playing}
    >
      <defs>
        <Arrowhead id="arrow-saliva" className="arrowhead saliva-head" />
      </defs>
      <text className="orientation" x="8" y="16">
        Davanti
      </text>
      <text className="orientation" x="352" y="16" textAnchor="end">
        Dietro
      </text>
      <path className="silhouette" d="M100 10 C74 14 58 32 56 54 L52 72 L40 92 L50 98 L50 102" />
      <path className="silhouette" d="M56 160 C58 178 68 188 84 194 C120 204 150 210 178 216" />
      <path className="pharynx-wall" d="M254 58 C258 120 260 190 258 272" />
      <path className="bone" d="M58 106 C100 96 150 94 198 100" />
      <g className="soft-palate">
        <path className="muscle" d="M198 100 C212 104 222 114 228 128" />
        <circle className="uvula" cx="229" cy="132" r="4" />
      </g>
      <path className="lip" d="M50 104 C45 112 47 120 54 124" />
      <ellipse className="gland" cx="294" cy="122" rx="22" ry="32" />
      <path className="duct" d="M274 120 C236 124 196 122 158 118" markerEnd="url(#arrow-saliva)" />
      <Teeth />

      {/* Mandibola, lingua e pavimento della bocca si muovono insieme masticando. */}
      <g className="jaw">
        <ellipse className="gland" cx="122" cy="180" rx="16" ry="6" />
        <ellipse className="gland" cx="180" cy="206" rx="22" ry="11" />
        <path className="duct" d="M164 200 C138 188 112 174 94 160" markerEnd="url(#arrow-saliva)" />
        <path className="duct" d="M122 174 L121 166" markerEnd="url(#arrow-saliva)" />
        <g className="tongue">
          <path d="M80 146 C92 136 128 132 162 133 C196 135 216 150 222 170 C224 180 220 188 212 190 C190 188 160 182 130 176 C108 170 90 160 80 146 Z" />
        </g>
        <path className="bone" d="M56 146 C56 166 62 180 76 186 L200 192 C212 192 220 182 222 166 L228 100" />
        <Teeth lower />
        <path className="lip" d="M54 132 C47 138 47 146 54 152" />
      </g>

      <g className="saliva-drops">
        <circle cx="80" cy="134" r="2.5" />
        <circle cx="110" cy="122" r="2" />
        <circle cx="126" cy="134" r="2.5" />
        <circle cx="152" cy="122" r="2" />
        <circle cx="96" cy="124" r="2" />
      </g>
      <g className="food">
        {CRUMBS.map((c) => (
          <g key={`${c.bolus[0]}-${c.bolus[1]}`} className="moving" style={crumb(c)}>
            <circle r="3" />
          </g>
        ))}
      </g>

      <g className="labels">
        <text x="66" y="88" className="minor">
          Palato duro
        </text>
        <text x="176" y="88" className="minor">
          Palato molle
        </text>
        <text x="150" y="166" className="on-organ">
          Lingua
        </text>
        <text x="96" y="58" className="minor">
          Denti
        </text>
        <text x="294" y="172" textAnchor="middle">
          Parotide
        </text>
        <text x="180" y="236" textAnchor="middle" className="minor">
          Sottomandibolare
        </text>
        <text x="20" y="232" className="minor">
          Sottolinguale
        </text>
        <text x="266" y="262" className="minor">
          Faringe
        </text>
      </g>
      <path className="leader" d="M108 62 L108 108" />
      <path className="leader" d="M60 222 C80 210 100 196 112 184" />
    </svg>
  );
}

/* 3 · La deglutizione, vista di lato. */

const SWALLOW_BOLUS: Record<string, [number, number]> = {
  volontaria: [232, 148],
  faringea: [248, 214],
  esofagea: [258, 304],
  sfintere: [300, 386],
};

export function SwallowDiagram({ phase }: DiagramProps) {
  const [x, y] = SWALLOW_BOLUS[phase] ?? SWALLOW_BOLUS.volontaria;
  const ring = phase === 'esofagea' || phase === 'sfintere';
  return (
    <svg className="digestion-diagram swallow-diagram" viewBox="0 0 360 420" aria-hidden="true" data-phase={phase}>
      <defs>
        <Arrowhead id="arrow-air" className="arrowhead" />
      </defs>
      <text className="orientation" x="8" y="16">
        Davanti
      </text>
      <text className="orientation" x="352" y="16" textAnchor="end">
        Dietro
      </text>
      <path className="nasal" d="M40 50 C80 34 180 34 212 50 L216 92 L40 96 Z" />
      <path
        className="air-flow"
        d="M60 70 C120 66 190 66 236 80 C246 100 220 230 206 260"
        markerEnd="url(#arrow-air)"
      />
      <path className="pharynx-wall" d="M252 44 C256 110 258 180 258 236" />
      <path className="bone" d="M50 100 C100 92 150 90 196 96" />
      <g className="soft-palate">
        <path className="muscle" d="M196 96 C212 100 222 110 226 124" />
        <circle className="uvula" cx="227" cy="128" r="4" />
      </g>
      <path className="silhouette" d="M70 20 C52 30 44 50 42 66 L30 84 L40 90 L40 96" />
      <path className="silhouette" d="M46 156 C48 174 60 184 76 188 C110 196 150 202 180 206" />
      <path className="lip" d="M40 98 C35 106 37 112 44 116" />
      <rect className="tooth" x="48" y="102" width="11" height="13" rx="3" />
      <g className="tongue">
        <path d="M60 142 C90 118 150 110 186 118 C214 126 226 150 224 180 C222 192 216 198 206 200 C170 194 120 184 96 172 C78 162 66 154 60 142 Z" />
      </g>
      <rect className="tooth" x="48" y="122" width="11" height="13" rx="3" />
      <path className="lip" d="M44 122 C37 128 37 136 44 142" />
      <path className="bone" d="M46 136 C46 156 52 170 66 176 L190 182 C204 182 212 174 214 160 L222 98" />

      <g className="larynx">
        <path className="cartilage" d="M196 226 L196 264 M226 222 L226 264" />
        <path className="epiglottis" d="M220 220 C222 204 228 192 236 184" />
      </g>
      <path className="trachea" d="M211 262 L211 412" />
      <g className="trachea-rings">
        {[280, 300, 320, 340, 360, 380, 400].map((ry) => (
          <path key={ry} d={`M201 ${ry} L221 ${ry}`} />
        ))}
      </g>

      <path className="esophagus" d="M255 236 C258 280 260 320 262 356" />
      <path className="diaphragm" d="M120 352 C180 334 300 334 352 352" />
      <path
        className="organ-fill"
        d="M248 358 C250 384 270 408 310 408 C346 408 358 378 348 358 C336 342 296 344 270 352 C262 354 254 356 248 358 Z"
      />
      <g className="sphincter upper" data-open={phase === 'faringea'}>
        <path d="M242 238 L248 238" />
        <path d="M262 238 L268 238" />
      </g>
      <g className="sphincter lower" data-open={phase === 'sfintere'}>
        <path d="M248 352 L254 352" />
        <path d="M268 352 L274 352" />
      </g>

      <g className="moving" style={at(x, y)}>
        <g className="peristalsis" data-visible={ring}>
          <path d="M-13 -40 Q-4 -28 -13 -16 M13 -40 Q4 -28 13 -16" />
          <path className="push" d="M0 14 L0 28" markerEnd="url(#arrow-air)" />
        </g>
        <circle className="bolus" r="9" />
      </g>

      <g className="labels">
        <text x="60" y="84" className="minor">
          Cavità nasale
        </text>
        <text x="100" y="160">
          Lingua
        </text>
        <text x="270" y="130" className="minor">
          Palato molle
        </text>
        <text x="270" y="190">
          Faringe
        </text>
        <text x="130" y="232" className="minor">
          Epiglottide
        </text>
        <text x="148" y="300">
          Trachea
        </text>
        <text x="274" y="296">
          Esofago
        </text>
        <text x="130" y="374" className="minor">
          Diaframma
        </text>
        <text x="300" y="400" textAnchor="middle" className="minor">
          Stomaco
        </text>
        <text className="breath-stop" x="160" y="84">
          Respiro fermo
        </text>
      </g>
    </svg>
  );
}

/* 4 · Lo stomaco, visto di fronte. */

const STOMACH_SHAPE =
  'M190 62 C186 40 214 26 240 30 C276 34 298 64 296 104 C294 168 254 226 190 236 C150 242 118 232 100 214 L80 206 L80 184 L100 188 C126 196 158 190 176 168 C190 150 194 110 190 62 Z';
const CHUNKS: [number, number, number][] = [
  [236, 86, 9],
  [262, 120, 7],
  [218, 140, 8],
  [250, 168, 6],
  [200, 196, 7],
  [160, 214, 6],
];

export function StomachDiagram({ phase }: DiagramProps) {
  const chyme = phase !== 'succo';
  return (
    <svg className="digestion-diagram stomach-diagram" viewBox="0 0 360 290" aria-hidden="true" data-phase={phase}>
      <defs>
        <Arrowhead id="arrow-stomach" className="arrowhead" />
        <clipPath id="stomach-clip">
          <path d={STOMACH_SHAPE} />
        </clipPath>
      </defs>
      <text className="orientation" x="46" y="284">
        Destra del corpo
      </text>
      <text className="orientation" x="352" y="284" textAnchor="end">
        Sinistra del corpo
      </text>
      <path className="esophagus" d="M198 4 L198 66" />
      <path className="duodenum" d="M84 195 L50 195 C36 195 28 208 28 226 L28 286" />
      <path className="organ-fill" d={STOMACH_SHAPE} />
      <g clipPath="url(#stomach-clip)">
        <path className="chyme-fill" data-visible={chyme} d={STOMACH_SHAPE} />
        <g className="rugae">
          <path d="M214 60 C230 90 236 130 226 170" />
          <path d="M244 52 C266 96 268 140 246 190" />
          <path d="M150 210 C170 206 190 200 206 190" />
        </g>
        <g className="chunks" data-visible={!chyme}>
          {CHUNKS.map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
        <g className="acid" data-visible={phase === 'succo'}>
          {[
            [206, 76],
            [284, 96],
            [276, 150],
            [228, 210],
            [140, 222],
            [184, 170],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" />
          ))}
        </g>
        <g className="waves" data-visible={phase === 'onde'}>
          <path d="M196 100 Q246 120 296 108" />
          <path d="M180 160 Q226 184 268 194" />
          <path d="M140 190 Q150 216 156 240" />
          <path d="M106 184 Q110 204 112 224" />
        </g>
      </g>
      <path className="mucus" d={STOMACH_SHAPE} />
      <path
        className="wave-direction"
        data-visible={phase === 'onde'}
        d="M262 92 C260 170 200 214 120 210"
        markerEnd="url(#arrow-stomach)"
      />
      <g className="sphincter pyloric" data-open={phase === 'svuotamento'}>
        <path d="M84 180 L84 188" />
        <path d="M84 202 L84 210" />
      </g>
      <g className="moving squirt" style={phase === 'svuotamento' ? at(38, 236, 1, 1) : at(104, 198, 0.6, 0)}>
        <circle r="6" />
      </g>
      <path
        className="return-arrow"
        data-visible={phase === 'svuotamento'}
        d="M110 214 C140 232 176 226 200 206"
        markerEnd="url(#arrow-stomach)"
      />

      <g className="labels">
        <text x="210" y="20" className="minor">
          Esofago
        </text>
        <text x="300" y="54" className="minor">
          Fondo
        </text>
        <text x="300" y="170">
          Corpo
        </text>
        <text x="100" y="262">
          Piloro
        </text>
        <text x="6" y="180" className="minor">
          Duodeno
        </text>
        <text className="phase-note" data-visible={phase === 'succo'} x="138" y="116">
          HCl · pH 1,5–3,5
        </text>
        <text className="phase-note" data-visible={phase === 'succo'} x="138" y="134">
          pepsina
        </text>
        <text className="phase-note" data-visible={phase === 'svuotamento'} x="36" y="276">
          ≈ 3 mL
        </text>
      </g>
    </svg>
  );
}

/* 5 · Duodeno, fegato, colecisti e pancreas, visti di fronte. */

const DUODENUM =
  'M236 168 C210 168 186 164 172 176 C164 186 168 220 170 246 C172 268 190 276 214 276 C240 276 262 268 272 250 C276 240 276 228 274 218';
const CHYME_REACH: Record<string, number> = { chimo: 30, bile: 55, pancreas: 75, miscela: 100 };

export function DuodenumDiagram({ phase }: DiagramProps) {
  const bile = phase === 'bile' || phase === 'miscela';
  const juice = phase === 'pancreas' || phase === 'miscela';
  return (
    <svg className="digestion-diagram duodenum-diagram" viewBox="0 0 360 320" aria-hidden="true" data-phase={phase}>
      <defs>
        <Arrowhead id="arrow-hormone" className="arrowhead hormone-head" />
      </defs>
      <text className="orientation" x="8" y="310">
        Destra del corpo
      </text>
      <text className="orientation" x="352" y="310" textAnchor="end">
        Sinistra del corpo
      </text>
      <path
        className="liver"
        d="M14 40 C40 14 200 10 262 30 C286 38 290 56 270 70 C226 100 150 116 90 120 C40 122 10 92 14 40 Z"
      />
      <path
        className="organ-fill"
        d="M360 118 C320 110 280 118 262 138 C254 148 248 156 238 160 L238 178 C254 178 270 172 286 162 C312 150 340 150 360 152 Z"
      />
      <path
        className="pancreas"
        d="M190 196 C202 184 226 184 240 192 C262 196 300 190 336 182 C350 180 354 194 342 200 C312 212 270 216 246 222 C242 238 236 256 220 262 C204 266 188 256 186 240 C184 224 184 208 190 196 Z"
      />
      <path className="duodenum" d={DUODENUM} />
      <path className="jejunum" d="M274 218 C272 208 286 200 300 204" />
      <path
        className="chyme-line"
        data-neutral={phase === 'miscela'}
        d={DUODENUM}
        pathLength="100"
        style={{ strokeDasharray: `${CHYME_REACH[phase] ?? 30} 100` }}
      />
      <g className="sphincter pyloric" data-open="true">
        <path d="M238 156 L244 156" />
        <path d="M238 180 L244 180" />
      </g>

      <g className="ducts">
        <path className="duct" d="M150 96 L164 122 M184 96 L168 122 M166 122 L170 146" />
        <path className="duct" d="M136 134 C150 140 160 144 170 146 C172 176 178 196 182 214" />
        <path className="duct" d="M340 190 C300 200 260 208 234 214 C214 218 196 216 184 216" />
      </g>
      <path
        className="flow bile-flow"
        data-visible={bile}
        d="M136 134 C150 140 160 144 170 146 C172 176 178 196 182 214"
      />
      <path className="flow bile-flow" data-visible={bile} d="M150 96 L164 122 M184 96 L168 122 M166 122 L170 146" />
      <path
        className="flow juice-flow"
        data-visible={juice}
        d="M340 190 C300 200 260 208 234 214 C214 218 196 216 184 216"
      />
      <g className="gallbladder-wrap" data-contracted={bile}>
        <path
          className="gallbladder"
          d="M116 118 C108 134 112 156 128 160 C144 162 150 146 142 128 C138 120 128 114 116 118 Z"
        />
      </g>

      <path
        className="hormone"
        data-visible={phase === 'bile'}
        d="M160 200 C130 196 116 184 122 166"
        markerEnd="url(#arrow-hormone)"
      />
      <path
        className="hormone"
        data-visible={phase === 'pancreas'}
        d="M226 282 C276 290 312 258 306 222"
        markerEnd="url(#arrow-hormone)"
      />

      <g className="fat" data-split={phase === 'miscela'}>
        <g className="drops-big">
          <circle cx="198" cy="270" r="5" />
          <circle cx="232" cy="270" r="5" />
        </g>
        <g className="drops-small">
          {[190, 198, 206, 222, 230, 238].map((cx, i) => (
            <circle key={cx} cx={cx} cy={i % 2 ? 266 : 273} r="2" />
          ))}
        </g>
      </g>

      <g className="labels">
        <text x="90" y="64">
          Fegato
        </text>
        <text x="64" y="150" className="minor">
          Colecisti
        </text>
        <text x="300" y="104" className="minor">
          Stomaco
        </text>
        <text x="96" y="240">
          Duodeno
        </text>
        <text x="282" y="236">
          Pancreas
        </text>
        <text className="phase-note" data-visible={phase === 'bile'} x="10" y="204">
          colecistochinina
        </text>
        <text className="phase-note" data-visible={phase === 'pancreas'} x="250" y="300">
          secretina
        </text>
        <text className="phase-note" data-visible={phase === 'chimo'} x="190" y="154">
          chimo acido
        </text>
      </g>
    </svg>
  );
}

/* 6 · Un villo dell'intestino tenue, in sezione. */

type Particle = { kind: 'sugar' | 'amino' | 'fat'; pos: Record<string, [number, number]> };
// Posizioni nelle tre fasi: sull'orletto a spazzola, nei capillari (zuccheri e amminoacidi) o
// nel vaso chilifero (grassi). Le catene si separano sull'orletto.
const PARTICLES: Particle[] = [
  { kind: 'sugar', pos: { orletto: [146, 70], capillari: [146, 150], chilifero: [140, 236] } },
  { kind: 'sugar', pos: { orletto: [156, 62], capillari: [212, 180], chilifero: [218, 240] } },
  { kind: 'sugar', pos: { orletto: [166, 56], capillari: [216, 214], chilifero: [222, 270] } },
  { kind: 'amino', pos: { orletto: [196, 56], capillari: [204, 128], chilifero: [220, 252] } },
  { kind: 'amino', pos: { orletto: [206, 62], capillari: [214, 158], chilifero: [218, 228] } },
  { kind: 'amino', pos: { orletto: [216, 70], capillari: [154, 194], chilifero: [148, 262] } },
  { kind: 'fat', pos: { orletto: [104, 40], capillari: [170, 70], chilifero: [180, 150] } },
  { kind: 'fat', pos: { orletto: [256, 40], capillari: [190, 70], chilifero: [180, 200] } },
  { kind: 'fat', pos: { orletto: [180, 30], capillari: [180, 60], chilifero: [180, 246] } },
];

export function VillusDiagram({ phase }: DiagramProps) {
  const villus = 'M120 266 C118 180 124 110 148 92 C166 78 194 78 212 92 C236 110 242 180 240 266';
  return (
    <svg className="digestion-diagram villus-diagram" viewBox="0 0 360 320" aria-hidden="true" data-phase={phase}>
      <defs>
        <linearGradient id="villus-blood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" className="stop-rich" />
          <stop offset="1" className="stop-poor" />
        </linearGradient>
      </defs>
      <rect className="lumen" x="0" y="0" width="360" height="300" />
      <path className="wall" d="M0 266 L360 266 L360 300 L0 300 Z" />
      <path className="villus side" d="M30 266 C28 200 36 150 60 150 C84 150 92 200 90 266" />
      <path className="villus side" d="M270 266 C268 200 276 150 300 150 C324 150 332 200 330 266" />
      <path className="villus" d={villus} />
      <path className="brush" d={villus} />
      <path
        className="capillary"
        d="M140 268 C138 200 140 140 156 110 C168 96 192 96 204 110 C220 140 222 200 220 268"
      />
      <path className="capillary thin" d="M146 230 C170 220 194 220 216 230 M144 170 C170 160 194 160 218 170" />
      <path className="lacteal" d="M180 280 L180 132" />
      <path className="lymph-vessel" d="M100 284 L260 284" />
      <path className="vein" d="M220 270 C240 286 280 292 360 292" />

      <g className="flow-dash" data-visible={phase === 'capillari'}>
        <path d="M204 110 C220 140 222 200 220 268" />
      </g>
      <g className="flow-dash lymph" data-visible={phase === 'chilifero'}>
        <path d="M180 132 L180 280" />
      </g>

      {PARTICLES.map((p, i) => {
        const [x, y] = p.pos[phase] ?? p.pos.orletto;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: le particelle sono fisse e non cambiano ordine
          <g key={i} className={`moving particle ${p.kind}`} style={at(x, y)}>
            {p.kind === 'fat' ? (
              <circle r="5" />
            ) : (
              <rect x="-3.5" y="-3.5" width="7" height="7" rx={p.kind === 'amino' ? 3.5 : 1} />
            )}
          </g>
        );
      })}

      <g className="labels">
        <text x="10" y="22" className="minor">
          Lume dell'intestino
        </text>
        <text x="250" y="96">
          Villo
        </text>
        <text x="246" y="116" className="minor">
          microvilli
        </text>
        <text x="96" y="132" className="minor" textAnchor="end">
          capillari
        </text>
        <text x="250" y="138" className="minor">
          vaso chilifero
        </text>
        <text x="8" y="314" className="minor">
          verso i vasi linfatici
        </text>
        <text x="352" y="314" className="minor" textAnchor="end">
          verso la vena porta
        </text>
      </g>
    </svg>
  );
}

/* 7 · L'intestino crasso, visto di fronte. */

const COLON =
  'M70 262 L70 92 C70 70 84 60 104 60 L256 60 C278 60 290 72 290 94 L290 214 C290 244 272 252 246 254 C214 256 190 262 184 280 L184 318';
// Tratto riempito: [lunghezza, inizio] in centesimi del percorso, dal cieco all'ano.
const COLON_CONTENT: Record<string, [number, number]> = {
  ingresso: [18, 0],
  acqua: [44, 0],
  flora: [52, 4],
  massa: [26, 72],
};

export function ColonDiagram({ phase }: DiagramProps) {
  const [length, start] = COLON_CONTENT[phase] ?? COLON_CONTENT.ingresso;
  return (
    <svg className="digestion-diagram colon-diagram" viewBox="0 0 360 330" aria-hidden="true" data-phase={phase}>
      <defs>
        <Arrowhead id="arrow-colon" className="arrowhead water-head" />
      </defs>
      <text className="orientation" x="8" y="22">
        Destra del corpo
      </text>
      <text className="orientation" x="352" y="22" textAnchor="end">
        Sinistra del corpo
      </text>
      <path className="ileum" d="M170 236 C130 240 104 250 92 260" />
      <ellipse className="cecum" cx="70" cy="266" rx="22" ry="20" />
      <path className="appendix" d="M62 284 C58 300 48 308 40 302" />
      <path className="colon" d={COLON} />
      <path className="haustra" d={COLON} />
      <path
        className="colon-content"
        data-phase={phase}
        d={COLON}
        pathLength="100"
        style={{ strokeDasharray: `${length} 100`, strokeDashoffset: -start }}
      />
      <g className="water" data-visible={phase === 'acqua'}>
        <path d="M70 200 L40 200" markerEnd="url(#arrow-colon)" />
        <path d="M70 140 L40 140" markerEnd="url(#arrow-colon)" />
        <path d="M130 60 L130 30" markerEnd="url(#arrow-colon)" />
        <path d="M200 60 L200 30" markerEnd="url(#arrow-colon)" />
      </g>
      <g className="bacteria" data-visible={phase === 'flora'}>
        {[
          [100, 62, 20],
          [128, 58, -30],
          [152, 64, 10],
          [176, 58, 60],
          [76, 120, 80],
          [66, 170, -70],
          [200, 62, -20],
        ].map(([x, y, r]) => (
          <rect
            key={`${x}-${y}`}
            x={x - 4}
            y={y - 1.5}
            width="8"
            height="3"
            rx="1.5"
            transform={`rotate(${r} ${x} ${y})`}
          />
        ))}
        <circle className="gas" cx="230" cy="58" r="4" />
        <circle className="gas" cx="244" cy="64" r="3" />
        <circle className="gas" cx="286" cy="110" r="3.5" />
      </g>
      <path
        className="mass-arrow"
        data-visible={phase === 'massa'}
        d="M236 86 C270 92 270 120 270 200"
        markerEnd="url(#arrow-colon)"
      />

      <g className="labels">
        <text x="104" y="112">
          Colon
        </text>
        <text x="104" y="128" className="minor">
          ascendente
        </text>
        <text x="152" y="100" className="minor">
          trasverso
        </text>
        <text x="268" y="150" className="minor" textAnchor="end">
          discendente
        </text>
        <text x="214" y="302" className="minor">
          sigmoideo
        </text>
        <text x="96" y="296" className="minor">
          Cieco
        </text>
        <text x="8" y="318" className="minor">
          Appendice
        </text>
        <text x="160" y="314" className="minor" textAnchor="end">
          Retto
        </text>
        <text x="142" y="226" className="minor">
          Ileo
        </text>
        <text className="phase-note" data-visible={phase === 'flora'} x="120" y="40">
          vitamina K
        </text>
      </g>
    </svg>
  );
}

/* 8 · Retto e canale anale, in sezione. */

const STOOL: Record<string, [number, number, number, number]> = {
  riempimento: [180, 134, 1, 1],
  riflesso: [180, 168, 0.95, 1],
  volonta: [180, 176, 0.92, 1],
  evacuazione: [180, 300, 0.7, 0],
};

export function RectumDiagram({ phase }: DiagramProps) {
  const [x, y, s, o] = STOOL[phase] ?? STOOL.riempimento;
  const internalOpen = phase !== 'riempimento';
  const externalOpen = phase === 'evacuazione';
  const externalHeld = phase === 'riflesso' || phase === 'volonta';
  return (
    <svg className="digestion-diagram rectum-diagram" viewBox="0 0 360 300" aria-hidden="true" data-phase={phase}>
      <defs>
        <Arrowhead id="arrow-rectum" className="arrowhead" />
      </defs>
      <path className="colon" d="M320 6 C320 50 270 58 226 62" />
      <path
        className="rectum-lumen"
        d="M150 66 L210 66 C222 108 222 168 200 196 L188 212 L188 280 L172 280 L172 212 L160 196 C138 168 138 108 150 66 Z"
      />
      <g className="rectum-walls" data-contracted={phase === 'riflesso'}>
        <path d="M150 66 C138 108 138 168 160 196 L172 212 L172 280" />
        <path d="M210 66 C222 108 222 168 200 196 L188 212 L188 280" />
      </g>
      <g className="squeeze" data-visible={phase === 'riflesso'}>
        <path d="M114 130 L134 130" markerEnd="url(#arrow-rectum)" />
        <path d="M246 130 L226 130" markerEnd="url(#arrow-rectum)" />
      </g>
      <g className="sphincter-internal" data-open={internalOpen}>
        <rect className="left" x="162" y="204" width="8" height="38" rx="2" />
        <rect className="right" x="190" y="204" width="8" height="38" rx="2" />
      </g>
      <g className="sphincter-external" data-open={externalOpen} data-held={externalHeld}>
        <rect className="left" x="146" y="230" width="14" height="44" rx="3" />
        <rect className="right" x="200" y="230" width="14" height="44" rx="3" />
      </g>
      <g className="moving stool" style={at(x, y, s, o)}>
        <ellipse rx="22" ry="30" />
      </g>

      <g className="labels">
        <text x="240" y="96" className="minor">
          Colon sigmoideo
        </text>
        <text x="250" y="178">
          Retto
        </text>
        <text x="30" y="210" className="minor">
          Sfintere interno
        </text>
        <text x="30" y="224" className="minor sub">
          involontario
        </text>
        <text x="226" y="252" className="minor">
          Sfintere esterno
        </text>
        <text x="226" y="266" className="minor sub">
          volontario
        </text>
        <text x="196" y="296" className="minor">
          Ano
        </text>
      </g>
      <path className="leader" d="M112 214 L160 222" />
      <path className="leader" d="M224 250 L214 250" />
    </svg>
  );
}

export const DIGESTION_DIAGRAMS: Record<DigestionDiagramId, (props: DiagramProps) => React.JSX.Element> = {
  digerente: TractDiagram,
  bocca: MouthDiagram,
  deglutizione: SwallowDiagram,
  stomaco: StomachDiagram,
  duodeno: DuodenumDiagram,
  villo: VillusDiagram,
  colon: ColonDiagram,
  retto: RectumDiagram,
};
