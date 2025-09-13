import { Camera } from './Camera';

export class Renderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  readonly camera: Camera;
  private dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  readonly logicalWidth = 1280;
  readonly logicalHeight = 720;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D context not supported');
    this.ctx = ctx;
    this.camera = new Camera({ x: 0, y: 0 }, { width: this.logicalWidth, height: this.logicalHeight });
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  beginFrame(): void {
    this.ctx.save();
    // Clear
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Transform to logical space with camera
    this.ctx.scale(this.dpr, this.dpr);
    this.ctx.translate(-this.camera.pos.x + this.camera.viewport.width / 2, -this.camera.pos.y + this.camera.viewport.height / 2);
  }

  endFrame(): void {
    this.ctx.restore();
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    this.canvas.width = Math.max(1, Math.floor(rect.width * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * this.dpr));
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  toWorld(screenX: number, screenY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const x = screenX - rect.left;
    const y = screenY - rect.top;
    const logicalX = x / this.dpr + this.camera.pos.x - this.camera.viewport.width / 2;
    const logicalY = y / this.dpr + this.camera.pos.y - this.camera.viewport.height / 2;
    return { x: logicalX, y: logicalY };
  }

  toScreen(worldX: number, worldY: number): { x: number; y: number } {
    const x = (worldX - this.camera.pos.x + this.camera.viewport.width / 2) * this.dpr;
    const y = (worldY - this.camera.pos.y + this.camera.viewport.height / 2) * this.dpr;
    return { x, y };
  }
}


