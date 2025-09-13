export interface Vec2 { x: number; y: number }

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function vecAdd(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vecSub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vecScale(a: Vec2, s: number): Vec2 {
  return { x: a.x * s, y: a.y * s };
}

export function projectilePoints(origin: Vec2, velocity: Vec2, gravity = 9.81, steps = 30, dt = 0.08): Vec2[] {
  const pts: Vec2[] = [];
  let x = origin.x;
  let y = origin.y;
  let vx = velocity.x;
  let vy = velocity.y;
  for (let i = 0; i < steps; i++) {
    x += vx * dt;
    y += vy * dt + 0.5 * gravity * dt * dt;
    vy += gravity * dt;
    pts.push({ x, y });
  }
  return pts;
}


