import type { IScene } from '../types';
import type { SceneManager } from '../SceneManager';

export class MenuScene implements IScene {
  constructor(private manager: SceneManager) {}

  init(): void {}

  render(ctx: CanvasRenderingContext2D): void {
    const r = this.manager.getRenderer();
    ctx.save();
    ctx.fillStyle = '#0b1021';
    ctx.fillRect(-r.camera.viewport.width / 2, -r.camera.viewport.height / 2, r.camera.viewport.width, r.camera.viewport.height);

    // Title circle logo
    ctx.translate(-300, -100);
    ctx.fillStyle = '#2bd1ff';
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.resetTransform();
    ctx.translate(-100, -50);
    ctx.fillStyle = '#e6f7ff';
    ctx.font = '48px system-ui, sans-serif';
    ctx.fillText('Sling Critter', 0, 0);

    // Buttons
    const btns = [
      { text: 'Start', y: 80, action: () => this.startLevel('level-001') },
      { text: 'Level Select', y: 140, action: () => this.startLevel('level-002') }
    ];
    btns.forEach((b) => this.drawButton(ctx, b.text, 0, b.y, b.action));
    ctx.restore();

    // Simple click handler (coarse)
    this.attachOnce();
  }

  private clickAttached = false;
  private attachOnce(): void {
    if (this.clickAttached) return;
    this.clickAttached = true;
    const canvas = document.getElementById('game') as HTMLCanvasElement;
    const handler = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const rect = canvas.getBoundingClientRect();
      const rx = x - rect.left - rect.width / 2;
      const ry = y - rect.top - rect.height / 2;
      if (ry > rect.height * 0.6 && Math.abs(rx) < 200) {
        this.startLevel('level-001');
        canvas.removeEventListener('click', handler);
      }
    };
    canvas.addEventListener('click', handler);
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
    ctx.fillRect(-120, -30, 240, 60);
    ctx.strokeStyle = '#2bd1ff';
    ctx.strokeRect(-120, -30, 240, 60);
    ctx.fillStyle = '#e6f7ff';
    ctx.font = '24px system-ui, sans-serif';
    ctx.fillText(text, -ctx.measureText(text).width / 2, 8);
    ctx.restore();
  }

  private async startLevel(id: string): Promise<void> {
    const { LevelScene } = await import('./Level');
    this.manager.setScene('Level', new LevelScene(this.manager, id));
  }
}


