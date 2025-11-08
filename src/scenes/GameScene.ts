import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { ResourceManager } from '../systems/ResourceManager';
import { DayNightSystem, TimeOfDay } from '../systems/DayNightSystem';
import { CraftingSystem } from '../systems/CraftingSystem';
import { ZombieSpawner } from '../managers/ZombieSpawner';
import { GameUI } from '../ui/GameUI';
import { TILE_SIZE, HORDE_INTERVAL, ResourceType } from '../config/GameConfig';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private resourceManager!: ResourceManager;
  private dayNightSystem!: DayNightSystem;
  private craftingSystem!: CraftingSystem;
  private zombieSpawner!: ZombieSpawner;
  private gameUI!: GameUI;

  private map!: Phaser.Tilemaps.Tilemap;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private joystickBase?: Phaser.GameObjects.Circle;
  private joystickThumb?: Phaser.GameObjects.Circle;
  private joystickData: { x: number; y: number } = { x: 0, y: 0 };
  private isUsingTouch: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Initialize systems
    this.resourceManager = new ResourceManager();
    this.craftingSystem = new CraftingSystem();

    // Create the world
    this.createWorld();

    // Create player
    this.player = new Player(this, 400, 640);

    // Initialize day/night system
    this.dayNightSystem = new DayNightSystem(this);
    this.setupDayNightCallbacks();

    // Create zombie spawner
    this.zombieSpawner = new ZombieSpawner(this, this.player);

    // Setup collisions
    this.setupCollisions();

    // Create UI
    this.gameUI = new GameUI(this, this.player, this.resourceManager);

    // Setup controls
    this.setupControls();

    // Setup camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);

    // Setup event listeners
    this.setupEventListeners();

    // Add some initial resources for testing
    this.resourceManager.addResource(ResourceType.WOOD, 50);
    this.resourceManager.addResource(ResourceType.STONE, 20);

    // Show welcome message
    this.gameUI.showMessage('Dark Ages: Survival\nSurvive the zombie apocalypse!', 4000);
  }

  private createWorld(): void {
    // Create a simple world with grass
    const mapWidth = 50;
    const mapHeight = 50;

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tileX = x * TILE_SIZE;
        const tileY = y * TILE_SIZE;

        // Alternate between grass patterns
        const tile = this.add.image(tileX, tileY, 'grass');
        tile.setOrigin(0, 0);
        tile.setDepth(0);
      }
    }

    // Set world bounds
    this.physics.world.setBounds(0, 0, mapWidth * TILE_SIZE, mapHeight * TILE_SIZE);
  }

  private setupDayNightCallbacks(): void {
    this.dayNightSystem.setDayChangeCallback((day: number) => {
      this.onDayChange(day);
    });

    this.dayNightSystem.setTimeChangeCallback((timeOfDay: TimeOfDay) => {
      this.onTimeChange(timeOfDay);
    });
  }

  private onDayChange(day: number): void {
    this.gameUI.showMessage(`Day ${day}`, 2000);

    // Check for horde
    if (day % HORDE_INTERVAL === 0 && day > 0) {
      this.gameUI.showMessage(`HORDE INCOMING!`, 3000);
      this.time.delayedCall(3000, () => {
        this.zombieSpawner.triggerHorde(day);
      });
    }

    // Unlock new recipes
    this.craftingSystem.updateUnlocks(day);
  }

  private onTimeChange(timeOfDay: TimeOfDay): void {
    if (timeOfDay === TimeOfDay.NIGHT) {
      this.gameUI.showMessage('Night falls... Zombies grow stronger!', 2000);
    } else {
      this.gameUI.showMessage('Dawn breaks. Time to gather resources.', 2000);
    }
  }

  private setupCollisions(): void {
    // Player vs zombies
    this.physics.add.overlap(
      this.player,
      this.zombieSpawner.getZombies(),
      () => {
        // Overlap handling is done in zombie update
      }
    );
  }

  private setupControls(): void {
    // Keyboard controls
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Touch/mobile controls
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);

    // Create virtual joystick
    this.createVirtualJoystick();
  }

  private createVirtualJoystick(): void {
    const baseSize = 80;
    const thumbSize = 40;
    const x = 100;
    const y = this.scale.height - 150;

    this.joystickBase = this.add.circle(x, y, baseSize, 0x888888, 0.3);
    this.joystickBase.setScrollFactor(0);
    this.joystickBase.setDepth(2500);
    this.joystickBase.setVisible(false);

    this.joystickThumb = this.add.circle(x, y, thumbSize, 0xffffff, 0.8);
    this.joystickThumb.setScrollFactor(0);
    this.joystickThumb.setDepth(2501);
    this.joystickThumb.setVisible(false);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    // Check if touch is in bottom-left (joystick area)
    if (pointer.y > this.scale.height - 300 && pointer.x < 200) {
      this.isUsingTouch = true;
      if (this.joystickBase && this.joystickThumb) {
        this.joystickBase.setPosition(pointer.x, pointer.y);
        this.joystickThumb.setPosition(pointer.x, pointer.y);
        this.joystickBase.setVisible(true);
        this.joystickThumb.setVisible(true);
      }
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.isUsingTouch && this.joystickBase && this.joystickThumb) {
      const distance = Phaser.Math.Distance.Between(
        this.joystickBase.x,
        this.joystickBase.y,
        pointer.x,
        pointer.y
      );

      const maxDistance = 60;
      const angle = Phaser.Math.Angle.Between(
        this.joystickBase.x,
        this.joystickBase.y,
        pointer.x,
        pointer.y
      );

      if (distance < maxDistance) {
        this.joystickThumb.setPosition(pointer.x, pointer.y);
        this.joystickData.x = (pointer.x - this.joystickBase.x) / maxDistance;
        this.joystickData.y = (pointer.y - this.joystickBase.y) / maxDistance;
      } else {
        this.joystickThumb.setPosition(
          this.joystickBase.x + Math.cos(angle) * maxDistance,
          this.joystickBase.y + Math.sin(angle) * maxDistance
        );
        this.joystickData.x = Math.cos(angle);
        this.joystickData.y = Math.sin(angle);
      }
    }
  }

  private onPointerUp(): void {
    this.isUsingTouch = false;
    this.joystickData = { x: 0, y: 0 };
    if (this.joystickBase && this.joystickThumb) {
      this.joystickBase.setVisible(false);
      this.joystickThumb.setVisible(false);
    }
  }

  private setupEventListeners(): void {
    this.events.on('playerDeath', () => {
      this.gameUI.showMessage('You have died...', 3000);
      this.time.delayedCall(3000, () => {
        this.scene.restart();
      });
    });

    this.events.on('hordeStarted', (hordeNumber: number, zombieCount: number) => {
      this.gameUI.showMessage(`HORDE ${hordeNumber}: ${zombieCount} zombies!`, 3000);
    });
  }

  update(time: number, delta: number): void {
    // Update player
    this.handlePlayerMovement();
    this.player.update();

    // Update systems
    this.dayNightSystem.update(delta);
    this.zombieSpawner.update(
      time,
      delta,
      this.dayNightSystem.getCurrentDay(),
      this.dayNightSystem.getTimeOfDay()
    );

    // Update UI
    this.gameUI.update(
      this.dayNightSystem.getCurrentDay(),
      this.dayNightSystem.getTimeOfDay(),
      this.dayNightSystem.getTimeRemaining()
    );
  }

  private handlePlayerMovement(): void {
    let moveX = 0;
    let moveY = 0;

    // Keyboard input
    if (this.cursors.left.isDown) moveX = -1;
    if (this.cursors.right.isDown) moveX = 1;
    if (this.cursors.up.isDown) moveY = -1;
    if (this.cursors.down.isDown) moveY = 1;

    // Touch input (overrides keyboard)
    if (this.isUsingTouch) {
      moveX = this.joystickData.x;
      moveY = this.joystickData.y;
    }

    // Apply movement
    if (moveX !== 0 || moveY !== 0) {
      const targetX = this.player.x + moveX * 100;
      const targetY = this.player.y + moveY * 100;
      this.player.moveToward(targetX, targetY);
    } else {
      this.player.stop();
    }
  }
}
