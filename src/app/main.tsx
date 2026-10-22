import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/bricolage-grotesque/opsz.css';
import '@fontsource-variable/atkinson-hyperlegible-next/wght.css';
import '@fontsource-variable/atkinson-hyperlegible-next/wght-italic.css';
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
