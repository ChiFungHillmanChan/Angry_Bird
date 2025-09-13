import * as Matter from 'matter-js';
import type { DrawableBody, WorldT } from '../../core/physics/engine';

export function createBird(world: WorldT, x: number, y: number, r = 28) {
  const bird = Matter.Bodies.circle(x, y, r, {
    label: 'bird',
    density: 0.003,
    friction: 0.3,
    restitution: 0.2
  });
  Matter.World.add(world as any, bird);
  return bird;
}

export function renderBird(ctx: CanvasRenderingContext2D, body: DrawableBody, color = '#ffd166') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(body.position.x, body.position.y, (body.circleRadius ?? 28), 0, Math.PI * 2);
  ctx.fill();
}


