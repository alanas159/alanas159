import Phaser from 'phaser';
import { Building } from '../world/Building';
import { BuildingType } from '../config/GameConfig';
import { Player } from '../entities/Player';

export class BuildingManager {
  private scene: Phaser.Scene;
  private buildings: Phaser.GameObjects.Group;
  private player: Player;
  private placementMode: boolean = false;
  private currentBuildingType?: BuildingType;
  private ghost?: Phaser.GameObjects.Rectangle;
  private gridSize: number = 32;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.buildings = scene.add.group({
      classType: Building,
      runChildUpdate: true
    });
  }

  enterPlacementMode(buildingType: BuildingType): void {
    this.placementMode = true;
    this.currentBuildingType = buildingType;
    this.createGhost();
  }

  exitPlacementMode(): void {
    this.placementMode = false;
    this.currentBuildingType = undefined;
    if (this.ghost) {
      this.ghost.destroy();
      this.ghost = undefined;
    }
  }

  private createGhost(): void {
    if (!this.currentBuildingType) return;

    this.ghost = this.scene.add.rectangle(
      this.player.x,
      this.player.y,
      this.gridSize,
      this.gridSize,
      0xffffff,
      0.5
    );
    this.ghost.setDepth(100);
  }

  update(pointer: Phaser.Input.Pointer, zombies: Phaser.GameObjects.Group): void {
    // Update existing buildings
    this.buildings.children.each((building) => {
      if (building instanceof Building) {
        building.update(0, this.scene.game.loop.delta, zombies);
      }
      return true;
    });

    // Handle placement mode
    if (this.placementMode && this.ghost) {
      // Snap ghost to grid based on camera world position
      const worldX = pointer.worldX;
      const worldY = pointer.worldY;
      const snappedX = Math.floor(worldX / this.gridSize) * this.gridSize + this.gridSize / 2;
      const snappedY = Math.floor(worldY / this.gridSize) * this.gridSize + this.gridSize / 2;

      this.ghost.setPosition(snappedX, snappedY);

      // Check if placement is valid
      const isValid = this.isValidPlacement(snappedX, snappedY);
      this.ghost.setFillStyle(isValid ? 0x00ff00 : 0xff0000, 0.5);
    }
  }

  tryPlaceBuilding(pointer: Phaser.Input.Pointer): boolean {
    if (!this.placementMode || !this.currentBuildingType || !this.ghost) {
      return false;
    }

    const worldX = pointer.worldX;
    const worldY = pointer.worldY;
    const snappedX = Math.floor(worldX / this.gridSize) * this.gridSize + this.gridSize / 2;
    const snappedY = Math.floor(worldY / this.gridSize) * this.gridSize + this.gridSize / 2;

    if (!this.isValidPlacement(snappedX, snappedY)) {
      return false;
    }

    // Place the building
    const building = new Building(this.scene, snappedX, snappedY, this.currentBuildingType);
    this.buildings.add(building);

    this.scene.events.emit('buildingPlaced', this.currentBuildingType);
    this.exitPlacementMode();

    return true;
  }

  private isValidPlacement(x: number, y: number): boolean {
    // Check distance from player
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      x,
      y
    );

    if (distance > 150) {
      return false; // Too far from player
    }

    // Check for overlapping buildings
    let hasOverlap = false;
    this.buildings.children.each((building) => {
      if (building instanceof Building) {
        const buildingDistance = Phaser.Math.Distance.Between(
          building.x,
          building.y,
          x,
          y
        );

        if (buildingDistance < this.gridSize) {
          hasOverlap = true;
        }
      }
      return !hasOverlap;
    });

    return !hasOverlap;
  }

  isInPlacementMode(): boolean {
    return this.placementMode;
  }

  getBuildings(): Phaser.GameObjects.Group {
    return this.buildings;
  }

  getBuildingCount(): number {
    return this.buildings.getLength();
  }
}
