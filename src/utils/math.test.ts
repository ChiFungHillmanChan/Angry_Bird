import { describe, it, expect } from 'vitest';
import { clamp, lerp, projectilePoints, vecAdd, vecScale, vecSub } from './math';

describe('math utils', () => {
  it('clamp', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
  it('lerp', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
  it('vec ops', () => {
    expect(vecAdd({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 });
    expect(vecSub({ x: 5, y: 6 }, { x: 2, y: 1 })).toEqual({ x: 3, y: 5 });
    expect(vecScale({ x: 2, y: 3 }, 2)).toEqual({ x: 4, y: 6 });
  });
  it('projectile points', () => {
    const pts = projectilePoints({ x: 0, y: 0 }, { x: 10, y: -10 }, 9.81, 3, 0.1);
    expect(pts.length).toBe(3);
    expect(pts[0].x).toBeCloseTo(1, 3);
  });
});


