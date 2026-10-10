# CLAUDE.md

Conventions for AI coding assistants working in this repo. Goals, phases and open decisions are in [`SCOPE.md`](SCOPE.md); read it first.

**Project:** Vishal Ghuge's PM portfolio. A scroll-driven 3D scene (fixed `<Canvas>`) with scrollable HTML in front: hero, résumé timeline, works gallery, contact.

## Commands (run inside `web/`)

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
npm run typecheck
npm run lint
```

No tests. After edits, run `npm run typecheck` and check the result in the browser.

## Architecture

- Pure front-end SPA, no backend yet, no router. `index.html` -> `src/main.tsx` -> `src/App.tsx`.
- `src/scene/Scene.tsx`: gradient backdrop, lights, scroll-driven camera (also dollies toward the cursor near the face); composes `<Avatar><Stickers /></Avatar>`.
- `src/scene/Avatar.tsx`: the Meshy-generated glb (`public/models/avatar.glb`). Fit constants at the top; head turns toward the cursor; provides a raycast `useSurface()` so stickers land on the real mesh. `Bust.tsx`/`headShape.ts` are the old procedural head, kept as the fallback for sticker placement.
- `src/scene/Bust.tsx`: soft-clay cartoon bust built in code (one head mesh with hair as vertex colour + offset, brows, nose, smile, ears, eyes that blink and follow the cursor). Look constants are at the top (`C`).
- `src/scene/headShape.ts`: the head surface (`headPoint`, `surfaceFrame`), hair mask/thickness. Anything placed on the face should use `surfaceFrame(theta, phi)` so it sits on the surface.
- `src/scene/Stickers.tsx`: clickable project stickers placed by (theta, phi); `slug` must match `works.ts`. Click sets `active` in `src/store.ts`, which opens the case study in `Works.tsx` (the gallery uses the same store key).
- `src/ui/Resume.tsx`: timeline entries (data inline). `src/ui/Works.tsx`: horizontal gallery + detail modal.
- `src/data/works.ts`: gallery data. `src/content/works/*.md`: one case study per `slug` (template: `_template.md`).
- `src/ui/LoadingScreen.tsx`, `NoiseOverlay.tsx`: loading mask and film grain.

## Gotchas

- Page content sits on top of the canvas and takes the pointer events, so the `<Canvas>` uses `eventSource={#root}` and `eventPrefix="client"` (see `App.tsx`). Without it, eye-follow and sticker clicks silently stop working. Do not add full-screen click-catcher meshes: events bubble from DOM overlays like the case-study modal, so they would fire on clicks inside it.

## Conventions

- English only. Keep copy honest and sourced from `Vishal_Ghuge_CV_updated.pdf`; do not invent metrics, dates or employers.
- TypeScript `strict`. The imperative Three.js code may use a few `any`s; do not over-type it.
- `base: './'` in `vite.config.ts`: use `import.meta.env.BASE_URL` for public asset URLs.
- Scene tunables are plain constants at the top of each component in `Scene.tsx`.
- Do not reintroduce content or assets from the original reference project (see `NOTICE`).

## Planned (see SCOPE.md)

Phase 1 case studies, Phase 2 real avatar and project stickers, Phase 3 JD Match and Ask Vishal (needs a serverless function; keep API keys server-side).
