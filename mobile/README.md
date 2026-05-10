# ION Splash — React Native handoff

This folder is everything your engineer needs to drop the splash screen into the ION mobile app. **No rewriting required** — the component is TypeScript, ready to import.

## Contents

| File | What it is |
|---|---|
| [`IonSplash.tsx`](IonSplash.tsx) | Drop-in TypeScript React Native component |
| [`SPEC.md`](SPEC.md) | Design tokens, timings, layer order, layout |
| [`splash.json`](splash.json) | Lottie animation (background grid pulse, ~5 KB) |
| [`assets/ion-logo.svg`](assets/ion-logo.svg) | Source logo (also inlined as paths in the component) |
| [`assets/station@1x.jpg`](assets/station@1x.jpg), `@2x`, `@3x` | Optimized background photo for each device scale |

The web reference implementation (HTML/CSS/JS) lives at [`../index.html`](../index.html) — useful to compare against side-by-side, not to ship.

## Install dependencies

```bash
# Bare RN
npm install lottie-react-native react-native-svg react-native-reanimated expo-linear-gradient
cd ios && pod install

# Expo
npx expo install lottie-react-native react-native-svg react-native-reanimated expo-linear-gradient
```

Required peer versions: `lottie-react-native ^7`, `react-native-svg ^15`, `react-native-reanimated ^3`, `expo-linear-gradient ^13`.

> Using `react-native-linear-gradient` instead of `expo-linear-gradient`? Just swap the import in `IonSplash.tsx` — the prop API is compatible.

Reanimated also needs the babel plugin in `babel.config.js` — see the [Reanimated install guide](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started).

## Register the Manrope font

Manrope weights **200** and **600** are required.

**Expo:**
```ts
import { useFonts, Manrope_200ExtraLight, Manrope_600SemiBold } from '@expo-google-fonts/manrope';

const [loaded] = useFonts({ Manrope_200ExtraLight, Manrope_600SemiBold });
```

(If you use `@expo-google-fonts/manrope`, change `fontFamily` in `IonSplash.tsx` from `'Manrope'` to `'Manrope_200ExtraLight'` / `'Manrope_600SemiBold'` on the relevant text styles.)

**Bare RN:** download `Manrope-ExtraLight.ttf` and `Manrope-SemiBold.ttf` from [Google Fonts](https://fonts.google.com/specimen/Manrope), drop them into `assets/fonts/`, run `npx react-native-asset`.

## Drop into the app

```tsx
import IonSplash from './path/to/mobile/IonSplash';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return <IonSplash onComplete={() => setSplashDone(true)} />;
  }
  return <RootNavigator />;
}
```

The component is fullscreen by default (`StyleSheet.absoluteFillObject`), pulls its own assets, and calls `onComplete` once the tagline finishes typing (~10 s).

### Props

| Prop | Default | Notes |
|---|---|---|
| `onComplete` | — | Fires after the tagline finishes. Use this to dismiss. |
| `version` | `"v1.0.0"` | Pull from your build manifest in real use. |
| `credit` | `"Built with ♥ in the UAE"` | Pass `null` to hide. |
| `holdAfterTypingMs` | `600` | Extra pause before `onComplete`. |
| `style` | — | Override container style (e.g. add a top inset). |

### Coordinate with the native launch screen

Recommended sequence:
1. iOS `LaunchScreen.storyboard` / Android `splash.xml` shows a static frame: `#0F0A2E` background + the dimmed station photo + the faint logo outline.
2. As soon as JS mounts, `<IonSplash>` takes over and animates the reveal.
3. On `onComplete`, transition to the app.

This avoids a flash between native splash and JS splash.

## Things you can change without re-deriving anything

- Tagline copy → edit `LINE_1` / `LINE_2` in `IonSplash.tsx`.
- Timings → constants at the top of `IonSplash.tsx`. Keep [`SPEC.md`](SPEC.md) in sync.
- Logo art → replace the path strings in `LOGO_PATHS` (and `assets/ion-logo.svg`) and update `LOGO_VB` if the viewBox changes.
- Background → swap the `station@*.jpg` files. The component picks the right scale automatically.

## Things to know about the implementation

- The logo "rise" is a `react-native-svg` `<Mask>` with a Reanimated white rect whose `y` slides from `73.75` (viewBox height) to `0`. This matches the web version's `clip-path: inset(100% 0 0 0) → inset(0 0 0 0)`.
- The web version uses a *radial* dim overlay; React Native's gradient libraries are linear-only without an extra package. The component approximates it with a vertical 3-stop linear gradient. If you want the exact radial look, add `react-native-radial-gradient` and replace the second gradient layer.
- The Lottie file only contains the background grid pulse — the logo and tagline are **native** for crisper text and easier localization.

## Questions for the design team before final cut

1. Should the splash dismiss on a fixed timer (current behaviour, ~10 s), on app-ready, or whichever comes later?
2. Is the credit line ("Built with ♥ in the UAE") shipping in the production build, or is it placeholder?
3. Is `v1.0.0` placeholder or do you want it pulled from a specific build field?
