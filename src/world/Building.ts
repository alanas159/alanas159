import Phaser from 'phaser';
import { BuildingType } from '../config/GameConfig';
import { Zombie } from '../entities/Zombie';

export interface BuildingData {
  type: BuildingType;
  name: string;
  health: number;
  width: number;
  height: number;
  canWalkThrough: boolean;
  defense?: boolean;
  damagePerSecond?: number;
}

export const BUILDING_DATA: Record<BuildingType, BuildingData> = {
  [BuildingType.WOODEN_WALL]: {
    type: BuildingType.WOODEN_WALL,
    name: 'Wooden Wall',
    health: 100,
    width: 32,
    height: 32,
    canWalkThrough: false
  },
  [BuildingType.WOODEN_GATE]: {
    type: BuildingType.WOODEN_GATE,
    name: 'Wooden Gate',
    health: 80,
    width: 32,
    height: 32,
    canWalkThrough: true
  },
  [BuildingType.SPIKE_PIT]: {
    type: BuildingType.SPIKE_PIT,
    name: 'Spike Pit',
    health: 50,
    width: 32,
    height: 32,
    canWalkThrough: true,
    defense: true,
    damagePerSecond: 10
  },
  [BuildingType.CAMPFIRE]: {
    type: BuildingType.CAMPFIRE,
    name: 'Campfire',
    health: 30,
    width: 32,
    height: 32,
    canWalkThrough: true
  },
  [BuildingType.WORKBENCH]: {
    type: BuildingType.WORKBENCH,
    name: 'Workbench',
    health: 60,
    width: 64,
    height: 32,
    canWalkThrough: false
  },
  [BuildingType.STORAGE]: {
    type: BuildingType.STORAGE,
    name: 'Storage Chest',
    health: 80,
    width: 32,
    height: 32,
    canWalkThrough: false
  },
  [BuildingType.STONE_WALL]: {
    type: BuildingType.STONE_WALL,
    name: 'Stone Wall',
    health: 250,
    width: 32,
    height: 32,
    canWalkThrough: false
  },
  [BuildingType.TOWER]: {
    type: BuildingType.TOWER,
    name: 'Archer Tower',
    health: 200,
    width: 64,
    height: 64,
    canWalkThrough: false,
    defense: true,
    damagePerSecond: 15
  },
  [BuildingType.FORGE]: {
    type: BuildingType.FORGE,
    name: 'Forge',
    health: 150,
    width: 64,
    height: 64,
    canWalkThrough: false
  }
};

export class Building extends Phaser.GameObjects.Container {
  private buildingType: BuildingType;
  private health: number;
  private maxHealth: number;
  private sprite: Phaser.GameObjects.Rectangle;
  private data: BuildingData;
  private damageTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: BuildingType) {
    super(scene, x, y);

    this.buildingType = type;
    this.data = BUILDING_DATA[type];
    this.health = this.data.health;
    this.maxHealth = this.data.health;

    // Create visual
    this.sprite = scene.add.rectangle(
      0, 0,
      this.data.width,
      this.data.height,
      this.getColor(),
      0.8
    );
    this.add(this.sprite);

    // Add border
    const border = scene.add.rectangle(
      0, 0,
      this.data.width,
      this.data.height
    );
    border.setStrokeStyle(2, 0x000000);
    this.add(border);

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body

    this.setSize(this.data.width, this.data.height);
    this.setDepth(5);
  }

  private getColor(): number {
    const colors: Record<BuildingType, number> = {
      [BuildingType.WOODEN_WALL]: 0x8b4513,
      [BuildingType.WOODEN_GATE]: 0xa0522d,
      [BuildingType.SPIKE_PIT]: 0x696969,
      [BuildingType.CAMPFIRE]: 0xff4500,
      [BuildingType.WORKBENCH]: 0xd2691e,
      [BuildingType.STORAGE]: 0xcd853f,
      [BuildingType.STONE_WALL]: 0x708090,
      [BuildingType.TOWER]: 0x2f4f4f,
      [BuildingType.FORGE]: 0x8b0000
    };
    return colors[this.buildingType];
  }

  update(time: number, delta: number, zombies: Phaser.GameObjects.Group): void {
    // Defense buildings damage nearby zombies
    if (this.data.defense && this.data.damagePerSecond) {
      this.damageTimer += delta;

      if (this.damageTimer >= 1000) {
        this.damageTimer = 0;
        this.damageNearbyZombies(zombies);
      }
    }
  }

  private damageNearbyZombies(zombies: Phaser.GameObjects.Group): void {
    if (!this.data.damagePerSecond) return;

    const range = this.buildingType === BuildingType.TOWER ? 150 : 40;

    zombies.children.each((zombie) => {
      if (zombie instanceof Zombie) {
        const distance = Phaser.Math.Distance.Between(
          this.x, this.y,
          zombie.x, zombie.y
        );

        if (distance < range) {
          zombie.takeDamage(this.data.damagePerSecond!);
        }
      }
      return true;
    });
  }

  takeDamage(amount: number): void {
    this.health -= amount;

    // Visual feedback
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      this.sprite.clearTint();
    });

    if (this.health <= 0) {
      this.destroy();
      this.scene.events.emit('buildingDestroyed', this.buildingType);
    }
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getBuildingType(): BuildingType {
    return this.buildingType;
  }

  canWalkThrough(): boolean {
    return this.data.canWalkThrough;
  }
}
