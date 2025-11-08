import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { ResourceManager, Resources } from '../systems/ResourceManager';
import { ResourceType } from '../config/GameConfig';
import { TimeOfDay } from '../systems/DayNightSystem';

export class GameUI {
  private scene: Phaser.Scene;
  private player: Player;
  private resourceManager: ResourceManager;

  // UI Elements
  private statusBar!: Phaser.GameObjects.Container;
  private healthBar!: Phaser.GameObjects.Graphics;
  private staminaBar!: Phaser.GameObjects.Graphics;
  private dayText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private resourceTexts: Map<ResourceType, Phaser.GameObjects.Text>;

  constructor(scene: Phaser.Scene, player: Player, resourceManager: ResourceManager) {
    this.scene = scene;
    this.player = player;
    this.resourceManager = resourceManager;
    this.resourceTexts = new Map();

    this.createUI();
  }

  private createUI(): void {
    const width = this.scene.scale.width;

    // Status bar container at top
    this.statusBar = this.scene.add.container(0, 0);
    this.statusBar.setDepth(2000);

    // Background for status bar
    const statusBg = this.scene.add.rectangle(0, 0, width, 120, 0x1a1a1a, 0.9);
    statusBg.setOrigin(0, 0);
    this.statusBar.add(statusBg);

    // Day and time display
    this.dayText = this.scene.add.text(20, 15, 'Day 1', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.statusBar.add(this.dayText);

    this.timeText = this.scene.add.text(20, 45, 'DAY', {
      fontSize: '18px',
      color: '#ffdd00'
    });
    this.statusBar.add(this.timeText);

    // Health bar
    const healthLabel = this.scene.add.text(180, 15, 'Health', {
      fontSize: '16px',
      color: '#ffffff'
    });
    this.statusBar.add(healthLabel);

    this.healthBar = this.scene.add.graphics();
    this.statusBar.add(this.healthBar);

    // Stamina bar
    const staminaLabel = this.scene.add.text(180, 50, 'Stamina', {
      fontSize: '16px',
      color: '#ffffff'
    });
    this.statusBar.add(staminaLabel);

    this.staminaBar = this.scene.add.graphics();
    this.statusBar.add(this.staminaBar);

    // Resources display
    const resources = [
      ResourceType.WOOD,
      ResourceType.STONE,
      ResourceType.IRON,
      ResourceType.FOOD
    ];

    resources.forEach((resource, index) => {
      const x = 450 + (index % 2) * 130;
      const y = 15 + Math.floor(index / 2) * 35;

      const icon = this.getResourceIcon(resource);
      const text = this.scene.add.text(x, y, `${icon} 0`, {
        fontSize: '18px',
        color: '#ffffff'
      });

      this.statusBar.add(text);
      this.resourceTexts.set(resource, text);
    });
  }

  private getResourceIcon(resource: ResourceType): string {
    const icons: Record<ResourceType, string> = {
      [ResourceType.WOOD]: '🪵',
      [ResourceType.STONE]: '🪨',
      [ResourceType.IRON]: '⛏️',
      [ResourceType.FOOD]: '🍖',
      [ResourceType.WATER]: '💧',
      [ResourceType.HERBS]: '🌿'
    };
    return icons[resource] || '?';
  }

  update(currentDay: number, timeOfDay: TimeOfDay, timeRemaining: number): void {
    // Update day
    this.dayText.setText(`Day ${currentDay}`);

    // Update time
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    const timeStr = timeOfDay === TimeOfDay.DAY ? 'DAY' : 'NIGHT';
    const color = timeOfDay === TimeOfDay.DAY ? '#ffdd00' : '#4444ff';
    this.timeText.setText(`${timeStr} ${minutes}:${seconds.toString().padStart(2, '0')}`);
    this.timeText.setColor(color);

    // Update health bar
    this.updateBar(
      this.healthBar,
      180, 35,
      this.player.getHealth(),
      this.player.getMaxHealth(),
      0x00ff00,
      0xff0000
    );

    // Update stamina bar
    this.updateBar(
      this.staminaBar,
      180, 70,
      this.player.getStamina(),
      this.player.getMaxStamina(),
      0x00ffff,
      0x0088ff
    );

    // Update resources
    const resources = this.resourceManager.getAllResources();
    this.resourceTexts.forEach((text, resourceType) => {
      const icon = this.getResourceIcon(resourceType);
      text.setText(`${icon} ${resources[resourceType]}`);
    });
  }

  private updateBar(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    current: number,
    max: number,
    colorFull: number,
    colorLow: number
  ): void {
    graphics.clear();

    const width = 200;
    const height = 16;
    const percentage = Math.max(0, Math.min(1, current / max));

    // Background
    graphics.fillStyle(0x333333);
    graphics.fillRect(x, y, width, height);

    // Foreground
    const color = percentage > 0.3 ? colorFull : colorLow;
    graphics.fillStyle(color);
    graphics.fillRect(x, y, width * percentage, height);

    // Border
    graphics.lineStyle(2, 0x000000);
    graphics.strokeRect(x, y, width, height);
  }

  showMessage(message: string, duration: number = 3000): void {
    const text = this.scene.add.text(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      message,
      {
        fontSize: '32px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }
    );
    text.setOrigin(0.5);
    text.setDepth(3000);

    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      y: text.y - 50,
      duration: duration,
      onComplete: () => {
        text.destroy();
      }
    });
  }

  destroy(): void {
    this.statusBar.destroy();
  }
}
