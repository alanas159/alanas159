import { Tile, TerrainType, GameConfig, StrategicResourceType } from '../types';

export class MapGenerator {
  private width: number;
  private height: number;
  private seed: number;

  constructor(config: GameConfig) {
    this.width = config.mapWidth;
    this.height = config.mapHeight;
    this.seed = config.seed || Math.random() * 10000;
  }

  // Seeded random number generator
  private random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Improved Perlin-like noise for terrain generation
  private noise(x: number, y: number, scale: number, octaves: number = 3): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      const nx = (x / scale) * frequency;
      const ny = (y / scale) * frequency;
      value += amplitude * (Math.sin(nx * 0.3 + this.seed) * Math.cos(ny * 0.3 + this.seed) + 1) / 2;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return value / maxValue;
  }

  // Generate the entire world map
  generateMap(): Tile[][] {
    const map: Tile[][] = [];

    // Generate base terrain
    for (let y = 0; y < this.height; y++) {
      map[y] = [];
      for (let x = 0; x < this.width; x++) {
        map[y][x] = this.generateTile(x, y);
      }
    }

    // Add natural features
    this.addContinents(map);
    this.addRivers(map);
    this.addForests(map);
    this.addMountainRanges(map);
    this.addStrategicResources(map);

    return map;
  }

  private generateTile(x: number, y: number): Tile {
    // Multi-octave noise for more varied terrain
    const elevation = this.noise(x, y, 25, 4);
    const moisture = this.noise(x + 1000, y + 1000, 20, 3);
    const temperature = this.noise(x + 2000, y + 2000, 30, 2);
    const latitude = Math.abs(y - this.height / 2) / (this.height / 2);

    let terrain: TerrainType = this.determineTerrainType(elevation, moisture, temperature, latitude);

    // Calculate base resources
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

  private determineTerrainType(
    elevation: number,
    moisture: number,
    temperature: number,
    latitude: number
  ): TerrainType {
    // Deep ocean
    if (elevation < 0.3) {
      return 'ocean';
    }

    // Mountains at high elevation
    if (elevation > 0.8) {
      return 'mountains';
    }

    // Polar regions
    if (latitude > 0.75) {
      return latitude > 0.88 ? 'snow' : 'tundra';
    }

    // Hills at moderate-high elevation
    if (elevation > 0.65) {
      return 'hills';
    }

    // Temperature-based biomes
    const coldRegion = latitude > 0.6 || temperature < 0.3;
    const hotRegion = latitude < 0.25 && temperature > 0.6;

    // Jungle in hot, wet areas
    if (hotRegion && moisture > 0.65) {
      return 'jungle';
    }

    // Forest in temperate, wet areas
    if (!hotRegion && !coldRegion && moisture > 0.55) {
      return 'forest';
    }

    // Desert in hot, dry areas
    if (hotRegion && moisture < 0.35) {
      return 'desert';
    }

    // Grassland vs plains based on moisture
    if (moisture > 0.45) {
      return 'grassland';
    } else {
      return 'plains';
    }
  }

  private getTerrainResources(terrain: TerrainType) {
    const resourceMap: Record<TerrainType, Partial<Record<'food' | 'production' | 'gold' | 'science' | 'culture', number>>> = {
      ocean: { food: 2, gold: 1 },
      grassland: { food: 3, production: 1 },
      plains: { food: 2, production: 2 },
      desert: { production: 1, gold: 1 },
      tundra: { food: 1, production: 1 },
      snow: {},
      forest: { food: 1, production: 3, science: 1 },
      jungle: { food: 2, production: 2, science: 1 },
      hills: { production: 4, gold: 1 },
      mountains: { production: 1, science: 1 }
    };
    return resourceMap[terrain] || {};
  }

  private addContinents(map: Tile[][]) {
    // Create 3-5 major landmasses
    const numContinents = 3 + Math.floor(this.random() * 3);

    for (let i = 0; i < numContinents; i++) {
      const centerX = Math.floor(this.random() * this.width);
      const centerY = Math.floor(this.random() * this.height);
      const size = 15 + Math.floor(this.random() * 15);

      for (let dy = -size; dy <= size; dy++) {
        for (let dx = -size; dx <= size; dx++) {
          const x = centerX + dx;
          const y = centerY + dy;

          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= size && this.random() > (dist / size) * 0.7) {
              const tile = map[y][x];
              if (tile.terrain === 'ocean') {
                // Convert to land
                if (this.random() > 0.7) {
                  tile.terrain = 'plains';
                } else {
                  tile.terrain = 'grassland';
                }
                tile.resources = this.getTerrainResources(tile.terrain);
              }
            }
          }
        }
      }
    }
  }

  private addRivers(map: Tile[][]) {
    // Generate 8-12 major rivers
    const numRivers = 8 + Math.floor(this.random() * 5);

    for (let i = 0; i < numRivers; i++) {
      // Start from mountains or hills
      let startX = Math.floor(this.random() * this.width);
      let startY = Math.floor(this.random() * this.height);

      // Find a mountain/hill tile
      for (let attempts = 0; attempts < 100; attempts++) {
        const tile = map[startY][startX];
        if (tile.terrain === 'mountains' || tile.terrain === 'hills') {
          break;
        }
        startX = Math.floor(this.random() * this.width);
        startY = Math.floor(this.random() * this.height);
      }

      // Flow river downhill towards ocean
      this.flowRiver(map, startX, startY);
    }
  }

  private flowRiver(map: Tile[][], x: number, y: number) {
    const visited = new Set<string>();
    let currentX = x;
    let currentY = y;
    let length = 0;
    const maxLength = 30 + Math.floor(this.random() * 20);

    while (length < maxLength) {
      const key = `${currentX},${currentY}`;
      if (visited.has(key)) break;
      visited.add(key);

      const tile = map[currentY]?.[currentX];
      if (!tile) break;

      // Rivers add +1 food
      tile.hasRiver = true;
      if (tile.resources.food) {
        tile.resources.food += 1;
      } else {
        tile.resources.food = 1;
      }

      // End if we reach ocean
      if (tile.terrain === 'ocean') break;

      // Find lowest neighbor
      let lowestX = currentX;
      let lowestY = currentY;
      let lowestElevation = this.getElevation(tile.terrain);

      const neighbors = [
        [0, -1], [1, -1], [1, 0], [1, 1],
        [0, 1], [-1, 1], [-1, 0], [-1, -1]
      ];

      for (const [dx, dy] of neighbors) {
        const nx = currentX + dx;
        const ny = currentY + dy;

        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          const neighbor = map[ny][nx];
          const elevation = this.getElevation(neighbor.terrain);

          if (elevation < lowestElevation || (elevation === lowestElevation && this.random() > 0.5)) {
            lowestX = nx;
            lowestY = ny;
            lowestElevation = elevation;
          }
        }
      }

      // If no lower neighbor, stop
      if (lowestX === currentX && lowestY === currentY) break;

      currentX = lowestX;
      currentY = lowestY;
      length++;
    }
  }

  private getElevation(terrain: TerrainType): number {
    const elevations: Record<TerrainType, number> = {
      ocean: 0,
      grassland: 1,
      plains: 1,
      desert: 1,
      forest: 2,
      jungle: 2,
      tundra: 1,
      snow: 1,
      hills: 3,
      mountains: 4
    };
    return elevations[terrain] || 1;
  }

  private addForests(map: Tile[][]) {
    // Add forest clusters
    for (let i = 0; i < 40; i++) {
      const cx = Math.floor(this.random() * this.width);
      const cy = Math.floor(this.random() * this.height);

      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const x = cx + dx;
          const y = cy + dy;

          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            const tile = map[y][x];
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= 3 && (tile.terrain === 'grassland' || tile.terrain === 'plains')) {
              if (this.random() > (dist / 3) * 0.6) {
                tile.terrain = 'forest';
                tile.resources = this.getTerrainResources('forest');
              }
            }
          }
        }
      }
    }
  }

  private addMountainRanges(map: Tile[][]) {
    // Add mountain ranges
    for (let i = 0; i < 20; i++) {
      const cx = Math.floor(this.random() * this.width);
      const cy = Math.floor(this.random() * this.height);
      const length = Math.floor(this.random() * 8) + 5;
      const direction = Math.floor(this.random() * 4); // 0=N, 1=E, 2=S, 3=W

      for (let j = 0; j < length; j++) {
        let x = cx;
        let y = cy;

        if (direction === 0) y -= j;
        else if (direction === 1) x += j;
        else if (direction === 2) y += j;
        else x -= j;

        // Add some randomness to create natural-looking ranges
        x += Math.floor(this.random() * 3) - 1;
        y += Math.floor(this.random() * 3) - 1;

        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          const tile = map[y][x];
          if (tile.terrain !== 'ocean' && this.random() > 0.3) {
            tile.terrain = this.random() > 0.7 ? 'mountains' : 'hills';
            tile.resources = this.getTerrainResources(tile.terrain);
          }
        }
      }
    }
  }

  private addStrategicResources(map: Tile[][]) {
    // Add strategic resources to specific terrains
    const resourcePlacements: Array<{resource: StrategicResourceType; terrain: TerrainType[]; count: number}> = [
      { resource: 'iron', terrain: ['hills', 'mountains'], count: 20 },
      { resource: 'horses', terrain: ['plains', 'grassland'], count: 15 },
      { resource: 'wheat', terrain: ['grassland', 'plains'], count: 25 },
      { resource: 'fish', terrain: ['ocean'], count: 30 },
      { resource: 'stone', terrain: ['hills', 'mountains'], count: 18 },
      { resource: 'luxury', terrain: ['jungle', 'forest', 'desert'], count: 12 }
    ];

    for (const placement of resourcePlacements) {
      let placed = 0;
      let attempts = 0;

      while (placed < placement.count && attempts < placement.count * 10) {
        const x = Math.floor(this.random() * this.width);
        const y = Math.floor(this.random() * this.height);
        const tile = map[y][x];

        if (placement.terrain.includes(tile.terrain) && !tile.strategicResource) {
          tile.strategicResource = placement.resource;

          // Bonus resources based on type
          if (placement.resource === 'wheat') tile.resources.food = (tile.resources.food || 0) + 2;
          else if (placement.resource === 'iron') tile.resources.production = (tile.resources.production || 0) + 1;
          else if (placement.resource === 'horses') tile.resources.production = (tile.resources.production || 0) + 1;
          else if (placement.resource === 'luxury') tile.resources.gold = (tile.resources.gold || 0) + 3;

          placed++;
        }
        attempts++;
      }
    }
  }

  // Find a suitable starting location
  findStartingLocation(map: Tile[][], existingLocations: Array<{x: number; y: number}>): {x: number; y: number} {
    let attempts = 0;
    const maxAttempts = 2000;
    let bestScore = -Infinity;
    let bestLocation = { x: 0, y: 0 };

    while (attempts < maxAttempts) {
      const x = Math.floor(this.random() * this.width);
      const y = Math.floor(this.random() * this.height);
      const tile = map[y][x];

      // Must be habitable terrain
      if (tile.terrain === 'ocean' || tile.terrain === 'mountains' || tile.terrain === 'snow') {
        attempts++;
        continue;
      }

      // Check distance from existing locations
      const tooClose = existingLocations.some(loc => {
        const dist = Math.sqrt((loc.x - x) ** 2 + (loc.y - y) ** 2);
        return dist < 18; // Minimum distance between starts
      });

      if (tooClose) {
        attempts++;
        continue;
      }

      // Score the location based on nearby resources
      const score = this.scoreStartingLocation(map, x, y);

      if (score > bestScore) {
        bestScore = score;
        bestLocation = { x, y };
      }

      attempts++;
    }

    return bestLocation;
  }

  private scoreStartingLocation(map: Tile[][], x: number, y: number): number {
    let score = 0;

    // Check 2-tile radius for resources
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          const tile = map[ny][nx];

          // Prefer balanced resources
          score += (tile.resources.food || 0) * 2;
          score += (tile.resources.production || 0) * 1.5;
          score += (tile.resources.gold || 0);

          // Bonus for rivers
          if (tile.hasRiver) score += 5;

          // Bonus for strategic resources
          if (tile.strategicResource) score += 8;

          // Penalty for unusable terrain
          if (tile.terrain === 'ocean' || tile.terrain === 'mountains') score -= 2;
        }
      }
    }

    return score;
  }
}
