let ctx: AudioContext | null = null;

/** Must be called from a user gesture (e.g. the START tap) so audio is allowed later. */
export function unlockAudio(): void {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
  } catch {
    // No Web Audio — cues will just vibrate.
  }
}

function tone(freq: number, start: number, dur: number): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.25, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

/** Play `count` short beeps; the last one long if `final`. */
export function cue(count: number, final = false): void {
  unlockAudio();
  if (ctx) {
    const t = ctx.currentTime + 0.02;
    for (let i = 0; i < count; i++) {
      const last = i === count - 1;
      tone(last && final ? 660 : 880, t + i * 0.25, last && final ? 0.9 : 0.15);
    }
  }
  const pattern: number[] = [];
  for (let i = 0; i < count; i++) pattern.push(final && i === count - 1 ? 700 : 150, 100);
  navigator.vibrate?.(pattern);
}
