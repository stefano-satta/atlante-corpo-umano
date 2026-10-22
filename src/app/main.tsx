import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/spectral/300.css';
import '@fontsource/spectral/300-italic.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '../stile/stile.css';
import { App } from './App';
import { ProviderAtlante } from './stato';

const radice = document.getElementById('root');
if (!radice) throw new Error('Elemento #root mancante in index.html');

createRoot(radice).render(
  <StrictMode>
    <ProviderAtlante>
      <App />
    </ProviderAtlante>
  </StrictMode>,
);
