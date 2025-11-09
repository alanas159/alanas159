import { Player } from '../types';
import { TECHNOLOGIES, Technology, getTechnologyById } from '../core/TechnologyData';
import { soundManager } from '../core/SoundManager';

/**
 * TechnologyTreeUI - Interactive technology research selection
 */
export class TechnologyTreeUI {
  private modal: HTMLElement;
  private closeBtn: HTMLButtonElement;
  private treeContainer: HTMLElement;
  private currentPlayer: Player | null = null;
  private onResearch: ((techId: string) => void) | null = null;

  constructor() {
    this.modal = document.getElementById('tech-tree-modal')!;
    this.closeBtn = document.getElementById('tech-tree-close') as HTMLButtonElement;
    this.treeContainer = document.getElementById('tech-tree-container')!;

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
   * Show technology tree
   */
  show(player: Player, onResearch: (techId: string) => void) {
    this.currentPlayer = player;
    this.onResearch = onResearch;

    this.renderTechTree();
    this.modal.classList.remove('hidden');
    soundManager.click();
  }

  /**
   * Render the technology tree
   */
  private renderTechTree() {
    if (!this.currentPlayer) return;

    this.treeContainer.innerHTML = '';

    // Group technologies by era and branch
    const eras: ('antiquity' | 'medieval' | 'modern')[] = ['antiquity', 'medieval', 'modern'];
    const branches: string[] = ['military', 'economy', 'infrastructure', 'naval', 'science_culture'];

    eras.forEach(era => {
      const eraSection = document.createElement('div');
      eraSection.className = 'tech-era-section';
      eraSection.innerHTML = `<h3 class="tech-era-title">${era.toUpperCase()}</h3>`;

      const branchesContainer = document.createElement('div');
      branchesContainer.className = 'tech-branches-container';

      branches.forEach(branch => {
        const techs = TECHNOLOGIES.filter(t => t.era === era && t.branch === branch);
        if (techs.length === 0) return;

        const branchDiv = document.createElement('div');
        branchDiv.className = 'tech-branch';
        branchDiv.innerHTML = `<div class="tech-branch-label">${this.getBranchIcon(branch)} ${branch.replace('_', ' ').toUpperCase()}</div>`;

        const techsDiv = document.createElement('div');
        techsDiv.className = 'tech-cards';

        techs.forEach(tech => {
          const card = this.createTechCard(tech);
          techsDiv.appendChild(card);
        });

        branchDiv.appendChild(techsDiv);
        branchesContainer.appendChild(branchDiv);
      });

      eraSection.appendChild(branchesContainer);
      this.treeContainer.appendChild(eraSection);
    });
  }

  /**
   * Create a technology card
   */
  private createTechCard(tech: Technology): HTMLElement {
    if (!this.currentPlayer) return document.createElement('div');

    const isResearched = this.currentPlayer.technologies.includes(tech.id);
    const isCurrentlyResearching = this.currentPlayer.currentResearch?.techId === tech.id;
    const canResearch = this.canResearch(tech);

    const card = document.createElement('div');
    card.className = `tech-card ${isResearched ? 'researched' : ''} ${isCurrentlyResearching ? 'researching' : ''} ${canResearch && !isResearched && !isCurrentlyResearching ? 'available' : ''}`;

    let statusIcon = '';
    if (isResearched) statusIcon = '✓';
    else if (isCurrentlyResearching) statusIcon = '⚙️';
    else if (canResearch) statusIcon = '🔬';
    else statusIcon = '🔒';

    card.innerHTML = `
      <div class="tech-card-header">
        <span class="tech-status-icon">${statusIcon}</span>
        <h4 class="tech-name">${tech.name}</h4>
      </div>
      <div class="tech-card-body">
        <div class="tech-cost">Cost: ${tech.cost} 🔬</div>
        ${tech.bonus ? `<div class="tech-bonus">${tech.bonus.description}</div>` : ''}
        ${tech.prerequisites.length > 0 ? `<div class="tech-prereqs">Requires: ${tech.prerequisites.map(p => getTechnologyById(p)?.name || p).join(', ')}</div>` : ''}
        ${tech.unlocks.length > 0 ? `<div class="tech-unlocks">Unlocks: ${tech.unlocks.slice(0, 3).join(', ')}${tech.unlocks.length > 3 ? '...' : ''}</div>` : ''}
      </div>
    `;

    // Add click handler
    if (canResearch && !isResearched && !isCurrentlyResearching) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        if (this.onResearch) {
          this.onResearch(tech.id);
          this.hide();
          soundManager.click();
        }
      });

      card.addEventListener('mouseenter', () => soundManager.hover());
    }

    return card;
  }

  /**
   * Check if player can research this technology
   */
  private canResearch(tech: Technology): boolean {
    if (!this.currentPlayer) return false;

    // Already researched
    if (this.currentPlayer.technologies.includes(tech.id)) return false;

    // Currently researching
    if (this.currentPlayer.currentResearch) return false;

    // Check prerequisites
    return tech.prerequisites.every(prereq => this.currentPlayer!.technologies.includes(prereq));
  }

  /**
   * Get branch icon
   */
  private getBranchIcon(branch: string): string {
    const icons: Record<string, string> = {
      military: '⚔️',
      economy: '💰',
      infrastructure: '🏗️',
      naval: '⚓',
      science_culture: '🔬'
    };
    return icons[branch] || '📚';
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
