/**
 * SoundManager - Handles all game sound effects
 * Uses Web Audio API to generate simple procedural sounds
 */
export class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  constructor() {
    // Initialize Audio Context (lazy loading)
    if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
      this.audioContext = new (AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Play a simple tone
   */
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * Play a chord
   */
  private playChord(frequencies: number[], duration: number) {
    frequencies.forEach(freq => this.playTone(freq, duration));
  }

  // === GAME SOUNDS ===

  /**
   * Click sound
   */
  click() {
    this.playTone(800, 0.05);
  }

  /**
   * Button hover
   */
  hover() {
    this.playTone(600, 0.03);
  }

  /**
   * City founded
   */
  cityFounded() {
    this.playChord([523, 659, 784], 0.4); // C Major chord
  }

  /**
   * Unit recruited
   */
  unitRecruited() {
    this.playTone(440, 0.15, 'triangle');
    setTimeout(() => this.playTone(554, 0.15, 'triangle'), 100);
  }

  /**
   * Technology researched
   */
  techResearched() {
    this.playChord([523, 659, 784, 1047], 0.5); // C Major 7th
  }

  /**
   * Turn ended
   */
  turnEnded() {
    this.playTone(330, 0.1);
  }

  /**
   * Victory
   */
  victory() {
    setTimeout(() => this.playChord([523, 659, 784], 0.3), 0);
    setTimeout(() => this.playChord([659, 784, 988], 0.3), 300);
    setTimeout(() => this.playChord([784, 988, 1175], 0.5), 600);
  }

  /**
   * Defeat
   */
  defeat() {
    setTimeout(() => this.playTone(196, 0.3, 'sawtooth'), 0);
    setTimeout(() => this.playTone(165, 0.3, 'sawtooth'), 300);
    setTimeout(() => this.playTone(131, 0.5, 'sawtooth'), 600);
  }

  /**
   * War declared
   */
  warDeclared() {
    this.playTone(220, 0.4, 'sawtooth');
  }

  /**
   * Alliance formed
   */
  allianceFormed() {
    this.playChord([392, 493, 587], 0.4); // G Major
  }

  /**
   * Great person earned
   */
  greatPerson() {
    setTimeout(() => this.playTone(659, 0.15), 0);
    setTimeout(() => this.playTone(784, 0.15), 150);
    setTimeout(() => this.playTone(988, 0.15), 300);
    setTimeout(() => this.playTone(1175, 0.3), 450);
  }

  /**
   * Wonder completed
   */
  wonderCompleted() {
    setTimeout(() => this.playChord([523, 659, 784], 0.2), 0);
    setTimeout(() => this.playChord([587, 740, 880], 0.2), 200);
    setTimeout(() => this.playChord([659, 784, 988], 0.4), 400);
  }

  /**
   * Event triggered
   */
  eventTriggered() {
    this.playChord([440, 554, 659], 0.3);
  }

  /**
   * Error/warning
   */
  error() {
    this.playTone(200, 0.2, 'sawtooth');
  }

  /**
   * Toggle sound
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Set volume
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Check if enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
export const soundManager = new SoundManager();
