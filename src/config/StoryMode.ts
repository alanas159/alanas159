export interface StoryAct {
  actNumber: number;
  name: string;
  dayStart: number;
  dayEnd: number;
  description: string;
  objectives: StoryObjective[];
  unlocks?: string[];
}

export interface StoryObjective {
  id: string;
  description: string;
  type: 'survive' | 'build' | 'kill' | 'gather' | 'explore';
  target?: number;
  completed: boolean;
}

export const STORY_ACTS: StoryAct[] = [
  {
    actNumber: 1,
    name: 'The Outbreak',
    dayStart: 1,
    dayEnd: 10,
    description: 'The plague has just begun. Learn to survive and establish your first base.',
    objectives: [
      {
        id: 'survive_day_5',
        description: 'Survive until Day 5',
        type: 'survive',
        target: 5,
        completed: false
      },
      {
        id: 'gather_wood',
        description: 'Gather 50 Wood',
        type: 'gather',
        target: 50,
        completed: false
      },
      {
        id: 'craft_weapon',
        description: 'Craft your first weapon',
        type: 'build',
        completed: false
      },
      {
        id: 'build_wall',
        description: 'Build 5 Wooden Walls',
        type: 'build',
        target: 5,
        completed: false
      },
      {
        id: 'kill_zombies',
        description: 'Kill 20 zombies',
        type: 'kill',
        target: 20,
        completed: false
      }
    ],
    unlocks: ['wooden_spear', 'spike_pit']
  },
  {
    actNumber: 2,
    name: 'Expansion & Fortification',
    dayStart: 11,
    dayEnd: 25,
    description: 'Expand your territory and build proper defenses. The hordes grow stronger.',
    objectives: [
      {
        id: 'survive_day_20',
        description: 'Survive until Day 20',
        type: 'survive',
        target: 20,
        completed: false
      },
      {
        id: 'craft_iron_weapon',
        description: 'Craft an Iron weapon',
        type: 'build',
        completed: false
      },
      {
        id: 'build_stone_walls',
        description: 'Build 10 Stone Walls',
        type: 'build',
        target: 10,
        completed: false
      },
      {
        id: 'build_tower',
        description: 'Build an Archer Tower',
        type: 'build',
        completed: false
      },
      {
        id: 'survive_horde',
        description: 'Survive a Horde event',
        type: 'survive',
        completed: false
      },
      {
        id: 'kill_knights',
        description: 'Kill 10 Knight zombies',
        type: 'kill',
        target: 10,
        completed: false
      }
    ],
    unlocks: ['iron_sword', 'stone_wall', 'tower']
  },
  {
    actNumber: 3,
    name: 'The Reckoning',
    dayStart: 26,
    dayEnd: 40,
    description: 'Face the ultimate challenge. Defeat the plague or escape to safety.',
    objectives: [
      {
        id: 'survive_day_35',
        description: 'Survive until Day 35',
        type: 'survive',
        target: 35,
        completed: false
      },
      {
        id: 'craft_legendary',
        description: 'Craft a legendary weapon (Steel Longsword or Battle Axe)',
        type: 'build',
        completed: false
      },
      {
        id: 'defeat_boss',
        description: 'Defeat the Plague Lord',
        type: 'kill',
        completed: false
      },
      {
        id: 'massive_base',
        description: 'Build a base with 50+ structures',
        type: 'build',
        target: 50,
        completed: false
      },
      {
        id: 'final_stand',
        description: 'Survive Day 40 Horde',
        type: 'survive',
        completed: false
      }
    ],
    unlocks: ['steel_longsword', 'battle_axe']
  }
];

export class StoryManager {
  private currentAct: number = 1;
  private objectives: Map<string, boolean>;
  private statsTracking: {
    zombiesKilled: number;
    knightZombiesKilled: number;
    buildingsBuilt: number;
    wallsBuilt: number;
    stoneWallsBuilt: number;
    towersBuilt: number;
    hordesSurvived: number;
  };

  constructor() {
    this.objectives = new Map();
    this.statsTracking = {
      zombiesKilled: 0,
      knightZombiesKilled: 0,
      buildingsBuilt: 0,
      wallsBuilt: 0,
      stoneWallsBuilt: 0,
      towersBuilt: 0,
      hordesSurvived: 0
    };
  }

  getCurrentAct(): StoryAct {
    return STORY_ACTS[this.currentAct - 1];
  }

  updateProgress(day: number): void {
    const act = this.getCurrentAct();

    // Check if we should progress to next act
    if (day > act.dayEnd && this.currentAct < STORY_ACTS.length) {
      this.currentAct++;
    }
  }

  trackZombieKill(zombieType: string): void {
    this.statsTracking.zombiesKilled++;
    if (zombieType === 'knight') {
      this.statsTracking.knightZombiesKilled++;
    }
  }

  trackBuildingPlaced(buildingType: string): void {
    this.statsTracking.buildingsBuilt++;
    if (buildingType.includes('wall')) {
      this.statsTracking.wallsBuilt++;
    }
    if (buildingType === 'stone_wall') {
      this.statsTracking.stoneWallsBuilt++;
    }
    if (buildingType === 'tower') {
      this.statsTracking.towersBuilt++;
    }
  }

  trackHordeSurvived(): void {
    this.statsTracking.hordesSurvived++;
  }

  checkObjectiveCompletion(day: number, resourceCounts: any): string[] {
    const completed: string[] = [];
    const act = this.getCurrentAct();

    act.objectives.forEach(objective => {
      if (objective.completed) return;

      let isComplete = false;

      switch (objective.type) {
        case 'survive':
          if (objective.id.includes('horde')) {
            isComplete = this.statsTracking.hordesSurvived > 0;
          } else {
            isComplete = day >= (objective.target || 0);
          }
          break;

        case 'kill':
          if (objective.id.includes('knight')) {
            isComplete = this.statsTracking.knightZombiesKilled >= (objective.target || 0);
          } else {
            isComplete = this.statsTracking.zombiesKilled >= (objective.target || 0);
          }
          break;

        case 'build':
          if (objective.id.includes('wall')) {
            if (objective.id.includes('stone')) {
              isComplete = this.statsTracking.stoneWallsBuilt >= (objective.target || 1);
            } else {
              isComplete = this.statsTracking.wallsBuilt >= (objective.target || 1);
            }
          } else if (objective.id.includes('tower')) {
            isComplete = this.statsTracking.towersBuilt >= (objective.target || 1);
          } else {
            isComplete = this.statsTracking.buildingsBuilt >= (objective.target || 1);
          }
          break;

        case 'gather':
          if (objective.id.includes('wood')) {
            isComplete = (resourceCounts.wood || 0) >= (objective.target || 0);
          }
          break;
      }

      if (isComplete) {
        objective.completed = true;
        completed.push(objective.id);
      }
    });

    return completed;
  }

  getCompletionPercentage(): number {
    const act = this.getCurrentAct();
    const total = act.objectives.length;
    const completed = act.objectives.filter(o => o.completed).length;
    return Math.floor((completed / total) * 100);
  }

  isActComplete(): boolean {
    const act = this.getCurrentAct();
    return act.objectives.every(o => o.completed);
  }

  getStats() {
    return { ...this.statsTracking };
  }
}
