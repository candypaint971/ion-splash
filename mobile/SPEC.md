# ION Splash — Design Spec

Single source of truth for tokens, timings, and layer order. The web reference is [`../index.html`](../index.html); the RN implementation is [`./IonSplash.tsx`](./IonSplash.tsx). If anything here disagrees with `IonSplash.tsx`, the component wins — please update this file.

## Layer order (back → front)

1. **Background photo** — `assets/station@{1,2,3}x.jpg`, `cover`, opacity `0.55`
2. **Brand diagonal gradient** — 135° linear, 4 stops, alpha 0.55
3. **Vignette** — soft top/bottom darkening with `#0F0A2E` (replaces the web radial)
4. **Lottie grid pulse** — `splash.json`, loops forever, ~80% width, centered
5. **Logo** — outline (always visible) + masked white fill (rises bottom→top)
6. **Tagline** — typed character-by-character
7. **Version** + **Credit** — bottom of screen

## Colors

| Token | Hex / RGBA | Use |
|---|---|---|
| `bg.base` | `#0F0A2E` | Stage background, vignette tint |
| `gradient.0` | `rgba(91, 61, 240, 0.55)` | Diagonal gradient stop 0 (0%) |
| `gradient.1` | `rgba(123, 63, 228, 0.55)` | Diagonal gradient stop 1 (35%) |
| `gradient.2` | `rgba(168, 85, 247, 0.55)` | Diagonal gradient stop 2 (65%) |
| `gradient.3` | `rgba(217, 70, 239, 0.55)` | Diagonal gradient stop 3 (100%) |
| `logo.outline` | `rgba(255, 255, 255, 0.28)` | Faint logo outline stroke |
| `logo.fill` | `#FFFFFF` | Logo fill |
| `logo.glow` | `rgba(123, 63, 228, 0.6)` | Drop shadow once revealed |
| `text.primary` | `#FFFFFF` | Tagline base |
| `text.accent` | `#C77DFF` | "faster" italic accent |
| `text.accentGlow` | `rgba(199, 125, 255, 0.55)` | Accent text shadow |
| `text.version` | `rgba(255, 255, 255, 0.30)` | Version label |
| `text.credit` | `rgba(255, 255, 255, 0.22)` | Credit line |
| `heart` | `#FF5C8A` | The ♥ in the credit |

## Typography

- **Family:** Manrope (Google Fonts). Weights used: **200** (tagline base, version, credit) and **600** (italic accent).
- **Tagline size:** `clamp(22, 3.6vw, 34)` on web — on mobile use **28pt** (line 1 and 2). Line height 32, letter spacing 0.3.
- **Italic accent:** `font-style: italic; font-weight: 600;` on the word "faster".
- **Version:** 13pt, weight 300, 80% letter spacing.
- **Credit:** 10pt, weight 300, 80% letter spacing.
- **Layout quirk:** line 2 is indented (`padding-left: 1.6em` on web ≈ **44px** on mobile).

## Timings (synced to the Lottie soundtrack, 30 fps)

| Event | Trigger | Duration | Easing |
|---|---|---|---|
| Logo reveal start | Lottie frame **18** = **600 ms** | — | — |
| Logo fill rises bottom→top | from start | **2400 ms** | `cubic-bezier(0.65, 0, 0.35, 1)` |
| Logo glow fades in | from start | **500 ms** ease-out | — |
| Tagline begins typing | Lottie frame **160** = **5300 ms** | — | — |
| Per-character delay | — | **55 ms** | linear |
| Gap between line 1 and line 2 | after line 1 finishes | **350 ms** | — |
| `onComplete` fires | after line 2 + holdAfterTypingMs | default **600 ms** | — |

The Lottie loops in the background indefinitely; logo + tagline run **once**. Total scripted runtime: ~9–10 s before `onComplete`.

## Tagline content

```
Charge faster        ← "faster" is italic + #C77DFF
   Drive longer      ← indented 44px, all #FFFFFF
```

## Logo geometry

- Source: [`assets/ion-logo.svg`](assets/ion-logo.svg) (also embedded as path data in `IonSplash.tsx`)
- viewBox: `0 0 173.3 73.75` (aspect ≈ 2.35)
- Rendered size: `min(220px, 48vw) × auto` — on a typical phone, **220 × 93**
- Position: dead center (50% / 50%)
- Reveal: SVG `<Mask>` with a white rect whose `y` animates from `73.75` (hidden) to `0` (full)

## Layout positions

- **Logo** — viewport center (50% / 50%)
- **Tagline** — `top: 60% + 20px`, horizontally centered, lines left-aligned within their block
- **Version** — bottom + 42 px (above safe-area inset on iOS)
- **Credit** — bottom + 14 px (above safe-area inset on iOS)

## Background photo handling

- Provided in `@1x` (390 px wide), `@2x` (780 px), `@3x` (1170 px) variants — RN auto-picks by device scale.
- Source: 4K Dubai EV charging station, cropped center, JPEG q ≈ 80.
- Always 0.55 opacity. Filters used on web (`saturate 1.05, contrast 1.05`) are subtle — fine to skip on mobile.
