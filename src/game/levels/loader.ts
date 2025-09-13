import * as Matter from 'matter-js';
import type { DrawableBody, WorldT } from '../../core/physics/engine';
import { LevelSchema, type LevelData } from './schema';
import { createBlock, renderBlock } from '../entities/Block';
import { createTarget, renderTarget } from '../entities/Target';
import { getPhysics } from '../../core/physics/engine';

export class LevelLoader {
  private world: WorldT;
  private data?: LevelData;
  private targets: DrawableBody[] = [];
  private blocks: (DrawableBody & { hp?: number; mat?: string })[] = [];

  constructor(world: WorldT) {
    this.world = world;
  }

  async load(idOrPath: string): Promise<LevelData> {
    try {
      const levelMap = import.meta.glob('/src/game/levels/*.json', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
      const idKey = idOrPath.endsWith('.json') ? idOrPath : `/src/game/levels/${idOrPath}.json`;
      const url = levelMap[idKey] ?? idKey;
      
      console.log('Loading level:', idKey, 'from URL:', url); // Debug
      
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Failed to fetch level: ${res.status} - ${res.statusText}`);
      const json = (await res.json()) as unknown;
      const data = LevelSchema.parse(json);
      this.data = data;
      
      console.log('Level loaded successfully:', data.id); // Debug
      
      return data;
    } catch (error) {
      console.error('Failed to load level:', idOrPath, error);
      throw error;
    }
  }

  spawnFromData(data: LevelData, onTargetDestroyed: (score: number) => void): void {
    // blocks
    this.blocks = [];
    for (const b of data.blocks) {
      const block = createBlock(this.world, { x: b.x, y: b.y, w: b.w, h: b.h, material: b.mat, hp: b.hp });
      this.blocks.push(block);
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
        const a = pair.bodyA as DrawableBody & { hp?: number; mat?: string };
        const b = pair.bodyB as DrawableBody & { hp?: number; mat?: string };
        
        // Calculate collision impact
        const relativeVelocity = Math.sqrt(
          Math.pow((a.velocity?.x || 0) - (b.velocity?.x || 0), 2) +
          Math.pow((a.velocity?.y || 0) - (b.velocity?.y || 0), 2)
        );
        
        // Bird hits target - instant destruction
        if ((a.label === 'bird' && b.label === 'target') || (b.label === 'bird' && a.label === 'target')) {
          const target = (a.label === 'target' ? a : b) as unknown as any;
          Matter.World.remove(this.world as any, target as any);
          this.targets = this.targets.filter((tt) => tt !== (target as unknown as DrawableBody));
          onTargetDestroyed(1000);
        }
        
        // Block damage system
        else if (a.label === 'block' && b.label === 'bird' && relativeVelocity > 2) {
          this.damageBlock(a, relativeVelocity);
        } else if (b.label === 'block' && a.label === 'bird' && relativeVelocity > 2) {
          this.damageBlock(b, relativeVelocity);
        }
        
        // Block hits target
        else if ((a.label === 'block' && b.label === 'target') || (b.label === 'block' && a.label === 'target')) {
          if (relativeVelocity > 3) {
            const target = (a.label === 'target' ? a : b) as unknown as any;
            Matter.World.remove(this.world as any, target as any);
            this.targets = this.targets.filter((tt) => tt !== (target as unknown as DrawableBody));
            onTargetDestroyed(500);
          }
        }
      }
    });
  }

  private damageBlock(block: DrawableBody & { hp?: number; mat?: string }, velocity: number): void {
    if (!block.hp) return;
    
    // Calculate damage based on velocity and material
    const baseDamage = Math.max(0, (velocity - 2) * 10);
    const materialMultiplier = block.mat === 'stone' ? 0.7 : 1.0;
    const damage = Math.round(baseDamage * materialMultiplier);
    
    block.hp = Math.max(0, block.hp - damage);
    
    // Remove block if HP reaches 0
    if (block.hp <= 0) {
      Matter.World.remove(this.world as any, block as any);
      this.blocks = this.blocks.filter(b => b !== block);
      // Add score for destroying block
      // onTargetDestroyed(block.mat === 'stone' ? 200 : 100);
    }
  }

  targetsRemaining(): number {
    return this.targets.length;
  }

  starsForScore(score: number): number {
    const s = this.data?.goals.scoreStars ?? [9999, 99999, 999999];
    return (score >= s[2] ? 3 : score >= s[1] ? 2 : score >= s[0] ? 1 : 0);
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Render blocks
    for (const block of this.blocks) {
      renderBlock(ctx, block);
    }
    
    // Render targets
    for (const target of this.targets) {
      renderTarget(ctx, target);
    }
  }
}


