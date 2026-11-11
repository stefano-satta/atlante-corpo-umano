import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

/** Attende che il modello 3D sia caricato e la scena interattiva. */
async function waitForScene(page: Page) {
  await expect(page.getByRole('status')).toHaveCount(0, { timeout: 45_000 });
}

/**
 * Entra dalla soglia (D26) quando il modello è pronto. Il tour della prima visita si salta,
 * a meno che il test non lo voglia vedere.
 */
async function enter(page: Page, { tour = false } = {}) {
  await page.goto('/');
  const exploreButton = page.getByRole('button', { name: 'Esplora il corpo' });
  await expect(exploreButton).toHaveAttribute('aria-disabled', 'false', { timeout: 45_000 });
  await exploreButton.click();
  await expect(page).toHaveURL(/\/esplora\/organi$/);
  if (!tour)
    await page
      .getByRole('dialog', { name: 'Ruota, avvicinati e sposta' })
      .getByRole('button', { name: 'Salta la guida' })
      .click();
}

/** Controllo di accessibilità WCAG 2.1 AA sull'interfaccia (il canvas 3D è escluso). */
async function checkAccessibility(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('canvas')
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
}

test('la vista iniziale si carica senza errori e senza problemi di accessibilità', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await enter(page);
  await expect(page.getByRole('radio', { name: 'Organi' })).toHaveAttribute('aria-checked', 'true');
  await checkAccessibility(page);
  expect(errors).toEqual([]);
});

test('logo e favicon (D56): icone e manifesto ci sono, la soglia e la barra mostrano il marchio', async ({ page }) => {
  for (const path of ['/favicon.svg', '/favicon.ico', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png']) {
    expect((await page.request.get(path)).status(), path).toBe(200);
  }
  const manifest = await (await page.request.get('/manifest.webmanifest')).json();
  expect(manifest.short_name).toBe('Atlante');
  for (const icon of manifest.icons) expect((await page.request.get(icon.src)).status(), icon.src).toBe(200);

  await page.goto('/');
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href', '/favicon.svg');
  const homeBrand = page.locator('.home .brand');
  await expect(homeBrand).toHaveText('Atlante del corpo umano');
  await expect(homeBrand.locator('svg.logo')).toBeVisible();

  await page.goto('/glossario');
  await expect(page.locator('.top-bar .brand svg.logo')).toBeVisible();
});

test("i meta per motori di ricerca e condivisioni sono nell'HTML servito", async ({ page }) => {
  // I crawler social non eseguono JavaScript: i meta devono stare nell'HTML statico.
  const html = await (await page.request.get('/esplora/organi/cuore')).text();
  expect(html).toMatch(/<meta\s+name="description"\s+content="[^"]{50,}"/);
  expect(html).toMatch(
    /<meta\s+property="og:image"\s+content="https:\/\/atlante-corpo-umano\.netlify\.app\/og-image\.png"/,
  );
  expect(html).toMatch(/<meta\s+name="twitter:card"\s+content="summary_large_image"/);
  const image = await page.request.get('/og-image.png');
  expect(image.status()).toBe(200);
  expect(image.headers()['content-type']).toBe('image/png');
  for (const file of ['/robots.txt', '/sitemap.xml']) expect((await page.request.get(file)).status(), file).toBe(200);

  // Il link canonico segue l'indirizzo, ed è uno solo.
  await page.goto('/glossario');
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveCount(1);
  await expect(canonical).toHaveAttribute('href', 'https://atlante-corpo-umano.netlify.app/glossario');
});

test('il cartellino è collegato alla struttura dalla linea di richiamo', async ({ page }) => {
  await page.goto('/esplora/organi/cuore');
  await waitForScene(page);
  const panel = page.getByRole('complementary', { name: 'Struttura selezionata' });
  await expect(panel.getByRole('heading', { name: 'Cuore' })).toBeVisible();
  await expect(page.locator('svg.callout')).toHaveAttribute('data-visible', 'yes');
  // La linea finisce sul bordo sinistro del pannello (misurato a pannello fermo, dopo l'entrata).
  await expect(async () => {
    const lineEnd = await page
      .locator('svg.callout polyline')
      .evaluate((l) => l.getAttribute('points')?.split(' ').at(-1));
    const panelEdge = await panel.evaluate((p) => p.getBoundingClientRect().left);
    expect(Number(lineEnd?.split(',')[0])).toBeCloseTo(panelEdge, 0);
  }).toPass({ timeout: 5_000 });
  await checkAccessibility(page);
});

test('la scheda si apre, si chiude con Esc e la cronologia funziona', async ({ page }) => {
  await page.goto('/esplora/organi/cuore');
  await waitForScene(page);
  await page.getByRole('button', { name: 'Apri la scheda' }).click();
  await expect(page).toHaveURL(/\/esplora\/organi\/cuore\/scheda$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Cuore' })).toBeFocused();
  await expect(page.getByRole('toolbar')).toHaveCount(0);
  await checkAccessibility(page);

  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/esplora\/organi\/cuore$/);
  await expect(page.getByRole('button', { name: 'Apri la scheda' })).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/esplora\/organi\/cuore\/scheda$/);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('complementary')).toHaveCount(0);
});

test('i tasti 1–9 cambiano apparato', async ({ page }) => {
  await enter(page);
  await page.keyboard.press('2');
  await expect(page.getByRole('radio', { name: 'Scheletro' })).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('3');
  await expect(page.getByRole('radio', { name: 'Muscoli' })).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('5');
  await expect(page.getByRole('radio', { name: 'Nervoso' })).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('6');
  await expect(page.getByRole('radio', { name: 'Digerente' })).toHaveAttribute('aria-checked', 'true');
  await expect(page).toHaveURL(/\/esplora\/digerente$/);
  await page.keyboard.press('7');
  await expect(page.getByRole('radio', { name: 'Respiratorio' })).toHaveAttribute('aria-checked', 'true');
  await expect(page).toHaveURL(/\/esplora\/respiratorio$/);
  await page.keyboard.press('8');
  await expect(page.getByRole('radio', { name: 'Urinario' })).toHaveAttribute('aria-checked', 'true');
  await expect(page).toHaveURL(/\/esplora\/urinario$/);
  await page.keyboard.press('9');
  await expect(page.getByRole('radio', { name: 'Riproduttivo' })).toHaveAttribute('aria-checked', 'true');
  await expect(page).toHaveURL(/\/esplora\/riproduttivo$/);
});

