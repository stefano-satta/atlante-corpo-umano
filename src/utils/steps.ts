/** Passo successivo o precedente, ricominciando dall'inizio dopo l'ultimo (il ciclo si ripete). */
export function wrapStep(current: number, total: number, direction: 1 | -1) {
  return (current + direction + total) % total;
}
