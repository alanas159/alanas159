import { ResourceType, BuildingType } from '../config/GameConfig';
import { Resources } from './ResourceManager';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  cost: Partial<Resources>;
  unlockDay?: number;
  requiredTech?: string[];
}

export interface BuildingRecipe extends Recipe {
  type: BuildingType;
  health: number;
  width: number;
  height: number;
}

export interface ItemRecipe extends Recipe {
  itemType: string;
  damage?: number;
  defense?: number;
  durability?: number;
}

// Building recipes
export const BUILDING_RECIPES: BuildingRecipe[] = [
  {
    id: 'wooden_wall',
    name: 'Wooden Wall',
    description: 'Basic defensive wall',
    type: BuildingType.WOODEN_WALL,
    cost: { [ResourceType.WOOD]: 5 },
    health: 100,
    width: 1,
    height: 1
  },
  {
    id: 'wooden_gate',
    name: 'Wooden Gate',
    description: 'Gate that can be opened and closed',
    type: BuildingType.WOODEN_GATE,
    cost: { [ResourceType.WOOD]: 8 },
    health: 80,
    width: 1,
    height: 1
  },
  {
    id: 'spike_pit',
    name: 'Spike Pit',
    description: 'Damages enemies that walk over it',
    type: BuildingType.SPIKE_PIT,
    cost: { [ResourceType.WOOD]: 10, [ResourceType.STONE]: 2 },
    health: 50,
    width: 1,
    height: 1
  },
  {
    id: 'campfire',
    name: 'Campfire',
    description: 'Provides warmth and cooking',
    type: BuildingType.CAMPFIRE,
    cost: { [ResourceType.WOOD]: 5, [ResourceType.STONE]: 3 },
    health: 30,
    width: 1,
    height: 1
  },
  {
    id: 'workbench',
    name: 'Workbench',
    description: 'Required for advanced crafting',
    type: BuildingType.WORKBENCH,
    cost: { [ResourceType.WOOD]: 15, [ResourceType.STONE]: 5 },
    health: 60,
    width: 2,
    height: 1
  },
  {
    id: 'storage',
    name: 'Storage Chest',
    description: 'Increases resource capacity',
    type: BuildingType.STORAGE,
    cost: { [ResourceType.WOOD]: 20 },
    health: 80,
    width: 1,
    height: 1
  },
  {
    id: 'stone_wall',
    name: 'Stone Wall',
    description: 'Strong defensive wall',
    type: BuildingType.STONE_WALL,
    cost: { [ResourceType.STONE]: 10, [ResourceType.WOOD]: 3 },
    unlockDay: 10,
    health: 250,
    width: 1,
    height: 1
  },
  {
    id: 'tower',
    name: 'Archer Tower',
    description: 'Defensive structure with range',
    type: BuildingType.TOWER,
    cost: { [ResourceType.WOOD]: 25, [ResourceType.STONE]: 15 },
    unlockDay: 15,
    health: 200,
    width: 2,
    height: 2
  },
  {
    id: 'forge',
    name: 'Forge',
    description: 'Required for iron and steel weapons',
    type: BuildingType.FORGE,
    cost: { [ResourceType.STONE]: 20, [ResourceType.IRON]: 10 },
    unlockDay: 15,
    health: 150,
    width: 2,
    height: 2
  }
];

// Weapon recipes
export const WEAPON_RECIPES: ItemRecipe[] = [
  {
    id: 'wooden_club',
    name: 'Wooden Club',
    description: 'Basic melee weapon',
    itemType: 'weapon',
    cost: { [ResourceType.WOOD]: 3 },
    damage: 10,
    durability: 50
  },
  {
    id: 'wooden_spear',
    name: 'Wooden Spear',
    description: 'Melee weapon with reach',
    itemType: 'weapon',
    cost: { [ResourceType.WOOD]: 5 },
    damage: 15,
    durability: 40
  },
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    description: 'Reliable iron blade',
    itemType: 'weapon',
    cost: { [ResourceType.IRON]: 5, [ResourceType.WOOD]: 2 },
    unlockDay: 10,
    damage: 25,
    durability: 100
  },
  {
    id: 'iron_shield',
    name: 'Iron Shield',
    description: 'Provides defense bonus',
    itemType: 'shield',
    cost: { [ResourceType.IRON]: 8, [ResourceType.WOOD]: 3 },
    unlockDay: 10,
    defense: 15,
    durability: 120
  }
];

export class CraftingSystem {
  private unlockedRecipes: Set<string>;

  constructor() {
    this.unlockedRecipes = new Set();
    // Unlock basic recipes
    this.unlockBasicRecipes();
  }

  private unlockBasicRecipes(): void {
    // Unlock all recipes without unlock requirements
    [...BUILDING_RECIPES, ...WEAPON_RECIPES].forEach(recipe => {
      if (!recipe.unlockDay) {
        this.unlockedRecipes.add(recipe.id);
      }
    });
  }

  updateUnlocks(currentDay: number): void {
    [...BUILDING_RECIPES, ...WEAPON_RECIPES].forEach(recipe => {
      if (recipe.unlockDay && currentDay >= recipe.unlockDay) {
        this.unlockedRecipes.add(recipe.id);
      }
    });
  }

  isUnlocked(recipeId: string): boolean {
    return this.unlockedRecipes.has(recipeId);
  }

  getAvailableBuildingRecipes(): BuildingRecipe[] {
    return BUILDING_RECIPES.filter(recipe => this.isUnlocked(recipe.id));
  }

  getAvailableWeaponRecipes(): ItemRecipe[] {
    return WEAPON_RECIPES.filter(recipe => this.isUnlocked(recipe.id));
  }

  getBuildingRecipe(id: string): BuildingRecipe | undefined {
    return BUILDING_RECIPES.find(r => r.id === id);
  }

  getWeaponRecipe(id: string): ItemRecipe | undefined {
    return WEAPON_RECIPES.find(r => r.id === id);
  }
}
