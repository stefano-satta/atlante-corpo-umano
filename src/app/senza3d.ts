import { createContext, useContext } from 'react';

/**
 * Vero nella versione testuale dell'atlante (D26), quando il browser non ha WebGL 2: i testi
 * restano gli stessi, ma i comandi che agiscono sul corpo 3D spariscono o aprono altri testi.
 */
export const Senza3d = createContext(false);
export const useSenza3d = () => useContext(Senza3d);
