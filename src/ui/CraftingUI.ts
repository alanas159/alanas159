import Phaser from 'phaser';
import { CraftingSystem, BuildingRecipe, ItemRecipe } from '../systems/CraftingSystem';
import { ResourceManager } from '../systems/ResourceManager';
import { Player } from '../entities/Player';
import { Weapon, WeaponType } from '../items/Weapon';
import { ResourceType } from '../config/GameConfig';

export class CraftingUI {
  private scene: Phaser.Scene;
  private craftingSystem: CraftingSystem;
  private resourceManager: ResourceManager;
  private player: Player;
  private container?: Phaser.GameObjects.Container;
  private isVisible: boolean = false;

  constructor(
    scene: Phaser.Scene,
    craftingSystem: CraftingSystem,
    resourceManager: ResourceManager,
    player: Player
  ) {
    this.scene = scene;
    this.craftingSystem = craftingSystem;
    this.resourceManager = resourceManager;
    this.player = player;
  }

  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show(): void {
    if (this.isVisible) return;

    this.isVisible = true;
    this.createUI();
  }

  hide(): void {
    if (!this.isVisible) return;

    this.isVisible = false;
    if (this.container) {
      this.container.destroy();
      this.container = undefined;
    }
  }

  private createUI(): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(3000);
    this.container.setScrollFactor(0);

