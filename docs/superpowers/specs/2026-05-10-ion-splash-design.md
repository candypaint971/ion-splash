# ION Mobile App — Animated Splash Screen Design

**Date:** 2026-05-10
**Owner:** Haitham
**Status:** Draft — pending implementation plan

## Goal

Deliver a premium, "wow" splash screen animation for the ION mobile app (an EV charging platform). Format: **Lottie JSON**, suitable for integration into iOS, Android, and React Native apps via the standard Lottie runtimes.

## Concept — "Charge & Reveal"

A single line of light traces in from off-screen, draws the ION logo letter by letter. When it reaches the "O", the two figures inside fade in left-to-right with a brief electric spark between them — the hero beat. The stroke continues into the "N", the logo settles to solid white, and a soft cyan halo pulses outward once. Optionally loops a subtle breathing pulse while the app finishes loading.

Single continuous gesture. Restraint as the premium signal.

## Visual specification

| Property | Value |
|---|---|
| Canvas size | 1080 × 1920 (portrait, scales to any mobile viewport) |
| Background | `#0F0A2E` (deeper variant of brand navy `#1d1645` — gives glow more room to breathe) |
| Logo stroke (during draw) | `#FFFFFF` at 95% opacity |
| Logo final fill | `#FFFFFF` |
| Accent (spark + halo) | `#00E5FF` (electric cyan) |
| Stroke width | 2px at logo's native scale |
| Logo source | `/Users/admin/Desktop/ION-LOGO-03.svg` (paths to be extracted into Lottie shape layers) |
| Logo placement | Centered horizontally and vertically; logo width ≈ 50% of canvas width |

## Animation timeline

Total duration: **2.5s** main reveal, then optional 2s breathing loop.

| Time (s) | Beat |
|---|---|
| 0.00 – 0.40 | Blank background. White stroke enters from above the canvas, draws the "I" top-to-bottom. |
| 0.40 – 1.20 | Stroke arcs into the "O" position; outer ring of the "O" is drawn clockwise. |
| 1.20 – 1.40 | Left figure inside "O" fades + scales in (90% → 100%). |
| 1.40 – 1.50 | **Hero beat:** cyan spark (small radial flash, ~80ms) flashes between the two figures. |
| 1.50 – 1.60 | Right figure inside "O" fades + scales in. |
| 1.60 – 2.20 | Stroke continues out of "O" and draws the "N". |
| 2.20 – 2.40 | All strokes transition from outline to solid white fill (180ms cross-fade). |
| 2.40 – 2.50 | Cyan halo expands outward from logo center, fades to 0 opacity. |
| 2.50+ (loop) | Optional: logo scales 1.000 → 1.015 → 1.000 over 2s, ease-in-out, infinite. |

### Easing
- All path draws: `cubic-bezier(0.65, 0, 0.35, 1)` (smooth, premium)
- Spark flash: ease-out, 80ms
- Halo expansion: ease-out, 100ms expansion + 100ms fade
- Breathing loop: ease-in-out sine

### What's deliberately excluded
- No bouncing, no overshoot, no rotation tricks
- No multiple competing motions at any single moment
- No more than two colors on screen at any time (white + cyan accent)
- No text, no tagline, no progress indicator (the breathing loop signals "alive")

## Architecture

Three artifacts, each with a single clear purpose:

1. **`splash.json`** — the Lottie animation file. Hand-authored shape layers (not an After Effects export). Contains: background solid, three stroke layers (one per logo path), trim-path animations driving the draw, two figure layers with opacity+scale animations, one spark layer, one halo layer, one optional loop group.

2. **`splash-preview.html`** — local-only preview page. Loads `splash.json` via [lottie-web](https://github.com/airbnb/lottie-web) from CDN. Includes a scrub bar, play/pause, and a background-color toggle (dark/light) so we can sanity-check the animation in isolation before integrating.

3. **`README.md`** — integration notes. One short section per platform (iOS via `lottie-ios`, Android via `lottie-android`, React Native via `lottie-react-native`) showing the minimum code to play the animation once and then transition to the app.

### Why hand-authored Lottie JSON (not After Effects export)
- Faster iteration: tweak a duration or color by editing one number in the JSON
- Smaller file: no unused AE properties or hidden layers
- No tooling dependency: the team can edit it in any text editor
- Easier code review: a diff on the JSON shows exactly what changed

## Color palette reference

| Role | Hex | Notes |
|---|---|---|
| Background | `#0F0A2E` | Deep navy, derived from brand `#1d1645` |
| Brand navy (reference) | `#1d1645` | Original logo color (used in light-bg variant if ever needed) |
| Logo stroke / fill | `#FFFFFF` | High contrast on dark bg |
| Accent (spark + halo) | `#00E5FF` | Electric cyan — used for ~10% of total frames |

## Out of scope (for this spec)

- App-side wiring (when splash plays, when it dismisses, transition into the home screen) — that's a mobile-app concern, not a splash-asset concern
- Light-background variant (deferred unless requested; design supports it with minor color swaps)
- Localization / per-region variants
- Sound design

## Success criteria

1. The animation file plays correctly in the lottie-web preview at 60fps on a recent MacBook
2. Total file size ≤ 50KB (hand-authored JSON should easily meet this)
3. The logo at the end of the animation is pixel-identical to the source SVG (no drift from path conversion)
4. The hero beat (cyan spark between figures) is unambiguously the visual focal point — confirmed by eye on first viewing
5. The animation feels premium and "clean" — no visible jank, no competing motion, no ornamental flourishes

## Open questions deferred to implementation

- Exact path data for the two figures inside the "O" — will be extracted from the source SVG during implementation
- Whether the breathing loop should be enabled by default or opt-in via a Lottie marker — decide during implementation review
