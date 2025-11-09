import { Tile, TerrainType, GameConfig } from '../types';

export class MapGenerator {
  private width: number;
  private height: number;
  private seed: number;

  constructor(config: GameConfig) {
    this.width = config.mapWidth;
    this.height = config.mapHeight;
    this.seed = config.seed || Math.random() * 10000;
  }

  // Simple seeded random number generator
  private random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Perlin-like noise for terrain generation
  private noise(x: number, y: number, scale: number): number {
    const nx = x / scale;
    const ny = y / scale;
    const value = Math.sin(nx * 0.3 + this.seed) * Math.cos(ny * 0.3 + this.seed);
    return (value + 1) / 2; // Normalize to 0-1
  }

  // Generate the entire world map
  generateMap(): Tile[][] {
    const map: Tile[][] = [];

    for (let y = 0; y < this.height; y++) {
      map[y] = [];
      for (let x = 0; x < this.width; x++) {
        map[y][x] = this.generateTile(x, y);
      }
    }

    // Add some variation with features
    this.addForests(map);
    this.addMountains(map);

    return map;
  }

  private generateTile(x: number, y: number): Tile {
    // Use noise to determine base terrain
    const elevation = this.noise(x, y, 20);
    const moisture = this.noise(x + 1000, y + 1000, 15);
    const latitude = Math.abs(y - this.height / 2) / (this.height / 2);

    let terrain: TerrainType;

    // Ocean at low elevation
    if (elevation < 0.35) {
      terrain = 'ocean';
    }
    // Mountains at high elevation
    else if (elevation > 0.75) {
      terrain = 'mountains';
    }
    // Snow/tundra at poles
    else if (latitude > 0.7) {
      terrain = latitude > 0.85 ? 'snow' : 'tundra';
    }
    // Desert in dry areas near equator
    else if (moisture < 0.3 && latitude < 0.3) {
      terrain = 'desert';
    }
    // Hills
    else if (elevation > 0.6) {
      terrain = 'hills';
    }
    // Forest/jungle based on moisture
    else if (moisture > 0.6) {
      terrain = latitude < 0.3 ? 'jungle' : 'forest';
    }
    // Grassland and plains
    else if (moisture > 0.4) {
      terrain = 'grassland';
    }
    else {
      terrain = 'plains';
    }

    // Calculate base resources based on terrain
    const resources = this.getTerrainResources(terrain);

    return {
      x,
      y,
      terrain,
      explored: false,
      visible: false,
      resources
    };
  }

  private getTerrainResources(terrain: TerrainType) {
    switch (terrain) {
      case 'ocean':
        return { food: 1, gold: 1 };
      case 'grassland':
        return { food: 3, production: 1 };
      case 'plains':
        return { food: 2, production: 2 };
      case 'desert':
        return { production: 1 };
      case 'tundra':
        return { food: 1 };
      case 'snow':
        return {};
      case 'forest':
        return { food: 1, production: 3 };
      case 'jungle':
        return { food: 2, production: 2 };
      case 'hills':
        return { production: 3, gold: 1 };
      case 'mountains':
        return { production: 1 };
      default:
        return { food: 1, production: 1 };
    }
  }

  private addForests(map: Tile[][]) {
    // Add additional forest clusters
    for (let i = 0; i < 30; i++) {
      const cx = Math.floor(this.random() * this.width);
      const cy = Math.floor(this.random() * this.height);

      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const x = cx + dx;
          const y = cy + dy;
          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            const tile = map[y][x];
            if (tile.terrain === 'grassland' || tile.terrain === 'plains') {
              if (this.random() > 0.5) {
                tile.terrain = 'forest';
                tile.resources = this.getTerrainResources('forest');
              }
            }
          }
        }
      }
    }
  }

  private addMountains(map: Tile[][]) {
    // Add mountain ranges
    for (let i = 0; i < 15; i++) {
      const cx = Math.floor(this.random() * this.width);
      const cy = Math.floor(this.random() * this.height);
      const length = Math.floor(this.random() * 5) + 3;
      const direction = this.random() > 0.5 ? 'horizontal' : 'vertical';

      for (let j = 0; j < length; j++) {
        const x = direction === 'horizontal' ? cx + j : cx;
        const y = direction === 'vertical' ? cy + j : cy;

        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          const tile = map[y][x];
          if (tile.terrain !== 'ocean') {
            tile.terrain = 'mountains';
            tile.resources = this.getTerrainResources('mountains');
          }
        }
      }
    }
  }

  // Find a suitable starting location (balanced resources, not ocean/mountains)
  findStartingLocation(map: Tile[][], existingLocations: Array<{x: number; y: number}>): {x: number; y: number} {
    let attempts = 0;
    const maxAttempts = 1000;

    while (attempts < maxAttempts) {
      const x = Math.floor(this.random() * this.width);
      const y = Math.floor(this.random() * this.height);
      const tile = map[y][x];

      // Check if location is suitable
      if (tile.terrain !== 'ocean' && tile.terrain !== 'mountains' && tile.terrain !== 'snow') {
        // Check distance from existing locations
        const tooClose = existingLocations.some(loc => {
          const dist = Math.sqrt((loc.x - x) ** 2 + (loc.y - y) ** 2);
          return dist < 15; // Minimum distance between starts
        });

        if (!tooClose) {
          return { x, y };
        }
      }

      attempts++;
    }

    // Fallback: return any non-ocean tile
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (map[y][x].terrain !== 'ocean') {
          return { x, y };
        }
      }
    }

    return { x: 0, y: 0 };
  }
}
