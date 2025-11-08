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
  },
  [ZombieType.BERSERKER]: {
    health: 60,
    speed: 80,
    damage: 15,
    xpReward: 40,
    color: 0xff4444
  },
  [ZombieType.TANK]: {
    health: 150,
    speed: 25,
    damage: 20,
    xpReward: 60,
    color: 0x444444
  },
  [ZombieType.PLAGUE_LORD]: {
    health: 500,
    speed: 50,
    damage: 30,
    xpReward: 500,
    color: 0x8b008b
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
  private isBoss: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, type: ZombieType = ZombieType.WALKER) {
    super(scene, x, y, 'zombie');

    this.zombieType = type;
    this.isBoss = type === ZombieType.PLAGUE_LORD;
    const stats = ZOMBIE_STATS[type];

    this.health = stats.health;
    this.maxHealth = stats.health;
    this.speed = stats.speed;
    this.damage = stats.damage;
    this.xpReward = stats.xpReward;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setTint(stats.color);
    this.setDepth(this.isBoss ? 15 : 5);

    // Boss is larger
    const scale = this.isBoss ? 2 : 1;
    this.setScale(scale);

    if (this.body) {
      const size = this.isBoss ? 48 : 24;
      (this.body as Phaser.Physics.Arcade.Body).setSize(size, size);
    }

    // Boss gets a health bar
    if (this.isBoss) {
      this.createHealthBar();
    }
  }

  private healthBarBg?: Phaser.GameObjects.Rectangle;
  private healthBarFg?: Phaser.GameObjects.Rectangle;

  private createHealthBar(): void {
    this.healthBarBg = this.scene.add.rectangle(this.x, this.y - 40, 80, 8, 0x000000);
    this.healthBarBg.setDepth(20);

    this.healthBarFg = this.scene.add.rectangle(this.x, this.y - 40, 80, 8, 0xff0000);
    this.healthBarFg.setDepth(21);
  }

  private updateHealthBar(): void {
    if (this.healthBarBg && this.healthBarFg) {
      this.healthBarBg.setPosition(this.x, this.y - 40);
      const percentage = this.health / this.maxHealth;
      this.healthBarFg.setPosition(this.x, this.y - 40);
      this.healthBarFg.setSize(80 * percentage, 8);
    }
  }

  update(time: number, delta: number): void {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    if (this.target && this.target.active) {
      this.moveTowardTarget();
    }

    // Update boss health bar
    if (this.isBoss) {
      this.updateHealthBar();
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

    // Destroy health bar if boss
    if (this.healthBarBg) this.healthBarBg.destroy();
    if (this.healthBarFg) this.healthBarFg.destroy();

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

    // Special event for boss death
    if (this.isBoss) {
      this.scene.events.emit('bossDefeated', this.zombieType);
    }
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

  isBossZombie(): boolean {
    return this.isBoss;
  }
}
