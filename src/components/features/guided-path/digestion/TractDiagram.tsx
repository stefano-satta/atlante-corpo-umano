import { useEffect, useRef, useState } from 'react';
import type { DiagramProps } from './diagramParts';

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
