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
  ctx.fillStyle = '#ff5d73';
  ctx.beginPath();
  ctx.arc(body.position.x, body.position.y, (body.circleRadius ?? 20), 0, Math.PI * 2);
  ctx.fill();
}


