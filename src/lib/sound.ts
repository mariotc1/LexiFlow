// Basic sound synthesis using Web Audio API for a premium, asset-free experience.

class SoundFX {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.soundEnabled = true;
    }
  }
  
  private getCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  private async playTone(freq: number, type: OscillatorType, duration: number, startTime = 0, vol = 0.1) {
    if (!this.soundEnabled) return;
    try {
        const ctx = this.getCtx();
        
        // Critical: Browsers block audio until interaction. Resume if suspended.
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.value = freq;
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const now = ctx.currentTime + startTime;
        osc.start(now);
        
        // Envelope to prevent clicking/cutting
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.stop(now + duration + 0.1); // slight buffer
    } catch(e) {
        console.error("Sound Playback Error:", e);
    }
  }

  public playCorrect() {
    // Nice Major Chord (C5 Major)
    // C5 = 523.25, E5 = 659.25, G5 = 783.99
    const now = 0;
    this.playTone(523.25, 'sine', 0.4, now, 0.1);
    this.playTone(659.25, 'sine', 0.4, now + 0.05, 0.1);
    this.playTone(783.99, 'sine', 0.6, now + 0.1, 0.1);
    // High sparkle
    this.playTone(1046.50, 'triangle', 0.3, now + 0.1, 0.05);
  }

  public playIncorrect() {
    // Dissonant / Error thud
    this.playTone(150, 'sawtooth', 0.3, 0, 0.15);
    this.playTone(140, 'sawtooth', 0.3, 0.05, 0.15);
  }
  
  public playAlmost() {
     // Questioning / Uncertain
     this.playTone(330, 'triangle', 0.3, 0, 0.1);
     this.playTone(349, 'triangle', 0.3, 0.15, 0.1); // Discomforting interval
  }

  public playWin() {
    // Victory Fanfare
    const now = 0;
    const speed = 0.12;
    // C G E A G ...
    this.playTone(523.25, 'square', speed, now, 0.1);
    this.playTone(659.25, 'square', speed, now + speed, 0.1);
    this.playTone(783.99, 'square', speed, now + speed*2, 0.1);
    this.playTone(1046.50, 'square', 0.6, now + speed*3, 0.1);
  }
  
  public playClick() {
      // Crisp click
      this.playTone(1200, 'sine', 0.05, 0, 0.05);
  }
}

export const sfx = new SoundFX();
