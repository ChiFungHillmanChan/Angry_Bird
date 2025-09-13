import type { Renderer } from '../render/Renderer';

export interface PointerState {
  isDown: boolean;
  start: { x: number; y: number; time: number } | null;
  current: { x: number; y: number } | null;
}

export class Input {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: Renderer;
  pointer: PointerState = { isDown: false, start: null, current: null };
  private moveThreshold = 3; // pixels
  private longPressMs = 200;

  constructor(canvas: HTMLCanvasElement, renderer: Renderer) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.bind();
  }

  private bind(): void {
    this.canvas.addEventListener('pointerdown', (e) => this.onDown(e));
    window.addEventListener('pointermove', (e) => this.onMove(e));
    window.addEventListener('pointerup', (e) => this.onUp(e));
    window.addEventListener('pointercancel', (e) => this.onUp(e));
  }

  private onDown(e: PointerEvent): void {
    this.canvas.setPointerCapture?.(e.pointerId);
    const p = this.renderer.toWorld(e.clientX, e.clientY);
    this.pointer.isDown = true;
    this.pointer.start = { x: p.x, y: p.y, time: performance.now() };
    this.pointer.current = { x: p.x, y: p.y };
  }

  private onMove(e: PointerEvent): void {
    if (!this.pointer.isDown) return;
    const p = this.renderer.toWorld(e.clientX, e.clientY);
    this.pointer.current = { x: p.x, y: p.y };
  }

  private onUp(e: PointerEvent): void {
    if (!this.pointer.isDown) return;
    const p = this.renderer.toWorld(e.clientX, e.clientY);
    this.pointer.isDown = false;
    this.pointer.current = { x: p.x, y: p.y };
  }

  isLongPress(): boolean {
    if (!this.pointer.start) return false;
    return performance.now() - this.pointer.start.time >= this.longPressMs;
  }
}


