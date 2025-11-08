import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_BASE_HEALTH, PLAYER_BASE_STAMINA } from '../config/GameConfig';
import { Inventory } from '../items/Inventory';
import { Weapon, WeaponType } from '../items/Weapon';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private health: number;
  private maxHealth: number;
  private stamina: number;
  private maxStamina: number;
  private level: number = 1;
  private experience: number = 0;
  private inventory: Inventory;
  private attackCooldown: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    this.maxHealth = PLAYER_BASE_HEALTH;
    this.health = this.maxHealth;
    this.maxStamina = PLAYER_BASE_STAMINA;
    this.stamina = this.maxStamina;

    this.inventory = new Inventory();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(10);

    // Set body size for collision
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setSize(24, 24);
    }
  }

  update(time: number, delta: number): void {
    // Regenerate stamina over time
    if (this.stamina < this.maxStamina) {
      this.stamina = Math.min(this.maxStamina, this.stamina + 0.1);
    }

    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
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

  getInventory(): Inventory {
    return this.inventory;
  }

  attack(target?: Phaser.Physics.Arcade.Sprite): boolean {
    const weapon = this.inventory.getEquippedWeapon();
    const attackDelay = 1000 / weapon.getAttackSpeed();

    if (this.attackCooldown > 0) {
      return false; // Still on cooldown
    }

    // Check stamina
    const staminaCost = 5;
    if (!this.useStamina(staminaCost)) {
      return false;
    }

    this.attackCooldown = attackDelay;

    // Visual attack animation
    const angle = target ? Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y) : 0;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true
    });

    // Use weapon durability
    if (!weapon.use() && weapon.isBroken()) {
      this.scene.events.emit('weaponBroken', weapon);
      // Revert to fists
      this.inventory.equipWeapon(new Weapon(WeaponType.FISTS));
    }

    return true;
  }

  canAttack(): boolean {
    return this.attackCooldown <= 0;
  }

  getAttackRange(): number {
    return this.inventory.getEquippedWeapon().getRange();
  }

  getAttackDamage(): number {
    return this.inventory.getEquippedWeapon().getDamage();
  }
}
