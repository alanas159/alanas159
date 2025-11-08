import Phaser from 'phaser';
import { ZombieType } from '../config/GameConfig';
import { Player } from './Player';

export interface ZombieStats {
  health: number;
  speed: number;
  damage: number;
  xpReward: number;
  color: number;
}

export const ZOMBIE_STATS: Record<ZombieType, ZombieStats> = {
  [ZombieType.WALKER]: {
    health: 30,
    speed: 40,
    damage: 5,
    xpReward: 10,
    color: 0x88aa88
  },
  [ZombieType.RUNNER]: {
    health: 20,
    speed: 100,
    damage: 3,
    xpReward: 15,
    color: 0xaa8888
  },
  [ZombieType.KNIGHT]: {
    health: 80,
    speed: 30,
    damage: 10,
    xpReward: 30,
    color: 0x666666
  },
  [ZombieType.PLAGUE_BEARER]: {
    health: 40,
    speed: 50,
    damage: 8,
    xpReward: 25,
    color: 0xaaaa88
  }
};

export class Zombie extends Phaser.Physics.Arcade.Sprite {
  private zombieType: ZombieType;
  private health: number;
  private maxHealth: number;
  private speed: number;
  private damage: number;
  private xpReward: number;
  private target?: Player;
  private attackCooldown: number = 0;
  private readonly ATTACK_DELAY = 1000; // 1 second between attacks

  constructor(scene: Phaser.Scene, x: number, y: number, type: ZombieType = ZombieType.WALKER) {
    super(scene, x, y, 'zombie');

    this.zombieType = type;
    const stats = ZOMBIE_STATS[type];

    this.health = stats.health;
    this.maxHealth = stats.health;
    this.speed = stats.speed;
    this.damage = stats.damage;
    this.xpReward = stats.xpReward;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setTint(stats.color);
    this.setDepth(5);

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setSize(24, 24);
    }
  }

  update(time: number, delta: number): void {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    if (this.target && this.target.active) {
      this.moveTowardTarget();
    }
  }

  setTarget(target: Player): void {
    this.target = target;
  }

  private moveTowardTarget(): void {
    if (!this.target) return;

    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.target.x, this.target.y
    );

    // Stop if very close (attack range)
    if (distance < 40) {
      this.setVelocity(0, 0);
      this.tryAttack();
      return;
    }

    // Move toward target
    const angle = Phaser.Math.Angle.Between(
      this.x, this.y,
      this.target.x, this.target.y
    );

    this.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }

  private tryAttack(): void {
    if (this.attackCooldown <= 0 && this.target) {
      this.target.takeDamage(this.damage);
      this.attackCooldown = this.ATTACK_DELAY;

      // Visual feedback
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true
      });
    }
  }

  takeDamage(amount: number): void {
    this.health -= amount;

    // Visual feedback
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.setTint(ZOMBIE_STATS[this.zombieType].color);
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  private die(): void {
    // Grant XP to player
    if (this.target) {
      this.target.addExperience(this.xpReward);
    }

    // Death animation
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 200,
      onComplete: () => {
        this.destroy();
      }
    });

    this.scene.events.emit('zombieKilled', this.zombieType);
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getType(): ZombieType {
    return this.zombieType;
  }

  modifySpeed(multiplier: number): void {
    this.speed = ZOMBIE_STATS[this.zombieType].speed * multiplier;
  }
}
