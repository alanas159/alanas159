import { GameState, Tile, TerrainType, Unit, City } from '../types';
import { Pathfinding } from './Pathfinding';
import { CombatSystem } from './CombatSystem';

interface UnitAnimation {
  unitId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTime: number;
  duration: number;
  type: 'move' | 'attack';
}

interface DamageNumber {
  x: number;
  y: number;
  damage: number;
  startTime: number;
  duration: number;
  color: string;
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tileSize: number = 32;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private showMovementRange: boolean = true; // Toggle for movement range display
  private activeAnimations: UnitAnimation[] = [];
  private attackFlashes: Map<string, number> = new Map(); // unitId -> timestamp
  private damageNumbers: DamageNumber[] = [];
  private cityFoundingMode: boolean = false;
  private cityFoundingPreview: {x: number; y: number; valid: boolean} | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.setupCanvas();
    this.setupControls();
  }

  private setupCanvas() {
    this.canvas.width = this.canvas.parentElement!.clientWidth;
    this.canvas.height = this.canvas.parentElement!.clientHeight;
  }

  private setupControls() {
    // Mouse wheel zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      this.tileSize *= zoomFactor;
      this.tileSize = Math.max(16, Math.min(64, this.tileSize));
    });

    // Mouse drag to pan
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.offsetX += dx;
        this.offsetY += dy;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
    });
  }

  render(state: GameState) {
    // Clear canvas
    this.ctx.fillStyle = '#0a0e14';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render map
    this.renderMap(state);

    // Render movement range for selected unit
    if (state.selectedUnit && this.showMovementRange && !this.cityFoundingMode) {
      this.renderMovementRange(state.selectedUnit, state);
    }

    // Render attack range for selected unit
    if (state.selectedUnit && this.showMovementRange && !this.cityFoundingMode && !state.selectedUnit.hasActed) {
      this.renderAttackRange(state.selectedUnit, state);
    }

    // Render city founding preview
    if (this.cityFoundingMode && this.cityFoundingPreview) {
      this.renderCityFoundingPreview(this.cityFoundingPreview, state);
    }

    // Render cities
    this.renderCities(state);

    // Render units
    this.renderUnits(state);

    // Render selection
    if (state.selectedTile) {
      this.renderSelection(state.selectedTile.x, state.selectedTile.y);
    }

    // Render damage numbers (on top of everything)
    this.renderDamageNumbers();
  }

  private renderMap(state: GameState) {
    const startX = Math.max(0, Math.floor(-this.offsetX / this.tileSize));
    const startY = Math.max(0, Math.floor(-this.offsetY / this.tileSize));
    const endX = Math.min(state.config.mapWidth, startX + Math.ceil(this.canvas.width / this.tileSize) + 1);
    const endY = Math.min(state.config.mapHeight, startY + Math.ceil(this.canvas.height / this.tileSize) + 1);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = state.map[y][x];
        this.renderTile(tile, x, y);
      }
    }
  }

  private renderTile(tile: Tile, x: number, y: number) {
    const screenX = x * this.tileSize + this.offsetX;
    const screenY = y * this.tileSize + this.offsetY;

    // Don't render if unexplored
    if (!tile.explored) {
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
      return;
    }

    // Get terrain colors
    const primaryColor = this.getTerrainColor(tile.terrain);
    const secondaryColor = this.getTerrainSecondaryColor(tile.terrain);

    // Create gradient for depth effect
    const gradient = this.ctx.createLinearGradient(
      screenX,
      screenY,
      screenX + this.tileSize,
      screenY + this.tileSize
    );
    gradient.addColorStop(0, primaryColor);
    gradient.addColorStop(0.5, primaryColor);
    gradient.addColorStop(1, secondaryColor);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

    // Add subtle texture pattern for certain terrains
    if (this.tileSize >= 24) {
      this.addTerrainTexture(tile.terrain, screenX, screenY);
    }

    // Draw river overlay (more realistic)
    if (tile.hasRiver) {
      // Subtle blue gradient for river
      const riverGradient = this.ctx.createLinearGradient(
        screenX,
        screenY,
        screenX + this.tileSize,
        screenY + this.tileSize
      );
      riverGradient.addColorStop(0, 'rgba(74, 158, 255, 0.25)');
      riverGradient.addColorStop(0.5, 'rgba(100, 180, 255, 0.35)');
      riverGradient.addColorStop(1, 'rgba(74, 158, 255, 0.25)');
      this.ctx.fillStyle = riverGradient;
      this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

      // River flow line (more organic)
      if (this.tileSize >= 24) {
        this.ctx.strokeStyle = 'rgba(74, 158, 255, 0.7)';
        this.ctx.lineWidth = Math.max(2, this.tileSize / 16);
        this.ctx.beginPath();
        this.ctx.moveTo(screenX + 2, screenY + this.tileSize / 2);
        this.ctx.quadraticCurveTo(
          screenX + this.tileSize / 2, screenY + this.tileSize / 2 + 3,
          screenX + this.tileSize - 2, screenY + this.tileSize / 2
        );
        this.ctx.stroke();
      }
    }

    // Draw strategic resource indicator
    if (tile.strategicResource && this.tileSize >= 20) {
      const resourceIcons: Record<string, string> = {
        iron: '⚒',
        horses: '🐴',
        wheat: '🌾',
        fish: '🐟',
        stone: '🪨',
        luxury: '💎'
      };

      const icon = resourceIcons[tile.strategicResource] || '●';
      this.ctx.fillStyle = '#ffd700';
      this.ctx.font = `${Math.floor(this.tileSize * 0.4)}px Arial`;
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(icon, screenX + this.tileSize - 2, screenY + 2);
    }

    // Fog of war overlay if not currently visible
    if (!tile.visible) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
    }

    // Draw subtle tile border
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    this.ctx.lineWidth = 0.5;
    this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);

    // Draw territory border (more prominent)
    if (tile.ownerId) {
      this.ctx.strokeStyle = 'rgba(212, 175, 55, 0.8)';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([]);
      this.ctx.strokeRect(screenX + 1, screenY + 1, this.tileSize - 2, this.tileSize - 2);
    }
  }

  private getTerrainColor(terrain: TerrainType): string {
    // Enhanced, more realistic colors
    const colors: Record<TerrainType, string> = {
      ocean: '#2c5f8d',        // Deeper, richer blue
      plains: '#c4b454',       // Warmer golden plains
      grassland: '#5a9367',    // Vibrant green
      desert: '#e6c990',       // Sandy beige
      tundra: '#c8d5dd',       // Pale blue-gray
      snow: '#f0f5f8',         // Bright white-blue
      forest: '#3d6b2e',       // Deep forest green
      jungle: '#2a4d28',       // Rich dark green
      hills: '#9c8468',        // Earthy brown
      mountains: '#7a7a7a'     // Rocky gray
    };
    return colors[terrain];
  }

  private getTerrainSecondaryColor(terrain: TerrainType): string {
    // Slightly different shade for texture effect
    const colors: Record<TerrainType, string> = {
      ocean: '#1e4a6f',
      plains: '#b8a84d',
      grassland: '#4e7f58',
      desert: '#d4b87d',
      tundra: '#b4c3cc',
      snow: '#e0ecf0',
      forest: '#2f5823',
      jungle: '#1f3b1f',
      hills: '#887456',
      mountains: '#656565'
    };
    return colors[terrain];
  }

  private addTerrainTexture(terrain: TerrainType, screenX: number, screenY: number) {
    const size = this.tileSize;

    switch (terrain) {
      case 'ocean':
        // Animated wave lines with depth (time-based)
        const time = Date.now() / 1000;
        const waveOffset = Math.sin(time * 2 + screenX * 0.01) * 3;

        // Multiple wave layers for depth
        for (let i = 0; i < 3; i++) {
          const alpha = 0.1 + (i * 0.05);
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          this.ctx.lineWidth = 1.5;

          this.ctx.beginPath();
          this.ctx.moveTo(screenX, screenY + (i + 1) * (size / 4) + waveOffset);
          this.ctx.quadraticCurveTo(
            screenX + size / 2, screenY + (i + 1) * (size / 4) + 2 + waveOffset,
            screenX + size, screenY + (i + 1) * (size / 4) + waveOffset
          );
          this.ctx.stroke();
        }

        // Add foam sparkles (subtle white dots)
        if (Math.random() < 0.1) {
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          const sparkleX = screenX + Math.random() * size;
          const sparkleY = screenY + Math.random() * size;
          this.ctx.fillRect(sparkleX, sparkleY, 2, 2);
        }
        break;

      case 'forest':
      case 'jungle':
        // Tree silhouettes with variety
        this.ctx.fillStyle = terrain === 'jungle' ? 'rgba(0, 50, 0, 0.3)' : 'rgba(0, 0, 0, 0.25)';
        for (let i = 0; i < 4; i++) {
          const x = screenX + ((i % 2) + 0.5) * (size / 2);
          const y = screenY + (Math.floor(i / 2) + 0.5) * (size / 2);
          const treeSize = size * 0.15;

          // Tree crown (circle)
          this.ctx.beginPath();
          this.ctx.arc(x, y - treeSize / 2, treeSize, 0, Math.PI * 2);
          this.ctx.fill();

          // Tree trunk (small rect)
          this.ctx.fillRect(x - treeSize / 6, y, treeSize / 3, treeSize / 2);
        }
        break;

      case 'desert':
        // Sand dunes with shadows
        this.ctx.strokeStyle = 'rgba(139, 90, 43, 0.15)';
        this.ctx.lineWidth = 1.5;
        for (let i = 0; i < 2; i++) {
          this.ctx.beginPath();
          this.ctx.arc(screenX + size / 2, screenY + (i + 0.5) * (size / 2), size / 3, 0, Math.PI);
          this.ctx.stroke();
        }
        // Add sand dots
        this.ctx.fillStyle = 'rgba(210, 180, 140, 0.3)';
        for (let i = 0; i < 5; i++) {
          const x = screenX + Math.random() * size;
          const y = screenY + Math.random() * size;
          this.ctx.fillRect(x, y, 1.5, 1.5);
        }
        break;

      case 'mountains':
        // Multiple mountain peaks
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        // Left peak
        this.ctx.beginPath();
        this.ctx.moveTo(screenX + size * 0.3, screenY + size * 0.3);
        this.ctx.lineTo(screenX + size * 0.15, screenY + size * 0.75);
        this.ctx.lineTo(screenX + size * 0.45, screenY + size * 0.75);
        this.ctx.closePath();
        this.ctx.fill();

        // Right peak (higher)
        this.ctx.beginPath();
        this.ctx.moveTo(screenX + size * 0.65, screenY + size * 0.2);
        this.ctx.lineTo(screenX + size * 0.45, screenY + size * 0.75);
        this.ctx.lineTo(screenX + size * 0.85, screenY + size * 0.75);
        this.ctx.closePath();
        this.ctx.fill();
        break;

      case 'hills':
        // Rolling hills
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        this.ctx.beginPath();
        this.ctx.arc(screenX + size * 0.3, screenY + size * 0.7, size * 0.25, Math.PI, 0);
        this.ctx.arc(screenX + size * 0.7, screenY + size * 0.7, size * 0.25, Math.PI, 0);
        this.ctx.fill();
        break;

      case 'grassland':
      case 'plains':
        // Grass tufts
        this.ctx.strokeStyle = terrain === 'grassland' ? 'rgba(0, 100, 0, 0.2)' : 'rgba(139, 119, 0, 0.15)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          const x = screenX + Math.random() * size;
          const y = screenY + Math.random() * size;
          this.ctx.beginPath();
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(x, y - size * 0.1);
          this.ctx.stroke();
        }
        break;

      case 'snow':
        // Snowflakes with variety
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 6; i++) {
          const x = screenX + Math.random() * size;
          const y = screenY + Math.random() * size;
          const flakeSize = Math.random() * 2 + 1;
          this.ctx.fillRect(x, y, flakeSize, flakeSize);
        }
        break;

      case 'tundra':
        // Frozen ground cracks
        this.ctx.strokeStyle = 'rgba(150, 170, 180, 0.3)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const startX = screenX + Math.random() * size;
          const startY = screenY + Math.random() * size;
          this.ctx.beginPath();
          this.ctx.moveTo(startX, startY);
          this.ctx.lineTo(startX + size * 0.2, startY + Math.random() * size * 0.2);
          this.ctx.stroke();
        }
        break;
    }
  }

  private renderCities(state: GameState) {
    state.players.forEach(player => {
      player.cities.forEach(city => {
        this.renderCity(city, player.civilizationId);
      });
    });
  }

  private renderCity(city: City, civId: string) {
    const screenX = city.x * this.tileSize + this.offsetX;
    const screenY = city.y * this.tileSize + this.offsetY;
    const centerX = screenX + this.tileSize / 2;
    const centerY = screenY + this.tileSize / 2;

    // City base size scales with population
    const popFactor = Math.min(city.population / 20, 1.5); // Max 1.5x size
    const citySize = this.tileSize * (0.6 + popFactor * 0.2);

    // Add shadow for depth
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetX = 3;
    this.ctx.shadowOffsetY = 3;

    if (city.isCapital) {
      // Capital: Elaborate design with central tower and walls
      // Outer walls (stone)
      this.ctx.fillStyle = '#8b7355';
      this.ctx.fillRect(
        centerX - citySize / 2 - 3,
        centerY - citySize / 2 - 3,
        citySize + 6,
        citySize + 6
      );

      // Wall battlements
      for (let i = 0; i < 4; i++) {
        const bx = centerX - citySize / 2 - 3 + i * ((citySize + 6) / 3);
        this.ctx.fillRect(bx, centerY - citySize / 2 - 6, (citySize + 6) / 3 / 2, 3);
        this.ctx.fillRect(bx, centerY + citySize / 2 + 3, (citySize + 6) / 3 / 2, 3);
      }

      // Main palace/castle building (gradient)
      const gradient = this.ctx.createLinearGradient(
        centerX - citySize / 2,
        centerY - citySize / 2,
        centerX + citySize / 2,
        centerY + citySize / 2
      );
      gradient.addColorStop(0, '#ffd700');
      gradient.addColorStop(0.5, '#d4af37');
      gradient.addColorStop(1, '#aa8c2e');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(
        centerX - citySize / 2,
        centerY - citySize / 2,
        citySize,
        citySize
      );

      // Central tower (taller)
      this.ctx.fillStyle = '#ffd700';
      const towerWidth = citySize * 0.3;
      const towerHeight = citySize * 0.5;
      this.ctx.fillRect(
        centerX - towerWidth / 2,
        centerY - citySize / 2 - towerHeight,
        towerWidth,
        towerHeight
      );

      // Tower roof (triangle)
      this.ctx.fillStyle = '#8b0000';
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY - citySize / 2 - towerHeight - towerWidth / 2);
      this.ctx.lineTo(centerX - towerWidth / 2 - 2, centerY - citySize / 2 - towerHeight);
      this.ctx.lineTo(centerX + towerWidth / 2 + 2, centerY - citySize / 2 - towerHeight);
      this.ctx.closePath();
      this.ctx.fill();

      // Windows on tower
      if (this.tileSize >= 32) {
        this.ctx.fillStyle = '#ffeb3b';
        for (let i = 0; i < 3; i++) {
          this.ctx.fillRect(
            centerX - towerWidth / 4,
            centerY - citySize / 2 - towerHeight + i * (towerHeight / 4),
            towerWidth / 2,
            towerHeight / 8
          );
        }
      }

      // Crown icon for capital
      if (this.tileSize >= 24) {
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = `${Math.floor(this.tileSize * 0.4)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('👑', centerX, centerY);
      }

    } else {
      // Regular city: Smaller buildings cluster
      // Base building (gradient)
      const gradient = this.ctx.createLinearGradient(
        centerX - citySize / 2,
        centerY - citySize / 2,
        centerX + citySize / 2,
        centerY + citySize / 2
      );
      gradient.addColorStop(0, '#d4af37');
      gradient.addColorStop(0.5, '#b8941e');
      gradient.addColorStop(1, '#8b7355');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(
        centerX - citySize / 2,
        centerY - citySize / 2,
        citySize,
        citySize
      );

      // Multiple small buildings
      const buildingCount = Math.min(Math.floor(city.population / 3) + 2, 6);
      this.ctx.fillStyle = '#a0826d';

      for (let i = 0; i < buildingCount; i++) {
        const angle = (i / buildingCount) * Math.PI * 2;
        const bx = centerX + Math.cos(angle) * (citySize * 0.2);
        const by = centerY + Math.sin(angle) * (citySize * 0.2);
        const bSize = citySize * 0.15;

        this.ctx.fillRect(bx - bSize / 2, by - bSize / 2, bSize, bSize);

        // Tiny roofs
        this.ctx.fillStyle = '#8b4513';
        this.ctx.beginPath();
        this.ctx.moveTo(bx, by - bSize / 2 - bSize * 0.3);
        this.ctx.lineTo(bx - bSize / 2, by - bSize / 2);
        this.ctx.lineTo(bx + bSize / 2, by - bSize / 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillStyle = '#a0826d';
      }

      // City center icon
      if (this.tileSize >= 24) {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${Math.floor(this.tileSize * 0.35)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🏛️', centerX, centerY);
      }
    }

    this.ctx.restore(); // Restore context (remove shadow)

    // Black border for definition
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      centerX - citySize / 2,
      centerY - citySize / 2,
      citySize,
      citySize
    );

    // City name with shadow
    if (this.tileSize >= 24) {
      // Shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.font = `bold ${Math.floor(this.tileSize * 0.32)}px Georgia`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(city.name, centerX + 1, screenY - 8 + 1);

      // Text
      this.ctx.fillStyle = city.isCapital ? '#ffd700' : '#ffffff';
      this.ctx.fillText(city.name, centerX, screenY - 8);
    }

    // Population indicator below city
    if (this.tileSize >= 28) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.ctx.fillRect(centerX - 18, screenY + this.tileSize - 12, 36, 10);

      this.ctx.fillStyle = '#4ade80';
      this.ctx.font = `${Math.floor(this.tileSize * 0.22)}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`👥 ${city.population}`, centerX, screenY + this.tileSize - 4);
    }
  }

  private renderUnits(state: GameState) {
    state.players.forEach(player => {
      player.units.forEach(unit => {
        const isSelected = state.selectedUnit?.id === unit.id;
        this.renderUnit(unit, player.civilizationId, isSelected);
      });
    });
  }

  private renderUnit(unit: Unit, civId: string, isSelected: boolean = false) {
    // Get interpolated position if unit is animating
    const pos = this.getUnitRenderPosition(unit);
    const screenX = pos.x * this.tileSize + this.offsetX;
    const screenY = pos.y * this.tileSize + this.offsetY;

    // Check for attack flash
    const attackFlash = this.attackFlashes.get(unit.id);
    const isFlashing = attackFlash && (Date.now() - attackFlash) < 500;

    // Selection glow effect (pulsing)
    if (isSelected) {
      const time = Date.now() / 1000;
      const pulse = 0.5 + Math.sin(time * 3) * 0.2; // Pulsing between 0.3 and 0.7

      // Outer glow
      const gradient = this.ctx.createRadialGradient(
        screenX + this.tileSize / 2,
        screenY + this.tileSize / 2,
        this.tileSize * 0.3,
        screenX + this.tileSize / 2,
        screenY + this.tileSize / 2,
        this.tileSize * 0.5
      );
      gradient.addColorStop(0, `rgba(0, 255, 255, ${pulse * 0.3})`);
      gradient.addColorStop(1, `rgba(0, 255, 255, 0)`);

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(
        screenX + this.tileSize / 2,
        screenY + this.tileSize / 2,
        this.tileSize * 0.5,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }

    // Drop shadow for depth
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 6;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;

    // Draw unit as a circle
    this.ctx.fillStyle = this.getUnitColor(unit.type);
    this.ctx.beginPath();
    this.ctx.arc(
      screenX + this.tileSize / 2,
      screenY + this.tileSize / 2,
      this.tileSize * 0.3,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    this.ctx.restore();

    // Attack flash effect
    if (isFlashing) {
      const flashProgress = (Date.now() - attackFlash!) / 500;
      const flashAlpha = 1 - flashProgress;
      this.ctx.fillStyle = `rgba(255, 255, 0, ${flashAlpha * 0.6})`;
      this.ctx.beginPath();
      this.ctx.arc(
        screenX + this.tileSize / 2,
        screenY + this.tileSize / 2,
        this.tileSize * 0.4,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }

    // Draw unit border
    this.ctx.strokeStyle = isFlashing ? '#ff0000' : isSelected ? '#00ffff' : '#000';
    this.ctx.lineWidth = isFlashing || isSelected ? 3 : 2;
    this.ctx.stroke();

    // Draw pixelated unit sprite
    if (this.tileSize >= 20) {
      this.drawUnitSprite(unit.type, screenX + this.tileSize / 2, screenY + this.tileSize / 2, this.tileSize);
    }

    // Enhanced health bar (always show)
    const healthPercent = unit.health / unit.maxHealth;
    const barWidth = this.tileSize * 0.8;
    const barHeight = Math.max(4, this.tileSize * 0.12);
    const barX = screenX + this.tileSize * 0.1;
    const barY = screenY + this.tileSize - barHeight - 2;

    // Black border for visibility
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

    // Background (red)
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health bar (color-coded)
    let healthColor = '#00ff00'; // Green
    if (healthPercent < 0.3) {
      healthColor = '#ff0000'; // Red
    } else if (healthPercent < 0.6) {
      healthColor = '#ffaa00'; // Orange
    } else if (healthPercent < 0.8) {
      healthColor = '#ffff00'; // Yellow
    }

    this.ctx.fillStyle = healthColor;
    const healthWidth = healthPercent * barWidth;
    this.ctx.fillRect(barX, barY, healthWidth, barHeight);

    // Health percentage text (if zoomed in enough)
    if (this.tileSize >= 32) {
      this.ctx.fillStyle = '#fff';
      this.ctx.font = `bold ${Math.floor(this.tileSize * 0.18)}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      // Shadow for visibility
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2;
      this.ctx.strokeText(
        `${Math.ceil(healthPercent * 100)}%`,
        barX + barWidth / 2,
        barY + barHeight / 2
      );

      this.ctx.fillText(
        `${Math.ceil(healthPercent * 100)}%`,
        barX + barWidth / 2,
        barY + barHeight / 2
      );
    }

    // Movement points indicator
    if (this.tileSize >= 20 && unit.movement > 0) {
      const movementPercent = unit.movement / unit.maxMovement;

      // Movement indicator circle in top-right corner
      const indicatorX = screenX + this.tileSize * 0.85;
      const indicatorY = screenY + this.tileSize * 0.15;
      const radius = this.tileSize * 0.12;

      // Background circle
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.beginPath();
      this.ctx.arc(indicatorX, indicatorY, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Movement indicator (colored by remaining movement)
      const color = movementPercent > 0.5 ? '#00ff00' : movementPercent > 0.2 ? '#ffff00' : '#ff8800';
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(indicatorX, indicatorY, radius * 0.7, 0, Math.PI * 2);
      this.ctx.fill();

      // Display movement points as text if zoom is high enough
      if (this.tileSize >= 28) {
        this.ctx.fillStyle = '#000';
        this.ctx.font = `bold ${Math.floor(this.tileSize * 0.2)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(Math.ceil(unit.movement).toString(), indicatorX, indicatorY);
      }
    }

    // "No moves" indicator
    if (unit.hasActed || unit.movement <= 0) {
      this.ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
      this.ctx.beginPath();
      this.ctx.arc(
        screenX + this.tileSize / 2,
        screenY + this.tileSize / 2,
        this.tileSize * 0.35,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }
  }

  private getUnitColor(type: string): string {
    const colors: Record<string, string> = {
      settler: '#4169e1',
      warrior: '#dc143c',
      spearman: '#ff6347',
      archer: '#228b22',
      swordsman: '#8b0000',
      cavalry: '#daa520',
      siege: '#8b4513'
    };
    return colors[type] || '#808080';
  }

  /**
   * Draw pixelated character sprite for unit
   */
  private drawUnitSprite(unitType: string, centerX: number, centerY: number, tileSize: number) {
    // Sprite patterns: 0 = transparent, 1 = primary color, 2 = secondary color, 3 = accent
    const sprites: Record<string, number[][]> = {
      settler: [
        [0,0,3,3,3,3,0,0],
        [0,3,3,3,3,3,3,0],
        [0,0,1,1,1,1,0,0],
        [0,0,1,1,1,1,0,0],
        [0,0,2,1,1,2,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,2,1,1,2,0,0],
        [0,0,2,0,0,2,0,0]
      ],
      warrior: [
        [0,0,0,2,2,0,0,0],
        [0,0,2,1,1,2,0,0],
        [0,0,1,1,1,1,0,0],
        [0,3,3,1,1,3,3,0],
        [0,0,3,1,1,3,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,2,1,1,2,0,0],
        [0,0,2,0,0,2,0,0]
      ],
      spearman: [
        [0,0,0,0,3,0,0,0],
        [0,0,0,3,3,0,0,0],
        [0,0,3,1,1,2,0,0],
        [0,0,1,1,1,1,0,0],
        [0,2,2,1,1,2,2,0],
        [0,0,0,1,1,0,0,0],
        [0,0,2,1,1,2,0,0],
        [0,0,2,0,0,2,0,0]
      ],
      archer: [
        [0,0,0,2,0,0,0,0],
        [0,0,2,1,3,3,0,0],
        [0,0,1,1,1,3,0,0],
        [0,0,1,1,1,1,0,0],
        [0,0,3,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,2,1,1,2,0,0],
        [0,0,2,0,0,2,0,0]
      ],
      swordsman: [
        [0,0,0,3,3,0,0,0],
        [0,0,2,1,1,2,0,0],
        [0,2,1,1,1,1,2,0],
        [3,3,2,1,1,2,3,3],
        [0,0,2,1,1,2,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,2,1,1,2,0,0],
        [0,0,2,0,0,2,0,0]
      ],
      cavalry: [
        [0,0,2,2,0,0,0,0],
        [0,2,1,1,2,0,0,0],
        [0,1,1,1,1,2,0,0],
        [0,1,1,1,1,2,2,0],
        [2,2,2,2,2,1,1,2],
        [2,1,1,1,2,2,2,2],
        [0,2,2,2,0,0,0,0],
        [0,0,0,0,0,0,0,0]
      ],
      siege: [
        [0,0,2,3,3,2,0,0],
        [0,2,2,3,3,2,2,0],
        [0,2,1,1,1,1,2,0],
        [2,1,1,1,1,1,1,2],
        [2,1,1,1,1,1,1,2],
        [2,2,2,2,2,2,2,2],
        [0,2,0,0,0,0,2,0],
        [0,2,0,0,0,0,2,0]
      ],
      galley: [
        [0,0,0,3,0,0,0,0],
        [0,0,3,3,3,0,0,0],
        [0,0,0,3,0,0,0,0],
        [0,2,2,2,2,2,0,0],
        [2,1,1,1,1,1,2,0],
        [2,1,1,1,1,1,2,0],
        [0,2,2,2,2,2,0,0],
        [0,0,0,0,0,0,0,0]
      ],
      trireme: [
        [0,0,3,3,3,0,0,0],
        [0,3,3,3,3,3,0,0],
        [0,0,3,3,3,0,0,0],
        [2,2,2,2,2,2,2,0],
        [2,1,1,1,1,1,1,2],
        [2,1,1,1,1,1,1,2],
        [0,2,2,2,2,2,2,0],
        [0,0,0,0,0,0,0,0]
      ],
      caravel: [
        [0,0,0,3,3,0,0,0],
        [0,0,3,3,3,3,0,0],
        [0,3,3,3,3,3,3,0],
        [0,0,0,3,3,0,0,0],
        [0,2,2,2,2,2,2,0],
        [2,1,1,1,1,1,1,2],
        [2,1,1,1,1,1,1,2],
        [0,2,2,2,2,2,2,0]
      ]
    };

    const sprite = sprites[unitType] || sprites.warrior;
    const spriteSize = sprite.length;

    // Calculate pixel size based on tile size
    const pixelSize = Math.max(1, Math.floor(tileSize * 0.7 / spriteSize));
    const totalSize = pixelSize * spriteSize;

    // Starting position (centered)
    const startX = centerX - totalSize / 2;
    const startY = centerY - totalSize / 2;

    // Color palettes for each unit type
    const colorPalettes: Record<string, {primary: string, secondary: string, accent: string}> = {
      settler: { primary: '#4169e1', secondary: '#ffd700', accent: '#ff8c00' },
      warrior: { primary: '#dc143c', secondary: '#8b0000', accent: '#c0c0c0' },
      spearman: { primary: '#ff6347', secondary: '#8b4513', accent: '#dcdcdc' },
      archer: { primary: '#228b22', secondary: '#8b4513', accent: '#f5f5dc' },
      swordsman: { primary: '#8b0000', secondary: '#696969', accent: '#c0c0c0' },
      cavalry: { primary: '#daa520', secondary: '#8b4513', accent: '#654321' },
      siege: { primary: '#8b4513', secondary: '#696969', accent: '#ff4500' },
      galley: { primary: '#8b4513', secondary: '#654321', accent: '#f5f5dc' },
      trireme: { primary: '#8b4513', secondary: '#654321', accent: '#f5f5dc' },
      caravel: { primary: '#8b4513', secondary: '#654321', accent: '#f5f5dc' }
    };

    const palette = colorPalettes[unitType] || colorPalettes.warrior;

    // Draw each pixel
    for (let y = 0; y < spriteSize; y++) {
      for (let x = 0; x < spriteSize; x++) {
        const pixelValue = sprite[y][x];
        if (pixelValue === 0) continue;

        let color = palette.primary;
        if (pixelValue === 2) color = palette.secondary;
        else if (pixelValue === 3) color = palette.accent;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(
          startX + x * pixelSize,
          startY + y * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    }
  }

  private renderSelection(x: number, y: number) {
    const screenX = x * this.tileSize + this.offsetX;
    const screenY = y * this.tileSize + this.offsetY;

    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
  }

  // Convert screen coordinates to tile coordinates
  screenToTile(screenX: number, screenY: number): {x: number; y: number} {
    const x = Math.floor((screenX - this.offsetX) / this.tileSize);
    const y = Math.floor((screenY - this.offsetY) / this.tileSize);
    return { x, y };
  }

  // Center view on a specific tile
  centerOn(x: number, y: number) {
    this.offsetX = this.canvas.width / 2 - x * this.tileSize;
    this.offsetY = this.canvas.height / 2 - y * this.tileSize;
  }

  // Render movement range overlay for selected unit
  private renderMovementRange(unit: Unit, state: GameState) {
    const validMoves = Pathfinding.getValidMoves(unit, state);

    validMoves.forEach(key => {
      const [x, y] = key.split(',').map(Number);
      const screenX = x * this.tileSize + this.offsetX;
      const screenY = y * this.tileSize + this.offsetY;

      // Semi-transparent blue overlay for reachable tiles
      this.ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
      this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

      // Border for reachable tiles
      this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
    });
  }

  /**
   * Render attack range for selected unit
   */
  private renderAttackRange(unit: Unit, state: GameState) {
    // Get enemies in range
    const enemiesInRange = CombatSystem.getEnemiesInRange(unit, state);

    // Calculate attack range based on unit type
    const range = (unit.type === 'archer' || unit.type === 'siege') ? 2 : 1;

    // Show attack range tiles (all tiles within attack range)
    const startX = Math.max(0, unit.x - range);
    const endX = Math.min(state.map[0].length - 1, unit.x + range);
    const startY = Math.max(0, unit.y - range);
    const endY = Math.min(state.map.length - 1, unit.y + range);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const distance = Math.abs(x - unit.x) + Math.abs(y - unit.y);

        // Skip center tile and out-of-range tiles
        if ((x === unit.x && y === unit.y) || distance > range || distance === 0) continue;

        // For ranged units, skip adjacent tiles
        if ((unit.type === 'archer' || unit.type === 'siege') && distance < 1) continue;

        const screenX = x * this.tileSize + this.offsetX;
        const screenY = y * this.tileSize + this.offsetY;

        // Check if there's an enemy on this tile
        const hasEnemy = enemiesInRange.some(enemy => enemy.x === x && enemy.y === y);

        if (hasEnemy) {
          // Red overlay for attackable enemies
          this.ctx.fillStyle = 'rgba(255, 50, 50, 0.4)';
          this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

          // Strong red border
          this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.9)';
          this.ctx.lineWidth = 3;
          this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);

          // Attack indicator icon
          if (this.tileSize >= 24) {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = `bold ${Math.floor(this.tileSize * 0.3)}px Arial`;
            this.ctx.textAlign = 'right';
            this.ctx.textBaseline = 'top';
            this.ctx.fillText('⚔', screenX + this.tileSize - 4, screenY + 4);
          }
        } else {
          // Light red overlay for potential attack range
          this.ctx.fillStyle = 'rgba(255, 100, 100, 0.15)';
          this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

          // Thin red border
          this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
        }
      }
    }
  }

  // Toggle movement range display
  toggleMovementRangeDisplay() {
    this.showMovementRange = !this.showMovementRange;
  }

  // Start a movement animation
  animateUnitMove(unitId: string, fromX: number, fromY: number, toX: number, toY: number) {
    this.activeAnimations.push({
      unitId,
      startX: fromX,
      startY: fromY,
      endX: toX,
      endY: toY,
      startTime: Date.now(),
      duration: 300, // 300ms animation
      type: 'move'
    });
  }

  // Start an attack animation
  animateUnitAttack(unitId: string, x: number, y: number) {
    this.attackFlashes.set(unitId, Date.now());
    // Clear attack flash after 500ms
    setTimeout(() => this.attackFlashes.delete(unitId), 500);
  }

  // Get interpolated position for animated unit
  private getUnitRenderPosition(unit: Unit): {x: number; y: number} {
    const animation = this.activeAnimations.find(a => a.unitId === unit.id);

    if (!animation) {
      return {x: unit.x, y: unit.y};
    }

    const elapsed = Date.now() - animation.startTime;
    const progress = Math.min(elapsed / animation.duration, 1);

    // Ease-out function for smoother animation
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    // Remove animation if complete
    if (progress >= 1) {
      this.activeAnimations = this.activeAnimations.filter(a => a.unitId !== unit.id);
    }

    // Interpolate position
    const x = animation.startX + (animation.endX - animation.startX) * easeProgress;
    const y = animation.startY + (animation.endY - animation.startY) * easeProgress;

    return {x, y};
  }

  /**
   * Show floating damage number at position
   */
  showDamageNumber(x: number, y: number, damage: number, isAttacker: boolean = false) {
    this.damageNumbers.push({
      x,
      y,
      damage,
      startTime: Date.now(),
      duration: 1500, // 1.5 seconds
      color: isAttacker ? '#ff6b6b' : '#ffd700'
    });

    // Auto-cleanup after duration
    setTimeout(() => {
      this.damageNumbers = this.damageNumbers.filter(d =>
        Date.now() - d.startTime < d.duration
      );
    }, 1500);
  }

  /**
   * Render floating damage numbers
   */
  private renderDamageNumbers() {
    const now = Date.now();

    this.damageNumbers.forEach(dmg => {
      const elapsed = now - dmg.startTime;
      const progress = Math.min(elapsed / dmg.duration, 1);

      // Calculate position (float upward)
      const screenX = dmg.x * this.tileSize + this.offsetX + this.tileSize / 2;
      const screenY = dmg.y * this.tileSize + this.offsetY + this.tileSize / 4;
      const floatY = screenY - (progress * 30); // Float up 30px

      // Calculate opacity (fade out)
      const opacity = 1 - progress;

      // Draw damage number
      this.ctx.save();
      this.ctx.globalAlpha = opacity;
      this.ctx.font = `bold ${Math.floor(this.tileSize * 0.6)}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      // Shadow/outline for visibility
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 3;
      this.ctx.strokeText(`-${dmg.damage}`, screenX, floatY);

      // Actual text
      this.ctx.fillStyle = dmg.color;
      this.ctx.fillText(`-${dmg.damage}`, screenX, floatY);

      this.ctx.restore();
    });

    // Clean up expired damage numbers
    this.damageNumbers = this.damageNumbers.filter(d =>
      now - d.startTime < d.duration
    );
  }

  // Check if unit has active animations
  hasActiveAnimations(): boolean {
    return this.activeAnimations.length > 0 || this.attackFlashes.size > 0;
  }

  // City founding mode controls
  enableCityFoundingMode() {
    this.cityFoundingMode = true;
  }

  disableCityFoundingMode() {
    this.cityFoundingMode = false;
    this.cityFoundingPreview = null;
  }

  setCityFoundingPreview(x: number, y: number, valid: boolean) {
    this.cityFoundingPreview = {x, y, valid};
  }

  isCityFoundingMode(): boolean {
    return this.cityFoundingMode;
  }

  // Render city founding preview
  private renderCityFoundingPreview(preview: {x: number; y: number; valid: boolean}, state: GameState) {
    const centerX = preview.x;
    const centerY = preview.y;

    // Render 3-tile radius (all tiles within distance 3)
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        // Skip if out of bounds
        if (x < 0 || x >= state.config.mapWidth || y < 0 || y >= state.config.mapHeight) {
          continue;
        }

        // Calculate distance (Euclidean)
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= 3) {
          const screenX = x * this.tileSize + this.offsetX;
          const screenY = y * this.tileSize + this.offsetY;

          // Fade alpha based on distance
          const alpha = Math.max(0.1, 0.4 - distance * 0.1);

          // Color: green if valid, red if invalid
          if (preview.valid) {
            this.ctx.fillStyle = `rgba(100, 255, 100, ${alpha})`;
            this.ctx.strokeStyle = 'rgba(100, 255, 100, 0.8)';
          } else {
            this.ctx.fillStyle = `rgba(255, 100, 100, ${alpha})`;
            this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
          }

          this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

          // Stronger border for center tile
          if (dx === 0 && dy === 0) {
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
          }
        }
      }
    }

    // Draw city preview icon at center
    const screenX = centerX * this.tileSize + this.offsetX;
    const screenY = centerY * this.tileSize + this.offsetY;

    if (preview.valid) {
      this.ctx.fillStyle = '#ffd700';
      this.ctx.font = `${Math.floor(this.tileSize * 0.6)}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('🏛', screenX + this.tileSize / 2, screenY + this.tileSize / 2);
    } else {
      // Show X for invalid placement
      this.ctx.fillStyle = '#ff0000';
      this.ctx.font = `bold ${Math.floor(this.tileSize * 0.8)}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('✖', screenX + this.tileSize / 2, screenY + this.tileSize / 2);
    }

    // Show distance circles for existing cities (minimum distance check)
    state.players.forEach(player => {
      player.cities.forEach(city => {
        const distance = Math.sqrt(Math.pow(city.x - centerX, 2) + Math.pow(city.y - centerY, 2));

        // Highlight cities that are too close (within 3 tiles)
        if (distance < 3 && distance > 0) {
          const cityScreenX = city.x * this.tileSize + this.offsetX;
          const cityScreenY = city.y * this.tileSize + this.offsetY;

          // Draw warning circle around too-close cities
          this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
          this.ctx.lineWidth = 3;
          this.ctx.setLineDash([5, 5]);
          this.ctx.beginPath();
          this.ctx.arc(
            cityScreenX + this.tileSize / 2,
            cityScreenY + this.tileSize / 2,
            this.tileSize * 0.7,
            0,
            Math.PI * 2
          );
          this.ctx.stroke();
          this.ctx.setLineDash([]);
        }
      });
    });
  }
}
