import Phaser from 'phaser';
import { DAY_DURATION, NIGHT_DURATION, FULL_CYCLE } from '../config/GameConfig';

export enum TimeOfDay {
  DAY = 'day',
  NIGHT = 'night'
}

export class DayNightSystem {
  private scene: Phaser.Scene;
  private currentDay: number = 1;
  private currentTime: number = 0; // 0 to FULL_CYCLE
  private timeOfDay: TimeOfDay = TimeOfDay.DAY;
  private overlay?: Phaser.GameObjects.Rectangle;
  private onDayChange?: (day: number) => void;
  private onTimeChange?: (timeOfDay: TimeOfDay) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createOverlay();
  }

  private createOverlay(): void {
    this.overlay = this.scene.add.rectangle(
      0, 0,
      this.scene.scale.width,
      this.scene.scale.height,
      0x000033,
      0
    );
    this.overlay.setOrigin(0, 0);
    this.overlay.setDepth(1000);
  }

  update(delta: number): void {
    this.currentTime += delta;

    // Check for new day
    if (this.currentTime >= FULL_CYCLE) {
      this.currentTime -= FULL_CYCLE;
      this.currentDay++;
      if (this.onDayChange) {
        this.onDayChange(this.currentDay);
      }
    }

    // Update time of day
    const wasNight = this.timeOfDay === TimeOfDay.NIGHT;
    this.timeOfDay = this.currentTime < DAY_DURATION ? TimeOfDay.DAY : TimeOfDay.NIGHT;

    // Trigger callback on change
    if (wasNight !== (this.timeOfDay === TimeOfDay.NIGHT)) {
      if (this.onTimeChange) {
        this.onTimeChange(this.timeOfDay);
      }
    }

    // Update overlay opacity
    this.updateOverlay();
  }

  private updateOverlay(): void {
    if (!this.overlay) return;

    if (this.timeOfDay === TimeOfDay.DAY) {
      // During day, no overlay (0 opacity)
      this.overlay.setAlpha(0);
    } else {
      // During night, dark overlay (0.4 opacity)
      this.overlay.setAlpha(0.4);
    }
  }

  getCurrentDay(): number {
    return this.currentDay;
  }

  getTimeOfDay(): TimeOfDay {
    return this.timeOfDay;
  }

  isDay(): boolean {
    return this.timeOfDay === TimeOfDay.DAY;
  }

  isNight(): boolean {
    return this.timeOfDay === TimeOfDay.NIGHT;
  }

  getTimeRemaining(): number {
    if (this.isDay()) {
      return DAY_DURATION - this.currentTime;
    } else {
      return FULL_CYCLE - this.currentTime;
    }
  }

  setDayChangeCallback(callback: (day: number) => void): void {
    this.onDayChange = callback;
  }

  setTimeChangeCallback(callback: (timeOfDay: TimeOfDay) => void): void {
    this.onTimeChange = callback;
  }
}
