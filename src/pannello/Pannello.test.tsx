// @vitest-environment jsdom
import '../../test/ambiente-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { Box3, Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { ProviderAtlante } from '../app/stato';
import { scenaApi } from '../scena/api';
import { Pannello } from './Pannello';

beforeAll(() => {
  const box = new Box3();
  const ancora = new Vector3();
  scenaApi.unita.set('cuore', {
    indice: 1,
    id: 'cuore',
    strato: 'organi',
    nomeFma: 'Heart',
    fma: 'FMA7088',
    box,
    ancora,
  });
  scenaApi.unita.set('FJ3259', {
    indice: 2,
    id: 'FJ3259',
    strato: 'ossa',
    nomeFma: 'Left femur',
    fma: 'FMA24475',
    box,
    ancora,
  });
  scenaApi.unita.set('FJ1', {
    indice: 3,
    id: 'FJ1',
    strato: 'muscoli',
    nomeFma: 'Left biceps',
    fma: 'FMA1',
    box,
    ancora,
  });
});

const apri = (percorso: string) => {
  history.replaceState(null, '', percorso);
  return render(
    <ProviderAtlante>
      <Pannello />
    </ProviderAtlante>,
  );
};

describe('pannello della struttura selezionata', () => {
  it('non compare senza selezione', () => {
    apri('/');
    expect(screen.queryByRole('complementary')).toBeNull();
  });

  it('mostra il cartellino di un organo con nome, termine e appartenenza', () => {
    apri('/esplora/cuore');
    expect(screen.getByRole('heading', { level: 2, name: 'Cuore' })).toBeTruthy();
    expect(screen.getByText('cor').getAttribute('lang')).toBe('la');
    expect(screen.getAllByText('Apparato cardiovascolare').length).toBeGreaterThan(0);
  });

  it('mostra il testo verificato con i rimandi, le fonti e il termine TA2', async () => {
    apri('/esplora/cuore');
    expect(await screen.findByText(/organo muscolare formato da quattro cavità/)).toBeTruthy();
    expect(screen.getByRole('link', { name: /TA2 3932/ }).getAttribute('href')).toBe(
      'https://ta2viewer.openanatomy.org/?id=3932',
    );
    const fonti = screen.getByRole('region', { name: 'Fonti' });
    expect(fonti.querySelectorAll('li')).toHaveLength(3);
    // Ogni rimando nel testo porta a una fonte presente nell'elenco.
    for (const rimando of document.querySelectorAll<HTMLAnchorElement>('.testo .rimando a'))
      expect(document.querySelector(rimando.getAttribute('href') ?? '')).toBeTruthy();
  });

  it('riconosce un osso con contenuto dal suo identificativo FMA', async () => {
    apri('/esplora/FJ3259');
    expect(screen.getByRole('heading', { name: 'Femore' })).toBeTruthy();
    expect(screen.getByText('os femoris').getAttribute('lang')).toBe('la');
    expect(await screen.findByText(/unico osso della coscia/)).toBeTruthy();
  });

  it('dichiara il nome provvisorio per ossa e muscoli senza contenuto', () => {
    apri('/esplora/FJ1');
    expect(screen.getByRole('heading', { name: 'Left biceps' })).toBeTruthy();
    expect(screen.getByText(/Nome provvisorio in inglese/)).toBeTruthy();
    expect(screen.getByText('Identificativo FMA 1')).toBeTruthy();
  });

  it('si allarga nella scheda e torna al cartellino riportando il fuoco sul pulsante', () => {
    apri('/esplora/cuore');
    fireEvent.click(screen.getByRole('button', { name: 'Apri la scheda' }));
    const titolo = screen.getByRole('heading', { level: 1, name: 'Cuore' });
    expect(document.activeElement).toBe(titolo);
    expect(screen.getByRole('complementary').dataset.modo).toBe('scheda');
    expect(location.pathname).toBe('/organo/cuore');

    fireEvent.click(screen.getByRole('button', { name: 'Torna al cartellino' }));
    expect(screen.getByRole('complementary').dataset.modo).toBe('cartellino');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Apri la scheda' }));
  });

  it('si chiude con il pulsante di chiusura', () => {
    apri('/esplora/cuore');
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi il cartellino' }));
    expect(screen.queryByRole('complementary')).toBeNull();
    expect(location.pathname).toBe('/');
  });
});
