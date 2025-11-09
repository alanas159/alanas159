import { GameState, Tile, TerrainType, Unit, City } from '../types';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tileSize: number = 32;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;

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

    // Get terrain color
    const color = this.getTerrainColor(tile.terrain);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

    // Draw river overlay
    if (tile.hasRiver) {
      this.ctx.fillStyle = 'rgba(74, 158, 255, 0.3)';
      this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

      // River indicator line
      if (this.tileSize >= 24) {
        this.ctx.strokeStyle = '#4a9eff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(screenX + 2, screenY + this.tileSize / 2);
        this.ctx.lineTo(screenX + this.tileSize - 2, screenY + this.tileSize / 2);
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

    // Draw border
    this.ctx.strokeStyle = '#1a1a2e';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);

    // Draw territory border
    if (tile.ownerId) {
      this.ctx.strokeStyle = '#d4af37';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(screenX + 1, screenY + 1, this.tileSize - 2, this.tileSize - 2);
    }
  }

  private getTerrainColor(terrain: TerrainType): string {
    const colors: Record<TerrainType, string> = {
      ocean: '#1e3a5f',
      plains: '#c9b037',
      grassland: '#4a7c59',
      desert: '#d4a574',
      tundra: '#b8c5d6',
      snow: '#e8f4f8',
      forest: '#2d5016',
      jungle: '#1a3a1a',
      hills: '#8b7355',
      mountains: '#696969'
    };
    return colors[terrain];
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
    const screenX = unit.x * this.tileSize + this.offsetX;
    const screenY = unit.y * this.tileSize + this.offsetY;

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

    // Draw unit border
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
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
}
