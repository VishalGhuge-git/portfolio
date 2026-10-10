# Vishal Ghuge: PM Portfolio

A scroll-driven 3D portfolio built as a product. Fixed 3D scene in the background, résumé timeline and a horizontal works gallery scrolling over it. See [`SCOPE.md`](SCOPE.md) for goals, phases and open decisions.

**Status:** Phase 0 complete (running skeleton). The 3D bust is a placeholder made of primitives; the real avatar arrives in Phase 2.

## Run it

```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + bundle to web/dist
npm run typecheck
```

## Where to change things

| To change | Edit |
| --- | --- |
| Résumé timeline | `web/src/ui/Resume.tsx` |
| Hero copy, name, LinkedIn/email | `web/src/App.tsx` (`COPY`, `LINKEDIN_URL`, `EMAIL`) |
| Projects shown in the gallery | `web/src/data/works.ts` |
| A project's case study | `web/src/content/works/<slug>.md` (start from `_template.md`) |
| Project images / video | `web/public/works/<slug>/` |
| 3D scene, lights, camera | `web/src/scene/Scene.tsx` |
| The bust (look, colours, blink) | `web/src/scene/Bust.tsx` (constants at the top) |
| Stickers on the bust (which project, where) | `web/src/scene/Stickers.tsx` |
| Colours, spacing, typography | `web/src/styles.css` |

### Adding a project (you'll do this often)

1. Add an item to a section in `web/src/data/works.ts` with a unique `slug`.
2. Copy `web/src/content/works/_template.md` to `web/src/content/works/<slug>.md` and fill it in.
3. Drop media into `web/public/works/<slug>/`.

Projects without a `.md` file show a "case study in progress" placeholder, so you can list a project before writing it up.

### Stickers

Each sticker on the bust opens a project: hover shows its name, click opens the case study. To add or change one, edit `STICKERS` in `web/src/scene/Stickers.tsx`: `slug` must match a `slug` in `works.ts`, and `theta`/`phi` set where it sits on the head (keep clear of the eyes, brows and mouth). Stickers only react near the top of the page.

## Deploy

Pushing to `main` builds `web/` and publishes to GitHub Pages (`.github/workflows`). The build uses relative paths, so `web/dist` also works on Netlify, Vercel or any static host.

## Credits and licence

The scene structure, scroll choreography and gallery are adapted from [dayinji/sen-3d-resume](https://github.com/dayinji/sen-3d-resume), MIT licensed (see `LICENSE`). None of that project's personal content, character model or logos is used here; see `NOTICE`.
