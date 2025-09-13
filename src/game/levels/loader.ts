import type { Body, Engine, IEventCollision, Pair } from 'matter-js';
import { Events, World } from 'matter-js';
import { LevelSchema, type LevelData } from './schema';
import { createBlock } from '../entities/Block';
import { createTarget, renderTarget } from '../entities/Target';
import { getPhysics } from '../../core/physics/engine';

export class LevelLoader {
  private world: World;
  private data?: LevelData;
  private targets: Body[] = [];

  constructor(world: World) {
    this.world = world;
  }

  async load(idOrPath: string): Promise<LevelData> {
    const levelMap = import.meta.glob('/src/game/levels/*.json', { as: 'url', eager: true }) as Record<string, string>;
    const idKey = idOrPath.endsWith('.json') ? idOrPath : `/src/game/levels/${idOrPath}.json`;
    const url = levelMap[idKey] ?? idKey;
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to fetch level: ${res.status}`);
    const json = (await res.json()) as unknown;
    const data = LevelSchema.parse(json);
    this.data = data;
    return data;
  }

  spawnFromData(data: LevelData, onTargetDestroyed: (score: number) => void): void {
    // blocks
    for (const b of data.blocks) {
      createBlock(this.world, { x: b.x, y: b.y, w: b.w, h: b.h, material: b.mat, hp: b.hp });
    }
    // targets
    this.targets = [];
    for (const t of data.targets) {
      const body = createTarget(this.world, t.x, t.y, t.r);
      this.targets.push(body);
    }

    // collisions
    const engine = getPhysics().engine as Engine;
    Events.on(engine, 'collisionStart', (evt: IEventCollision<Engine>) => {
      const pairs = evt.pairs as Pair[];
      for (const pair of pairs) {
        const a = pair.bodyA;
        const b = pair.bodyB;
        if ((a.label === 'bird' && b.label === 'target') || (b.label === 'bird' && a.label === 'target')) {
          const target = a.label === 'target' ? a : b;
          // remove target
          World.remove(this.world, target);
          this.targets = this.targets.filter((t) => t !== target);
          onTargetDestroyed(1000);
        }
      }
    });
  }

  targetsRemaining(): number {
    return this.targets.length;
  }

  starsForScore(score: number): number {
    const s = this.data?.goals.scoreStars ?? [9999, 99999, 999999];
    return (score >= s[2] ? 3 : score >= s[1] ? 2 : score >= s[0] ? 1 : 0);
  }

  render(ctx: CanvasRenderingContext2D): void {
    // For simplicity, iterate world bodies is heavy; instead we track blocks/targets for render in a real engine
    // Here we omit blocks drawing individually; in minimal MVP draw tracked targets only.
    for (const t of this.targets) renderTarget(ctx, t);
  }
}


