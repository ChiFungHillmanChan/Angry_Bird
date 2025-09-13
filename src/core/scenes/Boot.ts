import type { IScene } from '../types';
import type { SceneManager } from '../SceneManager';
import { Input } from '../input/Input';

export class BootScene implements IScene {
  private manager: SceneManager;
  private input?: Input;
  private ready = false;

  constructor(manager: SceneManager) {
    this.manager = manager;
  }

  init(): void {
    // Preload minimal assets (in real game we'd load audio/images). Here we just move to Menu.
    const renderer = this.manager.getRenderer();
    this.input = new Input(renderer.getCanvas(), renderer);
    this.ready = true;
    // Switch to Menu after short delay to show Boot screen
    setTimeout(() => {
      import('./Menu').then(({ MenuScene }) => {
        this.manager.setScene('Menu', new MenuScene(this.manager));
      });
    }, 300);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const r = this.manager.getRenderer();
    ctx.save();
    ctx.fillStyle = '#0b1021';
    ctx.fillRect(r.toWorld(0, 0).x, r.toWorld(0, 0).y, 1280, 720);
    ctx.fillStyle = '#2bd1ff';
    ctx.font = '48px system-ui, sans-serif';
    ctx.fillText('Sling Critter', -200, -50);
    ctx.fillStyle = '#e6f7ff';
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText(this.ready ? 'Loading…' : 'Starting…', -200, 0);
    ctx.restore();
  }
}


