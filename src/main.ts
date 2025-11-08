import Phaser from 'phaser';
import { gameConfig } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

// Add scenes to the game config
const config: Phaser.Types.Core.GameConfig = {
  ...gameConfig,
  scene: [BootScene, GameScene]
};

// Create and start the game
const game = new Phaser.Game(config);

// Prevent default touch behaviors on mobile
document.addEventListener('touchmove', (e) => {
  e.preventDefault();
}, { passive: false });

// Export game instance for debugging
(window as any).game = game;

console.log('Dark Ages: Survival - Game initialized');
