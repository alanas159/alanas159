import { Weapon, WeaponType } from './Weapon';
import { ResourceType } from '../config/GameConfig';

export interface InventoryItem {
  id: string;
  type: 'weapon' | 'resource' | 'consumable';
  data: any;
  count?: number;
}

export class Inventory {
  private items: Map<string, InventoryItem>;
  private maxSlots: number = 20;
  private equippedWeapon: Weapon;

  constructor() {
    this.items = new Map();
    this.equippedWeapon = new Weapon(WeaponType.FISTS);
  }

  addItem(item: InventoryItem): boolean {
    if (this.items.size >= this.maxSlots && !this.items.has(item.id)) {
      return false; // Inventory full
    }

    const existing = this.items.get(item.id);
    if (existing && existing.type === 'resource') {
      existing.count = (existing.count || 1) + (item.count || 1);
    } else {
      this.items.set(item.id, item);
    }

    return true;
  }

  removeItem(itemId: string, count: number = 1): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    if (item.count && item.count > count) {
      item.count -= count;
      return true;
    } else {
      this.items.delete(itemId);
      return true;
    }
  }

  hasItem(itemId: string, count: number = 1): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;
    if (item.count) {
      return item.count >= count;
    }
    return true;
  }

  getItem(itemId: string): InventoryItem | undefined {
    return this.items.get(itemId);
  }

  getAllItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }

  equipWeapon(weapon: Weapon): void {
    this.equippedWeapon = weapon;
  }

  getEquippedWeapon(): Weapon {
    return this.equippedWeapon;
  }

  addWeapon(weapon: Weapon): boolean {
    return this.addItem({
      id: `weapon_${weapon.type}_${Date.now()}`,
      type: 'weapon',
      data: weapon
    });
  }

  addResource(resourceType: ResourceType, amount: number): boolean {
    return this.addItem({
      id: resourceType,
      type: 'resource',
      data: resourceType,
      count: amount
    });
  }

  getResourceCount(resourceType: ResourceType): number {
    const item = this.items.get(resourceType);
    return item?.count || 0;
  }

  getSlotCount(): number {
    return this.items.size;
  }

  getMaxSlots(): number {
    return this.maxSlots;
  }

  increaseMaxSlots(amount: number): void {
    this.maxSlots += amount;
  }
}
