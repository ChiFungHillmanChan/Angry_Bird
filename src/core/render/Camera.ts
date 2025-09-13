export interface CameraBounds {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

export class Camera {
  pos: { x: number; y: number };
  viewport: { width: number; height: number };
  bounds: CameraBounds = {};

  private followTarget?: { getPosition: () => { x: number; y: number } };
  private followLerp = 0.1;

  constructor(pos: { x: number; y: number }, viewport: { width: number; height: number }) {
    this.pos = { ...pos };
    this.viewport = { ...viewport };
  }

  lookAt(x: number, y: number): void {
    this.pos.x = x;
    this.pos.y = y;
    this.clampToBounds();
  }

  setBounds(bounds: CameraBounds): void {
    this.bounds = bounds;
    this.clampToBounds();
  }

  follow(target: { getPosition: () => { x: number; y: number } }, options?: { lerp?: number }): void {
    this.followTarget = target;
    this.followLerp = Math.max(0.01, Math.min(1, options?.lerp ?? 0.1));
  }

  update(dt: number): void {
    if (this.followTarget) {
      const t = this.followTarget.getPosition();
      this.pos.x += (t.x - this.pos.x) * this.followLerp;
      this.pos.y += (t.y - this.pos.y) * this.followLerp;
      this.clampToBounds();
    }
  }

  clampToBounds(): void {
    const { minX = -Infinity, maxX = Infinity, minY = -Infinity, maxY = Infinity } = this.bounds;
    const halfW = this.viewport.width / 2;
    const halfH = this.viewport.height / 2;
    const minPx = minX + halfW;
    const maxPx = maxX - halfW;
    const minPy = minY + halfH;
    const maxPy = maxY - halfH;
    this.pos.x = Math.max(minPx, Math.min(maxPx, this.pos.x));
    this.pos.y = Math.max(minPy, Math.min(maxPy, this.pos.y));
  }
}


