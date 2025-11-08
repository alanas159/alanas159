import Phaser from 'phaser';
import { Zombie } from '../entities/Zombie';
import { Player } from '../entities/Player';
import { ZombieType, BASE_ZOMBIE_COUNT, ZOMBIE_SCALING, HORDE_INTERVAL } from '../config/GameConfig';
import { TimeOfDay } from '../systems/DayNightSystem';

export class ZombieSpawner {
  private scene: Phaser.Scene;
  private zombies: Phaser.GameObjects.Group;
  private player: Player;
  private spawnTimer: number = 0;
  private readonly SPAWN_INTERVAL = 5000; // 5 seconds
  private readonly SPAWN_DISTANCE = 400; // Spawn this far from player
  private currentDay: number = 1;
  private isHordeActive: boolean = false;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.zombies = scene.add.group({
      classType: Zombie,
      runChildUpdate: true
    });
  }

  update(time: number, delta: number, currentDay: number, timeOfDay: TimeOfDay): void {
    this.currentDay = currentDay;
    this.spawnTimer += delta;

    // Regular spawning (when not in horde mode)
    if (!this.isHordeActive && this.spawnTimer >= this.SPAWN_INTERVAL) {
      this.spawnTimer = 0;
      const count = timeOfDay === TimeOfDay.NIGHT ? 2 : 1;
      for (let i = 0; i < count; i++) {
        this.spawnRandomZombie(timeOfDay);
      }
    }

    // Update all zombies
    this.zombies.children.each((zombie) => {
      if (zombie instanceof Zombie) {
        // Modify speed based on time of day
        const speedMultiplier = timeOfDay === TimeOfDay.NIGHT ? 1.5 : 1.0;
        zombie.modifySpeed(speedMultiplier);
      }
      return true;
    });
  }

  spawnRandomZombie(timeOfDay: TimeOfDay): Zombie {
    const spawnPos = this.getRandomSpawnPosition();
    const type = this.getRandomZombieType(timeOfDay);

    const zombie = new Zombie(this.scene, spawnPos.x, spawnPos.y, type);
    zombie.setTarget(this.player);
    this.zombies.add(zombie);

    return zombie;
  }

  private getRandomSpawnPosition(): { x: number; y: number } {
    const angle = Math.random() * Math.PI * 2;
    return {
      x: this.player.x + Math.cos(angle) * this.SPAWN_DISTANCE,
      y: this.player.y + Math.sin(angle) * this.SPAWN_DISTANCE
    };
  }

  private getRandomZombieType(timeOfDay: TimeOfDay): ZombieType {
    // Higher chance of dangerous zombies at night and on later days
    const dangerLevel = this.currentDay / 10 + (timeOfDay === TimeOfDay.NIGHT ? 0.3 : 0);
    const roll = Math.random();

    if (roll < 0.6 - dangerLevel) {
      return ZombieType.WALKER;
    } else if (roll < 0.85 - dangerLevel / 2) {
      return ZombieType.RUNNER;
    } else if (roll < 0.95) {
      return ZombieType.KNIGHT;
    } else {
      return ZombieType.PLAGUE_BEARER;
    }
  }

  triggerHorde(day: number): void {
    this.isHordeActive = true;
    const hordeNumber = Math.floor(day / HORDE_INTERVAL);
    const zombieCount = Math.floor(BASE_ZOMBIE_COUNT * Math.pow(ZOMBIE_SCALING, hordeNumber));

    // Spawn zombies in waves
    let spawned = 0;
    const waveInterval = this.scene.time.addEvent({
      delay: 500,
      repeat: zombieCount - 1,
      callback: () => {
        this.spawnRandomZombie(TimeOfDay.NIGHT);
        spawned++;

        if (spawned >= zombieCount) {
          this.isHordeActive = false;
        }
      }
    });

    this.scene.events.emit('hordeStarted', hordeNumber, zombieCount);
  }

  getZombies(): Phaser.GameObjects.Group {
    return this.zombies;
  }

  getZombieCount(): number {
    return this.zombies.getLength();
  }

  clearAllZombies(): void {
    this.zombies.clear(true, true);
  }
}
