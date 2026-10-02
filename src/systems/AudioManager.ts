export class AudioManager {
  private ctx?: AudioContext;
  private hum?: GainNode;
  muted = false;
  start() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.hum = this.ctx.createGain();
      this.hum.gain.value = this.muted ? 0 : 0.017;
      this.hum.connect(this.ctx.destination);
      for (const frequency of [60, 120]) {
        const o = this.ctx.createOscillator();
        o.frequency.value = frequency;
        o.type = "sine";
        o.connect(this.hum);
        o.start();
      }
    }
    void this.ctx.resume();
  }
  toggle() {
    this.muted = !this.muted;
    if (this.hum)
      this.hum.gain.setTargetAtTime(
        this.muted ? 0 : 0.017,
        this.ctx!.currentTime,
        0.2,
      );
  }
  atmosphere(uncanny: boolean) {
    if (this.hum)
      this.hum.gain.setTargetAtTime(
        this.muted ? 0 : uncanny ? 0.002 : 0.017,
        this.ctx!.currentTime,
        0.8,
      );
  }
  tone(freq: number, duration = 0.12, volume = 0.04) {
    if (!this.ctx || this.muted) return;
    const o = this.ctx.createOscillator(),
      g = this.ctx.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(volume, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start();
    o.stop(this.ctx.currentTime + duration);
  }
  bell() {
    this.tone(880, 0.35, 0.025);
    setTimeout(() => this.tone(660, 0.45, 0.02), 160);
  }
}
