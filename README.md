# splat-walker

**[Live demo](https://anand-ramnarain-27.github.io/splat-walker/)**

A Gaussian splat viewer built around a real workflow used in spatial-capture pipelines: walk (or drive) a path through a space capturing 360° footage, reconstruct it as a 3D Gaussian splat scene, then let someone else retrace that exact path — or step off it and explore freely.

Most splat viewers only do free orbit. This one treats the *captured path* as a first-class citizen: a defined route through the scene that plays back smoothly, with the option to peel off into free exploration and back.

## Why this exists

Splat capture is increasingly used to document a physical space at a point in time — a construction site, a trail, a storefront — often by literally walking through it with a scanner. The useful product isn't just "a 3D scene you can orbit," it's "walk the same route the surveyor walked," and eventually, "compare that route captured on two different days." This project builds toward that: path-following as the core interaction, with free exploration as the secondary mode, and (as a stretch goal) two captures of the same route compared side by side.

## Scene

[**Calico Tanks Trail, Red Rock Canyon, Las Vegas NV**](https://superspl.at/scene/19312f07) — a real trail hike captured with an XGRIDS PortalCam, published by Paolo Tosolini under **CC BY 4.0**.

The published capture (~410MB, 38M Gaussians across 7 LOD levels in PlayCanvas's SOG format) was converted to a single flat `.spz` for direct web delivery using PlayCanvas's official [`splat-transform`](https://www.npmjs.com/package/@playcanvas/splat-transform) CLI: LOD level 2 selected (~4.8M Gaussians), NaN and floater filtering applied, written as `.spz` v3. Result: `public/splats/calico-tanks-trail.spz`, ~70MB.

The camera path isn't hand-authored — `src/scene/framing.ts` derives it from the splat data itself: a bounding-radius estimate (percentile-based, robust to stray outlier splats) drives an elevated overview sweep, and a PCA pass over the splat cloud's horizontal spread finds its dominant axis (the trail's actual direction) to build a ground-following walkthrough, sampling local terrain height near each waypoint rather than assuming a flat scene.

## Controls

- **Follow Path**: Play/pause and scrub through the overview → walkthrough sequence.
- **Free Explore**: `W`/`A`/`S`/`D` or arrow keys to move, `Space`/`Shift` for up/down, mouse-drag to look around.
- **Compare**: side-by-side view of the small dev placeholder scene against the final Calico Tanks Trail capture — a look at where the project started vs. where it ended up, each pane independently orbitable.

## Stack

- **[Three.js](https://threejs.org/)** for the scene graph, camera, and render loop.
- **[Spark](https://sparkjs.dev/)** (`@sparkjsdev/spark`) for Gaussian splat rendering — actively maintained, MIT-licensed, plugs into a standard Three.js scene as a `SplatMesh`. Chosen over `mkkellogg/GaussianSplats3D` (no longer actively developed; its own maintainer now points people to Spark).
- Plain TypeScript + Vite, no UI framework — the app is a render loop with a small DOM overlay, not a component tree.

## Getting started

```bash
npm install
npm run dev
```

## Performance

Two different tuning choices, driven by scene size:

- **`lod: false` was tried and reverted.** It's a reasonable choice for a small scene (the original ~982K-splat dev placeholder) where forcing full detail every frame costs little and guarantees no adaptive downsampling artifacts. At 4.8M splats it's the wrong call — it forces every splat to render every frame regardless of distance, with no headroom for weaker GPUs or mobile. The shipped scene runs with Spark's default adaptive LOD instead, which scales the rendered splat budget by platform (roughly 500K–750K on WebXR, 1–1.5M on mobile, 2.5M on desktop) and streams more detail in near the camera.
- **7 LOD levels were available in the source capture (19M down to 297K splats); level 2 (~4.8M) was picked** as the balance point between visual fidelity and a static file GitHub Pages has to serve whole — finer levels pushed well past 100MB for diminishing visual return at the distances this camera path actually uses, and levels 4+ (under 1.2M splats) were noticeably too sparse for the ground-level walkthrough to render clean terrain instead of gaps.

## Deployment

Live at **[anand-ramnarain-27.github.io/splat-walker](https://anand-ramnarain-27.github.io/splat-walker/)**. Pushes to `main` build and deploy to GitHub Pages automatically via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Attribution

Scene: "Calico Tanks Trail, Red Rock Canyon, Las Vegas NV (XGRIDS PortalCam)" by [Paolo Tosolini](https://superspl.at/user/tosolini), licensed [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/).
