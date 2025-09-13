import { Renderer } from './render/Renderer';
import type { IScene } from './types';

export class SceneManager {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly renderer: Renderer;
  private scenes: Map<string, IScene> = new Map();
  private active?: { name: string; scene: IScene };
  private running = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D context not supported');
    this.ctx = ctx;
    this.renderer = new Renderer(canvas);
  }

  setScene(name: string, scene: IScene): void {
    const prev = this.active?.scene;
    if (prev) prev.dispose?.();
    this.scenes.set(name, scene);
    this.active = { name, scene };
    scene.init?.();
  }

  getRenderer(): Renderer {
    return this.renderer;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.loop(performance.now());
  }

  private lastTime = 0;
  private accumulator = 0;
  private readonly fixedDt = 1 / 60;

  private loop(now: number): void {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.lastTime) / 1000 || 0);
    this.lastTime = now;
    this.accumulator += dt;

    const scene = this.active?.scene;
    while (this.accumulator >= this.fixedDt) {
      scene?.update?.(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    this.renderer.beginFrame();
    scene?.render?.(this.ctx, this.renderer);
    this.renderer.endFrame();

    requestAnimationFrame((t) => this.loop(t));
  }
}


