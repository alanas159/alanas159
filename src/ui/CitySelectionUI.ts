import { City, Player } from '../types';
import { soundManager } from '../core/SoundManager';

export class CitySelectionUI {
  /**
   * Show city selection dialog
   * @param cities - List of cities to choose from
   * @param title - Dialog title
   * @param description - Description text
   * @param callback - Callback with selected city
   */
  show(
    cities: City[],
    title: string,
    description: string,
    callback: (city: City | null) => void
  ): void {
    soundManager.click();

    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
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
      border: 2px solid #d4af37;
      border-radius: 12px;
      padding: 24px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(212, 175, 55, 0.3);
    `;

    // Title
    const titleEl = document.createElement('h2');
    titleEl.textContent = title;
    titleEl.style.cssText = `
      color: #d4af37;
      font-size: 24px;
      margin: 0 0 12px 0;
      text-align: center;
      font-family: Georgia, serif;
    `;

    // Description
    const descEl = document.createElement('p');
    descEl.textContent = description;
    descEl.style.cssText = `
      color: #e0e0e0;
      font-size: 14px;
      margin: 0 0 20px 0;
      text-align: center;
    `;

    // Cities container
    const citiesContainer = document.createElement('div');
    citiesContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    `;

    // Add city cards
    cities.forEach(city => {
      const card = this.createCityCard(city, () => {
        soundManager.click();
        document.body.removeChild(backdrop);
        callback(city);
      });
      citiesContainer.appendChild(card);
    });

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = `
      background: linear-gradient(135deg, #555 0%, #333 100%);
      color: white;
      border: 2px solid #666;
      border-radius: 6px;
      padding: 10px 24px;
      font-size: 16px;
      cursor: pointer;
      width: 100%;
      transition: all 0.2s;
    `;
    cancelBtn.onmouseover = () => {
      soundManager.hover();
      cancelBtn.style.background = 'linear-gradient(135deg, #666 0%, #444 100%)';
      cancelBtn.style.transform = 'scale(1.02)';
    };
    cancelBtn.onmouseout = () => {
      cancelBtn.style.background = 'linear-gradient(135deg, #555 0%, #333 100%)';
      cancelBtn.style.transform = 'scale(1)';
    };
    cancelBtn.onclick = () => {
      soundManager.click();
      document.body.removeChild(backdrop);
      callback(null);
    };

    // Assemble modal
    modal.appendChild(titleEl);
    modal.appendChild(descEl);
    modal.appendChild(citiesContainer);
    modal.appendChild(cancelBtn);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Close on ESC
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.body.removeChild(backdrop);
        callback(null);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Close on backdrop click
    backdrop.onclick = (e) => {
      if (e.target === backdrop) {
        soundManager.click();
        document.body.removeChild(backdrop);
        callback(null);
      }
    };
  }

  private createCityCard(city: City, onClick: () => void): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = `
      background: linear-gradient(135deg, #2a2a3e 0%, #1f1f2e 100%);
      border: 2px solid #444;
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;
    `;

    // Hover effects
    card.onmouseover = () => {
      soundManager.hover();
      card.style.border = '2px solid #d4af37';
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = '0 4px 16px rgba(212, 175, 55, 0.3)';
    };
    card.onmouseout = () => {
      card.style.border = '2px solid #444';
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'none';
    };
    card.onclick = onClick;

    // City name
    const name = document.createElement('div');
    name.textContent = city.name;
    name.style.cssText = `
      color: #d4af37;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 8px;
      font-family: Georgia, serif;
    `;
    if (city.isCapital) {
      name.textContent += ' ⭐';
    }

    // Population
    const population = document.createElement('div');
    population.textContent = `👥 Population: ${city.population}`;
    population.style.cssText = `
      color: #aaa;
      font-size: 13px;
      margin-bottom: 6px;
    `;

    // Production
    const production = document.createElement('div');
    const prodValues = [
      `🌾 ${city.production.food || 0}`,
      `⚙️ ${city.production.production || 0}`,
      `💰 ${city.production.gold || 0}`,
      `🔬 ${city.production.science || 0}`,
      `🎨 ${city.production.culture || 0}`
    ];
    production.textContent = prodValues.join('  ');
    production.style.cssText = `
      color: #aaa;
      font-size: 12px;
      margin-bottom: 6px;
    `;

    // Buildings count
    const buildings = document.createElement('div');
    buildings.textContent = `🏛️ Buildings: ${city.buildings.length}`;
    buildings.style.cssText = `
      color: #aaa;
      font-size: 12px;
    `;

    // Assemble card
    card.appendChild(name);
    card.appendChild(population);
    card.appendChild(production);
    card.appendChild(buildings);

    return card;
  }
}
