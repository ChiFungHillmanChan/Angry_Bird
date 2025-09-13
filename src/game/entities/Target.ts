import { Bodies, Body, World } from 'matter-js';

export function createTarget(world: World, x: number, y: number, r = 20) {
  const body = Bodies.circle(x, y, r, {
    label: 'target',
    density: 0.0025,
    friction: 0.4,
    restitution: 0.1
  });
  World.add(world, body);
  return body as Body & { alive?: boolean };
}

export function renderTarget(ctx: CanvasRenderingContext2D, body: Body) {
  ctx.fillStyle = '#ff5d73';
  ctx.beginPath();
  ctx.arc(body.position.x, body.position.y, (body.circleRadius ?? 20), 0, Math.PI * 2);
  ctx.fill();
}


