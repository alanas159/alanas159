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

    // Draw a more detailed character
    // Body
    graphics.fillStyle(0x4444ff);
    graphics.fillCircle(16, 18, 10);

    // Head
    graphics.fillStyle(0xffcc99);
    graphics.fillCircle(16, 10, 6);

    // Sword
    graphics.fillStyle(0xcccccc);
    graphics.fillRect(22, 14, 8, 2);
    graphics.fillStyle(0x8b4513);
    graphics.fillRect(22, 13, 3, 4);

    // Legs
    graphics.fillStyle(0x2222aa);
    graphics.fillRect(12, 26, 3, 6);
    graphics.fillRect(17, 26, 3, 6);

    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  private createZombieGraphic(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Draw an enhanced zombie
    // Body
    graphics.fillStyle(0x88aa88);
    graphics.fillCircle(16, 18, 10);

    // Head (tilted)
    graphics.fillStyle(0x779977);
    graphics.fillCircle(14, 10, 6);

    // Torn clothes
    graphics.fillStyle(0x666644);
    graphics.fillRect(10, 16, 12, 10);

    // Eyes (red)
    graphics.fillStyle(0xff0000);
    graphics.fillCircle(12, 9, 2);
    graphics.fillCircle(16, 10, 2);

    // Arms reaching
    graphics.fillStyle(0x779977);
    graphics.fillRect(6, 18, 4, 8);
    graphics.fillRect(22, 18, 4, 8);

    graphics.generateTexture('zombie', 32, 32);
    graphics.destroy();
  }

  private createTileGraphics(): void {
    // Enhanced grass tile with variation
    const grass = this.make.graphics({ x: 0, y: 0 });
    grass.fillStyle(0x4a7c4e);
    grass.fillRect(0, 0, 32, 32);

    // Add grass detail
    grass.fillStyle(0x5a8c5e);
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 32;
      const y = Math.random() * 32;
      grass.fillRect(x, y, 2, 4);
    }

    grass.fillStyle(0x3a6c3e);
    grass.fillRect(0, 0, 16, 16);
    grass.fillRect(16, 16, 16, 16);
    grass.generateTexture('grass', 32, 32);
    grass.destroy();

    // Enhanced dirt tile
    const dirt = this.make.graphics({ x: 0, y: 0 });
    dirt.fillStyle(0x8b7355);
    dirt.fillRect(0, 0, 32, 32);

    // Add dirt detail
    dirt.fillStyle(0x7b6345);
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 32;
      const y = Math.random() * 32;
      dirt.fillCircle(x, y, 2);
    }

    dirt.generateTexture('dirt', 32, 32);
    dirt.destroy();

    // Wall placeholder with depth
    const wall = this.make.graphics({ x: 0, y: 0 });
    wall.fillStyle(0x654321);
    wall.fillRect(0, 0, 32, 32);
    wall.fillStyle(0x543210);
    wall.fillRect(2, 2, 28, 28);
    wall.fillStyle(0x765432);
    wall.fillRect(4, 4, 24, 24);
    wall.generateTexture('wall', 32, 32);
    wall.destroy();
  }
}
