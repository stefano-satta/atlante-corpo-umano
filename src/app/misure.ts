// Raccolta delle misure di prestazione del prototipo (vedi criteri di D12).
export const misure = {
  fps: 0,
  frameMs: 0,
  chiamate: 0,
  triangoli: 0,
  /** Millisecondi dall'inizio della navigazione al primo fotogramma con il corpo. */
  interattivoMs: 0,
  /** Millisecondi tra il rilascio del clic e il fotogramma con il cartellino. */
  latenzaSelezioneMs: 0,
  inizioSelezione: 0,
  kBScaricati: 0,
};

export function kBModelli() {
  return Math.round(
    performance
      .getEntriesByType('resource')
      .filter((r) => /\/modelli\//.test(r.name))
      .reduce((s, r) => s + (r as PerformanceResourceTiming).encodedBodySize, 0) / 1024,
  );
}
