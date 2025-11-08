import Phaser from 'phaser';

export enum NPCRole {
  FARMER = 'farmer',
  GUARD = 'guard',
  BLACKSMITH = 'blacksmith',
  HEALER = 'healer'
}

export interface NPCStats {
  name: string;
  role: NPCRole;
  productivity: number; // Resources per minute
  color: number;
}

export const NPC_STATS: Record<NPCRole, Omit<NPCStats, 'name'>> = {
  [NPCRole.FARMER]: {
    role: NPCRole.FARMER,
    productivity: 2, // 2 food per minute
    color: 0x90ee90
  },
  [NPCRole.GUARD]: {
    role: NPCRole.GUARD,
    productivity: 0, // No resource production, provides defense
    color: 0x4169e1
  },
  [NPCRole.BLACKSMITH]: {
    role: NPCRole.BLACKSMITH,
    productivity: 1, // Repairs weapons/buildings
    color: 0x8b4513
  },
  [NPCRole.HEALER]: {
    role: NPCRole.HEALER,
    productivity: 0, // Heals player over time
    color: 0xffd700
  }
};

export class NPCSurvivor extends Phaser.Physics.Arcade.Sprite {
  private npcRole: NPCRole;
  private npcName: string;
  private productivity: number;
  private productionTimer: number = 0;
  private isAssigned: boolean = false;
  private assignedBuilding?: Phaser.GameObjects.GameObject;

  constructor(scene: Phaser.Scene, x: number, y: number, name: string, role: NPCRole) {
    super(scene, x, y, 'player'); // Reuse player sprite for now

    this.npcName = name;
    this.npcRole = role;
    const stats = NPC_STATS[role];
    this.productivity = stats.productivity;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setTint(stats.color);
    this.setDepth(8);
    this.setScale(0.8);

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setSize(24, 24);
    }
  }

  update(time: number, delta: number): void {
    if (!this.isAssigned) return;

    this.productionTimer += delta;

    // Produce resources every minute
    if (this.productionTimer >= 60000) {
      this.productionTimer = 0;
      this.produce();
    }
  }

  private produce(): void {
    if (this.productivity > 0) {
      this.scene.events.emit('npcProduced', this.npcRole, this.productivity);
    }
  }

  assignToBuilding(building: Phaser.GameObjects.GameObject): void {
    this.isAssigned = true;
    this.assignedBuilding = building;
  }

  unassign(): void {
    this.isAssigned = false;
    this.assignedBuilding = undefined;
  }

  getName(): string {
    return this.npcName;
  }

  getRole(): NPCRole {
    return this.npcRole;
  }

  getIsAssigned(): boolean {
    return this.isAssigned;
  }
}