    // Background overlay
    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0, 0);
    this.container.add(overlay);

    // Main panel
    const panelWidth = width * 0.8;
    const panelHeight = height * 0.7;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    const panel = this.scene.add.rectangle(
      panelX,
      panelY,
      panelWidth,
      panelHeight,
      0x2a2a2a,
      0.95
    );
    panel.setOrigin(0, 0);
    panel.setStrokeStyle(3, 0x8b7355);
    this.container.add(panel);

    // Title
    const title = this.scene.add.text(
      width / 2,
      panelY + 20,
      'CRAFTING',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    title.setOrigin(0.5, 0);
    this.container.add(title);

    // Tabs
    this.createTabs(panelX, panelY + 70, panelWidth);

    // Close button
    const closeBtn = this.scene.add.text(
      panelX + panelWidth - 40,
      panelY + 20,
      'X',
      {
        fontSize: '32px',
        color: '#ff0000',
        fontStyle: 'bold'
      }
    );
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hide());
    this.container.add(closeBtn);

    // Make overlay clickable to close
    overlay.setInteractive();
    overlay.on('pointerdown', () => this.hide());
  }

  private createTabs(x: number, y: number, width: number): void {
    const tabWidth = width / 2 - 20;

    // Weapons tab
    const weaponsTab = this.createTab(x + 10, y, tabWidth, 'WEAPONS', () => {
      this.showWeaponRecipes(x + 10, y + 60, width - 20);
    });
    this.container!.add(weaponsTab);

    // Buildings tab
    const buildingsTab = this.createTab(x + width / 2 + 10, y, tabWidth, 'BUILDINGS', () => {
      this.showBuildingRecipes(x + 10, y + 60, width - 20);
    });
    this.container!.add(buildingsTab);

    // Show weapons by default
    this.showWeaponRecipes(x + 10, y + 60, width - 20);
  }

  private createTab(
    x: number,
    y: number,
    width: number,
    label: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.rectangle(0, 0, width, 40, 0x4a4a4a);
    bg.setOrigin(0, 0);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', onClick);

    const text = this.scene.add.text(width / 2, 20, label, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);

    container.add([bg, text]);
    return container;
  }

  private showWeaponRecipes(x: number, y: number, width: number): void {
    // Clear existing recipe list
    this.clearRecipeList();

    const recipes = this.craftingSystem.getAvailableWeaponRecipes();
    this.displayRecipes(x, y, width, recipes, 'weapon');
  }

  private showBuildingRecipes(x: number, y: number, width: number): void {
    // Clear existing recipe list
    this.clearRecipeList();

    const recipes = this.craftingSystem.getAvailableBuildingRecipes();
    this.displayRecipes(x, y, width, recipes, 'building');
  }

  private clearRecipeList(): void {
    if (this.container) {
      const children = this.container.list.slice();
      children.forEach((child: any) => {
        if (child.getData && child.getData('recipeItem')) {
          child.destroy();
        }
      });
    }
  }

  private displayRecipes(
    x: number,
    y: number,
    width: number,
    recipes: (BuildingRecipe | ItemRecipe)[],
    type: 'weapon' | 'building'
  ): void {
    const itemHeight = 80;
    let currentY = y;

    recipes.forEach((recipe, index) => {
      if (index >= 6) return; // Limit to 6 items for now

      const item = this.createRecipeItem(x, currentY, width, recipe, type);
      item.setData('recipeItem', true);
      this.container!.add(item);

      currentY += itemHeight + 10;
    });
  }

  private createRecipeItem(
    x: number,
    y: number,
    width: number,
    recipe: BuildingRecipe | ItemRecipe,
    type: 'weapon' | 'building'
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // Background
    const bg = this.scene.add.rectangle(0, 0, width, 70, 0x3a3a3a);
    bg.setOrigin(0, 0);

    // Name
    const name = this.scene.add.text(10, 10, recipe.name, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // Description
    const desc = this.scene.add.text(10, 35, recipe.description, {
      fontSize: '14px',
      color: '#aaaaaa'
    });

    // Cost
    const costText = this.getCostText(recipe.cost);
    const cost = this.scene.add.text(10, 52, `Cost: ${costText}`, {
      fontSize: '14px',
      color: '#ffdd00'
    });

    // Craft button
    const canCraft = this.resourceManager.canAfford(recipe.cost);
    const btnColor = canCraft ? 0x00aa00 : 0x666666;
    const craftBtn = this.scene.add.rectangle(width - 80, 35, 70, 30, btnColor);
    craftBtn.setOrigin(0, 0.5);

    const btnText = this.scene.add.text(width - 45, 35, 'CRAFT', {
      fontSize: '16px',
      color: '#ffffff'
    });
    btnText.setOrigin(0.5);

    if (canCraft) {
      craftBtn.setInteractive({ useHandCursor: true });
      craftBtn.on('pointerdown', () => {
        this.craftItem(recipe, type);
      });
    }

    container.add([bg, name, desc, cost, craftBtn, btnText]);
    return container;
  }

  private getCostText(cost: any): string {
    const parts: string[] = [];
    for (const [resource, amount] of Object.entries(cost)) {
      const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
      parts.push(`${amount} ${resourceName}`);
    }
    return parts.join(', ');
  }

  private craftItem(recipe: BuildingRecipe | ItemRecipe, type: 'weapon' | 'building'): void {
    if (!this.resourceManager.spend(recipe.cost)) {
      return;
    }

    if (type === 'weapon') {
      // Create weapon and add to inventory
      const weaponType = this.getWeaponType(recipe.id);
      const weapon = new Weapon(weaponType);
      this.player.getInventory().addWeapon(weapon);

      this.scene.events.emit('itemCrafted', recipe.name);
    } else {
      // Emit event to enter building placement mode
      this.scene.events.emit('buildingCrafted', (recipe as BuildingRecipe).type);
      this.hide();
    }

    // Refresh the UI
    this.hide();
    this.show();
  }

  private getWeaponType(recipeId: string): WeaponType {
    const mapping: Record<string, WeaponType> = {
      'wooden_club': WeaponType.WOODEN_CLUB,
      'wooden_spear': WeaponType.WOODEN_SPEAR,
      'stone_axe': WeaponType.STONE_AXE,
      'iron_sword': WeaponType.IRON_SWORD,
      'iron_axe': WeaponType.IRON_AXE,
      'steel_longsword': WeaponType.STEEL_LONGSWORD,
      'battle_axe': WeaponType.BATTLE_AXE
    };
    return mapping[recipeId] || WeaponType.FISTS;
  }

  isShowing(): boolean {
    return this.isVisible;
  }

  destroy(): void {
    this.hide();
  }
}
