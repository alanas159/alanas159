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
      buttons.push(`<button class="diplomacy-btn diplomacy-btn-peace" data-action="peace" data-target="${targetId}">🕊️ Propose Peace</button>`);
    } else if (relation === 'allied') {
      buttons.push(`<button class="diplomacy-btn diplomacy-btn-danger" data-action="break_alliance" data-target="${targetId}">💔 Break Alliance</button>`);
      buttons.push(`<button class="diplomacy-btn diplomacy-btn-trade" data-action="trade" data-target="${targetId}">💰 Propose Trade</button>`);
    } else if (relation === 'neutral' || relation === 'friendly') {
      buttons.push(`<button class="diplomacy-btn diplomacy-btn-war" data-action="war" data-target="${targetId}">⚔️ Declare War</button>`);
      buttons.push(`<button class="diplomacy-btn diplomacy-btn-alliance" data-action="alliance" data-target="${targetId}">🤝 Propose Alliance</button>`);
      buttons.push(`<button class="diplomacy-btn diplomacy-btn-trade" data-action="trade" data-target="${targetId}">💰 Propose Trade</button>`);
    }

    // Add event listeners after rendering
    setTimeout(() => {
      buttons.forEach(() => {
        document.querySelectorAll(`[data-target="${targetId}"]`).forEach(btn => {
          btn.addEventListener('click', (e) => {
            const action = (e.target as HTMLElement).getAttribute('data-action');
            if (action && this.onAction) {
              if (action === 'trade') {
                this.showTradeDialog(targetId);
              } else {
                this.onAction(action, targetId);
              }
            }
          });
        });
      });
    }, 0);

    return buttons.join('');
  }

  /**
   * Show trade dialog
   */
  private showTradeDialog(targetId: string) {
    const tradeType = prompt('Trade type: "once" for one-time trade, "ongoing" for X turns trade');

    if (!tradeType || !['once', 'ongoing'].includes(tradeType)) return;

    const offerGold = parseInt(prompt('Offer gold (0 for none):') || '0');
    const requestGold = parseInt(prompt('Request gold (0 for none):') || '0');

    let offerGoldPerTurn = 0;
    let requestGoldPerTurn = 0;
    let turns = 0;

    if (tradeType === 'ongoing') {
      offerGoldPerTurn = parseInt(prompt('Offer gold per turn (0 for none):') || '0');
      requestGoldPerTurn = parseInt(prompt('Request gold per turn (0 for none):') || '0');
      turns = parseInt(prompt('For how many turns?') || '10');
    }

    const tradeData = {
      type: tradeType === 'once' ? 'one_time' : 'ongoing',
      offering: {
        gold: offerGold > 0 ? offerGold : undefined,
        goldPerTurn: offerGoldPerTurn > 0 ? offerGoldPerTurn : undefined
      },
      requesting: {
        gold: requestGold > 0 ? requestGold : undefined,
        goldPerTurn: requestGoldPerTurn > 0 ? requestGoldPerTurn : undefined
      },
      turnsRemaining: tradeType === 'ongoing' ? turns : undefined
    };

    if (this.onAction) {
      this.onAction('trade', targetId, tradeData);
    }
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
