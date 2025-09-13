import { z } from 'zod';

const positive = (min: number) => z.number().finite().gte(min);

export const LevelSchema = z.object({
  id: z.string().min(1),
  world: z.object({ gravity: z.number().finite().gte(0).lte(5), wind: z.number().finite().min(-5).max(5) }),
  camera: z.object({ startX: z.number(), startY: z.number(), minX: z.number(), maxX: z.number() }).refine((c) => c.maxX > c.minX, 'camera.maxX must be > minX'),
  slingshot: z.object({ x: z.number(), y: z.number(), maxPull: positive(1), powerK: positive(0.1) }),
  birds: z.array(z.object({ type: z.enum(['basic']) })).min(1).max(10),
  blocks: z
    .array(
      z.object({
        shape: z.literal('rect'),
        x: z.number(),
        y: z.number(),
        w: positive(5),
        h: positive(5),
        mat: z.enum(['wood', 'stone']),
        hp: positive(1)
      })
    )
    .max(200),
  targets: z.array(z.object({ shape: z.literal('circle'), x: z.number(), y: z.number(), r: positive(5), mat: z.literal('target') })).min(1).max(50),
  goals: z.object({ destroyTargets: z.boolean(), scoreStars: z.tuple([positive(0), positive(0), positive(0)]) }).refine((g) => g.scoreStars[0] < g.scoreStars[1] && g.scoreStars[1] < g.scoreStars[2], 'scoreStars must be strictly increasing')
});

export type LevelData = z.infer<typeof LevelSchema>;


