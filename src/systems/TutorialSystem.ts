import Phaser from 'phaser';

export interface TutorialStep {
  id: string;
  title: string;
  message: string;
  trigger: 'auto' | 'event';
  completed: boolean;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Dark Ages: Survival',
    message: 'The plague has turned the kingdom into a nightmare. You must survive!\n\nUse Arrow Keys or touch the bottom-left to move.',
    trigger: 'auto',
    completed: false
  },
  {
    id: 'gather',
    title: 'Gather Resources',
    message: 'Approach a tree or rock and press E (or tap the green button) to gather resources.\n\nYou need Wood and Stone to build defenses!',
    trigger: 'auto',
    completed: false
  },
  {
    id: 'combat',
    title: 'Combat',
    message: 'Zombies are coming! Press SPACE (or tap ATK button) when near a zombie to attack.\n\nManage your stamina - it regenerates over time.',
    trigger: 'event',
    completed: false
  },
  {
    id: 'crafting',
    title: 'Crafting',
    message: 'Press C (or tap the blue button) to open the Crafting menu.\n\nCraft weapons for better damage and buildings for defense!',
    trigger: 'auto',
    completed: false
  },
  {
    id: 'building',
    title: 'Build Defenses',
    message: 'After crafting a building, click anywhere to place it.\n\nBuild walls to protect yourself from zombie hordes!',
    trigger: 'event',
    completed: false
  },
  {
    id: 'daynight',
    title: 'Day & Night Cycle',
    message: 'Days last 7 minutes, nights last 3 minutes.\n\nZombies are FASTER and MORE AGGRESSIVE at night!',
    trigger: 'event',
    completed: false
  },
  {
    id: 'horde',
    title: 'Horde Events',
    message: 'Every 5 days, a massive zombie horde attacks!\n\nPrepare your defenses and weapons before the horde arrives.',
    trigger: 'event',
    completed: false
  }
];

export class TutorialSystem {
  private scene: Phaser.Scene;
  private steps: TutorialStep[];
  private currentStep: number = 0;
  private isActive: boolean = true;
  private container?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.steps = [...TUTORIAL_STEPS];

    // Check if tutorial was completed before
    const tutorialCompleted = localStorage.getItem('tutorial_completed');
    if (tutorialCompleted === 'true') {
      this.isActive = false;
    }
  }

  start(): void {
    if (!this.isActive) return;

    // Show first step after a short delay
    this.scene.time.delayedCall(2000, () => {
      this.showCurrentStep();
    });
  }

  private showCurrentStep(): void {
    if (this.currentStep >= this.steps.length) {
      this.complete();
      return;
    }

    const step = this.steps[this.currentStep];
    if (step.completed) {
      this.currentStep++;
      this.showCurrentStep();
      return;
    }

    this.displayStep(step);
  }

  private displayStep(step: TutorialStep): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    // Create container
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(5000);
    this.container.setScrollFactor(0);

    // Semi-transparent overlay
    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0, 0);
    overlay.setInteractive();
    this.container.add(overlay);

    // Tutorial box
    const boxWidth = width * 0.8;
    const boxHeight = 200;
    const boxX = (width - boxWidth) / 2;
    const boxY = height * 0.3;

    const box = this.scene.add.rectangle(boxX, boxY, boxWidth, boxHeight, 0x2a2a2a, 0.95);
    box.setOrigin(0, 0);
    box.setStrokeStyle(3, 0xffd700);
    this.container.add(box);

    // Title
    const title = this.scene.add.text(width / 2, boxY + 20, step.title, {
      fontSize: '24px',
      color: '#ffd700',
      fontStyle: 'bold',
      align: 'center'
    });
    title.setOrigin(0.5, 0);
    this.container.add(title);

    // Message
    const message = this.scene.add.text(width / 2, boxY + 60, step.message, {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: boxWidth - 40 }
    });
    message.setOrigin(0.5, 0);
    this.container.add(message);

    // Continue button
    const btnWidth = 120;
    const btnHeight = 40;
    const btnX = width / 2 - btnWidth / 2;
    const btnY = boxY + boxHeight - 60;

    const btn = this.scene.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0x00aa00);
    btn.setOrigin(0, 0);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => this.nextStep());

    const btnText = this.scene.add.text(width / 2, btnY + 20, 'Got it!', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    btnText.setOrigin(0.5);

    this.container.add([btn, btnText]);

    // Auto-advance after delay
    this.scene.time.delayedCall(15000, () => {
      if (this.container) {
        this.nextStep();
      }
    });
  }

  nextStep(): void {
    if (this.container) {
      this.container.destroy();
      this.container = undefined;
    }

    this.steps[this.currentStep].completed = true;
    this.currentStep++;

    // Wait before showing next step
    this.scene.time.delayedCall(5000, () => {
      this.showCurrentStep();
    });
  }

  trigger(eventId: string): void {
    if (!this.isActive) return;

    const step = this.steps.find(s => s.id === eventId && !s.completed);
    if (step && step.trigger === 'event') {
      const index = this.steps.indexOf(step);
      if (index >= this.currentStep) {
        this.currentStep = index;
        this.showCurrentStep();
      }
    }
  }

  skip(): void {
    if (this.container) {
      this.container.destroy();
    }
    this.complete();
  }

  private complete(): void {
    this.isActive = false;
    localStorage.setItem('tutorial_completed', 'true');
    this.scene.events.emit('tutorialComplete');
  }

  isCompleted(): boolean {
    return !this.isActive;
  }
}
