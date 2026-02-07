// Basic sound synthesis to avoid external assets for now, or use placeholder URLs
// For a premium feel, real assets are better, but we can synthesize "8-bit" or "modern" beeps.
// Let's use simple oscillator-based sounds for "Kahoot-like" feedback without assets.

class SoundFX {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      // Init on first user interaction usually
      this.soundEnabled = true; // controlled by store
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

  private playTone(freq: number, type: OscillatorType, duration: number, startTime = 0) {
    if (!this.soundEnabled) return;
    try {
        const ctx = this.getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.value = freq;
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const now = ctx.currentTime + startTime;
        osc.start(now);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.stop(now + duration);
    } catch(e) {
        console.error(e);
    }
  }

  public playCorrect() {
    // Digging coin sound / Positive Ding
    this.playTone(800, 'sine', 0.1);
    this.playTone(1200, 'sine', 0.3, 0.1);
  }

  public playIncorrect() {
    // Low thud
    this.playTone(200, 'sawtooth', 0.1);
    this.playTone(150, 'sawtooth', 0.3, 0.1);
  }
  
  public playAlmost() {
     // Questioning tone similar to incorrect but softer
     this.playTone(300, 'triangle', 0.2);
     this.playTone(400, 'triangle', 0.2, 0.2);
  }

  public playWin() {
    // Fanfare
    const now = 0;
    this.playTone(440, 'square', 0.2, now);
    this.playTone(554, 'square', 0.2, now + 0.2);
    this.playTone(659, 'square', 0.4, now + 0.4);
    this.playTone(880, 'square', 0.8, now + 0.8);
  }
  
  public playClick() {
      // Soft click
      this.playTone(800, 'triangle', 0.05);
  }
}

export const sfx = new SoundFX();
