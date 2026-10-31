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
  await expect(page).toHaveURL(/\/esplora$/);
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

test('il cartellino è collegato alla struttura dalla linea di richiamo', async ({ page }) => {
  await page.goto('/esplora/cuore');
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
  await page.goto('/esplora/cuore');
  await waitForScene(page);
  await page.getByRole('button', { name: 'Apri la scheda' }).click();
  await expect(page).toHaveURL(/\/organo\/cuore$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Cuore' })).toBeFocused();
  await expect(page.getByRole('toolbar')).toHaveCount(0);
  await checkAccessibility(page);

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
  await enter(page);
  await page.keyboard.press('1');
  await expect(page.getByRole('radio', { name: 'Scheletro' })).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('3');
  await expect(page.getByRole('radio', { name: 'Muscoli' })).toHaveAttribute('aria-checked', 'true');
});

test('su schermo stretto il cartellino è un foglio dal basso e la barra si nasconde', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/esplora/cuore');
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

test('il cartellino mostra il testo verificato, i rimandi e le fonti', async ({ page }) => {
  await page.goto('/esplora/cuore');
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

test('un indirizzo diretto a un muscolo mostra lo strato dei muscoli', async ({ page }) => {
  await page.goto('/esplora/FJ3131');
  await waitForScene(page);
  await expect(page.getByRole('heading', { name: 'Diaframma' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Muscoli' })).toHaveAttribute('aria-checked', 'true');
});

test('un indirizzo diretto a un osso mostra lo strato dello scheletro', async ({ page }) => {
  await page.goto('/esplora/FJ3259');
  await waitForScene(page);
  await expect(page.getByRole('radio', { name: 'Scheletro' })).toHaveAttribute('aria-checked', 'true');
});

test('la scheda del cuore ha tutte le sezioni, i collegamenti e le fonti', async ({ page }) => {
  await page.goto('/organo/cuore');
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
  await page.goto('/esplora/cuore');
  await waitForScene(page);
  await page.getByRole('button', { name: 'Fonti' }).click();
  await expect(page).toHaveURL(/\/fonti$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Fonti' })).toBeFocused();
  const main = page.getByRole('main');
  await expect(main.getByRole('link', { name: /How the Heart Works: What the Heart Looks Like/ })).toBeVisible();
  await expect(main.getByText(/Terminologia Anatomica, 2nd edition/)).toBeVisible();
  await checkAccessibility(page);

  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/esplora\/cuore$/);
  await expect(page.getByRole('button', { name: 'Fonti' })).toBeFocused();

  await page.getByRole('button', { name: 'Informazioni' }).click();
  await expect(page.getByRole('heading', { name: 'Avvertenze' })).toBeVisible();
  await expect(page.getByText(/non sono stati rivisti da un medico/)).toBeVisible();
  await checkAccessibility(page);
  await page.goBack();
  await expect(page).toHaveURL(/\/esplora\/cuore$/);
  await expect(page.getByRole('main')).toHaveCount(0);
});

test('il ciclo cardiaco nella scheda si comanda da tastiera e non ha problemi di accessibilità', async ({ page }) => {
  await page.goto('/organo/cuore');
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
  await page.goto('/organo/cuore');
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
  await page.goto('/esplora/cuore');
  await waitForScene(page);
  const panel = page.getByRole('complementary');
  await panel.getByRole('link', { name: 'Polmoni', exact: true }).click();
  await expect(page).toHaveURL(/\/esplora\/polmoni$/);
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
  await page.goto('/esplora/prostata');
  await waitForScene(page);
  const panel = page.getByRole('complementary');
  await expect(panel.getByRole('heading', { name: 'Prostata' })).toBeVisible();
  await page.getByRole('radio', { name: 'Donna' }).click();
  // La prostata non c'è nel corpo femminile: la selezione si chiude e la sagoma non è disponibile.
  await expect(page).toHaveURL(/\/esplora$/);
  await expect(page.getByRole('button', { name: 'Sagoma' })).toBeDisabled();
  await checkAccessibility(page);
  await page.getByRole('radio', { name: 'Uomo' }).click();
  await page.goto('/esplora/utero');
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
    history.pushState(null, '', '/esplora/polmoni');
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
  await expect(page).toHaveURL(/\/esplora$/);
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
  for (const title of ['Scegli una struttura', 'Strati e sagoma', 'Percorsi, Indice e Fonti']) {
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
  await expect(page).toHaveURL(/\/esplora$/);
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

  await page.getByRole('searchbox', { name: "Cerca nell'atlante" }).fill('pulm');
  await expect(page.getByRole('status').filter({ hasText: 'risultat' })).toHaveText('1 risultato');
  await expect(page).toHaveURL(/\/indice\?q=pulm$/);
  await expect(page.locator('mark', { hasText: 'Pulm' })).toBeVisible();
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
  await expect(page).toHaveURL(/\/esplora\/cuore$/);
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
