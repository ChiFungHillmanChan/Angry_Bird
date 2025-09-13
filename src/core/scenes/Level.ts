import type { IScene } from '../types';
import type { SceneManager } from '../SceneManager';
import { Input } from '../input/Input';
import { Renderer } from '../render/Renderer';
import { createGround, getPhysics, stepFixed } from '../physics/engine';
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
    createGround(1280, 700, 3000, 40);
    this.levelLoader = new LevelLoader(phys.world);
    try {
      const data = await this.levelLoader.load(`/src/game/levels/${this.levelId}.json`);
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
    this.slingshot.update();
    const r = this.manager.getRenderer();
    r.camera.update(dt);
    // Basic win check placeholder
    if (this.levelLoader.targetsRemaining() === 0) {
      const stars = this.levelLoader.starsForScore(this.score);
      this.manager.setScene('Result', new ResultScene(this.manager, { score: this.score, stars, nextLevel: 'level-002' }));
    } else if (this.birdsLeft === 0 && !this.slingshot.hasActiveBird()) {
      this.manager.setScene('Result', new ResultScene(this.manager, { score: this.score, stars: 0 }));
    }
  }

  render(ctx: CanvasRenderingContext2D, renderer: Renderer): void {
    // Sky
    ctx.fillStyle = '#0b1021';
    ctx.fillRect(-renderer.camera.viewport.width / 2, -renderer.camera.viewport.height / 2, renderer.camera.viewport.width, renderer.camera.viewport.height);

    // Ground visual
    ctx.fillStyle = '#23314f';
    ctx.fillRect(0, 680, 4000, 200);

    this.levelLoader?.render(ctx);
    this.slingshot?.render(ctx);

    // HUD minimal
    ctx.save();
    ctx.resetTransform();
    ctx.fillStyle = '#e6f7ff';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText(`Birds: ${this.birdsLeft}`, 20, 24);
    ctx.fillText(`Score: ${this.score}`, 20, 44);
    ctx.restore();
  }
}


