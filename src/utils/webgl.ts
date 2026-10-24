// Il controllo crea un contesto WebGL di prova: va fatto una volta sola e il contesto va
// rilasciato subito. I browser ne tengono attivi pochi (circa 16) e, superato il limite,
// chiudono il più vecchio, cioè quello della scena.
let supported: boolean | undefined;

export function supportsWebGL2() {
  if (supported === undefined) {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      supported = !!gl;
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      supported = false;
    }
  }
  return supported;
}
