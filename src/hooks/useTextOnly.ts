import { useContext } from 'react';
import { TextOnlyContext } from '@/contexts/TextOnlyContext';

export const useTextOnly = () => useContext(TextOnlyContext);
