import Phaser from 'phaser';
import { ResourceType } from '../config/GameConfig';
import { Inventory } from '../items/Inventory';

export enum WorldObjectType {
  TREE = 'tree',
  ROCK = 'rock',
  IRON_DEPOSIT = 'iron_deposit',
  BERRY_BUSH = 'berry_bush',
  WATER_SOURCE = 'water_source'
}

export interface WorldObjectData {
  type: WorldObjectType;
  resource: ResourceType;
  amount: number;
  health: number;
  respawnTime?: number; // milliseconds
}

export const WORLD_OBJECT_DATA: Record<WorldObjectType, WorldObjectData> = {
  [WorldObjectType.TREE]: {
    type: WorldObjectType.TREE,
    resource: ResourceType.WOOD,
    amount: 10,
    health: 30,
    respawnTime: 60000 // 1 minute
  },
  [WorldObjectType.ROCK]: {
    type: WorldObjectType.ROCK,
    resource: ResourceType.STONE,
    amount: 8,
    health: 40,
    respawnTime: 90000 // 1.5 minutes
  },
  [WorldObjectType.IRON_DEPOSIT]: {
    type: WorldObjectType.IRON_DEPOSIT,
    resource: ResourceType.IRON,
    amount: 5,
    health: 60,
    respawnTime: 180000 // 3 minutes
  },
  [WorldObjectType.BERRY_BUSH]: {
    type: WorldObjectType.BERRY_BUSH,
    resource: ResourceType.FOOD,
    amount: 3,
    health: 10,
    respawnTime: 120000 // 2 minutes
  },
  [WorldObjectType.WATER_SOURCE]: {
    type: WorldObjectType.WATER_SOURCE,
    resource: ResourceType.WATER,
    amount: 5,
    health: 1,
    respawnTime: 30000 // 30 seconds
  }
};

export class WorldObject extends Phaser.GameObjects.Container {
  private objectType: WorldObjectType;
  private health: number;
  private maxHealth: number;
  private resourceAmount: number;
  private resourceType: ResourceType;
  private sprite: Phaser.GameObjects.Rectangle;
  private isDepleted: boolean = false;
  private respawnTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number, type: WorldObjectType) {
    super(scene, x, y);

    this.objectType = type;
    const data = WORLD_OBJECT_DATA[type];

    this.health = data.health;
    this.maxHealth = data.health;
    this.resourceAmount = data.amount;
    this.resourceType = data.resource;

    // Create visual representation
    this.sprite = scene.add.rectangle(0, 0, 32, 32, this.getColor());
    this.add(this.sprite);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(32, 32);
    this.setDepth(3);
  }

  private getColor(): number {
    const colors: Record<WorldObjectType, number> = {
      [WorldObjectType.TREE]: 0x228b22,
      [WorldObjectType.ROCK]: 0x808080,
      [WorldObjectType.IRON_DEPOSIT]: 0x4a4a4a,
      [WorldObjectType.BERRY_BUSH]: 0x8b0000,
      [WorldObjectType.WATER_SOURCE]: 0x4169e1
    };
    return colors[this.objectType];
  }

  harvest(inventory: Inventory): boolean {
    if (this.isDepleted) return false;

    this.health -= 10;

    // Visual feedback
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });

    if (this.health <= 0) {
      // Add resources to inventory
      inventory.addResource(this.resourceType, this.resourceAmount);

      this.depleteObject();
      return true;
    }

    return false;
  }

  private depleteObject(): void {
    this.isDepleted = true;
    this.sprite.setAlpha(0.3);

    // Schedule respawn
    const respawnTime = WORLD_OBJECT_DATA[this.objectType].respawnTime;
    if (respawnTime) {
      this.respawnTimer = this.scene.time.delayedCall(respawnTime, () => {
        this.respawn();
      });
    }
  }

  private respawn(): void {
    this.isDepleted = false;
    this.health = this.maxHealth;
    this.sprite.setAlpha(1);
  }

  getObjectType(): WorldObjectType {
    return this.objectType;
  }

  getResourceType(): ResourceType {
    return this.resourceType;
  }

  getHealth(): number {
    return this.health;
  }

  isDone(): boolean {
    return this.isDepleted;
  }
}
