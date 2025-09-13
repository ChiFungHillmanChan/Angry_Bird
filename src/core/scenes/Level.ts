import type { IScene } from '../types';
import type { SceneManager } from '../SceneManager';
import { Input } from '../input/Input';
import { Renderer } from '../render/Renderer';
import { createGround, createWorldBoundaries, getPhysics, stepFixed } from '../physics/engine';
import { Slingshot } from '../../game/slingshot/Slingshot';
import { LevelLoader } from '../../game/levels/loader';
import { ResultScene } from './Result';

export class LevelScene implements IScene {
  private input!: Input;
  private slingshot!: Slingshot;
  private levelLoader!: LevelLoader;
  private score = 0;
  private birdsLeft = 3;

  constructor(private manager: SceneManager, private levelId: string) {}

  async init(): Promise<void> {
    const renderer = this.manager.getRenderer();
    this.input = new Input(renderer.getCanvas(), renderer);
    const phys = getPhysics(false);
    // Clear world by recreating engine if needed (simplified: rely on singleton)
    createGround(1600, 620, 3200, 40);
    createWorldBoundaries(3200, 720);
    
    // Add keyboard controls
    this.setupKeyboardControls();
    this.levelLoader = new LevelLoader(phys.world);
    try {
      const data = await this.levelLoader.load(this.levelId);
      renderer.camera.setBounds({ minX: 0, maxX: 3200, minY: 0, maxY: 1200 });
      const sling = data.slingshot;
      this.birdsLeft = data.birds.length;
      this.slingshot = new Slingshot(sling.x, sling.y, sling.maxPull, sling.powerK, phys.world, renderer, this.input, () => this.onLaunch());
      this.levelLoader.spawnFromData(data, this.onTargetDestroyed.bind(this));
    } catch (err) {
      console.error(err);
      alert('關卡載入失敗，返回選單');
      const { MenuScene } = await import('./Menu');
      this.manager.setScene('Menu', new MenuScene(this.manager));
    }
  }

  private onTargetDestroyed(points: number): void {
    this.score += points;
  }

  private onLaunch(): void {
    this.birdsLeft = Math.max(0, this.birdsLeft - 1);
  }

  update(dt: number): void {
    stepFixed(dt);
    
    // Only update if slingshot is initialized
    if (this.slingshot) {
      this.slingshot.update();
    }
    
    const r = this.manager.getRenderer();
    r.camera.update(dt);
    
    // Only check win conditions if level is fully loaded
    if (this.levelLoader && this.slingshot) {
      // Basic win check placeholder
      if (this.levelLoader.targetsRemaining() === 0) {
        const stars = this.levelLoader.starsForScore(this.score);
        const nextLevel = this.levelId === 'level-001' ? 'level-002' : undefined;
        this.manager.setScene('Result', new ResultScene(this.manager, { 
          score: this.score, 
          stars, 
          nextLevel,
          currentLevel: this.levelId 
        }));
      } else if (this.birdsLeft === 0 && !this.slingshot.hasActiveBird()) {
        this.manager.setScene('Result', new ResultScene(this.manager, { 
          score: this.score, 
          stars: 0, 
          currentLevel: this.levelId 
        }));
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, renderer: Renderer): void {
    // Sky
    ctx.fillStyle = '#0b1021';
    ctx.fillRect(-renderer.camera.viewport.width / 2, -renderer.camera.viewport.height / 2, renderer.camera.viewport.width, renderer.camera.viewport.height);

    // Ground visual
    ctx.fillStyle = '#23314f';
    ctx.fillRect(0, 620, 3200, 40);

    this.levelLoader?.render(ctx);
    this.slingshot?.render(ctx);

    // HUD
    this.renderHUD(ctx, renderer);
  }

  private renderHUD(ctx: CanvasRenderingContext2D, renderer: Renderer): void {
    ctx.save();
    ctx.resetTransform();
    
    // Semi-transparent HUD background
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, ctx.canvas.width / renderer['dpr'], 80);
    
    // Left side - Birds remaining
    ctx.fillStyle = '#e6f7ff';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('Birds:', 20, 30);
    
    // Draw bird icons
    for (let i = 0; i < this.birdsLeft; i++) {
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(90 + i * 35, 25, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Center - Level info
    const centerX = ctx.canvas.width / renderer['dpr'] / 2;
    ctx.fillStyle = '#e6f7ff';
    ctx.font = '18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Level: ${this.levelId.replace('level-', '')}`, centerX, 25);
    ctx.fillText(`Targets: ${this.levelLoader?.targetsRemaining() || 0}`, centerX, 50);
    
    // Right side - Score and controls
    const rightX = ctx.canvas.width / renderer['dpr'] - 20;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#e6f7ff';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(`Score: ${this.score}`, rightX, 30);
    
    // Control buttons (simplified)
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('R - Restart | M - Menu', rightX, 55);
    
    // Development FPS counter
    if (import.meta.env.DEV) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      const fps = Math.round(1000 / 16.67); // Approximate
      ctx.fillText(`FPS: ${fps}`, 20, 70);
    }
    
    ctx.restore();
  }

  private setupKeyboardControls(): void {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'r':
          // Restart level
          this.restartLevel();
          break;
        case 'm':
          // Return to menu
          this.goToMenu();
          break;
        case 'escape':
          // Pause or return to menu
          this.goToMenu();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    // Store reference for cleanup
    (this as any).keyHandler = handleKeyPress;
  }

  private async restartLevel(): Promise<void> {
    try {
      const { LevelScene } = await import('./Level');
      this.manager.setScene('Level', new LevelScene(this.manager, this.levelId));
    } catch (error) {
      console.error('Failed to restart level:', error);
    }
  }

  private async goToMenu(): Promise<void> {
    try {
      const { MenuScene } = await import('./Menu');
      this.manager.setScene('Menu', new MenuScene(this.manager));
    } catch (error) {
      console.error('Failed to go to menu:', error);
    }
  }

  dispose(): void {
    // Clean up keyboard listener
    if ((this as any).keyHandler) {
      window.removeEventListener('keydown', (this as any).keyHandler);
    }
    
    // Clean up resources
    this.input = undefined!;
    this.slingshot = undefined!;
    this.levelLoader = undefined!;
  }
}


