import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { ResourceManager } from '../systems/ResourceManager';
import { DayNightSystem, TimeOfDay } from '../systems/DayNightSystem';
import { CraftingSystem } from '../systems/CraftingSystem';
import { ZombieSpawner } from '../managers/ZombieSpawner';
import { BuildingManager } from '../managers/BuildingManager';
import { GameUI } from '../ui/GameUI';
import { CraftingUI } from '../ui/CraftingUI';
import { WorldObject, WorldObjectType } from '../world/WorldObject';
import { TILE_SIZE, HORDE_INTERVAL, ResourceType, BuildingType } from '../config/GameConfig';
import { Zombie } from '../entities/Zombie';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private resourceManager!: ResourceManager;
  private dayNightSystem!: DayNightSystem;
  private craftingSystem!: CraftingSystem;
  private zombieSpawner!: ZombieSpawner;
  private buildingManager!: BuildingManager;
  private gameUI!: GameUI;
  private craftingUI!: CraftingUI;

  private worldObjects!: Phaser.GameObjects.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: any;

  private joystickBase?: Phaser.GameObjects.Circle;
  private joystickThumb?: Phaser.GameObjects.Circle;
  private joystickData: { x: number; y: number } = { x: 0, y: 0 };
  private isUsingTouch: boolean = false;

  // Interaction
  private nearestWorldObject?: WorldObject;
  private nearestZombie?: Zombie;

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

    // Initialize managers
    this.buildingManager = new BuildingManager(this, this.player);

    // Initialize day/night system
    this.dayNightSystem = new DayNightSystem(this);
    this.setupDayNightCallbacks();

    // Create zombie spawner
    this.zombieSpawner = new ZombieSpawner(this, this.player);

    // Setup collisions
    this.setupCollisions();

    // Create UI
    this.gameUI = new GameUI(this, this.player, this.resourceManager);
    this.craftingUI = new CraftingUI(
      this,
      this.craftingSystem,
      this.resourceManager,
      this.player
    );

    // Setup controls
    this.setupControls();

    // Setup camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);

    // Setup event listeners
    this.setupEventListeners();

    // Spawn world objects
    this.spawnWorldObjects();

    // Show welcome message
    this.gameUI.showMessage('Dark Ages: Survival\nPress C to craft, E to gather', 4000);
  }

  private createWorld(): void {
    // Create a larger procedurally generated world
    const mapWidth = 100;
    const mapHeight = 100;

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tileX = x * TILE_SIZE;
        const tileY = y * TILE_SIZE;

        // Create varied terrain
        const noise = Math.random();
        const texture = noise > 0.3 ? 'grass' : 'dirt';

        const tile = this.add.image(tileX, tileY, texture);
        tile.setOrigin(0, 0);
        tile.setDepth(0);
      }
    }

    // Set world bounds
    this.physics.world.setBounds(0, 0, mapWidth * TILE_SIZE, mapHeight * TILE_SIZE);

    // Create world objects group
    this.worldObjects = this.add.group({
      classType: WorldObject
    });
  }

  private spawnWorldObjects(): void {
    const objectCounts = {
      [WorldObjectType.TREE]: 50,
      [WorldObjectType.ROCK]: 30,
      [WorldObjectType.IRON_DEPOSIT]: 15,
      [WorldObjectType.BERRY_BUSH]: 25,
      [WorldObjectType.WATER_SOURCE]: 10
    };

    const mapWidth = 100 * TILE_SIZE;
    const mapHeight = 100 * TILE_SIZE;

    for (const [type, count] of Object.entries(objectCounts)) {
      for (let i = 0; i < count; i++) {
        const x = Phaser.Math.Between(100, mapWidth - 100);
        const y = Phaser.Math.Between(100, mapHeight - 100);

        const obj = new WorldObject(this, x, y, type as WorldObjectType);
        this.worldObjects.add(obj);
        this.physics.add.existing(obj, true);
      }
    }
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
    // Player vs zombies - handled in update
    this.physics.add.overlap(
      this.player,
      this.zombieSpawner.getZombies(),
      () => {}
    );

    // Player vs buildings
    this.physics.add.collider(
      this.player,
      this.buildingManager.getBuildings(),
      (player, building: any) => {
        if (!building.canWalkThrough()) {
          // Collision handled by physics
        }
      }
    );

    // Zombies vs buildings
    this.physics.add.collider(
      this.zombieSpawner.getZombies(),
      this.buildingManager.getBuildings(),
      (zombie: any, building: any) => {
        if (!building.canWalkThrough() && zombie instanceof Zombie) {
          // Zombies attack buildings
          zombie.setVelocity(0, 0);
          building.takeDamage(0.5);
        }
      }
    );
  }

  private setupControls(): void {
    // Keyboard controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys({
      C: Phaser.Input.Keyboard.KeyCodes.C,
      E: Phaser.Input.Keyboard.KeyCodes.E,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
      ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
      I: Phaser.Input.Keyboard.KeyCodes.I
    });

    // Touch/mobile controls
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);

    // Create virtual joystick
    this.createVirtualJoystick();

    // Create action buttons
    this.createActionButtons();
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

  private createActionButtons(): void {
    const buttonSize = 60;
    const x = this.scale.width - 80;
    const y = this.scale.height - 80;

    // Attack button
    const attackBtn = this.add.circle(x, y, buttonSize, 0xff0000, 0.6);
    attackBtn.setScrollFactor(0);
    attackBtn.setDepth(2500);
    attackBtn.setInteractive();
    attackBtn.on('pointerdown', () => {
      this.handleAttack();
    });

    const attackText = this.add.text(x, y, 'ATK', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    attackText.setOrigin(0.5);
    attackText.setScrollFactor(0);
    attackText.setDepth(2501);

    // Gather button
    const gatherBtn = this.add.circle(x - 80, y, buttonSize, 0x00aa00, 0.6);
    gatherBtn.setScrollFactor(0);
    gatherBtn.setDepth(2500);
    gatherBtn.setInteractive();
    gatherBtn.on('pointerdown', () => {
      this.handleGather();
    });

    const gatherText = this.add.text(x - 80, y, 'E', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    gatherText.setOrigin(0.5);
    gatherText.setScrollFactor(0);
    gatherText.setDepth(2501);

    // Craft button
    const craftBtn = this.add.circle(x, y - 80, buttonSize, 0x0000ff, 0.6);
    craftBtn.setScrollFactor(0);
    craftBtn.setDepth(2500);
    craftBtn.setInteractive();
    craftBtn.on('pointerdown', () => {
      this.craftingUI.toggle();
    });

    const craftText = this.add.text(x, y - 80, 'C', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    craftText.setOrigin(0.5);
    craftText.setScrollFactor(0);
    craftText.setDepth(2501);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    // Handle building placement
    if (this.buildingManager.isInPlacementMode()) {
      this.buildingManager.tryPlaceBuilding(pointer);
      return;
    }

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

    this.events.on('buildingCrafted', (buildingType: BuildingType) => {
      this.buildingManager.enterPlacementMode(buildingType);
      this.gameUI.showMessage('Click to place building. ESC to cancel.', 2000);
    });

    this.events.on('buildingPlaced', (buildingType: BuildingType) => {
      this.gameUI.showMessage('Building placed!', 1000);
    });

    this.events.on('itemCrafted', (itemName: string) => {
      this.gameUI.showMessage(`Crafted: ${itemName}`, 1500);
    });

    this.events.on('weaponBroken', (weapon: any) => {
      this.gameUI.showMessage('Your weapon broke!', 2000);
    });
  }

  update(time: number, delta: number): void {
    // Update player
    this.handlePlayerMovement();
    this.player.update(time, delta);

    // Update systems
    this.dayNightSystem.update(delta);
    this.zombieSpawner.update(
      time,
      delta,
      this.dayNightSystem.getCurrentDay(),
      this.dayNightSystem.getTimeOfDay()
    );

    // Update building manager
    this.buildingManager.update(this.input.activePointer, this.zombieSpawner.getZombies());

    // Update UI
    this.gameUI.update(
      this.dayNightSystem.getCurrentDay(),
      this.dayNightSystem.getTimeOfDay(),
      this.dayNightSystem.getTimeRemaining()
    );

    // Handle keyboard input
    this.handleKeyboardInput();

    // Find nearest interactable
    this.findNearestInteractable();
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

  private handleKeyboardInput(): void {
    // Crafting menu
    if (Phaser.Input.Keyboard.JustDown(this.keys.C)) {
      this.craftingUI.toggle();
    }

    // Gather
    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
      this.handleGather();
    }

    // Attack
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
      this.handleAttack();
    }

    // Cancel placement
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      if (this.buildingManager.isInPlacementMode()) {
        this.buildingManager.exitPlacementMode();
        this.gameUI.showMessage('Placement cancelled', 1000);
      } else if (this.craftingUI.isShowing()) {
        this.craftingUI.hide();
      }
    }
  }

  private findNearestInteractable(): void {
    // Find nearest world object
    let nearestObj: WorldObject | undefined;
    let minDist = 100;

    this.worldObjects.children.each((obj) => {
      if (obj instanceof WorldObject && !obj.isDone()) {
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          obj.x,
          obj.y
        );

        if (dist < minDist) {
          minDist = dist;
          nearestObj = obj;
        }
      }
      return true;
    });

    this.nearestWorldObject = nearestObj;

    // Find nearest zombie for combat
    let nearestZomb: Zombie | undefined;
    let minZombDist = this.player.getAttackRange();

    this.zombieSpawner.getZombies().children.each((zombie) => {
      if (zombie instanceof Zombie) {
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          zombie.x,
          zombie.y
        );

        if (dist < minZombDist) {
          minZombDist = dist;
          nearestZomb = zombie;
        }
      }
      return true;
    });

    this.nearestZombie = nearestZomb;
  }

  private handleGather(): void {
    if (this.nearestWorldObject) {
      const harvested = this.nearestWorldObject.harvest(this.player.getInventory());
      if (harvested) {
        const resourceType = this.nearestWorldObject.getResourceType();
        const amount = this.nearestWorldObject.getObjectType();

        // Sync inventory resources to resource manager
        this.syncInventoryToResources();

        this.gameUI.showMessage(`Gathered ${resourceType}!`, 1000);
      }
    }
  }

  private syncInventoryToResources(): void {
    // Sync inventory resources to resource manager for crafting
    const inventory = this.player.getInventory();
    Object.values(ResourceType).forEach((resourceType) => {
      const count = inventory.getResourceCount(resourceType);
      const currentCount = this.resourceManager.getResource(resourceType);

      if (count > currentCount) {
        this.resourceManager.addResource(resourceType, count - currentCount);
      }
    });
  }

  private handleAttack(): void {
    if (this.nearestZombie && this.player.canAttack()) {
      if (this.player.attack(this.nearestZombie)) {
        this.nearestZombie.takeDamage(this.player.getAttackDamage());
      }
    }
  }
}
