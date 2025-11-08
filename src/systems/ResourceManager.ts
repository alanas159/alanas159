import { ResourceType } from '../config/GameConfig';

export interface Resources {
  [ResourceType.WOOD]: number;
  [ResourceType.STONE]: number;
  [ResourceType.IRON]: number;
  [ResourceType.FOOD]: number;
  [ResourceType.WATER]: number;
  [ResourceType.HERBS]: number;
}

export class ResourceManager {
  private resources: Resources;

  constructor() {
    this.resources = {
      [ResourceType.WOOD]: 50,
      [ResourceType.STONE]: 20,
      [ResourceType.IRON]: 0,
      [ResourceType.FOOD]: 10,
      [ResourceType.WATER]: 10,
      [ResourceType.HERBS]: 5
    };
  }

  addResource(type: ResourceType, amount: number): void {
    this.resources[type] += amount;
  }

  removeResource(type: ResourceType, amount: number): boolean {
    if (this.resources[type] >= amount) {
      this.resources[type] -= amount;
      return true;
    }
    return false;
  }

  hasResource(type: ResourceType, amount: number): boolean {
    return this.resources[type] >= amount;
  }

  getResource(type: ResourceType): number {
    return this.resources[type];
  }

  getAllResources(): Resources {
    return { ...this.resources };
  }

  canAfford(cost: Partial<Resources>): boolean {
    for (const [type, amount] of Object.entries(cost)) {
      if (!this.hasResource(type as ResourceType, amount as number)) {
        return false;
      }
    }
    return true;
  }

  spend(cost: Partial<Resources>): boolean {
    if (!this.canAfford(cost)) {
      return false;
    }

    for (const [type, amount] of Object.entries(cost)) {
      this.removeResource(type as ResourceType, amount as number);
    }
    return true;
  }
}
