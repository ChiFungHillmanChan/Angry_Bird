import * as Matter from 'matter-js';
import type { DrawableBody, WorldT } from '../../core/physics/engine';
import { LevelSchema, type LevelData } from './schema';
import { createBlock } from '../entities/Block';
import { createTarget, renderTarget } from '../entities/Target';
import { getPhysics } from '../../core/physics/engine';

export class LevelLoader {
  private world: WorldT;
  private data?: LevelData;
  private targets: DrawableBody[] = [];

  constructor(world: WorldT) {
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
    const engine = getPhysics().engine;
    Matter.Events.on(engine as any, 'collisionStart', (evt: any) => {
      const pairs = (evt.pairs as any[]) ?? [];
      for (const pair of pairs) {
        const a = pair.bodyA as DrawableBody;
        const b = pair.bodyB as DrawableBody;
        if ((a.label === 'bird' && b.label === 'target') || (b.label === 'bird' && a.label === 'target')) {
          const target = (a.label === 'target' ? a : b) as unknown as any;
          // remove target
          Matter.World.remove(this.world as any, target as any);
          this.targets = this.targets.filter((tt) => tt !== (target as unknown as DrawableBody));
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
    for (const t of this.targets) renderTarget(ctx, t);
  }
}


