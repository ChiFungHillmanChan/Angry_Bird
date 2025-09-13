## Sling Critter

Original slingshot physics puzzle game built with Vite (vanilla-ts), TypeScript, Canvas 2D, and Matter.js. Includes strict typing, ESLint/Prettier, Vitest unit tests, Playwright E2E, PWA, and CI.

### Tech Stack
- Vite (vanilla-ts), TypeScript (strict), Canvas 2D
- Matter.js physics, Howler for audio
- Zod for level schema validation
- ESLint (TS + import), Prettier
- Vitest (unit), Playwright (E2E)
- GitHub Actions CI, Vercel deployment
- PWA (manifest + Service Worker)

### Getting Started
```bash
npm ci
npm run dev
```
Open `http://localhost:5173`

### Scripts
```bash
npm run dev         # start dev server
npm run build       # typecheck + build
npm run preview     # preview built app
npm run lint        # eslint
npm run format      # prettier
npm run typecheck   # tsc --noEmit
npm run test        # vitest
npm run e2e         # playwright tests
```

### Deployment (Vercel)
- Push to GitHub, import repo on Vercel, framework: Vite
- Build command: `npm run build`, output dir: `dist`
- `vercel.json` already configured

### PWA
- Manifest at `public/manifest.webmanifest`
- Service worker at `src/sw.ts` (built to `dist/sw.js`)
- Cache-first for static, network-first for levels

### Level JSON Schema
```json
{
  "id": "level-001",
  "world": { "gravity": 1.0, "wind": 0 },
  "camera": { "startX": 0, "startY": 0, "minX": 0, "maxX": 3200 },
  "slingshot": { "x": 180, "y": 520, "maxPull": 140, "powerK": 7.5 },
  "birds": [{ "type": "basic" }],
  "blocks": [{ "shape": "rect", "x": 900, "y": 560, "w": 160, "h": 30, "mat": "wood", "hp": 40 }],
  "targets": [{ "shape": "circle", "x": 1100, "y": 580, "r": 20, "mat": "target" }],
  "goals": { "destroyTargets": true, "scoreStars": [2000, 4000, 6000] }
}
```

### Extensibility
- Add new entity types in `src/game/entities/`
- Expand schema in `src/game/levels/schema.ts`
- Scene logic in `src/core/scenes/`

### License
All included assets are CC0 placeholders created for this project.


