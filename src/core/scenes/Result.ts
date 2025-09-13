import type { IScene } from '../types';
import type { SceneManager } from '../SceneManager';

export class ResultScene implements IScene {
  constructor(private manager: SceneManager, private result: { score: number; stars: number; nextLevel?: string }) {}

  render(ctx: CanvasRenderingContext2D): void {
    const r = this.manager.getRenderer();
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(-r.camera.viewport.width / 2, -r.camera.viewport.height / 2, r.camera.viewport.width, r.camera.viewport.height);
    ctx.fillStyle = '#e6f7ff';
    ctx.font = '48px system-ui, sans-serif';
    ctx.fillText('Result', -80, -100);
    ctx.font = '24px system-ui, sans-serif';
    ctx.fillText(`Score: ${this.result.score}`, -120, -40);
    ctx.fillText(`Stars: ${'★'.repeat(this.result.stars)}${'☆'.repeat(3 - this.result.stars)}`, -120, 0);
    this.drawButton(ctx, 'Retry', -120, 80, () => this.goRetry());
    this.drawButton(ctx, 'Menu', 0, 80, () => this.goMenu());
    this.drawButton(ctx, 'Next', 120, 80, () => this.goNext());
    ctx.restore();
    this.attachOnce();
  }

  private clickAttached = false;
  private attachOnce(): void {
    if (this.clickAttached) return;
    this.clickAttached = true;
    const canvas = document.getElementById('game') as HTMLCanvasElement;
    const handler = () => this.goMenu();
    canvas.addEventListener('click', handler, { once: true });
  }

  private drawButton(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    _onClick: () => void
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#1b2a4b';
    ctx.fillRect(-60, -20, 120, 40);
    ctx.strokeStyle = '#2bd1ff';
    ctx.strokeRect(-60, -20, 120, 40);
    ctx.fillStyle = '#e6f7ff';
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText(text, -ctx.measureText(text).width / 2, 7);
    ctx.restore();
  }

  private async goMenu(): Promise<void> {
    const { MenuScene } = await import('./Menu');
    this.manager.setScene('Menu', new MenuScene(this.manager));
  }

  private async goRetry(): Promise<void> {
    const { LevelScene } = await import('./Level');
    const next = this.result.nextLevel ?? 'level-001';
    this.manager.setScene('Level', new LevelScene(this.manager, next));
  }

  private async goNext(): Promise<void> {
    const { LevelScene } = await import('./Level');
    const next = this.result.nextLevel ?? 'level-002';
    this.manager.setScene('Level', new LevelScene(this.manager, next));
  }
}


