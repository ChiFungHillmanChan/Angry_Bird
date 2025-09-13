import type { IScene } from '../types';
import type { SceneManager } from '../SceneManager';

interface Button {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  action: () => void;
}

export class ResultScene implements IScene {
  private buttons: Button[] = [];
  private clickAttached = false;
  private currentLevel = 'level-001';

  constructor(private manager: SceneManager, private result: { score: number; stars: number; nextLevel?: string; currentLevel?: string }) {
    this.currentLevel = result.currentLevel || 'level-001';
  }

  init(): void {
    // Setup buttons
    this.buttons = [
      { text: 'Retry', x: -150, y: 120, width: 120, height: 50, action: () => this.goRetry() },
      { text: 'Menu', x: 0, y: 120, width: 120, height: 50, action: () => this.goMenu() }
    ];

    // Add Next button only if there's a next level and we won
    if (this.result.nextLevel && this.result.stars > 0) {
      this.buttons.push({ text: 'Next', x: 150, y: 120, width: 120, height: 50, action: () => this.goNext() });
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const r = this.manager.getRenderer();
    
    // Semi-transparent overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(-r.camera.viewport.width / 2, -r.camera.viewport.height / 2, r.camera.viewport.width, r.camera.viewport.height);
    
    // Result panel background
    ctx.fillStyle = '#1a2847';
    ctx.fillRect(-250, -150, 500, 300);
    ctx.strokeStyle = '#2bd1ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(-250, -150, 500, 300);
    
    // Title
    ctx.fillStyle = '#e6f7ff';
    ctx.font = 'bold 48px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const title = this.result.stars > 0 ? 'Level Complete!' : 'Level Failed';
    ctx.fillText(title, 0, -100);
    
    // Score
    ctx.font = '32px system-ui, sans-serif';
    ctx.fillText(`Score: ${this.result.score}`, 0, -40);
    
    // Stars
    ctx.font = '36px system-ui, sans-serif';
    const starText = '★'.repeat(this.result.stars) + '☆'.repeat(3 - this.result.stars);
    ctx.fillStyle = this.result.stars > 0 ? '#ffd166' : '#666';
    ctx.fillText(starText, 0, 10);
    
    // Best score from localStorage
    const bestKey = `slingCritter_best_${this.currentLevel}`;
    const bestScore = parseInt(localStorage.getItem(bestKey) || '0');
    if (this.result.score > bestScore) {
      localStorage.setItem(bestKey, this.result.score.toString());
      ctx.fillStyle = '#22c55e';
      ctx.font = '20px system-ui, sans-serif';
      ctx.fillText('New Best Score!', 0, 50);
    } else if (bestScore > 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px system-ui, sans-serif';
      ctx.fillText(`Best: ${bestScore}`, 0, 50);
    }
    
    // Draw buttons
    this.buttons.forEach(button => this.drawButton(ctx, button));
    
    ctx.restore();
    this.attachOnce();
  }

  private attachOnce(): void {
    if (this.clickAttached) return;
    this.clickAttached = true;
    const canvas = this.manager.getRenderer().getCanvas();
    const handler = (e: MouseEvent) => {
      const worldPos = this.manager.getRenderer().toWorld(e.clientX, e.clientY);
      
      // Check button clicks
      for (const button of this.buttons) {
        if (this.isPointInButton(worldPos, button)) {
          button.action();
          canvas.removeEventListener('click', handler);
          this.clickAttached = false;
          break;
        }
      }
    };
    canvas.addEventListener('click', handler);
  }

  private isPointInButton(point: { x: number; y: number }, button: Button): boolean {
    return (
      point.x >= button.x - button.width / 2 &&
      point.x <= button.x + button.width / 2 &&
      point.y >= button.y - button.height / 2 &&
      point.y <= button.y + button.height / 2
    );
  }

  private drawButton(ctx: CanvasRenderingContext2D, button: Button): void {
    ctx.save();
    ctx.translate(button.x, button.y);
    
    // Button background
    ctx.fillStyle = '#1b2a4b';
    ctx.fillRect(-button.width / 2, -button.height / 2, button.width, button.height);
    
    // Button border
    ctx.strokeStyle = '#2bd1ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-button.width / 2, -button.height / 2, button.width, button.height);
    
    // Button text
    ctx.fillStyle = '#e6f7ff';
    ctx.font = '20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(button.text, 0, 0);
    
    ctx.restore();
  }

  private async goMenu(): Promise<void> {
    try {
      const { MenuScene } = await import('./Menu');
      this.manager.setScene('Menu', new MenuScene(this.manager));
    } catch (error) {
      console.error('Failed to load menu:', error);
    }
  }

  private async goRetry(): Promise<void> {
    try {
      const { LevelScene } = await import('./Level');
      this.manager.setScene('Level', new LevelScene(this.manager, this.currentLevel));
    } catch (error) {
      console.error('Failed to retry level:', error);
    }
  }

  private async goNext(): Promise<void> {
    try {
      const { LevelScene } = await import('./Level');
      const nextLevel = this.result.nextLevel ?? 'level-002';
      this.manager.setScene('Level', new LevelScene(this.manager, nextLevel));
    } catch (error) {
      console.error('Failed to load next level:', error);
    }
  }

  dispose(): void {
    // Clean up event listeners if needed
    this.clickAttached = false;
  }
}


