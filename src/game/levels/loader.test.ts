import { describe, it, expect } from 'vitest';
import { LevelSchema } from './schema';

describe('level schema', () => {
  it('valid level passes', () => {
    const data = {
      id: 'level-x',
      world: { gravity: 1, wind: 0 },
      camera: { startX: 0, startY: 0, minX: 0, maxX: 1000 },
      slingshot: { x: 0, y: 0, maxPull: 100, powerK: 5 },
      birds: [{ type: 'basic' }],
      blocks: [],
      targets: [{ shape: 'circle', x: 0, y: 0, r: 10, mat: 'target' }],
      goals: { destroyTargets: true, scoreStars: [1, 2, 3] }
    };
    const parsed = LevelSchema.safeParse(data);
    expect(parsed.success).toBe(true);
  });
  it('invalid level fails', () => {
    const data = {
      id: '',
      world: { gravity: -1, wind: 0 },
      camera: { startX: 0, startY: 0, minX: 0, maxX: 0 },
      slingshot: { x: 0, y: 0, maxPull: 0, powerK: 0 },
      birds: [],
      blocks: [],
      targets: [],
      goals: { destroyTargets: true, scoreStars: [3, 2, 1] }
    };
    const parsed = LevelSchema.safeParse(data);
    expect(parsed.success).toBe(false);
  });
});


