import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

/** Attende che il modello 3D sia caricato e la scena interattiva. */
async function attendiScena(page: Page) {
  await expect(page.getByRole('status')).toHaveCount(0, { timeout: 45_000 });
}

/** Controllo di accessibilità WCAG 2.1 AA sull'interfaccia (il canvas 3D è escluso). */
async function accessibilita(page: Page) {
  const esito = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('canvas')
    .analyze();
  expect(esito.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
}

test('la vista iniziale si carica senza errori e senza problemi di accessibilità', async ({ page }) => {
  const errori: string[] = [];
  page.on('pageerror', (e) => errori.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errori.push(m.text()));
  await page.goto('/');
  await attendiScena(page);
  await expect(page.getByRole('radio', { name: 'Scheletro e organi' })).toHaveAttribute('aria-checked', 'true');
  await accessibilita(page);
  expect(errori).toEqual([]);
});

test('il cartellino è collegato alla struttura dalla linea di richiamo', async ({ page }) => {
  await page.goto('/esplora/cuore');
  await attendiScena(page);
  const pannello = page.getByRole('complementary', { name: 'Struttura selezionata' });
  await expect(pannello.getByRole('heading', { name: 'Cuore' })).toBeVisible();
  await expect(page.locator('svg.richiamo')).toHaveAttribute('data-visibile', 'si');
  // La linea finisce sul bordo sinistro del pannello (misurato a pannello fermo, dopo l'entrata).
  await expect(async () => {
    const fine = await page
      .locator('svg.richiamo polyline')
      .evaluate((l) => l.getAttribute('points')?.split(' ').at(-1));
    const bordo = await pannello.evaluate((p) => p.getBoundingClientRect().left);
    expect(Number(fine?.split(',')[0])).toBeCloseTo(bordo, 0);
  }).toPass({ timeout: 5_000 });
  await accessibilita(page);
});

test('la scheda si apre, si chiude con Esc e la cronologia funziona', async ({ page }) => {
  await page.goto('/esplora/cuore');
  await attendiScena(page);
  await page.getByRole('button', { name: 'Apri la scheda' }).click();
  await expect(page).toHaveURL(/\/organo\/cuore$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Cuore' })).toBeFocused();
  await expect(page.getByRole('toolbar')).toHaveCount(0);
  await accessibilita(page);

  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/esplora\/cuore$/);
  await expect(page.getByRole('button', { name: 'Apri la scheda' })).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/organo\/cuore$/);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('complementary')).toHaveCount(0);
});

test('i tasti 1–3 cambiano strato', async ({ page }) => {
  await page.goto('/');
  await attendiScena(page);
  await page.keyboard.press('1');
  await expect(page.getByRole('radio', { name: 'Muscoli' })).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('3');
  await expect(page.getByRole('radio', { name: 'Scheletro', exact: true })).toHaveAttribute('aria-checked', 'true');
});

test('su schermo stretto il cartellino è un foglio dal basso e la barra si nasconde', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/esplora/cuore');
  await attendiScena(page);
  await expect(async () => {
    const riquadro = await page.getByRole('complementary').boundingBox();
    expect(riquadro?.x).toBe(0);
    expect((riquadro?.y ?? 0) + (riquadro?.height ?? 0)).toBeCloseTo(844, 0);
  }).toPass({ timeout: 5_000 });
  await expect(page.getByRole('toolbar')).toBeHidden();
  await expect(page.locator('svg.richiamo')).toHaveAttribute('data-visibile', 'no');
  await accessibilita(page);
});

test('il cartellino mostra il testo verificato, i rimandi e le fonti', async ({ page }) => {
  await page.goto('/esplora/cuore');
  await attendiScena(page);
  const pannello = page.getByRole('complementary');
  await expect(pannello.getByText(/organo muscolare formato da quattro cavità/)).toBeVisible();
  await expect(pannello.getByRole('link', { name: /TA2 3932/ })).toHaveAttribute(
    'href',
    'https://ta2viewer.openanatomy.org/?id=3932',
  );
  await expect(pannello.getByRole('region', { name: 'Fonti' }).getByRole('listitem')).toHaveCount(3);
  await accessibilita(page);
});

