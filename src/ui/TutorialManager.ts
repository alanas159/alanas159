/**
 * TutorialManager - Manages the interactive tutorial for new players
 */

export interface TutorialStep {
  title: string;
  description: string;
  highlightElement?: string; // CSS selector for element to highlight
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

export class TutorialManager {
  private currentStep: number = 0;
  private isActive: boolean = false;
  private tutorialOverlay: HTMLElement;
  private tutorialContent: HTMLElement;
  private tutorialTitle: HTMLElement;
  private tutorialDescription: HTMLElement;
  private tutorialProgress: HTMLElement;
  private nextBtn: HTMLButtonElement;
  private prevBtn: HTMLButtonElement;
  private skipBtn: HTMLButtonElement;
  private onComplete: (() => void) | null = null;

  private steps: TutorialStep[] = [
    {
      title: '⚔️ Welcome to Empires Eternal!',
      description: 'Build your empire from the ground up. Explore territories, research technologies, recruit armies, and conquer the world. This tutorial will teach you the basics of gameplay.',
      position: 'center'
    },
    {
      title: '🎯 Understanding the Interface',
      description: 'The top bar shows your resources: Food 🌾, Production 🔨, Gold 💰, Science 🔬, and Culture 🎭. These resources accumulate each turn and are used for various actions. The right panel displays your empire stats and available actions.',
      position: 'center'
    },
    {
      title: '🗺️ Exploring the Map',
      description: 'Click on any tile to view its details. You\'ll see terrain type, resources, and any units or cities present. Use your mouse to pan the map by clicking and dragging. Scroll to zoom in and out.',
      highlightElement: '#game-canvas',
      position: 'center'
    },
    {
      title: '⚔️ Selecting Units',
      description: 'Click on your units (warriors, settlers) to select them. Selected units will be highlighted. You can then move them to adjacent tiles by clicking on the destination. Different units have different movement ranges.',
      position: 'right'
    },
    {
      title: '🏰 Founding Cities',
      description: 'Select a Settler unit and click the "FOUND CITY" button. Cities are the heart of your empire! They generate resources, produce units, and expand your territory. Choose locations with good terrain resources.',
      highlightElement: '#build-city-btn',
      position: 'left'
    },
    {
      title: '⚔️ Recruiting Units',
      description: 'Select one of your cities, then click "RECRUIT UNIT". Units require Production and sometimes Gold. Different units require different technologies. Warriors are available from the start.',
      highlightElement: '#recruit-unit-btn',
      position: 'left'
    },
    {
      title: '🔬 Researching Technology',
      description: 'Click "RESEARCH TECH" to view the technology tree. Technologies unlock new units, buildings, and bonuses. Each tech costs Science to research. Choose wisely to match your strategy!',
      highlightElement: '#research-btn',
      position: 'left'
    },
    {
      title: '🌍 Territory Occupation',
      description: 'Move your military units onto neutral tiles and keep them there. After staying for a turn or two, you\'ll capture the territory! Captured tiles provide their resources to your nearest city.',
      position: 'center'
    },
    {
      title: '⏭️ Ending Your Turn',
      description: 'When you\'ve finished all your actions, click "END TURN". Your resources will accumulate, research will progress, and cities will grow. Then it\'s time to plan your next move!',
      highlightElement: '#end-turn-btn',
      position: 'left'
    },
    {
      title: '🎯 Requirements and Tooltips',
      description: 'If a button is disabled, click it to see what requirements are missing. The game will show you exactly what you need (technology, resources, etc.). Hover over elements for additional information.',
      position: 'center'
    },
    {
      title: '🏆 Ready to Build Your Empire!',
      description: 'You now know the basics! Remember: balance expansion, military, economy, and technology. Adapt your strategy to your civilization\'s strengths. Good luck, and may your empire prosper!',
      position: 'center'
    }
  ];

  constructor() {
    this.tutorialOverlay = document.getElementById('tutorial-overlay')!;
    this.tutorialContent = document.getElementById('tutorial-content')!;
    this.tutorialTitle = document.getElementById('tutorial-title')!;
    this.tutorialDescription = document.getElementById('tutorial-description')!;
    this.tutorialProgress = document.getElementById('tutorial-progress')!;
    this.nextBtn = document.getElementById('tutorial-next') as HTMLButtonElement;
    this.prevBtn = document.getElementById('tutorial-prev') as HTMLButtonElement;
    this.skipBtn = document.getElementById('tutorial-skip') as HTMLButtonElement;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.nextBtn.addEventListener('click', () => this.nextStep());
    this.prevBtn.addEventListener('click', () => this.prevStep());
    this.skipBtn.addEventListener('click', () => this.skip());
  }

  /**
   * Start the tutorial
   */
  start(onComplete?: () => void) {
    this.currentStep = 0;
    this.isActive = true;
    this.onComplete = onComplete || null;
    this.tutorialOverlay.classList.remove('hidden');
    this.showStep(this.currentStep);
  }

  /**
   * Show a specific step
   */
  private showStep(stepIndex: number) {
    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      return;
    }

    const step = this.steps[stepIndex];

    // Update content
    this.tutorialTitle.textContent = step.title;
    this.tutorialDescription.textContent = step.description;

    // Update progress
    this.tutorialProgress.textContent = `Step ${stepIndex + 1} of ${this.steps.length}`;

    // Update button states
    this.prevBtn.disabled = stepIndex === 0;
    this.nextBtn.textContent = stepIndex === this.steps.length - 1 ? '✓ FINISH' : 'NEXT →';

    // Position the tutorial content
    this.positionContent(step.position);

    // Highlight element if specified
    this.clearHighlights();
    if (step.highlightElement) {
      this.highlightElement(step.highlightElement);
    }
  }

  /**
   * Position tutorial content based on step requirements
   */
  private positionContent(position: string) {
    this.tutorialContent.className = 'tutorial-content';
    this.tutorialContent.classList.add(`position-${position}`);
  }

  /**
   * Highlight a specific element
   */
  private highlightElement(selector: string) {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('tutorial-highlight');
    }
  }

  /**
   * Clear all highlights
   */
  private clearHighlights() {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
  }

  /**
   * Go to next step
   */
  private nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.showStep(this.currentStep);
    } else {
      this.complete();
    }
  }

  /**
   * Go to previous step
   */
  private prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.showStep(this.currentStep);
    }
  }

  /**
   * Skip tutorial
   */
  private skip() {
    if (confirm('Are you sure you want to skip the tutorial? You can restart it anytime from the settings.')) {
      this.complete();
    }
  }

  /**
   * Complete tutorial
   */
  private complete() {
    this.isActive = false;
    this.tutorialOverlay.classList.add('hidden');
    this.clearHighlights();

    // Store completion in localStorage
    localStorage.setItem('tutorial_completed', 'true');

    if (this.onComplete) {
      this.onComplete();
    }
  }

  /**
   * Check if tutorial was completed before
   */
  static hasCompletedTutorial(): boolean {
    return localStorage.getItem('tutorial_completed') === 'true';
  }

  /**
   * Reset tutorial completion
   */
  static resetTutorial() {
    localStorage.removeItem('tutorial_completed');
  }

  /**
   * Check if tutorial is currently active
   */
  isTutorialActive(): boolean {
    return this.isActive;
  }
}
