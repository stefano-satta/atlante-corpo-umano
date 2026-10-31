import { Route, Routes } from 'react-router';
import { AtlasPage } from '@/pages/AtlasPage';
import { ReadingPage } from '@/pages/ReadingPage';
import { TextOnlyAtlasPage } from '@/pages/TextOnlyAtlasPage';
import { READING_PAGE_IDS } from '@/utils/pages';
import { supportsWebGL2 } from '@/utils/webgl';

/**
 * Rotte dell'atlante (D11). La vista resta montata su tutti gli indirizzi, così la scena 3D non
 * si ricarica: le rotte di struttura e di percorso si leggono nello stato (`AtlasContext`), quelle
 * delle pagine di lettura aprono la pagina sopra la vista. Senza WebGL 2 la vista è quella testuale (D26).
 */
export function App() {
  return (
    <Routes>
      <Route element={supportsWebGL2() ? <AtlasPage /> : <TextOnlyAtlasPage />}>
        <Route index />
        <Route path="esplora/:id?" />
        <Route path="organo/:id" />
        <Route path="percorsi/:pathId/:step?" />
        {READING_PAGE_IDS.map((p) => (
          <Route key={p} path={p} element={<ReadingPage key={p} page={p} />} />
        ))}
        {/* Un indirizzo sconosciuto apre l'atlante, che lo riscrive in /esplora. */}
        <Route path="*" />
      </Route>
    </Routes>
  );
}
