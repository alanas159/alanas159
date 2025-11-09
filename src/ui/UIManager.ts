import { GameState, Player, Tile } from '../types';
import { CIVILIZATIONS, getCivilizationById } from '../civilizations/CivilizationData';

export class UIManager {
  private civSelectionDiv: HTMLElement;
  private civGridDiv: HTMLElement;
  private startGameBtn: HTMLButtonElement;
  private selectedCivId: string | null = null;
  private onCivSelected: ((civId: string) => void) | null = null;

  // Game UI elements
  private civNameEl: HTMLElement;
  private foodEl: HTMLElement;
  private productionEl: HTMLElement;
  private goldEl: HTMLElement;
  private scienceEl: HTMLElement;
  private cultureEl: HTMLElement;
  private turnNumberEl: HTMLElement;
  private eraEl: HTMLElement;
  private tileInfoEl: HTMLElement;
  private endTurnBtn: HTMLButtonElement;
  private buildCityBtn: HTMLButtonElement;
  private recruitUnitBtn: HTMLButtonElement;

  constructor() {
    // Civilization selection elements
    this.civSelectionDiv = document.getElementById('civ-selection')!;
    this.civGridDiv = document.getElementById('civ-grid')!;
    this.startGameBtn = document.getElementById('start-game-btn') as HTMLButtonElement;

    // Game UI elements
    this.civNameEl = document.getElementById('civ-name')!;
    this.foodEl = document.getElementById('food')!;
    this.productionEl = document.getElementById('production')!;
    this.goldEl = document.getElementById('gold')!;
    this.scienceEl = document.getElementById('science')!;
    this.cultureEl = document.getElementById('culture')!;
    this.turnNumberEl = document.getElementById('turn-number')!;
    this.eraEl = document.getElementById('era')!;
    this.tileInfoEl = document.getElementById('tile-info')!;
    this.endTurnBtn = document.getElementById('end-turn-btn') as HTMLButtonElement;
    this.buildCityBtn = document.getElementById('build-city-btn') as HTMLButtonElement;
    this.recruitUnitBtn = document.getElementById('recruit-unit-btn') as HTMLButtonElement;

    this.setupCivilizationSelection();
  }

  private setupCivilizationSelection() {
    // Create civilization cards
    CIVILIZATIONS.forEach(civ => {
      const card = document.createElement('div');
      card.className = 'civ-card';
      card.innerHTML = `
        <h3>${civ.name}</h3>
        <p>${civ.description}</p>
        <p style="margin-top: 8px; font-size: 11px; color: #d4af37;">
          <strong>${civ.uniqueAbility}</strong>
        </p>
      `;

      card.addEventListener('click', () => {
        // Deselect all cards
        document.querySelectorAll('.civ-card').forEach(c => c.classList.remove('selected'));
        // Select this card
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
    // Update civilization name
    const civ = getCivilizationById(currentPlayer.civilizationId);
    if (civ) {
      this.civNameEl.textContent = civ.name;
    }

    // Update resources
    this.foodEl.textContent = Math.floor(currentPlayer.resources.food).toString();
    this.productionEl.textContent = Math.floor(currentPlayer.resources.production).toString();
    this.goldEl.textContent = Math.floor(currentPlayer.resources.gold).toString();
    this.scienceEl.textContent = Math.floor(currentPlayer.resources.science).toString();
    this.cultureEl.textContent = Math.floor(currentPlayer.resources.culture).toString();

    // Update turn info
    this.turnNumberEl.textContent = state.turn.toString();
    this.eraEl.textContent = state.era.charAt(0).toUpperCase() + state.era.slice(1);
  }

  updateTileInfo(tile: Tile | null, state: GameState) {
    if (!tile || !tile.explored) {
      this.tileInfoEl.innerHTML = '<p>Unexplored territory</p>';
      return;
    }

    let html = `<p><strong>${tile.terrain.charAt(0).toUpperCase() + tile.terrain.slice(1)}</strong></p>`;
    html += '<p style="font-size: 11px; margin-top: 5px;">Resources:</p>';
    html += '<div style="font-size: 10px;">';

    Object.entries(tile.resources).forEach(([resource, amount]) => {
      if (amount && amount > 0) {
        html += `<div>${resource}: +${amount}</div>`;
      }
    });

    html += '</div>';

    // Show city info if present
    if (tile.cityId) {
      const city = state.players
        .flatMap(p => p.cities)
        .find(c => c.id === tile.cityId);

      if (city) {
        html += `<p style="margin-top: 5px;"><strong>City: ${city.name}</strong></p>`;
        html += `<p style="font-size: 11px;">Population: ${city.population}</p>`;
      }
    }

    // Show unit info if present
    if (tile.unitId) {
      const unit = state.players
        .flatMap(p => p.units)
        .find(u => u.id === tile.unitId);

      if (unit) {
        html += `<p style="margin-top: 5px;"><strong>${unit.type.charAt(0).toUpperCase() + unit.type.slice(1)}</strong></p>`;
        html += `<p style="font-size: 11px;">HP: ${unit.health}/${unit.maxHealth}</p>`;
        html += `<p style="font-size: 11px;">Movement: ${unit.movement}/${unit.maxMovement}</p>`;
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
}
