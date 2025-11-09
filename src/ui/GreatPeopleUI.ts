import { Player, City } from '../types';
import { GREAT_PEOPLE, GreatPerson, GreatPersonType } from '../data/GreatPeopleData';
import { soundManager } from '../core/SoundManager';

/**
 * GreatPeopleUI - Manage and activate great people
 */
export class GreatPeopleUI {
  private modal: HTMLElement;
  private closeBtn: HTMLButtonElement;
  private progressContainer: HTMLElement;
  private earnedContainer: HTMLElement;
  private currentPlayer: Player | null = null;
  private pointsProgress: Map<GreatPersonType, number> = new Map();
  private earnedPeople: GreatPerson[] = [];
  private onActivate: ((personId: string, cityId?: string) => void) | null = null;

  constructor() {
    this.modal = document.getElementById('great-people-modal')!;
    this.closeBtn = document.getElementById('great-people-close') as HTMLButtonElement;
    this.progressContainer = document.getElementById('great-people-progress')!;
    this.earnedContainer = document.getElementById('great-people-earned')!;

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
   * Show great people UI
   */
  show(
    player: Player,
    pointsProgress: Map<GreatPersonType, number>,
    earnedPeople: GreatPerson[],
    onActivate: (personId: string, cityId?: string) => void
  ) {
    this.currentPlayer = player;
    this.pointsProgress = pointsProgress;
    this.earnedPeople = earnedPeople;
    this.onActivate = onActivate;

    this.renderProgress();
    this.renderEarnedPeople();
    this.modal.classList.remove('hidden');
    soundManager.click();
  }

  /**
   * Render progress towards earning great people
   */
  private renderProgress() {
    this.progressContainer.innerHTML = '<h3 class="gp-section-title">Progress Towards Great People</h3>';

    const types: GreatPersonType[] = ['scientist', 'engineer', 'artist', 'general', 'merchant', 'prophet'];
    const icons: Record<GreatPersonType, string> = {
      scientist: '🔬',
      engineer: '🏗️',
      artist: '🎨',
      general: '⚔️',
      merchant: '💰',
      prophet: '☯️'
    };

    types.forEach(type => {
      const points = this.pointsProgress.get(type) || 0;
      const percentage = (points / 100) * 100; // 100 points = 1 great person

      const div = document.createElement('div');
      div.className = 'gp-progress-item';
      div.innerHTML = `
        <div class="gp-progress-header">
          <span class="gp-type-icon">${icons[type]}</span>
          <span class="gp-type-name">${type.toUpperCase()}</span>
          <span class="gp-points">${points}/100</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.min(100, percentage)}%"></div>
        </div>
      `;

      this.progressContainer.appendChild(div);
    });

    if (types.every(type => (this.pointsProgress.get(type) || 0) === 0)) {
      this.progressContainer.innerHTML += '<p class="gp-empty">Build Libraries, Workshops, Temples, Markets, and Wonders to earn points towards great people!</p>';
    }
  }

  /**
   * Render earned great people
   */
  private renderEarnedPeople() {
    this.earnedContainer.innerHTML = '<h3 class="gp-section-title">Earned Great People</h3>';

    if (this.earnedPeople.length === 0) {
      this.earnedContainer.innerHTML += '<p class="gp-empty">No great people earned yet. Keep building and advancing your civilization!</p>';
      return;
    }

    const peopleGrid = document.createElement('div');
    peopleGrid.className = 'gp-grid';

    this.earnedPeople.forEach(person => {
      const card = this.createGreatPersonCard(person);
      peopleGrid.appendChild(card);
    });

    this.earnedContainer.appendChild(peopleGrid);
  }

  /**
   * Create a great person card
   */
  private createGreatPersonCard(person: GreatPerson): HTMLElement {
    if (!this.currentPlayer) return document.createElement('div');

    const card = document.createElement('div');
    card.className = 'gp-card';

    card.innerHTML = `
      <div class="gp-card-header">
        <span class="gp-card-icon">${person.icon}</span>
        <h4 class="gp-card-name">${person.name}</h4>
      </div>
      <div class="gp-card-body">
        <div class="gp-card-era">Era: ${person.era}</div>
        <div class="gp-card-ability">
          <strong>${person.ability.name}</strong>
          <p>${person.ability.description}</p>
        </div>
      </div>
      <div class="gp-card-actions">
        <button class="btn gp-activate-btn" id="activate-${person.id}">
          ⚡ ACTIVATE
        </button>
      </div>
    `;

    // Add activate button handler
    const activateBtn = card.querySelector(`#activate-${person.id}`) as HTMLButtonElement;
    if (activateBtn) {
      activateBtn.addEventListener('click', () => {
        if (this.onActivate) {
          // Check if ability requires a city (boost effects)
          const requiresCity = person.ability.description.includes('in one city') ||
                              person.ability.description.includes('city permanently');

          if (requiresCity && this.currentPlayer!.cities.length > 0) {
            // For now, use the first city or prompt for city selection
            const cityId = this.currentPlayer!.cities[0].id;
            this.onActivate(person.id, cityId);
          } else {
            this.onActivate(person.id);
          }

          this.hide();
          soundManager.greatPerson();
        }
      });

      activateBtn.addEventListener('mouseenter', () => soundManager.hover());
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
