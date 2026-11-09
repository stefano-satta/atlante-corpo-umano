import { Route, Routes } from 'react-router';
import { ReadingShell } from '@/components/features/layout/ReadingShell';
import { AtlasPage } from '@/pages/AtlasPage';
import { ReadingPage } from '@/pages/ReadingPage';
import { TextOnlyAtlasPage } from '@/pages/TextOnlyAtlasPage';
import { PAGE_PATHS, READING_PAGE_IDS } from '@/utils/pages';
import { supportsWebGL2 } from '@/utils/webgl';

/**
 * Rotte dell'atlante (D11, D54). Le rotte con il corpo 3D (soglia, esplorazione, percorsi a passi, quiz) non
 * hanno un elemento: si leggono nello stato (`AtlasContext`) e le mostra l'atlante del guscio. Le pagine di
 * lettura sono rotte sorelle, nel guscio `ReadingShell`: pagine a sé, senza l'atlante sotto. Il guscio
 * (`AtlasPage`) resta montato, così la scena 3D, una volta aperta, non si ricarica. Senza WebGL 2 il guscio
 * è la versione testuale (D26).
 */
export function App() {
  return (
    <Routes>
      <Route element={supportsWebGL2() ? <AtlasPage /> : <TextOnlyAtlasPage />}>
        <Route index />
        {/* /esplora/<apparato>/<struttura>/scheda (D47); /esplora/<struttura> e /organo/<struttura> sono gli indirizzi di prima. */}
        <Route path="esplora/:layer?/:id?/:sheet?" />
        <Route path="organo/:id" />
        <Route path="percorsi/:pathId/:step?" />
        {/* Quiz (D53): /quiz sceglie il tema, /quiz/<apparato> e /quiz/completa lo aprono. */}
        <Route path="quiz/:theme?" />
        {/* Pagine di lettura: pagine a sé, con barra e crediti, senza l'atlante sotto. */}
        <Route element={<ReadingShell />}>
          {READING_PAGE_IDS.map((p) => (
            <Route key={p} path={PAGE_PATHS[p]} element={<ReadingPage key={p} page={p} />} />
          ))}
        </Route>
        {/* Un indirizzo sconosciuto apre l'atlante, che lo riscrive in /esplora. */}
        <Route path="*" />
      </Route>
    </Routes>
  );
}
