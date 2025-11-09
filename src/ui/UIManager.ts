import { GameState, Player, Tile, City, UnitType, Unit } from '../types';
import { CIVILIZATIONS, getCivilizationById } from '../civilizations/CivilizationData';
import { getTechnologyById } from '../core/TechnologyData';
import { TutorialManager } from './TutorialManager';
import { RequirementsModal } from './RequirementsModal';

export class UIManager {
  private tutorialManager: TutorialManager;
  private requirementsModal: RequirementsModal;
  private showTutorialBtn: HTMLButtonElement;
  private civSelectionDiv: HTMLElement;
  private civGridDiv: HTMLElement;
  private startGameBtn: HTMLButtonElement;
  private selectedCivId: string | null = null;
  private onCivSelected: ((civId: string) => void) | null = null;

  // Top bar resource elements
  private topFoodEl: HTMLElement;
  private topProductionEl: HTMLElement;
  private topGoldEl: HTMLElement;
  private topScienceEl: HTMLElement;
  private topCultureEl: HTMLElement;
  private topFoodChangeEl: HTMLElement;
  private topProductionChangeEl: HTMLElement;
  private topGoldChangeEl: HTMLElement;
  private topScienceChangeEl: HTMLElement;
  private topCultureChangeEl: HTMLElement;

  // Side panel UI elements
  private civNameEl: HTMLElement;
  private civAbilityEl: HTMLElement;
  private cityCountEl: HTMLElement;
  private totalPopulationEl: HTMLElement;
  private unitCountEl: HTMLElement;
  private territoryCountEl: HTMLElement;
  private turnNumberEl: HTMLElement;
  private eraEl: HTMLElement;
  private currentTechEl: HTMLElement;
  private techProgressEl: HTMLElement;
  private tileInfoEl: HTMLElement;
  private endTurnBtn: HTMLButtonElement;
  private buildCityBtn: HTMLButtonElement;
  private recruitUnitBtn: HTMLButtonElement;
  private researchBtn: HTMLButtonElement;
  private notificationsDiv: HTMLElement;
  private previousResources = { food: 0, production: 0, gold: 0, science: 0, culture: 0 };

  constructor() {
    this.civSelectionDiv = document.getElementById('civ-selection')!;
    this.civGridDiv = document.getElementById('civ-grid')!;
    this.startGameBtn = document.getElementById('start-game-btn') as HTMLButtonElement;

    this.topFoodEl = document.getElementById('top-food')!;
    this.topProductionEl = document.getElementById('top-production')!;
    this.topGoldEl = document.getElementById('top-gold')!;
    this.topScienceEl = document.getElementById('top-science')!;
    this.topCultureEl = document.getElementById('top-culture')!;
    this.topFoodChangeEl = document.getElementById('top-food-change')!;
    this.topProductionChangeEl = document.getElementById('top-production-change')!;
    this.topGoldChangeEl = document.getElementById('top-gold-change')!;
    this.topScienceChangeEl = document.getElementById('top-science-change')!;
    this.topCultureChangeEl = document.getElementById('top-culture-change')!;

    this.civNameEl = document.getElementById('civ-name')!;
    this.civAbilityEl = document.getElementById('civ-ability')!;
    this.cityCountEl = document.getElementById('city-count')!;
    this.totalPopulationEl = document.getElementById('total-population')!;
    this.unitCountEl = document.getElementById('unit-count')!;
    this.territoryCountEl = document.getElementById('territory-count')!;
    this.turnNumberEl = document.getElementById('turn-number')!;
    this.eraEl = document.getElementById('era')!;
    this.currentTechEl = document.getElementById('current-tech')!;
    this.techProgressEl = document.getElementById('tech-progress')!;
    this.tileInfoEl = document.getElementById('tile-info')!;
    this.endTurnBtn = document.getElementById('end-turn-btn') as HTMLButtonElement;
    this.buildCityBtn = document.getElementById('build-city-btn') as HTMLButtonElement;
    this.recruitUnitBtn = document.getElementById('recruit-unit-btn') as HTMLButtonElement;
    this.researchBtn = document.getElementById('research-btn') as HTMLButtonElement;
    this.notificationsDiv = document.getElementById('notifications')!;
    this.showTutorialBtn = document.getElementById('show-tutorial-btn') as HTMLButtonElement;

    // Initialize tutorial and requirements systems
    this.tutorialManager = new TutorialManager();
    this.requirementsModal = new RequirementsModal();

    this.setupCivilizationSelection();
    this.setupTutorialButton();
  }

