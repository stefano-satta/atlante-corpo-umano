// @vitest-environment jsdom
import '../../../../test/dom-setup';
import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { Box3, Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
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
    open('/esplora/cuore');
    expect(screen.getByRole('heading', { level: 2, name: 'Cuore' })).toBeTruthy();
    expect(screen.getByText('cor').getAttribute('lang')).toBe('la');
    expect(screen.getAllByText('Apparato cardiovascolare').length).toBeGreaterThan(0);
  });

  it('mostra il testo verificato con i rimandi, le fonti e il termine TA2', async () => {
    open('/esplora/cuore');
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

  it('si allarga nella scheda e torna al cartellino riportando il fuoco sul pulsante', () => {
    open('/esplora/cuore');
    fireEvent.click(screen.getByRole('button', { name: 'Apri la scheda' }));
    const title = screen.getByRole('heading', { level: 1, name: 'Cuore' });
    expect(document.activeElement).toBe(title);
    expect(screen.getByRole('complementary').dataset.mode).toBe('sheet');
    expect(location.pathname).toBe('/organo/cuore');

    fireEvent.click(screen.getByRole('button', { name: 'Torna al cartellino' }));
    expect(screen.getByRole('complementary').dataset.mode).toBe('card');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Apri la scheda' }));
  });

  it('si chiude con il pulsante di chiusura', () => {
    open('/esplora/cuore');
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi il cartellino' }));
    expect(screen.queryByRole('complementary')).toBeNull();
    expect(location.pathname).toBe('/esplora');
  });
});
