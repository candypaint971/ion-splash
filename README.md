# ION Splash

Animated splash screen for the **ION** EV charging mobile app.

**Live preview:** https://ion-splash-five.vercel.app

## What's in the box

| File / Path | Purpose |
|---|---|
| `index.html` | Production splash composition (no dev controls). Open this on a static host. |
| `splash-preview.html` | Same composition with play/pause/restart/scrub controls — for tuning. |
| `splash.json` | Lottie animation: background grid pulse only. The logo + tagline are composited natively in HTML. |
| `assets/ion-logo.svg` | Original ION logo (source artwork). |
| `assets/station.jpg` | Background photo (Dubai charging station). |
| `src/` | Node.js builder that emits `splash.json`. Hand-authored shape layers, no After Effects. |
| `tests/` | Validates the generated `splash.json` (`node --test`). |

## Composition

The splash is a layered composition (back to front):
1. **Photo** — `assets/station.jpg`, 55% opacity
2. **Gradient overlay** — radial dim + diagonal indigo→purple→magenta wash (matches the brand CTA gradient)
3. **Lottie effects** — faint cyan/purple grid pulsing slowly
4. **ION logo** — original SVG, two stacked layers: a faint outline (always visible) + a solid white fill that rises bottom-to-top via `clip-path` animation (~2.4s)
5. **Tagline** — typed character-by-character: "Charge **faster**" then "Drive longer" (offset). Manrope font (matches `ion.ae`).
6. **Version footer** — `v1.0.0` in 30% white at the bottom.

## Local development

```bash
npm install
npm run build       # regenerate splash.json from src/
npm test            # run validation tests (40 tests)
npm run preview     # serve at http://localhost:8080
# open http://localhost:8080/splash-preview.html for the dev view
# open http://localhost:8080/                     for the production view
```

## Deploying

Pushed to `main` auto-deploys to Vercel (any static host works — there is no build step).

If you want to host elsewhere: copy `index.html`, `splash.json`, and `assets/` to any static host. That's all that's required at runtime.

## Mobile integration (React Native)

The complete handoff bundle for the mobile app lives in [`mobile/`](mobile/):

- [`mobile/IonSplash.tsx`](mobile/IonSplash.tsx) — drop-in TypeScript component, no rewrite needed
- [`mobile/SPEC.md`](mobile/SPEC.md) — colors, fonts, timings, layout
- [`mobile/README.md`](mobile/README.md) — install steps, props, native-launch-screen coordination
- [`mobile/splash.json`](mobile/splash.json) + [`mobile/assets/`](mobile/assets/) — runtime assets, with the station photo pre-resized for `@1x`/`@2x`/`@3x`

Hand the engineer the `mobile/` folder and [`mobile/README.md`](mobile/README.md) — that has everything needed to install dependencies and drop `<IonSplash />` into the app.

Why the split: the logo and tagline are rendered natively (crisper text, easier localization, runtime overrides) while the background grid pulse plays via Lottie. Keeps the binary tiny and the brand text editable without re-exporting from After Effects.
