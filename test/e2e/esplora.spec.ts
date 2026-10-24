import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

/** Attende che il modello 3D sia caricato e la scena interattiva. */
async function attendiScena(page: Page) {
  await expect(page.getByRole('status')).toHaveCount(0, { timeout: 45_000 });
}

/**
 * Entra dalla soglia (D26) quando il modello è pronto. Il tour della prima visita si salta,
 * a meno che il test non lo voglia vedere.
 */
async function entra(page: Page, { tour = false } = {}) {
  await page.goto('/');
  const esplora = page.getByRole('button', { name: 'Esplora il corpo' });
  await expect(esplora).toHaveAttribute('aria-disabled', 'false', { timeout: 45_000 });
  await esplora.click();
  if (!tour)
    await page
      .getByRole('dialog', { name: 'Ruota e avvicinati' })
      .getByRole('button', { name: 'Salta la guida' })
      .click();
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
  await entra(page);
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
  await entra(page);
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
  await entra(page);
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

test('il percorso "Un respiro" si segue passo per passo e si può lasciare per esplorare', async ({ page }) => {
  const errori: string[] = [];
  page.on('pageerror', (e) => errori.push(e.message));
  await entra(page);
  await page.getByRole('navigation', { name: 'Sezioni' }).getByRole('button', { name: 'Percorsi' }).click();
  await expect(page).toHaveURL(/\/percorsi\/respirazione\/1$/);
  const pannello = page.getByRole('complementary', { name: 'Percorso guidato' });
  await expect(pannello.getByRole('heading', { name: 'Un respiro' })).toBeVisible();
  await expect(pannello.getByText('Passo 1 di 6').first()).toBeVisible();
  await accessibilita(page);

  await pannello.getByRole('button', { name: 'Avanti' }).click();
  await expect(page).toHaveURL(/\/percorsi\/respirazione\/2$/);
  await expect(pannello.getByRole('heading', { name: "Le vie dell'aria" })).toBeVisible();
  await pannello.getByRole('button', { name: 'Passo 5: Negli alveoli' }).click();
  await expect(page).toHaveURL(/\/percorsi\/respirazione\/5$/);
  await expect(pannello.getByText("Ossigeno, dall'aria al sangue")).toBeVisible();
  await expect(pannello.getByRole('heading', { name: 'Fonti di questo passo' })).toBeVisible();
  await accessibilita(page);

  // Si esplora una struttura (come con un clic nel corpo) e si torna allo stesso passo.
  await page.evaluate(() => {
    history.pushState(null, '', '/esplora/polmoni');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  const cartellino = page.getByRole('complementary', { name: 'Struttura selezionata' });
  await expect(cartellino.getByRole('heading', { name: 'Polmoni' })).toBeVisible();
  await cartellino.getByRole('button', { name: /Torna al percorso “Un respiro”, passo 5/ }).click();
  await expect(page).toHaveURL(/\/percorsi\/respirazione\/5$/);
  await expect(pannello.getByRole('heading', { name: 'Negli alveoli' })).toBeVisible();

  // I passi non riempiono la cronologia; Esc chiude il percorso.
  await page.keyboard.press('Escape');
  await expect(pannello).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
  expect(errori).toEqual([]);
});

test('con il movimento ridotto il percorso non offre la riproduzione continua', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/percorsi/respirazione/4');
  await attendiScena(page);
  const pannello = page.getByRole('complementary', { name: 'Percorso guidato' });
  await expect(pannello.getByRole('heading', { name: 'Inspirazione' })).toBeVisible();
  await expect(pannello.locator('.schema-torace')).toHaveAttribute('data-fase', 'inspirazione');
  await expect(pannello.getByRole('button', { name: /Riproduci/ })).toHaveCount(0);
});

test("la soglia d'ingresso porta all'atlante e il tour compare solo alla prima visita", async ({ page }) => {
  const errori: string[] = [];
  page.on('pageerror', (e) => errori.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Il corpo umano, strato per strato.' })).toBeVisible();
  await expect(page.getByText(/non sostituisce il parere di un medico/)).toBeVisible();
  // La barra dei comandi sta sotto la soglia, inerte.
  await expect(page.getByRole('toolbar')).toHaveCount(0);
  await accessibilita(page);

  await entra(page, { tour: true });
  const guida = page.getByRole('dialog', { name: 'Ruota e avvicinati' });
  await expect(guida.getByRole('heading', { name: 'Ruota e avvicinati' })).toBeFocused();
  await accessibilita(page);
  for (const titolo of ['Scegli una struttura', 'Strati e sagoma', 'Percorsi, Indice e Fonti']) {
    await page.getByRole('dialog').getByRole('button', { name: 'Avanti' }).click();
    await expect(page.getByRole('heading', { name: titolo })).toBeFocused();
  }
  await expect(page.locator('.tour-bordo')).toBeVisible();
  await page.getByRole('button', { name: 'Inizia a esplorare' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Aiuto' })).toBeFocused();

  // Il tasto ? riapre la guida, Esc la chiude; tornando alla soglia il tour non riparte.
  await page.keyboard.press('?');
  await expect(page.getByRole('heading', { name: 'Ruota e avvicinati' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto('/');
  await page.getByRole('button', { name: 'Esplora il corpo' }).click();
  await expect(page.getByRole('toolbar')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(errori).toEqual([]);
});

test("l'Indice cerca le strutture e le mostra nel corpo", async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Indice dei contenuti' }).click();
  await expect(page).toHaveURL(/\/indice$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Indice' })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Glossario' })).toBeVisible();
  await accessibilita(page);

  await page.getByRole('searchbox', { name: "Cerca nell'atlante" }).fill('pulm');
  await expect(page.getByRole('status').filter({ hasText: 'risultat' })).toHaveText('1 risultato');
  await page.getByRole('searchbox').fill('xyz');
  await expect(page.getByText(/Nessun risultato per «xyz»/)).toBeVisible();
  await page.getByRole('searchbox').fill('polmon');
  await page.getByRole('button', { name: 'Polmoni: mostra nel corpo' }).click();
  await expect(page).toHaveURL(/\/esplora\/polmoni$/, { timeout: 45_000 });
  await expect(
    page.getByRole('complementary', { name: 'Struttura selezionata' }).getByRole('heading', { name: 'Polmoni' }),
  ).toBeVisible({ timeout: 45_000 });
});

test('i termini del glossario si aprono sul posto e portano al glossario', async ({ page }) => {
  await page.goto('/percorsi/respirazione/5');
  await attendiScena(page);
  const pannello = page.getByRole('complementary', { name: 'Percorso guidato' });
  const termine = pannello.getByRole('link', { name: 'capillari' });
  await termine.click();
  const definizione = page.getByRole('dialog', { name: 'capillare' });
  await expect(definizione).toBeVisible();
  await expect(definizione.getByText(/Vaso sanguigno sottilissimo/)).toBeVisible();
  await expect(termine).toHaveAttribute('aria-expanded', 'true');
  await accessibilita(page);

  // Esc chiude solo la definizione: il percorso resta aperto e il fuoco torna al termine.
  await page.keyboard.press('Escape');
  await expect(definizione).toHaveCount(0);
  await expect(pannello).toBeVisible();
  await expect(termine).toBeFocused();

  await termine.click();
  await page.getByRole('link', { name: 'Tutto il glossario' }).click();
  await expect(page).toHaveURL(/\/indice$/);
  await expect(page.locator('#glossario-capillare')).toBeFocused();
});

test('senza WebGL si apre la versione testuale con Indice, schede e percorso', async ({ page }) => {
  await page.addInitScript(() => {
    const originale = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...a: unknown[]) {
      return a[0] === 'webgl2' ? null : (originale as (...b: unknown[]) => unknown).apply(this, a);
    } as typeof originale;
  });
  await page.goto('/');
  await expect(page.getByText(/non mostra la grafica 3D \(WebGL 2\)/)).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Indice' })).toBeVisible();
  await accessibilita(page);

  await page.getByRole('button', { name: 'Cuore: leggi il testo' }).click();
  await expect(page).toHaveURL(/\/esplora\/cuore$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Cuore' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Il processo: il ciclo cardiaco' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Passo successivo' })).toBeVisible();
  await accessibilita(page);

  await page.getByRole('button', { name: "Torna all'indice" }).click();
  await page.getByRole('button', { name: 'Un respiro: inizia il percorso' }).click();
  await expect(page).toHaveURL(/\/percorsi\/respirazione\/1$/);
  await page.getByRole('button', { name: 'Avanti' }).click();
  await expect(page.getByRole('heading', { name: "Le vie dell'aria" })).toBeVisible();
  await accessibilita(page);
});
