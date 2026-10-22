// @vitest-environment jsdom
import '../../test/ambiente-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { Box3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { ProviderAtlante } from '../app/stato';
import { scenaApi } from '../scena/api';
import { Pannello } from './Pannello';

beforeAll(() => {
  const box = new Box3();
  scenaApi.unita.set('cuore', { indice: 1, id: 'cuore', strato: 'organi', nomeFma: 'Heart', fma: 'FMA7088', box });
  scenaApi.unita.set('BP1', { indice: 2, id: 'BP1', strato: 'ossa', nomeFma: 'Left femur', fma: 'FMA24475', box });
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

  it('dichiara il nome provvisorio per ossa e muscoli non ancora tradotti', () => {
    apri('/esplora/BP1');
    expect(screen.getByRole('heading', { name: 'Left femur' })).toBeTruthy();
    expect(screen.getByText(/Nome provvisorio in inglese/)).toBeTruthy();
    expect(screen.getByText('Identificativo FMA 24475')).toBeTruthy();
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