test('un indirizzo diretto a un muscolo mostra lo strato dei muscoli', async ({ page }) => {
  await page.goto('/esplora/FJ3131');
  await attendiScena(page);
  await expect(page.getByRole('heading', { name: 'Diaframma' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Muscoli' })).toHaveAttribute('aria-checked', 'true');
});

test('la scheda del cuore ha tutte le sezioni, i collegamenti e le fonti', async ({ page }) => {
  await page.goto('/organo/cuore');
  await attendiScena(page);
  const indice = page.getByRole('navigation', { name: 'Sezioni della scheda' }).getByRole('link');
  await expect(indice).toHaveText([
    'In breve',
    'Dove si trova',
    'Come è fatto',
    'Cosa fa',
    'Il processo',
    'Collegamenti',
    'Fonti',
  ]);
  await expect(page.locator('#sez-fonti li')).toHaveCount(6);
  await accessibilita(page);
});

test('le pagine Fonti e Informazioni si aprono dal menu e si chiudono con Esc', async ({ page }) => {
  await page.goto('/esplora/cuore');
  await attendiScena(page);
  await page.getByRole('button', { name: 'Fonti' }).click();
  await expect(page).toHaveURL(/\/fonti$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Fonti' })).toBeFocused();
  const pagina = page.getByRole('main');
  await expect(pagina.getByRole('link', { name: /How the Heart Works: What the Heart Looks Like/ })).toBeVisible();
  await expect(pagina.getByText(/Terminologia Anatomica, 2nd edition/)).toBeVisible();
  await accessibilita(page);

  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/esplora\/cuore$/);
  await expect(page.getByRole('button', { name: 'Fonti' })).toBeFocused();

  await page.getByRole('button', { name: 'Informazioni' }).click();
  await expect(page.getByRole('heading', { name: 'Avvertenze' })).toBeVisible();
  await expect(page.getByText(/non sono stati rivisti da un medico/)).toBeVisible();
  await accessibilita(page);
  await page.goBack();
  await expect(page).toHaveURL(/\/esplora\/cuore$/);
  await expect(page.getByRole('main')).toHaveCount(0);
});

test('il ciclo cardiaco nella scheda si comanda da tastiera e non ha problemi di accessibilità', async ({ page }) => {
  await page.goto('/organo/cuore');
  await attendiScena(page);
  const ciclo = page.getByRole('figure', { name: 'Il ciclo cardiaco, passo per passo' });
  await ciclo.scrollIntoViewIfNeeded();
  await expect(ciclo.getByRole('heading', { name: 'Le cavità si riempiono' })).toBeVisible();
  await ciclo.getByRole('button', { name: 'Passo successivo' }).focus();
  await page.keyboard.press('Enter');
  await expect(ciclo.getByRole('heading', { name: 'Parte il segnale' })).toBeVisible();
  await ciclo.getByRole('button', { name: /Passo 4/ }).click();
  await expect(ciclo.getByText('Primo tono', { exact: true })).toBeVisible();
  await expect(ciclo.locator('.schema-cuore')).toHaveAttribute('data-ventricoli', 'contratti');
  await accessibilita(page);
});

test('con il movimento ridotto il ciclo cardiaco va solo passo per passo', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/organo/cuore');
  await attendiScena(page);
  const ciclo = page.getByRole('figure', { name: 'Il ciclo cardiaco, passo per passo' });
  await expect(ciclo.getByRole('button', { name: 'Passo successivo' })).toBeVisible();
  await expect(ciclo.getByRole('button', { name: 'Riproduci' })).toHaveCount(0);
});

test("l'uso prolungato non crea nuovi contesti WebGL e la scena resta viva", async ({ page }) => {
  // Ogni contesto WebGL creato dalla pagina viene contato: oltre il limite del browser
  // (circa 16) il più vecchio, quello della scena, verrebbe chiuso.
  await page.addInitScript(() => {
    const w = window as unknown as { contesti: number };
    w.contesti = 0;
    const originale = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...a: unknown[]) {
      if (String(a[0]).startsWith('webgl')) w.contesti++;
      return (originale as (...b: unknown[]) => unknown).apply(this, a);
    } as typeof originale;
  });
  const avvisi: string[] = [];
  page.on('console', (m) => /Too many active WebGL contexts|Context Lost/.test(m.text()) && avvisi.push(m.text()));
  await page.goto('/');
  await attendiScena(page);
  const iniziali = await page.evaluate(() => (window as unknown as { contesti: number }).contesti);
  for (let i = 0; i < 30; i++) await page.keyboard.press(['1', '2', '3'][i % 3]);
  expect(await page.evaluate(() => (window as unknown as { contesti: number }).contesti)).toBe(iniziali);
  expect(avvisi).toEqual([]);
});

test('i polmoni si selezionano, hanno il loro testo e si raggiungono dal cuore', async ({ page }) => {
  await page.goto('/esplora/cuore');
  await attendiScena(page);
  const pannello = page.getByRole('complementary');
  await pannello.getByRole('link', { name: 'Polmoni', exact: true }).click();
  await expect(page).toHaveURL(/\/esplora\/polmoni$/);
  await expect(pannello.getByRole('heading', { name: 'Polmoni' })).toBeVisible();
  await expect(pannello.getByText(/principali organi dell'apparato respiratorio/)).toBeVisible();
  await expect(pannello.getByRole('link', { name: /TA2 3265/ })).toHaveAttribute(
    'href',
    'https://ta2viewer.openanatomy.org/?id=3265',
  );
  await expect(page.locator('svg.richiamo')).toHaveAttribute('data-visibile', 'si');
  await accessibilita(page);
  await pannello.getByRole('button', { name: 'Apri la scheda' }).click();
  for (const titolo of ['Dove si trova', 'Come è fatto', 'Cosa fa'])
    await expect(page.getByRole('heading', { name: titolo })).toBeVisible();
  await accessibilita(page);
});
