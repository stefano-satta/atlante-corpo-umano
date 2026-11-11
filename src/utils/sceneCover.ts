/**
 * Dice se la scena 3D è coperta per intero dall'interfaccia: su smartphone lo schema di un passo di
 * percorso, o il foglio del percorso aperto a tutta altezza. Coperta, la scena smette di disegnare.
 * Un piccolo archivio fuori da React: lo scrive il pannello del percorso, lo legge l'atlante.
 */
let covered = false;
const listeners = new Set<() => void>();

export const sceneCover = {
  get: () => covered,
  set(value: boolean) {
    if (value === covered) return;
    covered = value;
    for (const l of listeners) l();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
