import { Bodies, Body, World } from 'matter-js';

export function createBird(world: World, x: number, y: number, r = 16) {
  const bird = Bodies.circle(x, y, r, {
    label: 'bird',
    density: 0.003,
    friction: 0.3,
    restitution: 0.2
  });
  World.add(world, bird);
  return bird;
}

export function renderBird(ctx: CanvasRenderingContext2D, body: Body, color = '#ffd166') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(body.position.x, body.position.y, (body.circleRadius ?? 16), 0, Math.PI * 2);
  ctx.fill();
}


