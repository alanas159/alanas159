import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Create placeholder graphics for player and zombies
    this.createPlayerGraphic();
    this.createZombieGraphic();
    this.createTileGraphics();

    // Show loading text
    const loadingText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      'Loading Dark Ages: Survival...',
      {
        fontSize: '24px',
        color: '#ffffff'
      }
    );
    loadingText.setOrigin(0.5);
  }

  create(): void {
    // Start the main game scene
    this.scene.start('GameScene');
  }

  private createPlayerGraphic(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Draw a simple character (circle with a sword)
    graphics.fillStyle(0x4444ff); // Blue for player
    graphics.fillCircle(16, 16, 12);

    // Sword
    graphics.fillStyle(0xcccccc);
    graphics.fillRect(20, 10, 8, 2);

    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  private createZombieGraphic(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Draw a simple zombie (circle with darker color)
    graphics.fillStyle(0x88aa88); // Green for zombie
    graphics.fillCircle(16, 16, 12);

    // Eyes
    graphics.fillStyle(0xff0000);
    graphics.fillCircle(12, 14, 2);
    graphics.fillCircle(20, 14, 2);

    graphics.generateTexture('zombie', 32, 32);
    graphics.destroy();
  }

  private createTileGraphics(): void {
    // Grass tile
    const grass = this.make.graphics({ x: 0, y: 0 });
    grass.fillStyle(0x4a7c4e);
    grass.fillRect(0, 0, 32, 32);
    grass.fillStyle(0x3a6c3e);
    grass.fillRect(0, 0, 16, 16);
    grass.fillRect(16, 16, 16, 16);
    grass.generateTexture('grass', 32, 32);
    grass.destroy();

    // Dirt tile
    const dirt = this.make.graphics({ x: 0, y: 0 });
    dirt.fillStyle(0x8b7355);
    dirt.fillRect(0, 0, 32, 32);
    dirt.generateTexture('dirt', 32, 32);
    dirt.destroy();

    // Wall placeholder
    const wall = this.make.graphics({ x: 0, y: 0 });
    wall.fillStyle(0x654321);
    wall.fillRect(0, 0, 32, 32);
    wall.fillStyle(0x4d3319);
    wall.fillRect(2, 2, 28, 28);
    wall.generateTexture('wall', 32, 32);
    wall.destroy();
  }
}
