import * as Matter from 'matter-js';
import type { WorldT } from '../../core/physics/engine';
import type { Renderer } from '../../core/render/Renderer';
import type { Input } from '../../core/input/Input';

export class Slingshot {
  private anchor: { x: number; y: number };
  private maxPull: number;
  private powerK: number;
  private world: WorldT;
  private renderer: Renderer;
  private input: Input;
  private currentBird: any | null = null;
  private path: { x: number; y: number }[] = [];
  private onLaunch: () => void;

  constructor(
    x: number,
    y: number,
    maxPull: number,
    powerK: number,
    world: WorldT,
    renderer: Renderer,
    input: Input,
    onLaunch: () => void
  ) {
    this.anchor = { x, y };
    this.maxPull = maxPull;
    this.powerK = powerK;
    this.world = world;
    this.renderer = renderer;
    this.input = input;
    this.onLaunch = onLaunch;
    this.spawnBird();
  }

  hasActiveBird(): boolean {
    return !!this.currentBird;
  }

  private spawnBird(): void {
    const bird = Matter.Bodies.circle(this.anchor.x, this.anchor.y, 16, {
      label: 'bird',
      density: 0.003,
      friction: 0.3,
      restitution: 0.2
    });
    Matter.Body.setStatic(bird, true);
    this.currentBird = bird as any;
    Matter.World.add(this.world as any, bird as any);
  }

  private getPullPoint(): { x: number; y: number } | null {
    if (!this.input.pointer.isDown || !this.input.pointer.current) return null;
    const p = this.input.pointer.current;
    const dx = p.x - this.anchor.x;
    const dy = p.y - this.anchor.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clamped = Math.min(this.maxPull, dist);
    const angle = Math.atan2(dy, dx);
    return { x: this.anchor.x + Math.cos(angle) * clamped, y: this.anchor.y + Math.sin(angle) * clamped };
  }

  private computeLaunchVelocity(pull: { x: number; y: number }): { x: number; y: number } {
    const dx = pull.x - this.anchor.x;
    const dy = pull.y - this.anchor.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const v = this.powerK * Math.min(this.maxPull, dist);
    const x = -Math.cos(angle) * v;
    const y = -Math.sin(angle) * v;
    return { x, y };
  }

  update(): void {
    if (!this.currentBird) return;
    const pull = this.getPullPoint();
    if (pull) {
      Matter.Body.setPosition(this.currentBird as any, pull as any);
    }
    if (!this.input.pointer.isDown && this.input.pointer.start && pull) {
      // Release
      Matter.Body.setStatic(this.currentBird as any, false);
      const v = this.computeLaunchVelocity(pull);
      Matter.Body.setVelocity(this.currentBird as any, v as any);
      this.onLaunch();
      this.path = [];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.renderer.camera.follow({ getPosition: () => ({ x: (this.currentBird as any)!.position.x, y: (this.currentBird as any)!.position.y }) }, { lerp: 0.08 });
    }
    if (this.currentBird && !this.input.pointer.isDown) {
      // Update trail
      const pos = (this.currentBird as any).position as { x: number; y: number };
      this.path.push({ x: pos.x, y: pos.y });
      if (this.path.length > 40) this.path.shift();
      const vel = (this.currentBird as any).velocity as { x: number; y: number };
      if ((vel.x ** 2 + vel.y ** 2) < 0.01) {
        // Ended movement
        this.currentBird = null;
        this.spawnBird();
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Bands
    ctx.strokeStyle = '#7cff6b';
    ctx.lineWidth = 6;
    const pull = this.getPullPoint();
    const anchor = this.anchor;
    const birdPos = (this.currentBird ? (this.currentBird as any).position : anchor) as { x: number; y: number };
    ctx.beginPath();
    ctx.moveTo(anchor.x - 8, anchor.y);
    ctx.lineTo(pull?.x ?? birdPos.x, pull?.y ?? birdPos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(anchor.x + 8, anchor.y);
    ctx.lineTo(pull?.x ?? birdPos.x, pull?.y ?? birdPos.y);
    ctx.stroke();

    // Anchor
    ctx.fillStyle = '#2bd1ff';
    ctx.beginPath();
    ctx.arc(anchor.x, anchor.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Bird
    if (this.currentBird) {
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      const p = (this.currentBird as any).position as { x: number; y: number };
      ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    // Trajectory
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (const p of this.path) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}