test('su desktop la barra è centrata sulla finestra, con i crediti in basso a destra', async ({ page }) => {
  await enter(page);
  const toolbar = page.getByRole('toolbar');
  const box = await toolbar.boundingBox();
  expect((box?.x ?? 0) + (box?.width ?? 0) / 2).toBeCloseTo(1440 / 2, 0);
  await expect(toolbar.getByRole('button')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Apparati', exact: true })).toHaveCount(0);

  await toolbar.getByRole('button', { name: 'Vista iniziale' }).hover();
  await expect(toolbar.locator('.command-tooltip', { hasText: 'Vista iniziale' })).toHaveCSS('opacity', '1');

  const credits = await page.locator('.footer').boundingBox();
  expect((credits?.x ?? 0) + (credits?.width ?? 0)).toBeCloseTo(1440 - 28, 0);
  expect((credits?.y ?? 0) + (credits?.height ?? 0)).toBeCloseTo(900 - 24, 0);
  await checkAccessibility(page);
});

test('genere e apparati: barra laterale su schermo largo, menu a comparsa sotto i 1024 px', async ({ page }) => {
  await enter(page);
  const sidebar = page.getByRole('region', { name: 'Genere e apparati' });
  await expect(sidebar.getByRole('radiogroup', { name: 'Genere' })).toBeVisible();
  await checkAccessibility(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(sidebar).toHaveCount(0);
  await expect(page.getByRole('radio')).toHaveCount(0);
  await expect(page.locator('.footer')).toBeHidden();
  const commands = page.getByRole('toolbar').getByRole('button');
  await expect(commands).toHaveCount(4);
  await expect(commands.first()).toHaveAccessibleName('Apparati');
  // La barra resta orizzontale anche su smartphone.
  const firstBox = await commands.first().boundingBox();
  const lastBox = await commands.last().boundingBox();
  expect(lastBox?.y).toBe(firstBox?.y);
  expect(lastBox?.x ?? 0).toBeGreaterThan(firstBox?.x ?? 0);
  await commands.first().click();
  const drawer = page.getByRole('dialog', { name: 'Genere e apparati' });
  await expect(drawer).toBeVisible();
  await checkAccessibility(page);

  await drawer.getByRole('radio', { name: 'Donna' }).click();
  await drawer.getByRole('radio', { name: 'Muscoli' }).click();
  await expect(drawer).toBeVisible();
  // Esc chiude il menu, riporta il fuoco sul pulsante e non tocca la vista.
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(commands.first()).toBeFocused();
  await expect(page).toHaveURL(/\/esplora\/muscoli$/);

  // Anche il clic sullo sfondo lo chiude; la scelta resta.
  await commands.first().click();
  await expect(drawer.getByRole('radio', { name: 'Muscoli' })).toHaveAttribute('aria-checked', 'true');
  await page.mouse.click(370, 400);
  await expect(drawer).toBeHidden();
});

test('su schermo stretto il cartellino è un foglio dal basso e la barra si nasconde', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/esplora/organi/cuore');
  await waitForScene(page);
  await expect(async () => {
    const box = await page.getByRole('complementary').boundingBox();
    expect(box?.x).toBe(0);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeCloseTo(844, 0);
  }).toPass({ timeout: 5_000 });
  await expect(page.getByRole('toolbar')).toBeHidden();
  await expect(page.locator('svg.callout')).toHaveAttribute('data-visible', 'no');
  await checkAccessibility(page);
});

test('su smartphone lo schema del percorso sta intero in alto e il foglio si apre a tutta altezza', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/percorsi/respirazione/1');
  await waitForScene(page);
  const panel = page.getByRole('complementary', { name: 'Percorso guidato' });
  const figure = panel.getByRole('figure', { name: 'Schema del torace' });
  const sheetTop = async () => (await panel.locator('.guided-path').boundingBox())?.y ?? 0;
  // Il disegno è tutto visibile, sopra il foglio.
  await expect(async () => {
    const drawing = await figure.locator('.chest-diagram').boundingBox();
    expect(drawing?.y ?? -1).toBeGreaterThanOrEqual(0);
    expect((drawing?.y ?? 0) + (drawing?.height ?? 0)).toBeLessThanOrEqual(await sheetTop());
  }).toPass({ timeout: 5_000 });
  await expect(page.getByRole('navigation', { name: 'Sezioni' })).toBeHidden();
  await checkAccessibility(page);

  // Corpo 3D al posto dello schema, e ritorno.
  await panel.getByRole('button', { name: 'Corpo 3D' }).click();
  await expect(figure).toBeHidden();
  await panel.getByRole('button', { name: 'Schema' }).click();
  await expect(figure).toBeVisible();

  // Il foglio a tutta altezza copre il palco; Avanti porta al passo dopo.
  const handle = panel.getByRole('button', { name: 'Testo a tutta altezza' });
  await handle.click();
  await expect(handle).toHaveAttribute('aria-expanded', 'true');
  await expect(figure).toBeHidden();
  await panel.getByRole('button', { name: 'Avanti' }).click();
  await expect(page).toHaveURL(/\/percorsi\/respirazione\/2$/);
  await expect(panel.getByRole('heading', { name: "Le vie dell'aria" })).toBeVisible();
});

