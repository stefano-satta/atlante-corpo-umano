// Suono del battito del cuore 3D (D42): sintetizzato con la Web Audio API, senza file audio.
// Ogni tono è un colpo grave che scende di frequenza, con un breve soffio di rumore, il tutto
// passato in un filtro passa-basso che lo rende ovattato come allo stetoscopio. Il primo tono è
// più grave e più lungo del secondo. Il suono è spento all'inizio e parte solo da un clic.

/** Fasi del ciclo (frazioni di BEAT_PERIOD) dei due toni: inizio e fine della contrazione dei ventricoli. */
export const FIRST_SOUND = 0.16;
export const SECOND_SOUND = 0.47;

/** Toni il cui istante cade fra due fasi successive del ciclo (anche a cavallo dell'inizio di un ciclo). */
export function soundsBetween(previous: number, next: number): Array<'primo' | 'secondo'> {
  const crossed = (at: number) => (previous <= next ? previous < at && at <= next : previous < at || at <= next);
  const sounds: Array<'primo' | 'secondo'> = [];
  if (crossed(FIRST_SOUND)) sounds.push('primo');
  if (crossed(SECOND_SOUND)) sounds.push('secondo');
  return sounds;
}

const TONES = {
  primo: { frequency: 48, duration: 0.16, gain: 0.9 },
  secondo: { frequency: 62, duration: 0.11, gain: 0.68 },
} as const;
const CUTOFF = 180;
const NOISE = 0.25;

let context: AudioContext | null = null;
let noise: AudioBuffer | null = null;

/**
 * Prepara l'audio. Va chiamata dentro il clic dell'utente: i browser avviano l'audio solo
 * dopo un gesto. Restituisce falso se il browser non ha la Web Audio API.
 */
export function unlockHeartSound() {
  if (typeof AudioContext === 'undefined') return false;
  if (!context) {
    context = new AudioContext();
    noise = context.createBuffer(1, Math.round(context.sampleRate * 0.05), context.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  void context.resume();
  return true;
}

/** Suona subito uno dei due toni; senza audio preparato non fa nulla. */
export function playHeartSound(tone: 'primo' | 'secondo') {
  if (!context || !noise || context.state !== 'running') return;
  const { frequency, duration, gain } = TONES[tone];
  const t = context.currentTime;
  const out = context.createGain();
  const lowpass = context.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = CUTOFF;
  out.connect(lowpass);
  lowpass.connect(context.destination);
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  out.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  const oscillator = context.createOscillator();
  oscillator.frequency.setValueAtTime(frequency * 1.7, t);
  oscillator.frequency.exponentialRampToValueAtTime(frequency, t + 0.035);
  oscillator.connect(out);
  oscillator.start(t);
  oscillator.stop(t + duration + 0.02);

  const burst = context.createBufferSource();
  burst.buffer = noise;
  const burstGain = context.createGain();
  burstGain.gain.value = NOISE;
  burst.connect(burstGain);
  burstGain.connect(out);
  burst.start(t);
  // Il filtro e il guadagno si staccano alla fine del tono, così i nodi non restano appesi.
  oscillator.onended = () => lowpass.disconnect();
}
