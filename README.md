# ION Splash

Animated splash screen for the **ION** EV charging mobile app.

**Live preview:** [will be added after first Vercel deploy]

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

## Mobile integration

To use this in the actual ION mobile app, the recommended pattern is:

1. Display `assets/station.jpg` as a full-screen background with the gradient overlay applied in native code (matches the CSS in `index.html`).
2. Render the original ION SVG (`assets/ion-logo.svg`) as a vector asset, with a clip-path animation revealing it bottom-to-top over ~2.4s.
3. Play `splash.json` on top via the platform Lottie runtime (`lottie-ios`, `lottie-android`, `lottie-react-native`) — it's only 5 KB and contributes the background grid pulse.
4. Render the tagline as native text using the Manrope font, with the typewriter effect implemented in your platform's animation framework.
5. Show the app version from the build manifest.

Keeping the logo and tagline native gives crisper text rendering, easier localization, and lets you adjust per device without re-exporting Lottie.
