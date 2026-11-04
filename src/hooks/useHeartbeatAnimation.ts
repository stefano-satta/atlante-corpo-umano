import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';
import { BEAT_FADE, BEAT_PERIOD } from '@/utils/heartbeat';
import { playHeartSound, soundsBetween } from '@/utils/heartSound';
import { bodyUniforms } from '@/utils/sceneMaterials';
import { useAtlas } from './useAtlas';
import { useReducedMotion } from './useReducedMotion';

/**
 * Battito del cuore selezionato (D41): entra ed esce con una dissolvenza; ogni battito parte
 * dagli atri. Con il movimento ridotto il cuore resta fermo.
 */
export function useHeartbeatAnimation() {
  const { state } = useAtlas();
  const reducedMotion = useReducedMotion();
  const beating = state.selection === 'cuore' && state.heartbeat && !reducedMotion;
  const sound = beating && state.heartSound;
  useFrame((_, delta) => {
    const { uBeatAmount, uBeatTime } = bodyUniforms;
    const dt = Math.min(delta, 0.1);
    uBeatAmount.value = MathUtils.clamp(uBeatAmount.value + (beating ? dt : -dt) / BEAT_FADE, 0, 1);
    const previous = uBeatTime.value;
    uBeatTime.value = uBeatAmount.value > 0 ? previous + dt : 0;
    // I due toni (D42) suonano quando il ciclo animato passa per il loro istante.
    if (sound && uBeatAmount.value > 0.5)
      for (const tone of soundsBetween((previous / BEAT_PERIOD) % 1, (uBeatTime.value / BEAT_PERIOD) % 1))
        playHeartSound(tone);
  });
}
