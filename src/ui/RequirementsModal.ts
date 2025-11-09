import { Player, City, UnitType } from '../types';
import { getUnitData, canRecruitUnit } from '../core/UnitData';
import { getTechnologyById } from '../core/TechnologyData';

/**
 * RequirementsModal - Shows detailed requirements for actions
 */

export interface Requirement {
  icon: string;
  text: string;
  value?: string;
  met: boolean;
}

export class RequirementsModal {
  private modal: HTMLElement;
  private titleEl: HTMLElement;
  private listEl: HTMLElement;
  private closeBtn: HTMLButtonElement;

  constructor() {
    this.modal = document.getElementById('requirements-modal')!;
    this.titleEl = document.getElementById('requirements-title')!;
    this.listEl = document.getElementById('requirements-list')!;
    this.closeBtn = document.getElementById('requirements-close') as HTMLButtonElement;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.closeBtn.addEventListener('click', () => this.hide());

    // Close on click outside modal
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
        this.hide();
      }
    });
  }

  /**
   * Show requirements for founding a city
   */
  showFoundCityRequirements(player: Player, selectedUnit: any) {
    const requirements: Requirement[] = [];

    // Check if settler is selected
    const hasSettler = selectedUnit && selectedUnit.type === 'settler';
    requirements.push({
      icon: '🏕️',
      text: 'Settler unit selected',
      met: hasSettler
    });

    // Check if settler has movement
    if (selectedUnit && selectedUnit.type === 'settler') {
      const hasMovement = selectedUnit.movement > 0;
      requirements.push({
        icon: '👣',
        text: 'Unit has movement points',
        value: `${selectedUnit.movement.toFixed(1)}/${selectedUnit.maxMovement}`,
        met: hasMovement
      });
    }

    // Check if tile is valid (no cities nearby, etc.)
    requirements.push({
      icon: '📍',
      text: 'Valid location (no nearby cities)',
      met: true // This is assumed true for now
    });

    this.show('Found City', requirements);
  }

  /**
   * Show requirements for recruiting a unit
   */
  showRecruitUnitRequirements(player: Player, selectedCity: City | null, unitType: UnitType) {
    const requirements: Requirement[] = [];
    const unitData = getUnitData(unitType);

    if (!unitData) {
      requirements.push({
        icon: '❌',
        text: 'Invalid unit type',
        met: false
      });
      this.show(`Recruit ${unitType}`, requirements);
      return;
    }

    // Check if city is selected
    requirements.push({
      icon: '🏰',
      text: 'City selected',
      met: !!selectedCity
    });

    // Check technology requirements
    const hasTech = canRecruitUnit(unitType, player.technologies);
    const techName = unitData.requiredTech ?
      (getTechnologyById(unitData.requiredTech)?.name || unitData.requiredTech) :
      'None';

    requirements.push({
      icon: '🔬',
      text: unitData.requiredTech ? `Technology: ${techName}` : 'No technology required',
      met: hasTech
    });

    // Check production cost
    const hasProduction = player.resources.production >= unitData.cost.production;
    requirements.push({
      icon: '🔨',
      text: 'Production',
      value: `${Math.floor(player.resources.production)}/${unitData.cost.production}`,
      met: hasProduction
    });

    // Check gold cost if applicable
    if (unitData.cost.gold && unitData.cost.gold > 0) {
      const hasGold = player.resources.gold >= unitData.cost.gold;
      requirements.push({
        icon: '💰',
        text: 'Gold',
        value: `${Math.floor(player.resources.gold)}/${unitData.cost.gold}`,
        met: hasGold
      });
    }

    this.show(`Recruit ${unitData.name}`, requirements);
  }

  /**
   * Show requirements for researching technology
   */
  showResearchRequirements(player: Player, techId: string) {
    const requirements: Requirement[] = [];
    const tech = getTechnologyById(techId);

    if (!tech) {
      requirements.push({
        icon: '❌',
        text: 'Technology not found',
        met: false
      });
      this.show('Research Technology', requirements);
      return;
    }

    // Check if already researched
    const alreadyResearched = player.technologies.includes(techId);
    requirements.push({
      icon: alreadyResearched ? '✓' : '📚',
      text: alreadyResearched ? 'Already researched' : 'Not yet researched',
      met: !alreadyResearched
    });

    // Check prerequisites
    if (tech.prerequisites.length > 0) {
      tech.prerequisites.forEach(prereqId => {
        const prereq = getTechnologyById(prereqId);
        const hasPrereq = player.technologies.includes(prereqId);
        requirements.push({
          icon: '🔗',
          text: `Prerequisite: ${prereq?.name || prereqId}`,
          met: hasPrereq
        });
      });
    } else {
      requirements.push({
        icon: '🔗',
        text: 'No prerequisites',
        met: true
      });
    }

    // Check science cost
    const hasScience = player.resources.science >= tech.cost;
    requirements.push({
      icon: '🔬',
      text: 'Science',
      value: `${Math.floor(player.resources.science)}/${tech.cost}`,
      met: hasScience
    });

    // Check if already researching something
    const notResearching = !player.currentResearch;
    requirements.push({
      icon: '⚗️',
      text: notResearching ? 'No active research' : 'Already researching',
      value: player.currentResearch ? getTechnologyById(player.currentResearch.techId)?.name : undefined,
      met: notResearching
    });

    this.show(`Research ${tech.name}`, requirements);
  }

  /**
   * Show generic requirements
   */
  show(title: string, requirements: Requirement[]) {
    this.titleEl.textContent = title;
    this.listEl.innerHTML = '';

    requirements.forEach(req => {
      const item = document.createElement('div');
      item.className = `requirement-item ${req.met ? 'met' : 'unmet'}`;

      const icon = document.createElement('div');
      icon.className = 'requirement-icon';
      icon.textContent = req.icon;

      const text = document.createElement('div');
      text.className = 'requirement-text';
      text.textContent = req.text;

      item.appendChild(icon);
      item.appendChild(text);

      if (req.value) {
        const value = document.createElement('div');
        value.className = 'requirement-value';
        value.textContent = req.value;
        item.appendChild(value);
      }

      const status = document.createElement('div');
      status.className = 'requirement-status';
      status.textContent = req.met ? '✓' : '✗';
      status.style.color = req.met ? '#4ade80' : '#ef4444';
      item.appendChild(status);

      this.listEl.appendChild(item);
    });

    this.modal.classList.remove('hidden');
  }

  /**
   * Hide the modal
   */
  hide() {
    this.modal.classList.add('hidden');
  }

  /**
   * Check if modal is visible
   */
  isVisible(): boolean {
    return !this.modal.classList.contains('hidden');
  }
}
