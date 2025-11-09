import { GameState, Tile, TerrainType, Unit, City } from '../types';
import { Pathfinding } from './Pathfinding';

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
        // Wave lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(screenX, screenY + size * 0.3);
        this.ctx.lineTo(screenX + size, screenY + size * 0.3);
        this.ctx.moveTo(screenX, screenY + size * 0.6);
        this.ctx.lineTo(screenX + size, screenY + size * 0.6);
        this.ctx.stroke();
        break;

      case 'forest':
      case 'jungle':
        // Tree dots
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 0; i < 3; i++) {
          const x = screenX + (i + 1) * (size / 4);
          const y = screenY + ((i % 2) + 1) * (size / 3);
          this.ctx.fillRect(x - 1, y - 1, 2, 2);
        }
        break;

      case 'desert':
        // Sand ripples
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          this.ctx.beginPath();
          this.ctx.arc(screenX + size / 2, screenY + (i + 1) * (size / 4), size / 4, 0, Math.PI);
          this.ctx.stroke();
        }
        break;

      case 'mountains':
      case 'hills':
        // Rock patterns
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.beginPath();
        this.ctx.moveTo(screenX + size * 0.5, screenY + size * 0.2);
        this.ctx.lineTo(screenX + size * 0.3, screenY + size * 0.7);
        this.ctx.lineTo(screenX + size * 0.7, screenY + size * 0.7);
        this.ctx.closePath();
        this.ctx.fill();
        break;

      case 'snow':
        // Snowflake dots
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 4; i++) {
          const x = screenX + Math.random() * size;
          const y = screenY + Math.random() * size;
          this.ctx.fillRect(x, y, 1, 1);
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

    // Draw city as a square
    this.ctx.fillStyle = city.isCapital ? '#ffd700' : '#d4af37';
    this.ctx.fillRect(
      screenX + this.tileSize * 0.25,
      screenY + this.tileSize * 0.25,
      this.tileSize * 0.5,
      this.tileSize * 0.5
    );

    // Draw city border
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      screenX + this.tileSize * 0.25,
      screenY + this.tileSize * 0.25,
      this.tileSize * 0.5,
      this.tileSize * 0.5
    );

    // Draw city name if zoom is high enough
    if (this.tileSize >= 24) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = `${Math.floor(this.tileSize * 0.3)}px Georgia`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(city.name, screenX + this.tileSize / 2, screenY - 5);
    }
  }

  private renderUnits(state: GameState) {
    state.players.forEach(player => {
      player.units.forEach(unit => {
        this.renderUnit(unit, player.civilizationId);
      });
    });
  }

  private renderUnit(unit: Unit, civId: string) {
    // Get interpolated position if unit is animating
    const pos = this.getUnitRenderPosition(unit);
    const screenX = pos.x * this.tileSize + this.offsetX;
    const screenY = pos.y * this.tileSize + this.offsetY;

    // Check for attack flash
    const attackFlash = this.attackFlashes.get(unit.id);
    const isFlashing = attackFlash && (Date.now() - attackFlash) < 500;

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
    this.ctx.strokeStyle = isFlashing ? '#ff0000' : '#000';
    this.ctx.lineWidth = isFlashing ? 3 : 2;
    this.ctx.stroke();

    // Draw unit icon/letter
    if (this.tileSize >= 20) {
      this.ctx.fillStyle = '#fff';
      this.ctx.font = `bold ${Math.floor(this.tileSize * 0.4)}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      const iconMap: Record<string, string> = {
        settler: 'S',
        warrior: 'W',
        spearman: 'P',
        archer: 'A',
        swordsman: 'D',
        cavalry: 'C',
        siege: 'G'
      };
      const icon = iconMap[unit.type] || 'X';
      this.ctx.fillText(icon, screenX + this.tileSize / 2, screenY + this.tileSize / 2);
    }

    // Health bar
    if (unit.health < unit.maxHealth) {
      const barWidth = this.tileSize * 0.8;
      const barHeight = 3;
      const barX = screenX + this.tileSize * 0.1;
      const barY = screenY + this.tileSize * 0.9;

      this.ctx.fillStyle = '#ff0000';
      this.ctx.fillRect(barX, barY, barWidth, barHeight);

      this.ctx.fillStyle = '#00ff00';
      const healthWidth = (unit.health / unit.maxHealth) * barWidth;
      this.ctx.fillRect(barX, barY, healthWidth, barHeight);
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
