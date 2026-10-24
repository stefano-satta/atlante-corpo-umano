import { AtlasPage } from '@/pages/AtlasPage';
import { TextOnlyAtlasPage } from '@/pages/TextOnlyAtlasPage';
import { supportsWebGL2 } from '@/utils/webgl';

/** Senza WebGL 2 l'atlante si apre nella versione testuale (D26). */
export function App() {
  return supportsWebGL2() ? <AtlasPage /> : <TextOnlyAtlasPage />;
}
