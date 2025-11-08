import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_BASE_HEALTH, PLAYER_BASE_STAMINA } from '../config/GameConfig';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private health: number;
  private maxHealth: number;
  private stamina: number;
  private maxStamina: number;
  private level: number = 1;
  private experience: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    this.maxHealth = PLAYER_BASE_HEALTH;
    this.health = this.maxHealth;
    this.maxStamina = PLAYER_BASE_STAMINA;
    this.stamina = this.maxStamina;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(10);

    // Set body size for collision
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setSize(24, 24);
    }
  }

  update(): void {
    // Regenerate stamina over time
    if (this.stamina < this.maxStamina) {
      this.stamina = Math.min(this.maxStamina, this.stamina + 0.1);
    }
  }

  moveToward(targetX: number, targetY: number): void {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    this.setVelocity(
      Math.cos(angle) * PLAYER_SPEED,
      Math.sin(angle) * PLAYER_SPEED
    );
  }

  stop(): void {
    this.setVelocity(0, 0);
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);

    // Visual feedback
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  useStamina(amount: number): boolean {
    if (this.stamina >= amount) {
      this.stamina -= amount;
      return true;
    }
    return false;
  }

  addExperience(amount: number): void {
    this.experience += amount;
    const requiredXP = this.level * 100;

    if (this.experience >= requiredXP) {
      this.levelUp();
    }
  }

  private levelUp(): void {
    this.level++;
    this.experience = 0;
    this.maxHealth += 10;
    this.maxStamina += 10;
    this.health = this.maxHealth;
    this.stamina = this.maxStamina;

    // Emit level up event
    this.scene.events.emit('playerLevelUp', this.level);
  }

  private die(): void {
    this.scene.events.emit('playerDeath');
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getStamina(): number {
    return this.stamina;
  }

  getMaxStamina(): number {
    return this.maxStamina;
  }

  getLevel(): number {
    return this.level;
  }

  getExperience(): number {
    return this.experience;
  }
}
