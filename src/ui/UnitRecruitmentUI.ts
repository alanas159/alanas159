import { City, Player, UnitType } from '../types';
import { getUnitData, canRecruitUnit, getUnitCostWithBonuses } from '../core/UnitData';
import { getTechnologyById } from '../core/TechnologyData';
import { soundManager } from '../core/SoundManager';

/**
 * UnitRecruitmentUI - Sleek UI for recruiting units
 */
export class UnitRecruitmentUI {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'unit-recruitment-ui';
    this.container.className = 'modal-overlay hidden';
    document.body.appendChild(this.container);
  }

  /**
   * Show unit recruitment UI
   */
  show(city: City, player: Player, onRecruit: (unitType: UnitType) => void) {
    soundManager.click();

    const availableUnits: UnitType[] = [
      'settler',
      'warrior',
      'spearman',
      'archer',
      'swordsman',
      'cavalry',
      'siege',
      'galley',
      'trireme',
      'caravel'
    ];

    this.container.innerHTML = `
      <div class="modal-content" style="max-width: 900px; max-height: 80vh; overflow-y: auto;">
        <div class="modal-header">
          <h2>🏰 Recruit Units - ${city.name}</h2>
          <button class="close-btn" id="recruitment-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="resource-display">
            <div class="resource-item">
              <span class="resource-icon">⚙️</span>
              <span class="resource-value">${Math.floor(player.resources.production)}</span>
              <span class="resource-label">Production</span>
            </div>
            <div class="resource-item">
              <span class="resource-icon">💰</span>
              <span class="resource-value">${Math.floor(player.resources.gold)}</span>
              <span class="resource-label">Gold</span>
            </div>
          </div>
          <div id="units-grid" class="units-grid"></div>
        </div>
      </div>
    `;

    const unitsGrid = this.container.querySelector('#units-grid')!;

    // Render unit cards
    availableUnits.forEach(unitType => {
      const unitData = getUnitData(unitType);
      if (!unitData) return;

      const canRecruit = canRecruitUnit(unitType, player.technologies);
      const costs = getUnitCostWithBonuses(unitType, player.civilizationId);
      const canAfford = player.resources.production >= costs.production &&
                        (!costs.gold || player.resources.gold >= costs.gold);

      const card = document.createElement('div');
      card.className = `unit-card ${!canRecruit ? 'locked' : !canAfford ? 'unaffordable' : 'available'}`;

      // Unit icon/sprite preview
      const unitIcons: Record<UnitType, string> = {
        settler: '👷',
        warrior: '⚔️',
        spearman: '🗡️',
        archer: '🏹',
        swordsman: '⚔️',
        cavalry: '🐴',
        siege: '🎯',
        galley: '⛵',
        trireme: '🚢',
        caravel: '⛵'
      };

      const requirementInfo = !canRecruit && unitData.requiredTech
        ? `<div class="requirement-warning">🔒 Requires ${getTechnologyById(unitData.requiredTech)?.name}</div>`
        : '';

      const affordabilityInfo = canRecruit && !canAfford
        ? `<div class="affordability-warning">⚠️ Insufficient resources</div>`
        : '';

      card.innerHTML = `
        <div class="unit-card-header">
          <span class="unit-icon">${unitIcons[unitType]}</span>
          <h3 class="unit-name">${unitData.name}</h3>
        </div>
        <div class="unit-card-body">
          <div class="unit-stats">
            <div class="stat"><span class="stat-icon">⚔️</span>${unitData.baseStrength} Attack</div>
            <div class="stat"><span class="stat-icon">🛡️</span>${unitData.baseDefense || unitData.baseStrength} Defense</div>
            <div class="stat"><span class="stat-icon">👟</span>${unitData.movement} Movement</div>
            ${unitData.ranged ? `<div class="stat"><span class="stat-icon">🎯</span>${unitData.range} Range</div>` : ''}
          </div>
          <div class="unit-costs">
            <div class="cost-item">
              <span class="cost-icon">⚙️</span>
              <span class="cost-value ${player.resources.production < costs.production ? 'insufficient' : ''}">${costs.production}</span>
            </div>
            ${costs.gold ? `
              <div class="cost-item">
                <span class="cost-icon">💰</span>
                <span class="cost-value ${player.resources.gold < costs.gold ? 'insufficient' : ''}">${costs.gold}</span>
              </div>
            ` : ''}
          </div>
          ${requirementInfo}
          ${affordabilityInfo}
        </div>
        <div class="unit-card-footer">
          <button
            class="recruit-btn ${canRecruit && canAfford ? 'primary' : 'disabled'}"
            data-unit-type="${unitType}"
            ${!canRecruit || !canAfford ? 'disabled' : ''}
          >
            ${canRecruit && canAfford ? '✅ Recruit' : !canRecruit ? '🔒 Locked' : '⚠️ Can\'t Afford'}
          </button>
        </div>
      `;

      unitsGrid.appendChild(card);
    });

    // Add event listeners
    document.getElementById('recruitment-close')?.addEventListener('click', () => {
      soundManager.click();
      this.hide();
    });

    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        soundManager.click();
        this.hide();
      }
    });

    // Add recruit button listeners
    this.container.querySelectorAll('.recruit-btn:not(.disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        const unitType = (btn as HTMLElement).getAttribute('data-unit-type') as UnitType;
        soundManager.click();
        onRecruit(unitType);
        this.hide();
      });
    });

    document.addEventListener('keydown', this.handleEscapeKey);

    this.container.classList.remove('hidden');
  }

  private handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !this.container.classList.contains('hidden')) {
      soundManager.click();
      this.hide();
    }
  };

  hide() {
    this.container.classList.add('hidden');
    document.removeEventListener('keydown', this.handleEscapeKey);
  }
}
