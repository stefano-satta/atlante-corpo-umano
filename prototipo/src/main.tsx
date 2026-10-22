import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/spectral/300.css';
import '@fontsource/spectral/300-italic.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './stile.css';
import { ProviderAtlante } from './stato';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProviderAtlante>
      <App />
    </ProviderAtlante>
  </StrictMode>,
);
