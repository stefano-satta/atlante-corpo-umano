/**
 * Icone dell'atlante (D56) da `public/favicon.svg`, l'unica sorgente: favicon.ico (16 e 32 px),
 * apple-touch-icon (180), icone del manifesto (192, 512) e la versione "maskable" (512).
 * Rasterizza con il Chromium di Playwright, già usato dai test end-to-end.
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
await page.context().browser().close();
console.log('Icone scritte in public/.');
