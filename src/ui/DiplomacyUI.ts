import { Player } from '../types';
import { DiplomacyManager, DiplomaticRelation } from '../core/DiplomacyManager';
import { CIVILIZATIONS } from '../civilizations/CivilizationData';

/**
 * DiplomacyUI - Manages diplomacy interface
 */
export class DiplomacyUI {
  private modal: HTMLElement;
  private closeBtn: HTMLButtonElement;
  private civilizationsList: HTMLElement;
  private selectedPlayerId: string | null = null;
  private currentPlayerId: string;
  private diplomacyManager: DiplomacyManager;
  private onAction: ((action: string, targetId: string, data?: any) => void) | null = null;

  constructor(diplomacyManager: DiplomacyManager) {
    this.diplomacyManager = diplomacyManager;
    this.currentPlayerId = '';

    this.modal = document.getElementById('diplomacy-modal')!;
    this.closeBtn = document.getElementById('diplomacy-close') as HTMLButtonElement;
    this.civilizationsList = document.getElementById('civilizations-list')!;

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
   * Show diplomacy screen
   */
  show(currentPlayer: Player, allPlayers: Player[], onAction: (action: string, targetId: string, data?: any) => void) {
    this.currentPlayerId = currentPlayer.id;
    this.onAction = onAction;

    // Render list of other civilizations
    this.civilizationsList.innerHTML = '';

    allPlayers.forEach(player => {
      if (player.id === currentPlayer.id) return; // Skip self

      const civ = CIVILIZATIONS.find(c => c.id === player.civilizationId);
      if (!civ) return;

      const relation = this.diplomacyManager.getRelation(currentPlayer.id, player.id);
      if (!relation) return;

      const card = document.createElement('div');
      card.className = 'diplomacy-card';
      card.innerHTML = `
        <div class="diplomacy-card-header" style="background: ${civ.color}20; border-left: 4px solid ${civ.color};">
          <h3>${civ.name}</h3>
          <span class="relation-badge relation-${relation.relation}">${this.getRelationLabel(relation.relation)}</span>
        </div>
        <div class="diplomacy-card-body">
          <div class="stat-row">
            <span class="stat-label">Trust Level:</span>
            <span class="stat-value">${this.getTrustLabel(relation.trustLevel)} (${relation.trustLevel})</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Cities:</span>
            <span class="stat-value">${player.cities.length}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Military:</span>
            <span class="stat-value">${player.units.length} units</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Technologies:</span>
            <span class="stat-value">${player.technologies.length}</span>
          </div>
        </div>
        <div class="diplomacy-card-actions">
          ${this.renderActions(relation.relation, player.id)}
        </div>
      `;

      this.civilizationsList.appendChild(card);
    });

    this.modal.classList.remove('hidden');
  }

  /**
   * Render action buttons based on relation
   */
  private renderActions(relation: DiplomaticRelation, targetId: string): string {
    const buttons: string[] = [];

    if (relation === 'war') {
      buttons.push(`<button class="diplomacy-btn diplomacy-btn-peace" data-action="make_peace" data-target="${targetId}">🕊️ Propose Peace</button>`);
      buttons.push(`<button class="diplomacy-btn diplomacy-btn-trade" data-action="propose_trade" data-target="${targetId}">💰 Propose Trade</button>`);
    } else if (relation === 'allied') {
      buttons.push(`<button class="diplomacy-btn diplomacy-btn-danger" data-action="break_alliance" data-target="${targetId}">💔 Break Alliance</button>`);
      buttons.push(`<button class="diplomacy-btn diplomacy-btn-trade" data-action="propose_trade" data-target="${targetId}">💰 Propose Trade</button>`);
    } else if (relation === 'neutral' || relation === 'friendly') {
      buttons.push(`<button class="diplomacy-btn diplomacy-btn-war" data-action="declare_war" data-target="${targetId}">⚔️ Declare War</button>`);
      buttons.push(`<button class="diplomacy-btn diplomacy-btn-alliance" data-action="form_alliance" data-target="${targetId}">🤝 Propose Alliance</button>`);
      buttons.push(`<button class="diplomacy-btn diplomacy-btn-trade" data-action="propose_trade" data-target="${targetId}">💰 Propose Trade</button>`);
    }

    // Add event listeners after rendering
    setTimeout(() => {
      buttons.forEach(() => {
        document.querySelectorAll(`[data-target="${targetId}"]`).forEach(btn => {
          btn.addEventListener('click', (e) => {
            const action = (e.target as HTMLElement).getAttribute('data-action');
            if (action && this.onAction) {
              // All actions are now handled in main.ts
              this.onAction(action, targetId);
              // Close modal after action for better UX
              if (action !== 'propose_trade') {
                this.hide();
              }
            }
          });
        });
      });
    }, 0);

    return buttons.join('');
  }

  /**
   * Get relation label
   */
  private getRelationLabel(relation: DiplomaticRelation): string {
    const labels: Record<DiplomaticRelation, string> = {
      war: '⚔️ WAR',
      neutral: '😐 NEUTRAL',
      friendly: '😊 FRIENDLY',
      allied: '🤝 ALLIED'
    };
    return labels[relation];
  }

  /**
   * Get trust level label
   */
  private getTrustLabel(trust: number): string {
    if (trust >= 75) return '💚 Excellent';
    if (trust >= 50) return '💙 Good';
    if (trust >= 25) return '💛 Fair';
    if (trust >= 0) return '🧡 Cautious';
    if (trust >= -25) return '❤️ Poor';
    if (trust >= -50) return '💔 Hostile';
    return '☠️ Enemies';
  }

  /**
   * Hide diplomacy screen
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
