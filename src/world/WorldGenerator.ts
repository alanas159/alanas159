import Phaser from 'phaser';
import { TILE_SIZE } from '../config/GameConfig';
import { WorldObject, WorldObjectType } from './WorldObject';

export class WorldGenerator {
  private scene: Phaser.Scene;
  private generatedChunks: Set<string>;
  private chunkSize: number = 16; // 16x16 tiles per chunk
  private worldObjects: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene, worldObjects: Phaser.GameObjects.Group) {
    this.scene = scene;
    this.worldObjects = worldObjects;
    this.generatedChunks = new Set();
  }

  generateAroundPoint(worldX: number, worldY: number): void {
    const chunkX = Math.floor(worldX / (this.chunkSize * TILE_SIZE));
    const chunkY = Math.floor(worldY / (this.chunkSize * TILE_SIZE));

    // Generate chunks in a 3x3 grid around the player
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cx = chunkX + dx;
        const cy = chunkY + dy;
        const chunkKey = `${cx},${cy}`;

        if (!this.generatedChunks.has(chunkKey)) {
          this.generateChunk(cx, cy);
          this.generatedChunks.add(chunkKey);
        }
      }
    }
  }

  private generateChunk(chunkX: number, chunkY: number): void {
    const startX = chunkX * this.chunkSize;
    const startY = chunkY * this.chunkSize;

    // Generate terrain
    for (let y = 0; y < this.chunkSize; y++) {
      for (let x = 0; x < this.chunkSize; x++) {
        const tileX = (startX + x) * TILE_SIZE;
        const tileY = (startY + y) * TILE_SIZE;

        // Use pseudo-random based on world position for consistent generation
        const noise = this.simpleNoise(startX + x, startY + y);
        const texture = noise > 0.4 ? 'grass' : 'dirt';

        const tile = this.scene.add.image(tileX, tileY, texture);
        tile.setOrigin(0, 0);
        tile.setDepth(0);
      }
    }

    // Spawn world objects in this chunk
    this.spawnObjectsInChunk(chunkX, chunkY);
  }

  private spawnObjectsInChunk(chunkX: number, chunkY: number): void {
    const baseX = chunkX * this.chunkSize * TILE_SIZE;
    const baseY = chunkY * this.chunkSize * TILE_SIZE;
    const chunkWidth = this.chunkSize * TILE_SIZE;

    // Deterministic random based on chunk position
    const seed = chunkX * 73856093 ^ chunkY * 19349663;
    const random = this.seededRandom(seed);

    // Trees
    const treeCount = Math.floor(random() * 5) + 2;
    for (let i = 0; i < treeCount; i++) {
      const x = baseX + random() * chunkWidth;
      const y = baseY + random() * chunkWidth;
      const obj = new WorldObject(this.scene, x, y, WorldObjectType.TREE);
      this.worldObjects.add(obj);
      this.scene.physics.add.existing(obj, true);
    }

    // Rocks
    const rockCount = Math.floor(random() * 3) + 1;
    for (let i = 0; i < rockCount; i++) {
      const x = baseX + random() * chunkWidth;
      const y = baseY + random() * chunkWidth;
      const obj = new WorldObject(this.scene, x, y, WorldObjectType.ROCK);
      this.worldObjects.add(obj);
      this.scene.physics.add.existing(obj, true);
    }

    // Iron (rarer)
    if (random() > 0.6) {
      const x = baseX + random() * chunkWidth;
      const y = baseY + random() * chunkWidth;
      const obj = new WorldObject(this.scene, x, y, WorldObjectType.IRON_DEPOSIT);
      this.worldObjects.add(obj);
      this.scene.physics.add.existing(obj, true);
    }

    // Berry bushes
    if (random() > 0.5) {
      const x = baseX + random() * chunkWidth;
      const y = baseY + random() * chunkWidth;
      const obj = new WorldObject(this.scene, x, y, WorldObjectType.BERRY_BUSH);
      this.worldObjects.add(obj);
      this.scene.physics.add.existing(obj, true);
    }

    // Water source (rare)
    if (random() > 0.8) {
      const x = baseX + random() * chunkWidth;
      const y = baseY + random() * chunkWidth;
      const obj = new WorldObject(this.scene, x, y, WorldObjectType.WATER_SOURCE);
      this.worldObjects.add(obj);
      this.scene.physics.add.existing(obj, true);
    }
  }

  private simpleNoise(x: number, y: number): number {
    // Simple pseudo-random noise function
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
    return n - Math.floor(n);
  }

  private seededRandom(seed: number): () => number {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  getGeneratedChunksCount(): number {
    return this.generatedChunks.size;
  }
}