test('il cartellino mostra il testo verificato, i rimandi e le fonti', async ({ page }) => {
  await page.goto('/esplora/organi/cuore');
  await waitForScene(page);
  const panel = page.getByRole('complementary');
  await expect(panel.getByText(/organo muscolare formato da quattro cavità/)).toBeVisible();
  await expect(panel.getByRole('link', { name: /TA2 3932/ })).toHaveAttribute(
    'href',
    'https://ta2viewer.openanatomy.org/?id=3932',
  );
  await expect(panel.getByRole('region', { name: 'Fonti' }).getByRole('listitem')).toHaveCount(3);
  await checkAccessibility(page);
});

test("un indirizzo diretto a un muscolo mostra lo strato dei muscoli e corregge l'apparato", async ({ page }) => {
  await page.goto('/esplora/organi/FJ3131');
  await waitForScene(page);
  await expect(page.getByRole('heading', { name: 'Diaframma' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Muscoli' })).toHaveAttribute('aria-checked', 'true');
  await expect(page).toHaveURL(/\/esplora\/muscoli\/FJ3131$/);
});

test("gli indirizzi di prima si riscrivono nella forma con l'apparato (D47)", async ({ page }) => {
  await page.goto('/organo/cuore');
  await waitForScene(page);
  await expect(page).toHaveURL(/\/esplora\/organi\/cuore\/scheda$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Cuore' })).toBeVisible();
  await page.goto('/esplora/FJ3259');
  await waitForScene(page);
  await expect(page).toHaveURL(/\/esplora\/scheletro\/FJ3259$/);
});

test("l'apparato respiratorio mostra polmoni, muscoli dell'inspirazione e naso (D49, D50)", async ({ page }) => {
  await page.goto('/esplora/respiratorio/polmoni');
  await waitForScene(page);
  const panel = page.getByRole('complementary');
  await expect(panel.getByRole('heading', { name: 'Polmoni' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Respiratorio' })).toHaveAttribute('aria-checked', 'true');
  await expect(page).toHaveURL(/\/esplora\/respiratorio\/polmoni$/);
  // Diaframma, un osso nasale, la cavità nasale e la cartilagine del setto restano nello strato respiratorio.
  for (const id of ['FJ3131', 'FJ3378', 'cavita-nasale', 'ZA-nasal-septal-cartilage']) {
    await page.goto(`/esplora/respiratorio/${id}`);
    await waitForScene(page);
    await expect(page).toHaveURL(new RegExp(`/esplora/respiratorio/${id}$`));
  }
  await page.goto('/esplora/respiratorio/stomaco');
  await waitForScene(page);
  await expect(page).toHaveURL(/\/esplora\/organi\/stomaco$/);
  await checkAccessibility(page);
});

test("gli apparati urinario e riproduttivo hanno i loro organi; l'uretra sta in entrambi (D51, D52)", async ({
  page,
}) => {
  await page.goto('/esplora/urinario/uretra');
  await waitForScene(page);
  const panel = page.getByRole('complementary');
  await expect(panel.getByRole('heading', { name: 'Uretra' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Urinario' })).toHaveAttribute('aria-checked', 'true');
  await expect(panel.getByText('Apparato urinario, Apparato genitale maschile')).toBeVisible();
  // Gli ureteri, aggiunti al modello (D52), restano nello strato urinario.
  await page.goto('/esplora/urinario/ureteri');
  await waitForScene(page);
  await expect(panel.getByRole('heading', { name: 'Ureteri' })).toBeVisible();
  await expect(page).toHaveURL(/\/esplora\/urinario\/ureteri$/);
  await page.goto('/esplora/riproduttivo/uretra');
  await waitForScene(page);
  await expect(page).toHaveURL(/\/esplora\/riproduttivo\/uretra$/);
  // Un organo femminile passa al corpo della donna e resta nello strato riproduttivo.
  await page.goto('/esplora/riproduttivo/utero');
  await waitForScene(page);
  await expect(page).toHaveURL(/\/esplora\/riproduttivo\/utero$/);
  await expect(page.getByRole('radio', { name: 'Donna' })).toHaveAttribute('aria-checked', 'true');
  // Un organo di un altro apparato riporta allo strato degli organi.
  await page.goto('/esplora/urinario/testicoli');
  await waitForScene(page);
  await expect(page).toHaveURL(/\/esplora\/organi\/testicoli$/);
  await checkAccessibility(page);
});

test("l'apparato digerente mostra i suoi organi e i costrittori della faringe (D48)", async ({ page }) => {
  await page.goto('/esplora/digerente/pancreas');
  await waitForScene(page);
  const panel = page.getByRole('complementary');
  await expect(panel.getByRole('heading', { name: 'Pancreas' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Digerente' })).toHaveAttribute('aria-checked', 'true');
  await expect(page).toHaveURL(/\/esplora\/digerente\/pancreas$/);
  await expect(panel.getByRole('link', { name: 'Arterie pancreatiche' })).toHaveAttribute(
    'href',
    '/esplora/digerente/vaso-caudal-pancreatic-artery',
  );
  // Un muscolo costrittore della faringe resta nello strato digerente; il diaframma no.
  await page.goto('/esplora/digerente/FJ2759');
  await waitForScene(page);
  await expect(page).toHaveURL(/\/esplora\/digerente\/FJ2759$/);
  await page.goto('/esplora/digerente/FJ3131');
  await waitForScene(page);
  await expect(page).toHaveURL(/\/esplora\/muscoli\/FJ3131$/);
  await checkAccessibility(page);
});

test('un indirizzo diretto a un osso mostra lo strato dello scheletro', async ({ page }) => {
  await page.goto('/esplora/scheletro/FJ3259');
  await waitForScene(page);
  await expect(page.getByRole('radio', { name: 'Scheletro' })).toHaveAttribute('aria-checked', 'true');
});

test('la scheda del cuore ha tutte le sezioni, i collegamenti e le fonti', async ({ page }) => {
  await page.goto('/esplora/organi/cuore/scheda');
  await waitForScene(page);
  const toc = page.getByRole('navigation', { name: 'Sezioni della scheda' }).getByRole('link');
  await expect(toc).toHaveText([
    'In breve',
    'Dove si trova',
    'Come è fatto',
    'Cosa fa',
    'Il processo',
    'Collegamenti',
    'Fonti',
  ]);
  await expect(page.locator('#sez-fonti li')).toHaveCount(6);
  await checkAccessibility(page);
});

test('le pagine Fonti e Informazioni si aprono dal menu e si chiudono con Esc', async ({ page }) => {
  await page.goto('/esplora/organi/cuore');
  await waitForScene(page);
  // Fonti e Informazioni stanno nel menu secondario della barra, dopo Glossario.
  await page.getByRole('button', { name: 'Altre sezioni' }).click();
  await page.getByRole('button', { name: /^Fonti/ }).click();
  await expect(page).toHaveURL(/\/fonti$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Fonti' })).toBeFocused();
  const main = page.getByRole('main');
  await expect(main.getByRole('link', { name: /How the Heart Works: What the Heart Looks Like/ })).toBeVisible();
  await expect(main.getByText(/Terminologia Anatomica, 2nd edition/)).toBeVisible();
  await checkAccessibility(page);

  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/esplora\/organi\/cuore$/);
  await expect(page.getByRole('button', { name: 'Altre sezioni' })).toBeFocused();

  await page.getByRole('button', { name: 'Altre sezioni' }).click();
  await page.getByRole('button', { name: /^Informazioni/ }).click();
  await expect(page.getByRole('heading', { name: 'Avvertenze' })).toBeVisible();
  await expect(page.getByText(/non sono stati rivisti da un medico/)).toBeVisible();
  await checkAccessibility(page);
  await page.goBack();
  await expect(page).toHaveURL(/\/esplora\/organi\/cuore$/);
  await expect(page.getByRole('main')).toHaveCount(0);
});

test('il ciclo cardiaco nella scheda si comanda da tastiera e non ha problemi di accessibilità', async ({ page }) => {
  await page.goto('/esplora/organi/cuore/scheda');
  await waitForScene(page);
  const cycle = page.getByRole('figure', { name: 'Il ciclo cardiaco, passo per passo' });
  await cycle.scrollIntoViewIfNeeded();
  await expect(cycle.getByRole('heading', { name: 'Le cavità si riempiono' })).toBeVisible();
  await cycle.getByRole('button', { name: 'Passo successivo' }).focus();
  await page.keyboard.press('Enter');
  await expect(cycle.getByRole('heading', { name: 'Parte il segnale' })).toBeVisible();
  await cycle.getByRole('button', { name: /Passo 4/ }).click();
  await expect(cycle.getByText('Primo tono', { exact: true })).toBeVisible();
  await expect(cycle.locator('.heart-diagram')).toHaveAttribute('data-ventricles', 'contratti');
  await checkAccessibility(page);
});

test('con il movimento ridotto il ciclo cardiaco va solo passo per passo', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/esplora/organi/cuore/scheda');
  await waitForScene(page);
  const cycle = page.getByRole('figure', { name: 'Il ciclo cardiaco, passo per passo' });
  await expect(cycle.getByRole('button', { name: 'Passo successivo' })).toBeVisible();
  await expect(cycle.getByRole('button', { name: 'Riproduci' })).toHaveCount(0);
});

test("l'uso prolungato non crea nuovi contesti WebGL e la scena resta viva", async ({ page }) => {
  // Ogni contesto WebGL creato dalla pagina viene contato: oltre il limite del browser
  // (circa 16) il più vecchio, quello della scena, verrebbe chiuso.
  await page.addInitScript(() => {
    const w = window as unknown as { contexts: number };
    w.contexts = 0;
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...a: unknown[]) {
      if (String(a[0]).startsWith('webgl')) w.contexts++;
      return (original as (...b: unknown[]) => unknown).apply(this, a);
    } as typeof original;
  });
  const warnings: string[] = [];
  page.on('console', (m) => /Too many active WebGL contexts|Context Lost/.test(m.text()) && warnings.push(m.text()));
  await enter(page);
  const initial = await page.evaluate(() => (window as unknown as { contexts: number }).contexts);
  for (let i = 0; i < 30; i++) await page.keyboard.press(['1', '2', '3'][i % 3]);
  expect(await page.evaluate(() => (window as unknown as { contexts: number }).contexts)).toBe(initial);
  expect(warnings).toEqual([]);
});

test('i polmoni si selezionano, hanno il loro testo e si raggiungono dal cuore', async ({ page }) => {
  await page.goto('/esplora/organi/cuore');
  await waitForScene(page);
  const panel = page.getByRole('complementary');
  await panel.getByRole('link', { name: 'Polmoni', exact: true }).click();
  await expect(page).toHaveURL(/\/esplora\/organi\/polmoni$/);
  await expect(panel.getByRole('heading', { name: 'Polmoni' })).toBeVisible();
  await expect(panel.getByText(/principali organi dell'apparato respiratorio/)).toBeVisible();
  await expect(panel.getByRole('link', { name: /TA2 3265/ })).toHaveAttribute(
    'href',
    'https://ta2viewer.openanatomy.org/?id=3265',
  );
  await expect(page.locator('svg.callout')).toHaveAttribute('data-visible', 'yes');
  await checkAccessibility(page);
  await panel.getByRole('button', { name: 'Apri la scheda' }).click();
  for (const title of ['Dove si trova', 'Come è fatto', 'Cosa fa'])
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  await checkAccessibility(page);
});

test('il selettore Uomo/Donna cambia gli organi e un organo femminile porta al corpo femminile (D29)', async ({
  page,
}) => {
  await page.goto('/esplora/organi/prostata');
  await waitForScene(page);
  const panel = page.getByRole('complementary');
  await expect(panel.getByRole('heading', { name: 'Prostata' })).toBeVisible();
  await page.getByRole('radio', { name: 'Donna' }).click();
  // La prostata non c'è nel corpo femminile: la selezione si chiude e la sagoma non è disponibile.
  await expect(page).toHaveURL(/\/esplora\/organi$/);
  await expect(page.getByRole('button', { name: 'Sagoma' })).toBeDisabled();
  await checkAccessibility(page);
  await page.getByRole('radio', { name: 'Uomo' }).click();
  await page.goto('/esplora/organi/utero');
  await waitForScene(page);
  await expect(page.getByRole('radio', { name: 'Donna' })).toHaveAttribute('aria-checked', 'true');
  await expect(panel.getByRole('heading', { name: 'Utero' })).toBeVisible();
  await expect(page.locator('svg.callout')).toHaveAttribute('data-visible', 'yes');
  await checkAccessibility(page);
});

test('il percorso "Un respiro" si segue passo per passo e si può lasciare per esplorare', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await enter(page);
  await page.getByRole('navigation', { name: 'Sezioni' }).getByRole('button', { name: 'Percorsi' }).click();
  await expect(page).toHaveURL(/\/percorsi$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Percorsi' })).toBeVisible();
  await checkAccessibility(page);
  await page.getByRole('button', { name: 'Un respiro' }).click();
  await expect(page).toHaveURL(/\/percorsi\/respirazione\/1$/);
  const panel = page.getByRole('complementary', { name: 'Percorso guidato' });
  await expect(panel.getByRole('heading', { name: 'Un respiro' })).toBeVisible();
  await expect(panel.getByText('Passo 1 di 6').first()).toBeVisible();
  await checkAccessibility(page);

  await panel.getByRole('button', { name: 'Avanti' }).click();
  await expect(page).toHaveURL(/\/percorsi\/respirazione\/2$/);
  await expect(panel.getByRole('heading', { name: "Le vie dell'aria" })).toBeVisible();
  await panel.getByRole('button', { name: 'Passo 5: Negli alveoli' }).click();
  await expect(page).toHaveURL(/\/percorsi\/respirazione\/5$/);
  await expect(panel.getByText("Ossigeno, dall'aria al sangue")).toBeVisible();
  await expect(panel.getByRole('heading', { name: 'Fonti di questo passo' })).toBeVisible();
  await checkAccessibility(page);

  // Si esplora una struttura (come con un clic nel corpo) e si torna allo stesso passo.
  await page.evaluate(() => {
    history.pushState(null, '', '/esplora/organi/polmoni');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  const card = page.getByRole('complementary', { name: 'Struttura selezionata' });
  await expect(card.getByRole('heading', { name: 'Polmoni' })).toBeVisible();
  await card.getByRole('button', { name: /Torna al percorso “Un respiro”, passo 5/ }).click();
  await expect(page).toHaveURL(/\/percorsi\/respirazione\/5$/);
  await expect(panel.getByRole('heading', { name: 'Negli alveoli' })).toBeVisible();

  // I passi non riempiono la cronologia; Esc chiude il percorso.
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(page).toHaveURL(/\/esplora\/[a-z]+$/);
  expect(errors).toEqual([]);
});

test('il percorso "Il viaggio del cibo" mostra uno schema animato a fasi in ogni passo', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/percorsi');
  await page.getByRole('button', { name: 'Il viaggio del cibo' }).click();
  await expect(page).toHaveURL(/\/percorsi\/viaggio-del-cibo\/1$/);
  await waitForScene(page);
  const panel = page.getByRole('complementary', { name: 'Percorso guidato' });
  await expect(panel.getByRole('heading', { name: 'Un pasto' })).toBeVisible();
  const figure = panel.getByRole('figure', { name: 'Schema del canale digerente' });
  await figure.getByRole('button', { name: 'Fase 3: Stomaco' }).click();
  await expect(figure.locator('.tract-diagram')).toHaveAttribute('data-phase', 'stomaco');
  await expect(figure.getByText('da 2 a 4 ore')).toBeVisible();
  await checkAccessibility(page);

  await panel.getByRole('button', { name: 'Passo 4: Nello stomaco' }).click();
  const stomach = panel.getByRole('figure', { name: 'Schema dello stomaco' });
  await stomach.getByRole('button', { name: 'Fase successiva' }).click();
  await expect(stomach.locator('.stomach-diagram')).toHaveAttribute('data-phase', 'onde');
  await panel.getByRole('button', { name: "Passo 8: L'uscita" }).click();
  await expect(panel.getByRole('figure', { name: 'Schema del retto e del canale anale' })).toBeVisible();
  await checkAccessibility(page);
  expect(errors).toEqual([]);
});

test('con il movimento ridotto il percorso non offre la riproduzione continua', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/percorsi/respirazione/4');
  await waitForScene(page);
  const panel = page.getByRole('complementary', { name: 'Percorso guidato' });
  await expect(panel.getByRole('heading', { name: 'Inspirazione' })).toBeVisible();
  await expect(panel.locator('.chest-diagram')).toHaveAttribute('data-phase', 'inhale');
  await expect(panel.getByRole('button', { name: /Riproduci/ })).toHaveCount(0);
});

test("la soglia d'ingresso porta all'atlante e il tour compare solo alla prima visita", async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Il corpo umano, strato per strato.' })).toBeVisible();
  await expect(page.getByText(/non sostituisce il parere di un medico/)).toBeVisible();
  // La barra dei comandi sta sotto la soglia, inerte.
  await expect(page.getByRole('toolbar')).toHaveCount(0);
  await checkAccessibility(page);

  await enter(page, { tour: true });
  const guide = page.getByRole('dialog', { name: 'Ruota, avvicinati e sposta' });
  await expect(guide.getByRole('heading', { name: 'Ruota, avvicinati e sposta' })).toBeFocused();
  await checkAccessibility(page);
  for (const title of ['Scegli una struttura', 'Genere, apparati e sagoma', 'Percorsi, Indice e Fonti']) {
    await page.getByRole('dialog').getByRole('button', { name: 'Avanti' }).click();
    await expect(page.getByRole('heading', { name: title })).toBeFocused();
  }
  await expect(page.locator('.tour-highlight')).toBeVisible();
  await page.getByRole('button', { name: 'Inizia a esplorare' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Aiuto' })).toBeFocused();

  // Il tasto ? riapre la guida, Esc la chiude; Indietro riporta alla soglia, Avanti all'atlante.
  await page.keyboard.press('?');
  await expect(page.getByRole('heading', { name: 'Ruota, avvicinati e sposta' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Il corpo umano, strato per strato.' })).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/esplora\/organi$/);
  await expect(page.getByRole('toolbar')).toBeVisible();

  // Tornando alla soglia il tour non riparte.
  await page.goto('/');
  await page.getByRole('button', { name: 'Esplora il corpo' }).click();
  await expect(page.getByRole('toolbar')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("l'Indice cerca le strutture e le mostra nel corpo", async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Indice dei contenuti' }).click();
  await expect(page).toHaveURL(/\/indice$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Indice' })).toBeFocused();
  // Gli apparati sono chiusi: la pagina a riposo è una mappa, il glossario ha una pagina sua.
  await expect(page.getByRole('button', { name: 'Polmoni: mostra nel corpo' })).toBeHidden();
  await expect(page.getByRole('button', { name: /^Glossario: \d+ termini/ })).toBeVisible();
  await checkAccessibility(page);
  await page.locator('summary', { hasText: 'Apparato respiratorio' }).click();
  await expect(page.getByRole('button', { name: 'Polmoni: mostra nel corpo' })).toBeVisible();

  // Il tasto / porta alla ricerca, che resta nell'indirizzo.
  await page.getByRole('heading', { level: 1, name: 'Indice' }).focus();
  await page.keyboard.press('/');
  await expect(page.getByRole('searchbox', { name: "Cerca nell'atlante" })).toBeFocused();

  await page.getByRole('searchbox', { name: "Cerca nell'atlante" }).fill('hepar');
  await expect(page.getByRole('status').filter({ hasText: 'risultat' })).toHaveText('1 risultato');
  await expect(page).toHaveURL(/\/indice\?q=hepar$/);
  await expect(page.locator('mark', { hasText: 'hepar' })).toBeVisible();
  await page.getByRole('searchbox').fill('xyz');
  await expect(page.getByText(/Nessun risultato per «xyz»/)).toBeVisible();
  await page.getByRole('searchbox').fill('polmon');
  await page.getByRole('button', { name: 'Polmoni: mostra nel corpo' }).click();
  await expect(page).toHaveURL(/\/esplora\/organi\/polmoni$/, { timeout: 45_000 });
  await expect(
    page.getByRole('complementary', { name: 'Struttura selezionata' }).getByRole('heading', { name: 'Polmoni' }),
  ).toBeVisible({ timeout: 45_000 });
});

test('i termini del glossario si aprono sul posto e portano al glossario', async ({ page }) => {
  await page.goto('/percorsi/respirazione/5');
  await waitForScene(page);
  const panel = page.getByRole('complementary', { name: 'Percorso guidato' });
  const term = panel.getByRole('link', { name: 'capillari' });
  await term.click();
  const definition = page.getByRole('dialog', { name: 'capillare' });
  await expect(definition).toBeVisible();
  await expect(definition.getByText(/Vaso sanguigno sottilissimo/)).toBeVisible();
  await expect(term).toHaveAttribute('aria-expanded', 'true');
  await checkAccessibility(page);

  // Esc chiude solo la definizione: il percorso resta aperto e il fuoco torna al termine.
  await page.keyboard.press('Escape');
  await expect(definition).toHaveCount(0);
  await expect(panel).toBeVisible();
  await expect(term).toBeFocused();

  await term.click();
  await page.getByRole('link', { name: 'Tutto il glossario' }).click();
  await expect(page).toHaveURL(/\/glossario$/);
  await expect(page.locator('#glossario-capillare')).toBeFocused();
  await expect(page.locator('#glossario-capillare')).toHaveAttribute('open', '');
});

test('il Glossario ha una pagina con ricerca, lettere e filtri', async ({ page }) => {
  await page.goto('/indice?q=retin');
  await expect(page.getByRole('heading', { name: 'Nel glossario' })).toBeVisible();
  await page.getByRole('button', { name: 'retina: leggi la definizione' }).click();
  await expect(page).toHaveURL(/\/glossario$/);
  const retina = page.locator('#glossario-retina');
  await expect(retina).toBeFocused();
  await expect(retina.getByText(/fondo dell'occhio/)).toBeVisible();
  await checkAccessibility(page);

  // Filtro per apparato e ricerca insieme; con pochi risultati le definizioni si aprono da sole.
  await page.getByRole('button', { name: /^Uditivo/ }).click();
  await expect(page.getByRole('button', { name: /^Uditivo/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(retina).toHaveCount(0);
  await page.getByRole('searchbox', { name: 'Cerca nel glossario' }).fill('timp');
  await expect(page).toHaveURL(/\/glossario\?q=timp$/);
  await expect(page.getByRole('status')).toHaveText('1 termine');
  await expect(page.locator('#glossario-timpano')).toHaveAttribute('open', '');

  await page.getByRole('button', { name: 'Tutti' }).click();
  await page.getByRole('searchbox', { name: 'Cerca nel glossario' }).fill('');
  await page.getByRole('button', { name: 'Lettera V' }).click();
  await expect(page.getByRole('heading', { name: 'V', exact: true })).toBeFocused();
});

test('senza WebGL si apre la versione testuale con Indice, schede e percorso', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...a: unknown[]) {
      return a[0] === 'webgl2' ? null : (original as (...b: unknown[]) => unknown).apply(this, a);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.getByText(/non mostra la grafica 3D \(WebGL 2\)/)).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Indice' })).toBeVisible();
  await checkAccessibility(page);

  await page.locator('summary', { hasText: 'Apparato cardiovascolare' }).click();
  await page.getByRole('button', { name: 'Cuore: leggi il testo' }).click();
  await expect(page).toHaveURL(/\/esplora\/organi\/cuore$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Cuore' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Il processo: il ciclo cardiaco' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Passo successivo' })).toBeVisible();
  await checkAccessibility(page);

  await page.getByRole('button', { name: "Torna all'indice" }).click();
  await page.getByRole('button', { name: /^Un respiro.*inizia il percorso$/ }).click();
  await expect(page).toHaveURL(/\/percorsi\/respirazione\/1$/);
  await page.getByRole('button', { name: 'Avanti' }).click();
  await expect(page.getByRole('heading', { name: "Le vie dell'aria" })).toBeVisible();
  await checkAccessibility(page);
});

test('le sezioni Percorsi e Quiz si scaricano solo al clic sulla loro voce', async ({ page }) => {
  const scaricati: string[] = [];
  page.on('request', (r) => scaricati.push(r.url()));
  const scaricato = (nome: string) => scaricati.some((u) => u.includes(nome));
  await enter(page);
  expect(scaricato('PathsPage')).toBe(false);
  expect(scaricato('QuizPanel')).toBe(false);

  const sezioni = page.getByRole('navigation', { name: 'Sezioni' });
  await sezioni.getByRole('button', { name: 'Percorsi' }).click();
  await expect(page.getByRole('heading', { name: 'Percorsi', level: 1 })).toBeVisible();
  expect(scaricato('PathsPage')).toBe(true);
  expect(scaricato('QuizPanel')).toBe(false);

  // Dalla pagina di lettura si torna all'atlante e da lì si apre il quiz.
  await page.getByRole('button', { name: "Torna all'atlante" }).click();
  await sezioni.getByRole('button', { name: 'Quiz' }).click();
  await expect(page.getByRole('heading', { name: 'Mettiti alla prova' })).toBeVisible();
  expect(scaricato('QuizPanel')).toBe(true);
});

test('lo strato dei vasi si scarica solo quando si apre, e un vaso si apre dal suo indirizzo', async ({ page }) => {
  const scaricati: string[] = [];
  page.on('request', (r) => scaricati.push(r.url()));
  await page.goto('/esplora');
  await expect(page.getByRole('radio', { name: 'Cardiocircolatorio' })).toBeVisible();
  await expect(page.locator('.loading')).toBeHidden({ timeout: 45_000 });
  expect(scaricati.some((u) => u.endsWith('/vasi.glb'))).toBe(false);

  await page.getByRole('radio', { name: 'Cardiocircolatorio' }).click();
  await expect.poll(() => scaricati.some((u) => u.endsWith('/vasi.glb'))).toBe(true);
  await expect(page.getByRole('radio', { name: 'Cardiocircolatorio' })).toHaveAttribute('aria-checked', 'true');
  await expect(page).toHaveURL(/\/esplora\/cardiocircolatorio$/);

  await page.goto('/esplora/cardiocircolatorio/vaso-left-femoral-artery');
  const cartellino = page.getByRole('complementary', { name: 'Struttura selezionata' });
  await expect(cartellino.getByRole('heading', { name: 'Arteria femorale' })).toBeVisible({ timeout: 45_000 });
  await expect(page.getByRole('radio', { name: 'Cardiocircolatorio' })).toHaveAttribute('aria-checked', 'true');
  await checkAccessibility(page);

  // Un vaso solo maschile porta al corpo maschile anche partendo da quello femminile.
  await page.getByRole('radio', { name: 'Donna' }).click();
  await page.goto('/esplora/cardiocircolatorio/vaso-uomo-left-testicular-artery');
  await expect(page.getByRole('radio', { name: 'Uomo' })).toHaveAttribute('aria-checked', 'true');
});

test('lo strato dei nervi si scarica solo quando si apre, e un nervo si apre dal suo indirizzo', async ({ page }) => {
  const scaricati: string[] = [];
  page.on('request', (r) => scaricati.push(r.url()));
  await page.goto('/esplora');
  await expect(page.getByRole('radio', { name: 'Nervoso' })).toBeVisible();
  await expect(page.locator('.loading')).toBeHidden({ timeout: 45_000 });
  expect(scaricati.some((u) => u.endsWith('/nervi.glb'))).toBe(false);

  await page.getByRole('radio', { name: 'Nervoso' }).click();
  await expect.poll(() => scaricati.some((u) => u.endsWith('/nervi.glb'))).toBe(true);
  expect(scaricati.some((u) => u.endsWith('/vasi.glb'))).toBe(false);
  await expect(page).toHaveURL(/\/esplora\/nervoso$/);

  await page.goto('/esplora/nervoso/nervo-right-sciatic-nerve');
  const cartellino = page.getByRole('complementary', { name: 'Struttura selezionata' });
  await expect(cartellino.getByRole('heading', { name: 'Nervo sciatico' })).toBeVisible({ timeout: 45_000 });
  await expect(page.getByRole('radio', { name: 'Nervoso' })).toHaveAttribute('aria-checked', 'true');
  await checkAccessibility(page);
});

test('il quiz evidenzia la struttura e segna le risposte giuste e sbagliate (D53)', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await enter(page);
  await page.getByRole('navigation', { name: 'Sezioni' }).getByRole('button', { name: 'Quiz' }).click();
  await expect(page).toHaveURL(/\/quiz$/);
  const panel = page.getByRole('complementary', { name: 'Quiz' });
  await expect(panel.getByRole('heading', { name: 'Mettiti alla prova' })).toBeVisible();
  await checkAccessibility(page);

  // Il tema sceglie l'apparato della barra.
  await panel.getByRole('combobox', { name: 'Apparato' }).selectOption('respiratorio');
  await expect(page).toHaveURL(/\/quiz\/respiratorio$/);
  await expect(page.getByRole('radio', { name: 'Respiratorio' })).toHaveAttribute('aria-checked', 'true');
  await panel.getByRole('button', { name: /Inizia il quiz/ }).click();
  await expect(panel.getByText('Domanda 1 di 10')).toBeVisible();
  // Nel quiz i tasti degli strati non cambiano apparato: il giro non ricomincia.
  await page.keyboard.press('2');
  await expect(page).toHaveURL(/\/quiz\/respiratorio$/);
  await expect(panel.getByText('Domanda 1 di 10')).toBeVisible();

  // Una risposta qualsiasi: se è sbagliata compare anche la giusta, in verde.
  const answers = panel.locator('.quiz-answer');
  await expect(answers).toHaveCount(4);
  await answers.first().click();
  await expect(panel.locator('.quiz-answer[data-result="correct"]')).toHaveCount(1);
  const verdict = panel.locator('.quiz-verdict');
  await expect(verdict).toBeVisible();
  if ((await verdict.getAttribute('data-result')) === 'wrong')
    await expect(answers.first()).toHaveAttribute('data-result', 'wrong');
  await checkAccessibility(page);

  for (let i = 1; i < 10; i++) {
    await panel.getByRole('button', { name: 'Avanti' }).click();
    await panel.locator('.quiz-answer').first().click();
  }
  await panel.getByRole('button', { name: 'Vedi il risultato' }).click();
  await expect(panel.getByRole('heading', { name: /\d+ su 10/ })).toBeVisible();
  await checkAccessibility(page);

  // Il quiz completo cambia apparato seguendo le domande; Esc chiude il quiz.
  await panel.getByRole('button', { name: 'Cambia apparato' }).click();
  await panel.getByRole('combobox', { name: 'Apparato' }).selectOption('completa');
  await expect(page).toHaveURL(/\/quiz\/completa$/);
  await panel.getByRole('button', { name: /Inizia il quiz/ }).click();
  await expect(panel.getByText('Domanda 1 di 20')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(page).toHaveURL(/\/esplora\//);
  expect(errors).toEqual([]);
});

test('una pagina di lettura aperta dal suo indirizzo non scarica il corpo 3D finché non si apre l’atlante', async ({
  page,
}) => {
  const scaricati: string[] = [];
  page.on('request', (r) => scaricati.push(r.url()));
  const modelli = () => scaricati.filter((u) => u.endsWith('.glb'));
  await page.goto('/glossario');
  await expect(page.getByRole('heading', { name: 'Glossario', level: 1 })).toBeVisible();
  await expect(page).toHaveTitle('Glossario · Atlante del corpo umano');
  // È una pagina a sé: l'atlante non c'è, nemmeno nascosto (D54).
  await expect(page.locator('.atlas')).toHaveCount(0);
  expect(modelli()).toEqual([]);

  await page.getByRole('button', { name: "Torna all'atlante" }).click();
  await expect(page).toHaveURL(/\/esplora\/organi$/);
  await waitForScene(page);
  expect(modelli().length).toBeGreaterThan(0);
  await expect(page).toHaveTitle('Atlante del corpo umano');
});

test('tornando a una pagina di lettura con Indietro si ritrova il punto di lettura', async ({ page }) => {
  await page.goto('/glossario');
  const pagina = page.locator('.reading-page');
  await expect(page.locator('#glossario-retina')).toBeAttached();
  await pagina.evaluate((el) => el.scrollTo({ top: 1500 }));
  await expect.poll(() => pagina.evaluate((el) => el.scrollTop)).toBe(1500);

  // Esc chiude la pagina senza scorrere fino al pulsante in cima (che il clic di Playwright farebbe).
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/esplora\/organi$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/glossario$/);
  await expect.poll(() => page.locator('.reading-page').evaluate((el) => el.scrollTop)).toBe(1500);

  // Aprendo la pagina dal menu si parte dall'inizio.
  await page.getByRole('button', { name: "Torna all'atlante" }).click();
  await page.getByRole('navigation', { name: 'Sezioni' }).getByRole('button', { name: 'Glossario' }).click();
  await expect(page.locator('.reading-page')).toBeVisible();
  expect(await page.locator('.reading-page').evaluate((el) => el.scrollTop)).toBe(0);
});

test('i muscoli si scaricano solo quando servono: strato Muscoli o apparato che ne mostra alcuni (D55)', async ({
  page,
}) => {
  const scaricati: string[] = [];
  page.on('request', (r) => scaricati.push(r.url()));
  const muscoli = () => scaricati.some((u) => u.endsWith('/muscoli.glb'));
  await page.goto('/esplora');
  await expect(page.locator('.loading')).toBeHidden({ timeout: 45_000 });
  // Organi e scheletro in trasparenza arrivano subito; i muscoli no.
  expect(scaricati.some((u) => u.endsWith('/organi.glb'))).toBe(true);
  expect(scaricati.some((u) => u.endsWith('/ossa.glb'))).toBe(true);
  expect(muscoli()).toBe(false);
  await page.getByRole('radio', { name: 'Urinario' }).click();
  expect(muscoli()).toBe(false);

  await page.getByRole('radio', { name: 'Muscoli' }).click();
  await expect.poll(muscoli).toBe(true);
  await expect(page.locator('.loading')).toBeHidden({ timeout: 45_000 });

  // Un muscolo aperto dal suo indirizzo, in una nuova visita.
  await page.goto('/esplora/muscoli/FJ3131');
  await expect(page.getByRole('complementary', { name: 'Struttura selezionata' })).toBeVisible({ timeout: 45_000 });
});

test('la panoramica della circolazione ha l’indirizzo /come-circola-il-sangue (prima /circolazione)', async ({
  page,
}) => {
  await page.goto('/circolazione');
  await expect(page).toHaveURL(/\/come-circola-il-sangue$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Come circola il sangue' })).toBeVisible();
  await expect(page.locator('.atlas')).toHaveCount(0);
});
