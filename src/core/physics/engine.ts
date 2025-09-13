import { Bodies, Engine, World } from 'matter-js';

export type Material = 'wood' | 'stone' | 'bird' | 'target';

export interface PhysicsContext {
  engine: Engine;
  world: World;
  debug: boolean;
}

let singleton: PhysicsContext | null = null;

const MATERIALS: Record<Material, { density: number; friction: number; restitution: number }> = {
  wood: { density: 0.002, friction: 0.4, restitution: 0.1 },
  stone: { density: 0.004, friction: 0.5, restitution: 0.05 },
  bird: { density: 0.003, friction: 0.3, restitution: 0.2 },
  target: { density: 0.0025, friction: 0.4, restitution: 0.1 }
};

export function getPhysics(debug = false): PhysicsContext {
  if (singleton) return singleton;
  const engine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.001 } });
  const world = engine.world;
  singleton = { engine, world, debug };
  return singleton;
}

export function stepFixed(dt: number): void {
  const ctx = getPhysics();
  Engine.update(ctx.engine, dt * 1000);
}

export function createGround(x: number, y: number, width: number, height: number) {
  const body = Bodies.rectangle(x, y, width, height, { isStatic: true, label: 'ground' });
  World.add(getPhysics().world, body);
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

export { Bodies, Body, Composite, World } from 'matter-js';


