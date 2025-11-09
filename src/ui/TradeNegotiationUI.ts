import { Player, Resources } from '../types';
import { soundManager } from '../core/SoundManager';
import { TECHNOLOGIES } from '../core/TechnologyData';

export interface TradeOffer {
  offering: {
    gold?: number;
    goldPerTurn?: number;
    resources?: Partial<Resources>;
    technologies?: string[];
  };
  requesting: {
    gold?: number;
    goldPerTurn?: number;
    resources?: Partial<Resources>;
    technologies?: string[];
  };
}

export class TradeNegotiationUI {
  /**
   * Show trade negotiation dialog
   * @param player - Current player
   * @param otherPlayer - Player to trade with
   * @param onOffer - Callback when player makes an offer
   */
  show(
    player: Player,
    otherPlayer: Player,
    onOffer: (offer: TradeOffer) => void
  ): void {
    soundManager.click();

    const offer: TradeOffer = {
      offering: {},
      requesting: {}
    };

    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
    `;

    // Create modal container
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 3px solid #d4af37;
      border-radius: 12px;
      padding: 24px;
      max-width: 800px;
      width: 95%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(212, 175, 55, 0.4);
    `;

    // Title
    const titleEl = document.createElement('h2');
    titleEl.textContent = `Trade with ${this.getCivName(otherPlayer.civilizationId)}`;
    titleEl.style.cssText = `
      color: #d4af37;
      font-size: 26px;
      margin: 0 0 20px 0;
      text-align: center;
      font-family: Georgia, serif;
    `;

    // Trade container (two columns)
    const tradeContainer = document.createElement('div');
    tradeContainer.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    `;

    // Left column: You offer
    const offerColumn = this.createTradeColumn(
      'You Offer',
      player,
      offer.offering,
      otherPlayer
    );
    tradeContainer.appendChild(offerColumn);

    // Right column: You request
    const requestColumn = this.createTradeColumn(
      'You Request',
      otherPlayer,
      offer.requesting,
      player
    );
    tradeContainer.appendChild(requestColumn);

    // Buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      gap: 12px;
    `;

    const proposeBtn = document.createElement('button');
    proposeBtn.textContent = '✅ Propose Trade';
    proposeBtn.style.cssText = `
      flex: 1;
      background: linear-gradient(135deg, #2a7c2a 0%, #1e5a1e 100%);
      color: white;
      border: 2px solid #3a9a3a;
      border-radius: 6px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    `;
    proposeBtn.onmouseover = () => {
      soundManager.hover();
      proposeBtn.style.background = 'linear-gradient(135deg, #3a9a3a 0%, #2a7c2a 100%)';
      proposeBtn.style.transform = 'scale(1.02)';
    };
    proposeBtn.onmouseout = () => {
      proposeBtn.style.background = 'linear-gradient(135deg, #2a7c2a 0%, #1e5a1e 100%)';
      proposeBtn.style.transform = 'scale(1)';
    };
    proposeBtn.onclick = () => {
      soundManager.click();
      document.body.removeChild(backdrop);
      onOffer(offer);
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '❌ Cancel';
    cancelBtn.style.cssText = `
      flex: 1;
      background: linear-gradient(135deg, #7c2a2a 0%, #5a1e1e 100%);
      color: white;
      border: 2px solid #9a3a3a;
      border-radius: 6px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    `;
    cancelBtn.onmouseover = () => {
      soundManager.hover();
      cancelBtn.style.background = 'linear-gradient(135deg, #9a3a3a 0%, #7c2a2a 100%)';
      cancelBtn.style.transform = 'scale(1.02)';
    };
    cancelBtn.onmouseout = () => {
      cancelBtn.style.background = 'linear-gradient(135deg, #7c2a2a 0%, #5a1e1e 100%)';
      cancelBtn.style.transform = 'scale(1)';
    };
    cancelBtn.onclick = () => {
      soundManager.click();
      document.body.removeChild(backdrop);
    };

    buttonsContainer.appendChild(proposeBtn);
    buttonsContainer.appendChild(cancelBtn);

    // Assemble modal
    modal.appendChild(titleEl);
    modal.appendChild(tradeContainer);
    modal.appendChild(buttonsContainer);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Close on ESC
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.body.removeChild(backdrop);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  private createTradeColumn(
    title: string,
    fromPlayer: Player,
    tradeSection: any,
    toPlayer: Player
  ): HTMLElement {
    const column = document.createElement('div');
    column.style.cssText = `
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid #444;
      border-radius: 8px;
      padding: 16px;
    `;

    // Column title
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.cssText = `
      color: #d4af37;
      font-size: 18px;
      margin: 0 0 16px 0;
      text-align: center;
    `;
    column.appendChild(titleEl);

    // Gold section
    const goldSection = this.createResourceInput(
      '💰 Gold',
      fromPlayer.resources.gold,
      (value) => { tradeSection.gold = value; }
    );
    column.appendChild(goldSection);

    // Gold per turn
    const goldPerTurnSection = this.createResourceInput(
      '💰/turn Gold per Turn',
      Math.floor(fromPlayer.resources.gold / 20), // Reasonable limit
      (value) => { tradeSection.goldPerTurn = value; }
    );
    column.appendChild(goldPerTurnSection);

    // Resources section
    const resourcesTitle = document.createElement('div');
    resourcesTitle.textContent = 'Resources per Turn';
    resourcesTitle.style.cssText = `
      color: #d4af37;
      font-size: 14px;
      font-weight: bold;
      margin: 12px 0 8px 0;
    `;
    column.appendChild(resourcesTitle);

    // Food
    const foodSection = this.createResourceInput(
      '🌾 Food',
      Math.floor((fromPlayer.resources.food || 0) / 10),
      (value) => {
        if (!tradeSection.resources) tradeSection.resources = {};
        tradeSection.resources.food = value;
      },
      5
    );
    column.appendChild(foodSection);

    // Production
    const prodSection = this.createResourceInput(
      '⚙️ Production',
      Math.floor((fromPlayer.resources.production || 0) / 10),
      (value) => {
        if (!tradeSection.resources) tradeSection.resources = {};
        tradeSection.resources.production = value;
      },
      5
    );
    column.appendChild(prodSection);

    // Science
    const sciSection = this.createResourceInput(
      '🔬 Science',
      Math.floor((fromPlayer.resources.science || 0) / 10),
      (value) => {
        if (!tradeSection.resources) tradeSection.resources = {};
        tradeSection.resources.science = value;
      },
      5
    );
    column.appendChild(sciSection);

    // Culture
    const cultSection = this.createResourceInput(
      '🎨 Culture',
      Math.floor((fromPlayer.resources.culture || 0) / 10),
      (value) => {
        if (!tradeSection.resources) tradeSection.resources = {};
        tradeSection.resources.culture = value;
      },
      5
    );
    column.appendChild(cultSection);

    // Technologies section
    const techsTitle = document.createElement('div');
    techsTitle.textContent = 'Technologies';
    techsTitle.style.cssText = `
      color: #d4af37;
      font-size: 14px;
      font-weight: bold;
      margin: 12px 0 8px 0;
    `;
    column.appendChild(techsTitle);

    // Get tradeable techs (fromPlayer has, toPlayer doesn't)
    const tradeableTechs = fromPlayer.technologies.filter(
      techId => !toPlayer.technologies.includes(techId)
    );

    if (tradeableTechs.length === 0) {
      const noTechs = document.createElement('div');
      noTechs.textContent = 'No technologies to trade';
      noTechs.style.cssText = `
        color: #888;
        font-size: 12px;
        font-style: italic;
        margin: 4px 0;
      `;
      column.appendChild(noTechs);
    } else {
      tradeableTechs.slice(0, 5).forEach(techId => {
        const tech = TECHNOLOGIES.find(t => t.id === techId);
        if (tech) {
          const techCheckbox = this.createCheckbox(
            tech.name,
            (checked) => {
              if (!tradeSection.technologies) tradeSection.technologies = [];
              if (checked) {
                tradeSection.technologies.push(techId);
              } else {
                tradeSection.technologies = tradeSection.technologies.filter((id: string) => id !== techId);
              }
            }
          );
          column.appendChild(techCheckbox);
        }
      });
    }

    return column;
  }

  private createResourceInput(
    label: string,
    max: number,
    onChange: (value: number) => void,
    step: number = 1
  ): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      margin-bottom: 12px;
    `;

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.style.cssText = `
      color: #ccc;
      font-size: 13px;
      display: block;
      margin-bottom: 4px;
    `;

    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = max.toString();
    input.step = step.toString();
    input.value = '0';
    input.style.cssText = `
      flex: 1;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid #555;
      border-radius: 4px;
      color: #fff;
      padding: 6px 10px;
      font-size: 14px;
    `;
    input.oninput = () => {
      const value = Math.max(0, Math.min(max, parseInt(input.value) || 0));
      input.value = value.toString();
      onChange(value);
    };

    const maxLabel = document.createElement('span');
    maxLabel.textContent = `/ ${max}`;
    maxLabel.style.cssText = `
      color: #888;
      font-size: 12px;
    `;

    inputContainer.appendChild(input);
    inputContainer.appendChild(maxLabel);
    container.appendChild(labelEl);
    container.appendChild(inputContainer);

    return container;
  }

  private createCheckbox(label: string, onChange: (checked: boolean) => void): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.style.cssText = `
      cursor: pointer;
    `;
    checkbox.onchange = () => onChange(checkbox.checked);

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.style.cssText = `
      color: #ccc;
      font-size: 13px;
      cursor: pointer;
    `;
    labelEl.onclick = () => {
      checkbox.checked = !checkbox.checked;
      onChange(checkbox.checked);
    };

    container.appendChild(checkbox);
    container.appendChild(labelEl);

    return container;
  }

  private getCivName(civId: string): string {
    const civNames: Record<string, string> = {
      rome: 'Rome',
      egypt: 'Egypt',
      greece: 'Greece',
      persia: 'Persia',
      china: 'China',
      mongols: 'Mongols',
      arabia: 'Arabia',
      vikings: 'Vikings'
    };
    return civNames[civId] || civId;
  }
}
