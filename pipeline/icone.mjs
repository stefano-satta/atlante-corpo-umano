/**
 * Icone dell'atlante (D56) da `public/favicon.svg`, l'unica sorgente: favicon.ico (16 e 32 px),
 * apple-touch-icon (180), icone del manifesto (192, 512) e la versione "maskable" (512).
 * Rasterizza con il Chromium di Playwright, già usato dai test end-to-end.
 * Genera anche l'anteprima per le condivisioni social (og-image.png, 1200 × 630).
 * Uso: npm run icone
 */
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const PUBLIC = new URL('../public/', import.meta.url);
const ROOM = '#16131f';
const svg = await readFile(new URL('favicon.svg', PUBLIC), 'utf8');
/**
 * A 16 px anello, pupille e sorriso si impastano: per quella misura il disegno si riduce al
 * campo, al corpo e a due occhi bianchi allineati ai pixel (griglia 16 × 16).
 */
const SMALL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges"><circle cx="8" cy="8" r="8" fill="${ROOM}" shape-rendering="auto"/><ellipse cx="8" cy="9" rx="5" ry="6" fill="#b8434b" shape-rendering="auto"/><rect x="5" y="6" width="2" height="2" fill="#fff"/><rect x="9" y="6" width="2" height="2" fill="#fff"/><rect x="6" y="7" width="1" height="1" fill="#221a33"/><rect x="10" y="7" width="1" height="1" fill="#221a33"/></svg>`;

/**
 * Il logo su un quadrato `size`. `scale` è la parte del lato occupata dal campo; con `fill` il
 * fondo è pieno (per le icone dei telefoni, che non vogliono angoli trasparenti).
 */
const page = await (await chromium.launch()).newPage();
async function render(size, { scale = 1, fill = false, source = svg } = {}) {
  const inner = Math.round(size * scale);
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>html,body{margin:0;width:${size}px;height:${size}px;background:${fill ? ROOM : 'transparent'};display:grid;place-items:center}svg{width:${inner}px;height:${inner}px;display:block}</style>${source}`,
  );
  return page.screenshot({ omitBackground: !fill, type: 'png' });
}

/** File ICO con immagini PNG dentro (ammesse da Windows Vista in poi e da tutti i browser). */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(size % 256, entry);
    header.writeUInt8(size % 256, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.png)]);
}

const out = (name, data) => writeFile(new URL(name, PUBLIC), data);
await out(
  'favicon.ico',
  ico([
    { size: 16, png: await render(16, { source: SMALL }) },
    { size: 32, png: await render(32) },
  ]),
);
await out('apple-touch-icon.png', await render(180, { scale: 0.88, fill: true }));
await out('icon-192.png', await render(192));
await out('icon-512.png', await render(512));
// Zona sicura delle icone maskable: un cerchio di raggio pari al 40 % del lato.
await out('icon-maskable-512.png', await render(512, { scale: 0.78, fill: true }));

/**
 * Anteprima per le condivisioni (Open Graph, 1200 × 630). Logo e nome stanno al centro: le miniature
 * quadrate di alcune app ritagliano i lati. I caratteri sono quelli del sito, incorporati.
 */
const font = async (pkg, file) =>
  (await readFile(new URL(`../node_modules/@fontsource-variable/${pkg}/files/${file}`, import.meta.url))).toString(
    'base64',
  );
const [title, text] = await Promise.all([
  font('bricolage-grotesque', 'bricolage-grotesque-latin-wght-normal.woff2'),
  font('atkinson-hyperlegible-next', 'atkinson-hyperlegible-next-latin-wght-normal.woff2'),
]);
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<style>
  @font-face{font-family:Bricolage;src:url(data:font/woff2;base64,${title}) format('woff2');font-weight:200 800}
  @font-face{font-family:Atkinson;src:url(data:font/woff2;base64,${text}) format('woff2');font-weight:200 800}
  html,body{margin:0;width:1200px;height:630px;background:${ROOM};color:#e9e4ef}
  body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;
    background:radial-gradient(circle at 50% 38%,#29233a 0,${ROOM} 62%)}
  svg{width:220px;height:220px;display:block}
  h1{margin:0;font:700 76px/1 Bricolage,sans-serif;letter-spacing:-0.01em}
  p{margin:0;font:400 32px/1.3 Atkinson,sans-serif;color:#a59db3}
  b{color:#ef8fac;font-weight:400}
</style>${svg}<h1>Atlante del corpo umano</h1><p>Organi, ossa, muscoli, vasi e nervi in 3D <b>·</b> con fonti citate</p>`);
await page.evaluate(() => document.fonts.ready);
await out('og-image.png', await page.screenshot({ type: 'png' }));
await page.context().browser().close();
console.log('Icone scritte in public/.');
