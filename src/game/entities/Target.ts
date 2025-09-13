import * as Matter from 'matter-js';
import type { DrawableBody, WorldT } from '../../core/physics/engine';

export function createTarget(world: WorldT, x: number, y: number, r = 20) {
  const body = Matter.Bodies.circle(x, y, r, {
    label: 'target',
    density: 0.0025,
    friction: 0.4,
    restitution: 0.1
  });
  Matter.World.add(world as any, body);
  return body as DrawableBody & { alive?: boolean };
}

export function renderTarget(ctx: CanvasRenderingContext2D, body: DrawableBody) {
  const radius = body.circleRadius ?? 20;
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  
  // Target body (green pig-like creature)
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Darker border
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Simple face features
  // Eyes
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-radius * 0.3, -radius * 0.2, radius * 0.15, 0, Math.PI * 2);
  ctx.arc(radius * 0.3, -radius * 0.2, radius * 0.15, 0, Math.PI * 2);
  ctx.fill();
  
  // Mouth/snout
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.ellipse(0, radius * 0.2, radius * 0.3, radius * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Nostrils
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-radius * 0.1, radius * 0.15, 2, 0, Math.PI * 2);
  ctx.arc(radius * 0.1, radius * 0.15, 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}


