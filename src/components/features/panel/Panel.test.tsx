// @vitest-environment jsdom
import '../../../../test/dom-setup';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { Box3, Vector3 } from 'three';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { AtlasProvider } from '@/contexts/AtlasContext';
import { sceneApi } from '@/utils/sceneApi';
import { Panel } from './Panel';

beforeAll(() => {
  const box = new Box3();
  const anchor = new Vector3();
  sceneApi.units.set('cuore', {
    index: 1,
    id: 'cuore',
    layer: 'organi',
    body: null,
    fmaName: 'Heart',
    fma: 'FMA7088',
    box,
    anchor,
  });
  sceneApi.units.set('FJ3259', {
    index: 2,
    id: 'FJ3259',
    layer: 'ossa',
    body: null,
    fmaName: 'Left femur',
    fma: 'FMA24475',
    box,
    anchor,
  });
  sceneApi.units.set('FJ1', {
    index: 3,
    id: 'FJ1',
    layer: 'muscoli',
    body: null,
    fmaName: 'Left biceps',
    fma: 'FMA1',
    box,
    anchor,
  });
  sceneApi.units.set('ZA-right-example', {
    index: 4,
    id: 'ZA-right-example',
    layer: 'muscoli',
    body: null,
    fmaName: 'Right example muscle',
    fma: null,
    box,
    anchor,
  });
  sceneApi.units.set('vaso-left-lacrimal-artery', {
    index: 5,
    id: 'vaso-left-lacrimal-artery',
    layer: 'vasi',
    body: null,
    fmaName: 'Left lacrimal artery',
    fma: null,
    box,
    anchor,
  });
});

const open = (path: string) => {
  history.replaceState(null, '', path);
  return render(
    <BrowserRouter>
      <AtlasProvider>
        <Panel />
      </AtlasProvider>
    </BrowserRouter>,
  );
};

describe('pannello della struttura selezionata', () => {
  it('non compare senza selezione', () => {
    open('/');
    expect(screen.queryByRole('complementary')).toBeNull();
  });

  it('mostra il cartellino di un organo con nome, termine e appartenenza', () => {
    open('/esplora/organi/cuore');
    expect(screen.getByRole('heading', { level: 2, name: 'Cuore' })).toBeTruthy();
    expect(screen.getByText('cor').getAttribute('lang')).toBe('la');
    expect(screen.getAllByText('Apparato cardiovascolare').length).toBeGreaterThan(0);
  });

  it('mostra il testo verificato con i rimandi, le fonti e il termine TA2', async () => {
    open('/esplora/organi/cuore');
    expect(await screen.findByText(/organo muscolare formato da quattro cavità/)).toBeTruthy();
    expect(screen.getByRole('link', { name: /TA2 3932/ }).getAttribute('href')).toBe(
      'https://ta2viewer.openanatomy.org/?id=3932',
    );
    const sources = screen.getByRole('region', { name: 'Fonti' });
    expect(sources.querySelectorAll('li')).toHaveLength(3);
    // Ogni rimando nel testo porta a una fonte presente nell'elenco.
    for (const citation of document.querySelectorAll<HTMLAnchorElement>('.text .citation a'))
      expect(document.querySelector(citation.getAttribute('href') ?? '')).toBeTruthy();
  });

  it('riconosce un osso con contenuto dal suo identificativo FMA', async () => {
    open('/esplora/FJ3259');
    expect(screen.getByRole('heading', { name: 'Femore' })).toBeTruthy();
    expect(screen.getByText('os femoris').getAttribute('lang')).toBe('la');
    expect(await screen.findByText(/unico osso della coscia/)).toBeTruthy();
  });

  it('dichiara il nome provvisorio per ossa e muscoli senza contenuto', () => {
    open('/esplora/FJ1');
    expect(screen.getByRole('heading', { name: 'Left biceps' })).toBeTruthy();
    expect(screen.getByText(/Nome provvisorio in inglese/)).toBeTruthy();
    expect(screen.getByText('Identificativo FMA 1')).toBeTruthy();
  });

  it('per i muscoli di Z-Anatomy cita Z-Anatomy come origine del nome, senza identificativo FMA', () => {
    open('/esplora/ZA-right-example');
    expect(screen.getByRole('heading', { name: 'Right example muscle' })).toBeTruthy();
    expect(screen.getByText(/Nome provvisorio in inglese, da Z-Anatomy/)).toBeTruthy();
    expect(screen.queryByText(/Identificativo FMA/)).toBeNull();
  });

  it('nei vasi il link alla circolazione sta tra il testo e la linea di separazione', async () => {
    open('/esplora/vaso-left-lacrimal-artery');
    const text = await screen.findByText(/secondo ramo dell'arteria oftalmica/);
    const link = screen.getByRole('link', { name: 'Come circola il sangue' });
    const relations = document.querySelector('.relations');
    expect(relations).toBeTruthy();
    expect(text.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(link.compareDocumentPosition(relations as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('si allarga nella scheda e torna al cartellino riportando il fuoco sul pulsante', () => {
    open('/esplora/organi/cuore');
    fireEvent.click(screen.getByRole('button', { name: 'Apri la scheda' }));
    const title = screen.getByRole('heading', { level: 1, name: 'Cuore' });
    expect(document.activeElement).toBe(title);
    expect(screen.getByRole('complementary').dataset.mode).toBe('sheet');
    expect(location.pathname).toBe('/esplora/organi/cuore/scheda');

    fireEvent.click(screen.getByRole('button', { name: 'Torna al cartellino' }));
    expect(screen.getByRole('complementary').dataset.mode).toBe('card');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Apri la scheda' }));
  });

  it('si chiude con il pulsante di chiusura', () => {
    open('/esplora/organi/cuore');
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi il cartellino' }));
    expect(screen.queryByRole('complementary')).toBeNull();
    expect(location.pathname).toBe('/esplora/organi');
  });
});

describe('battito del cuore', () => {
  afterEach(() => vi.restoreAllMocks());

  it('solo il cartellino del cuore ha il comando, che ferma e riprende il battito', () => {
    open('/esplora/FJ3259');
    expect(screen.queryByRole('button', { name: /battito/ })).toBeNull();
    cleanup();

    open('/esplora/organi/cuore');
    const toggle = screen.getByRole('button', { name: 'Ferma il battito' });
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByText(/non sono in scala/)).toBeTruthy();
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Riprendi il battito' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('il suono parte solo su richiesta e sparisce fermando il battito', () => {
    // jsdom non ha la Web Audio API: basta un contesto che si possa avviare.
    vi.stubGlobal(
      'AudioContext',
      class {
        sampleRate = 8000;
        state = 'running';
        resume = () => Promise.resolve();
        createBuffer = () => ({ getChannelData: () => new Float32Array(1) });
      },
    );
    open('/esplora/organi/cuore');
    const sound = screen.getByRole('button', { name: 'Ascolta il battito' });
    expect(sound.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(sound);
    expect(screen.getByRole('button', { name: 'Togli il suono' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Ferma il battito' }));
    expect(screen.queryByRole('button', { name: /suono|Ascolta/ })).toBeNull();
    vi.unstubAllGlobals();
  });

  it('con il movimento ridotto il cuore è fermo e il comando non compare', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query) =>
        ({ matches: true, media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList,
    );
    open('/esplora/organi/cuore');
    expect(screen.queryByRole('button', { name: /battito|suono/ })).toBeNull();
  });
});
