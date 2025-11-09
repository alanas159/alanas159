import { Player, City } from '../types';
import { WORLD_WONDERS, WorldWonder, WorldWondersManager } from '../data/WorldWondersData';
import { soundManager } from '../core/SoundManager';

/**
 * WorldWondersUI - Browse and build world wonders
 */
export class WorldWondersUI {
  private modal: HTMLElement;
  private closeBtn: HTMLButtonElement;
  private availableContainer: HTMLElement;
  private builtContainer: HTMLElement;
  private currentPlayer: Player | null = null;
  private wondersManager: WorldWondersManager | null = null;
  private era: string = 'antiquity';
  private onBuild: ((wonderId: string, cityId: string) => void) | null = null;

  constructor() {
    this.modal = document.getElementById('world-wonders-modal')!;
    this.closeBtn = document.getElementById('world-wonders-close') as HTMLButtonElement;
    this.availableContainer = document.getElementById('wonders-available')!;
    this.builtContainer = document.getElementById('wonders-built')!;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.closeBtn.addEventListener('click', () => this.hide());

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
        this.hide();
      }
    });
  }

  /**
   * Show world wonders UI
   */
  show(
    player: Player,
    wondersManager: WorldWondersManager,
    era: string,
    onBuild: (wonderId: string, cityId: string) => void
  ) {
    this.currentPlayer = player;
    this.wondersManager = wondersManager;
    this.era = era;
    this.onBuild = onBuild;

    this.renderAvailableWonders();
    this.renderBuiltWonders();
    this.modal.classList.remove('hidden');
    soundManager.click();
  }

  /**
   * Render available wonders
   */
  private renderAvailableWonders() {
    if (!this.currentPlayer || !this.wondersManager) return;

    this.availableContainer.innerHTML = '<h3 class="ww-section-title">Available Wonders</h3>';

    const availableWonders = this.wondersManager.getAvailableWonders(this.era, this.currentPlayer.technologies);

    if (availableWonders.length === 0) {
      this.availableContainer.innerHTML += '<p class="ww-empty">No wonders available. Research more technologies to unlock wonders!</p>';
      return;
    }

    const wondersGrid = document.createElement('div');
    wondersGrid.className = 'ww-grid';

    availableWonders.forEach(wonder => {
      const card = this.createWonderCard(wonder, true);
      wondersGrid.appendChild(card);
    });

    this.availableContainer.appendChild(wondersGrid);
  }

  /**
   * Render built wonders
   */
  private renderBuiltWonders() {
    if (!this.currentPlayer || !this.wondersManager) return;

    this.builtContainer.innerHTML = '<h3 class="ww-section-title">Built Wonders</h3>';

    const playerWonders = this.wondersManager.getPlayerWonders(this.currentPlayer.id);

    if (playerWonders.length === 0) {
      this.builtContainer.innerHTML += '<p class="ww-empty">You haven\'t built any wonders yet. Build wonders to gain powerful bonuses!</p>';
      return;
    }

    const wondersGrid = document.createElement('div');
    wondersGrid.className = 'ww-grid';

    playerWonders.forEach(wonder => {
      const card = this.createWonderCard(wonder, false);
      wondersGrid.appendChild(card);
    });

    this.builtContainer.appendChild(wondersGrid);
  }

  /**
   * Create a wonder card
   */
  private createWonderCard(wonder: WorldWonder, isAvailable: boolean): HTMLElement {
    if (!this.currentPlayer) return document.createElement('div');

    const card = document.createElement('div');
    card.className = `ww-card ${isAvailable ? 'ww-available' : 'ww-built'}`;

    const effectsList = [];
    if (wonder.effects.global) {
      Object.entries(wonder.effects.global).forEach(([key, value]) => {
        effectsList.push(`+${value} ${key} (global)`);
      });
    }
    if (wonder.effects.city) {
      Object.entries(wonder.effects.city).forEach(([key, value]) => {
        effectsList.push(`+${value} ${key} (city)`);
      });
    }
    if (wonder.effects.unique) {
      effectsList.push(wonder.effects.unique);
    }

    card.innerHTML = `
      <div class="ww-card-header">
        <span class="ww-card-icon">${wonder.icon}</span>
        <div>
          <h4 class="ww-card-name">${wonder.name}</h4>
          <div class="ww-card-era">Era: ${wonder.era}</div>
        </div>
      </div>
      <div class="ww-card-body">
        <p class="ww-description">${wonder.description}</p>
        <div class="ww-cost">
          <span>Cost: ${wonder.cost.production} 🔨</span>
          <span>Min. Turns: ${wonder.cost.turns}</span>
        </div>
        <div class="ww-tech-req">Required Tech: ${wonder.requiredTech}</div>
        <div class="ww-effects">
          <strong>Effects:</strong>
          <ul>
            ${effectsList.map(effect => `<li>${effect}</li>`).join('')}
          </ul>
        </div>
      </div>
      ${isAvailable ? `
        <div class="ww-card-actions">
          <button class="btn ww-build-btn" id="build-${wonder.id}">
            🏗️ BUILD IN CITY
          </button>
        </div>
      ` : '<div class="ww-completed-badge">✅ COMPLETED</div>'}
    `;

    // Add build button handler
    if (isAvailable) {
      const buildBtn = card.querySelector(`#build-${wonder.id}`) as HTMLButtonElement;
      if (buildBtn) {
        buildBtn.addEventListener('click', () => {
          if (this.onBuild && this.currentPlayer!.cities.length > 0) {
            // For now, use the first city or show city selector
            const cityId = this.currentPlayer!.cities[0].id;
            this.onBuild(wonder.id, cityId);
            this.hide();
            soundManager.click();
          } else {
            alert('You need at least one city to build a wonder!');
            soundManager.error();
          }
        });

        buildBtn.addEventListener('mouseenter', () => soundManager.hover());
      }
    }

    return card;
  }

  /**
   * Hide modal
   */
  hide() {
    this.modal.classList.add('hidden');
  }

  /**
   * Check if visible
   */
  isVisible(): boolean {
    return !this.modal.classList.contains('hidden');
  }
}
