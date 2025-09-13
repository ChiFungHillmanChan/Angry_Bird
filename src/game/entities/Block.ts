import * as Matter from 'matter-js';
import type { DrawableBody, WorldT } from '../../core/physics/engine';

export interface BlockOptions {
  x: number;
  y: number;
  w: number;
  h: number;
  material: 'wood' | 'stone';
  hp: number;
}

export function createBlock(world: WorldT, opts: BlockOptions) {
  const block = Matter.Bodies.rectangle(opts.x, opts.y, opts.w, opts.h, {
    label: 'block',
    density: opts.material === 'stone' ? 0.004 : 0.002,
    friction: opts.material === 'stone' ? 0.5 : 0.4,
    restitution: opts.material === 'stone' ? 0.05 : 0.1
  }) as DrawableBody & { hp?: number; mat?: string };
  block.hp = opts.hp;
  block.mat = opts.material;
  Matter.World.add(world as any, block as any);
  return block;
}

export function renderBlock(ctx: CanvasRenderingContext2D, body: DrawableBody & { hp?: number; mat?: string }) {
  const w = body.bounds.max.x - body.bounds.min.x;
  const h = body.bounds.max.y - body.bounds.min.y;
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.fillStyle = body.mat === 'stone' ? '#9aa4b2' : '#8b5e3c';
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.restore();
}


