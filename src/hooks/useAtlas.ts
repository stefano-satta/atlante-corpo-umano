import { useContext } from 'react';
import { AtlasContext } from '@/contexts/AtlasContext';

export function useAtlas() {
  const context = useContext(AtlasContext);
  if (!context) throw new Error('useAtlas fuori da AtlasProvider');
  return context;
}