  private setupTutorialButton() {
    this.showTutorialBtn.addEventListener('click', () => {
      this.tutorialManager.start();
    });
  }

  private setupCivilizationSelection() {
    CIVILIZATIONS.forEach(civ => {
      const card = document.createElement('div');
      card.className = 'civ-card';
      card.innerHTML = '<h3>' + civ.name + '</h3><p>' + civ.description + '</p><p style="margin-top: 8px; font-size: 11px; color: #d4af37;"><strong>' + civ.uniqueAbility + '</strong></p>';

      card.addEventListener('click', () => {
        document.querySelectorAll('.civ-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedCivId = civ.id;
        this.startGameBtn.disabled = false;
      });

      this.civGridDiv.appendChild(card);
    });

    this.startGameBtn.addEventListener('click', () => {
      if (this.selectedCivId && this.onCivSelected) {
        this.civSelectionDiv.classList.add('hidden');
        this.onCivSelected(this.selectedCivId);
      }
    });
  }

  showCivilizationSelection(callback: (civId: string) => void) {
    this.onCivSelected = callback;
    this.civSelectionDiv.classList.remove('hidden');
  }

  updateUI(state: GameState, currentPlayer: Player) {
    const civ = getCivilizationById(currentPlayer.civilizationId);
    if (civ) {
      this.civNameEl.textContent = civ.name;
      this.civAbilityEl.textContent = civ.uniqueAbility;
    }

    const foodChange = Math.floor(currentPlayer.resources.food - this.previousResources.food);
    const prodChange = Math.floor(currentPlayer.resources.production - this.previousResources.production);
    const goldChange = Math.floor(currentPlayer.resources.gold - this.previousResources.gold);
    const scienceChange = Math.floor(currentPlayer.resources.science - this.previousResources.science);
    const cultureChange = Math.floor(currentPlayer.resources.culture - this.previousResources.culture);

    this.topFoodEl.textContent = Math.floor(currentPlayer.resources.food).toString();
    this.topProductionEl.textContent = Math.floor(currentPlayer.resources.production).toString();
    this.topGoldEl.textContent = Math.floor(currentPlayer.resources.gold).toString();
    this.topScienceEl.textContent = Math.floor(currentPlayer.resources.science).toString();
    this.topCultureEl.textContent = Math.floor(currentPlayer.resources.culture).toString();

    this.topFoodChangeEl.textContent = foodChange > 0 ? '+' + foodChange : '';
    this.topProductionChangeEl.textContent = prodChange > 0 ? '+' + prodChange : '';
    this.topGoldChangeEl.textContent = goldChange > 0 ? '+' + goldChange : '';
    this.topScienceChangeEl.textContent = scienceChange > 0 ? '+' + scienceChange : '';
    this.topCultureChangeEl.textContent = cultureChange > 0 ? '+' + cultureChange : '';

    this.previousResources = { ...currentPlayer.resources };

    this.cityCountEl.textContent = currentPlayer.cities.length.toString();
    const totalPop = currentPlayer.cities.reduce((sum, city) => sum + city.population, 0);
    this.totalPopulationEl.textContent = totalPop.toString();
    this.unitCountEl.textContent = currentPlayer.units.length.toString();
    this.territoryCountEl.textContent = currentPlayer.territories.length.toString();

    this.turnNumberEl.textContent = state.turn.toString();
    this.eraEl.textContent = state.era.charAt(0).toUpperCase() + state.era.slice(1);

    if (currentPlayer.currentResearch) {
      const tech = getTechnologyById(currentPlayer.currentResearch.techId);
      if (tech) {
        this.currentTechEl.textContent = tech.name;
        const progress = (currentPlayer.currentResearch.progress / tech.cost) * 100;
        this.techProgressEl.style.width = Math.min(100, progress) + '%';
      }
    } else {
      this.currentTechEl.textContent = 'None';
      this.techProgressEl.style.width = '0%';
    }

    this.updateNotifications(state);
  }

  private updateNotifications(state: GameState) {
    const recentNotifications = state.notifications.slice(-5);
    this.notificationsDiv.innerHTML = '';

    recentNotifications.forEach(notif => {
      const div = document.createElement('div');
      div.className = 'notification ' + notif.type;
      div.textContent = notif.message;
      this.notificationsDiv.appendChild(div);

      setTimeout(() => {
        div.style.opacity = '0';
        div.style.transform = 'translateX(-100%)';
        setTimeout(() => div.remove(), 300);
      }, 5000);
    });
  }

  updateTileInfo(tile: Tile | null, state: GameState) {
    if (!tile || !tile.explored) {
      this.tileInfoEl.innerHTML = '<p style="font-size: 12px; color: #9ca3af;">Unexplored territory</p>';
      return;
    }

    let html = '<p><strong>' + tile.terrain.charAt(0).toUpperCase() + tile.terrain.slice(1) + '</strong></p>';

    if (tile.hasRiver) {
      html += '<p style="font-size: 11px; color: #4a9eff;">River</p>';
    }

    if (tile.strategicResource) {
      html += '<p style="font-size: 11px; color: #ffd700;">' + tile.strategicResource.charAt(0).toUpperCase() + tile.strategicResource.slice(1) + '</p>';
    }

    html += '<p style="font-size: 11px; margin-top: 5px;">Resources:</p><div style="font-size: 10px;">';

    Object.entries(tile.resources).forEach(([resource, amount]) => {
      if (amount && amount > 0) {
        html += '<div>' + resource + ': +' + amount + '</div>';
      }
    });

    html += '</div>';

    if (tile.cityId) {
      const city = state.players.flatMap(p => p.cities).find(c => c.id === tile.cityId);
      if (city) {
        html += '<p style="margin-top: 5px;"><strong>' + city.name + '</strong></p>';
        html += '<p style="font-size: 11px;">Population: ' + city.population + '</p>';
        html += '<p style="font-size: 11px;">Buildings: ' + city.buildings.length + '</p>';
      }
    }

    if (tile.unitId) {
      const unit = state.players.flatMap(p => p.units).find(u => u.id === tile.unitId);
      if (unit) {
        html += '<p style="margin-top: 5px;"><strong>' + unit.type.charAt(0).toUpperCase() + unit.type.slice(1) + '</strong></p>';
        html += '<p style="font-size: 11px;">HP: ' + unit.health + '/' + unit.maxHealth + '</p>';
        html += '<p style="font-size: 11px;">Movement: ' + unit.movement.toFixed(1) + '/' + unit.maxMovement + '</p>';
        html += '<p style="font-size: 11px;">ATK: ' + unit.attack + ' | DEF: ' + unit.defense + '</p>';
      }
    }

    this.tileInfoEl.innerHTML = html;
  }

  setEndTurnCallback(callback: () => void) {
    this.endTurnBtn.addEventListener('click', callback);
  }

  setBuildCityCallback(callback: () => void) {
    this.buildCityBtn.addEventListener('click', callback);
  }

  setRecruitUnitCallback(callback: () => void) {
    this.recruitUnitBtn.addEventListener('click', callback);
  }

  setResearchCallback(callback: () => void) {
    this.researchBtn.addEventListener('click', callback);
  }

  /**
   * Show requirements for founding a city
   */
  showFoundCityRequirements(player: Player, selectedUnit: Unit | null) {
    this.requirementsModal.showFoundCityRequirements(player, selectedUnit);
  }

  /**
   * Show requirements for recruiting a unit
   */
  showRecruitUnitRequirements(player: Player, selectedCity: City | null, unitType: UnitType) {
    this.requirementsModal.showRecruitUnitRequirements(player, selectedCity, unitType);
  }

  /**
   * Show requirements for researching technology
   */
  showResearchRequirements(player: Player, techId: string) {
    this.requirementsModal.showResearchRequirements(player, techId);
  }

  /**
   * Get tutorial manager
   */
  getTutorialManager(): TutorialManager {
    return this.tutorialManager;
  }

  /**
   * Get requirements modal
   */
  getRequirementsModal(): RequirementsModal {
    return this.requirementsModal;
  }

  /**
   * Start tutorial if not completed
   */
  startTutorialIfNeeded() {
    if (!TutorialManager.hasCompletedTutorial()) {
      // Start tutorial after a short delay
      setTimeout(() => {
        this.tutorialManager.start();
      }, 1000);
    }
  }
}
