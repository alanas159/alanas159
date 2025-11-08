import { ResourceType } from '../config/GameConfig';

export enum WeaponType {
  FISTS = 'fists',
  WOODEN_CLUB = 'wooden_club',
  WOODEN_SPEAR = 'wooden_spear',
  STONE_AXE = 'stone_axe',
  IRON_SWORD = 'iron_sword',
  IRON_AXE = 'iron_axe',
  STEEL_LONGSWORD = 'steel_longsword',
  BATTLE_AXE = 'battle_axe'
}

export enum ItemType {
  WEAPON = 'weapon',
  TOOL = 'tool',
  CONSUMABLE = 'consumable',
  RESOURCE = 'resource',
  BUILDING = 'building'
}

export interface WeaponStats {
  name: string;
  damage: number;
  attackSpeed: number; // Attacks per second
  range: number;
  durability: number;
  description: string;
}

export const WEAPON_STATS: Record<WeaponType, WeaponStats> = {
  [WeaponType.FISTS]: {
    name: 'Fists',
    damage: 5,
    attackSpeed: 1.5,
    range: 30,
    durability: -1, // Infinite
    description: 'Your bare hands'
  },
  [WeaponType.WOODEN_CLUB]: {
    name: 'Wooden Club',
    damage: 12,
    attackSpeed: 1.2,
    range: 35,
    durability: 50,
    description: 'A simple wooden club'
  },
  [WeaponType.WOODEN_SPEAR]: {
    name: 'Wooden Spear',
    damage: 15,
    attackSpeed: 1.0,
    range: 50,
    durability: 40,
    description: 'A spear with extended reach'
  },
  [WeaponType.STONE_AXE]: {
    name: 'Stone Axe',
    damage: 20,
    attackSpeed: 0.9,
    range: 40,
    durability: 80,
    description: 'A crude but effective axe'
  },
  [WeaponType.IRON_SWORD]: {
    name: 'Iron Sword',
    damage: 30,
    attackSpeed: 1.3,
    range: 45,
    durability: 150,
    description: 'A well-balanced iron blade'
  },
  [WeaponType.IRON_AXE]: {
    name: 'Iron Axe',
    damage: 35,
    attackSpeed: 0.8,
    range: 42,
    durability: 140,
    description: 'A heavy iron axe'
  },
  [WeaponType.STEEL_LONGSWORD]: {
    name: 'Steel Longsword',
    damage: 45,
    attackSpeed: 1.2,
    range: 50,
    durability: 250,
    description: 'A masterwork steel blade'
  },
  [WeaponType.BATTLE_AXE]: {
    name: 'Battle Axe',
    damage: 55,
    attackSpeed: 0.7,
    range: 48,
    durability: 220,
    description: 'A devastating two-handed axe'
  }
};

export class Weapon {
  public type: WeaponType;
  public currentDurability: number;
  private stats: WeaponStats;

  constructor(type: WeaponType) {
    this.type = type;
    this.stats = WEAPON_STATS[type];
    this.currentDurability = this.stats.durability;
  }

  getDamage(): number {
    return this.stats.damage;
  }

  getAttackSpeed(): number {
    return this.stats.attackSpeed;
  }

  getRange(): number {
    return this.stats.range;
  }

  getName(): string {
    return this.stats.name;
  }

  getDescription(): string {
    return this.stats.description;
  }

  getDurability(): number {
    return this.currentDurability;
  }

  getMaxDurability(): number {
    return this.stats.durability;
  }

  use(): boolean {
    if (this.stats.durability === -1) return true; // Infinite durability

    this.currentDurability--;
    return this.currentDurability > 0;
  }

  isBroken(): boolean {
    return this.stats.durability !== -1 && this.currentDurability <= 0;
  }

  repair(amount: number): void {
    if (this.stats.durability === -1) return;
    this.currentDurability = Math.min(this.stats.durability, this.currentDurability + amount);
  }
}
