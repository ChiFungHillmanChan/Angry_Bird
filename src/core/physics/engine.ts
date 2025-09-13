import * as Matter from 'matter-js';

export type Material = 'wood' | 'stone' | 'bird' | 'target';

export type EngineT = ReturnType<typeof Matter.Engine.create>;
export type WorldT = EngineT['world'];
export type BodyT = ReturnType<typeof Matter.Bodies.circle>;

export type DrawableBody = {
  label: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  angle: number;
  bounds: { min: { x: number; y: number }; max: { x: number; y: number } };
  circleRadius?: number;
};

export interface PhysicsContext {
  engine: EngineT;
  world: WorldT;
  debug: boolean;
}

// Matter.js types are available via the default namespace import

let singleton: PhysicsContext | null = null;

const MATERIALS: Record<Material, { density: number; friction: number; restitution: number }> = {
  wood: { density: 0.002, friction: 0.4, restitution: 0.1 },
  stone: { density: 0.004, friction: 0.5, restitution: 0.05 },
  bird: { density: 0.003, friction: 0.3, restitution: 0.2 },
  target: { density: 0.0025, friction: 0.4, restitution: 0.1 }
};

export function getPhysics(debug = false): PhysicsContext {
  if (singleton) return singleton;
  const engine = Matter.Engine.create({ gravity: { x: 0, y: 1, scale: 0.001 } });
  const world: WorldT = engine.world;
  singleton = { engine, world, debug };
  return singleton;
}

export function stepFixed(dt: number): void {
  const ctx = getPhysics();
  Matter.Engine.update(ctx.engine, dt * 1000);
}

export function createGround(x: number, y: number, width: number, height: number) {
  const body = Matter.Bodies.rectangle(x, y, width, height, { isStatic: true, label: 'ground' });
  Matter.World.add(getPhysics().world, body);
  return body;
}

export function applyMaterial(opts: { label: string; material: Material; isStatic?: boolean }) {
  const m = MATERIALS[opts.material];
  return {
    label: opts.label,
    isStatic: opts.isStatic ?? false,
    density: m.density,
    friction: m.friction,
    restitution: m.restitution
  };
}



