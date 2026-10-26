import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import '@fontsource-variable/bricolage-grotesque/opsz.css';
import '@fontsource-variable/atkinson-hyperlegible-next/wght.css';
import '@fontsource-variable/atkinson-hyperlegible-next/wght-italic.css';
import '@/styles/index.css';
import { App } from './App';
import { AtlasProvider } from './contexts/AtlasContext';

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root mancante in index.html');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <AtlasProvider>
        <App />
      </AtlasProvider>
    </BrowserRouter>
  </StrictMode>,
);
