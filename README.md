# splat-walker

A Gaussian splat viewer built around a real workflow used in spatial-capture pipelines: walk (or drive) a path through a space capturing 360° footage, reconstruct it as a 3D Gaussian splat scene, then let someone else retrace that exact path — or step off it and explore freely.

Most splat viewers only do free orbit. This one treats the *captured path* as a first-class citizen: a defined route through the scene that plays back smoothly, with the option to peel off into free exploration and back.

## Why this exists

Splat capture is increasingly used to document a physical space at a point in time — a construction site, a trail, a storefront — often by literally walking through it with a scanner. The useful product isn't just "a 3D scene you can orbit," it's "walk the same route the surveyor walked," and eventually, "compare that route captured on two different days." This project builds toward that: path-following as the core interaction, with free exploration as the secondary mode, and (as a stretch goal) two captures of the same route compared side by side.

## Stack

- **[Three.js](https://threejs.org/)** for the scene graph, camera, and render loop.
- **[Spark](https://sparkjs.dev/)** (`@sparkjsdev/spark`) for Gaussian splat rendering — actively maintained, MIT-licensed, plugs into a standard Three.js scene as a `SplatMesh`. Chosen over `mkkellogg/GaussianSplats3D` (no longer actively developed; its own maintainer now points people to Spark).
- Plain TypeScript + Vite, no UI framework — the app is a render loop with a small DOM overlay, not a component tree.

## Status

v1 in progress: splat loading, path playback, and free-explore controls are wired up against a small placeholder scene for fast local iteration.

The dev placeholder is `snow-street.spz`, a small (~10MB) street-level capture served from Spark's own example CDN. It exists purely so `npm run dev` loads fast while building the path/UI system. The intended real scene is [**Calico Tanks Trail, Red Rock Canyon**](https://superspl.at/scene/19312f07) — a genuine walked-trail capture, licensed CC BY 4.0 by `tosolini` on SuperSplat — which will be decimated and compressed to `.spz` and swapped in via `src/config.ts` once the app is working end-to-end. Waypoints in `src/data/path.ts` will need re-tuning to that scene's geometry at that point.

## Getting started

```bash
npm install
npm run dev
```

## Deployment

Pushes to `main` build and deploy to GitHub Pages automatically via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Enable Pages for this repo under Settings → Pages → Source: GitHub Actions.
