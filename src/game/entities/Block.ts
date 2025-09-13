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
  
  // Material colors and effects
  if (body.mat === 'stone') {
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(-w / 2, -h / 2, w, h);
    
    // Stone texture lines
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 5, -h / 2 + 5);
    ctx.lineTo(w / 2 - 5, -h / 2 + 5);
    ctx.moveTo(-w / 2 + 5, h / 2 - 5);
    ctx.lineTo(w / 2 - 5, h / 2 - 5);
    ctx.stroke();
  } else {
    // Wood
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-w / 2, -h / 2, w, h);
    
    // Wood grain lines
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    for (let i = -h / 2 + 8; i < h / 2; i += 8) {
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 2, i);
      ctx.lineTo(w / 2 - 2, i);
      ctx.stroke();
    }
  }
  
  // Border
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  
  // HP indicator (development mode)
  if (import.meta.env.DEV && body.hp !== undefined) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(body.hp.toString(), 0, 3);
  }
  
  ctx.restore();
}


