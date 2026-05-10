import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Defs,
  G,
  Mask,
  Path,
  Rect,
} from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// ---------------------------------------------------------------------------
// Drop-in ION splash screen for React Native.
//
// Required peer dependencies (install in the host app):
//   lottie-react-native        ^7
//   react-native-svg           ^15
//   react-native-reanimated    ^3
//   expo-linear-gradient       ^13   (or react-native-linear-gradient — swap import)
//   Manrope font (weights 200, 600) registered via expo-font or react-native-asset
//
// Asset paths assume this file sits next to ./assets/ — adjust the require() calls
// if your project uses a different convention.
// ---------------------------------------------------------------------------

export type IonSplashProps = {
  /** Fires after the tagline has finished typing. Use this to dismiss the splash. */
  onComplete?: () => void;
  /** App version label shown at the bottom. Defaults to "v1.0.0". */
  version?: string;
  /** Override the credit line. Pass null to hide it. Defaults to "Built with ♥ in the UAE". */
  credit?: string | null;
  /** Wait this many ms after the tagline finishes before calling onComplete. Default 600. */
  holdAfterTypingMs?: number;
  /** Override the container style (e.g. add a top safe-area inset). */
  style?: ViewStyle;
};

// Timing constants — keep in sync with mobile/SPEC.md.
const LOGO_REVEAL_DELAY_MS = 600;     // Lottie frame 18 @ 30fps
const LOGO_REVEAL_DURATION_MS = 2400;
const TYPE_TRIGGER_DELAY_MS = 5300;   // Lottie frame 160 @ 30fps
const CHAR_DELAY_MS = 55;
const LINE_GAP_MS = 350;

// Logo SVG viewBox + path data, lifted from assets/ion-logo.svg.
const LOGO_VB = { width: 173.3, height: 73.75 };
const LOGO_PATHS = [
  'M6.31,4.18c-1.16,1.1-1.74,2.43-1.74,4.01v57.6c0,1.58.58,2.91,1.74,4.01,1.13,1.13,2.51,1.69,4.13,1.69s3-.57,4.13-1.69c1.16-1.09,1.74-2.43,1.74-4.01V8.19c0-1.58-.58-2.91-1.74-4.01-1.13-1.13-2.51-1.69-4.13-1.69s-3,.56-4.13,1.69',
  'M114.71,2.59c-1.19.39-2.16,1.08-2.88,2.08-.73.96-1.1,2.06-1.1,3.28v57.85c0,1.58.58,2.91,1.74,4.01,1.13,1.13,2.5,1.69,4.13,1.69s3-.57,4.13-1.69c1.16-1.09,1.74-2.43,1.74-4.01V24.61l35.77,44.67v.05h.05c.1.13.15.19.15.19,0,0,.07.06.2.19v.05l.05.05c.13.13.28.26.45.38.04.03.1.08.2.15.13.1.25.18.35.24.03.03.1.08.2.15.1.03.21.08.35.15.07.06.13.1.2.1.1.06.23.12.4.14.1.07.17.1.2.1.1.03.23.06.4.1.16.07.23.08.2.05.13.03.3.06.5.1.13.03.17.03.1,0,.23.03.45.05.65.05.27,0,.54-.02.85-.05l.15-.05c.3-.03.58-.1.85-.19-.07.03-.03.02.1-.05.26-.1.53-.21.79-.34h.05c.23-.13.48-.29.74-.48l.05-.05c.06-.04.09-.07.11-.08.05-.04.12-.09.19-.16.13-.1.2-.16.2-.19.03,0,.1-.07.2-.19.1-.1.16-.16.2-.19l.15-.19c.1-.13.17-.22.2-.29l.15-.15c.07-.13.12-.22.15-.29l.15-.24.1-.24c.03-.07.07-.16.1-.29.07-.13.1-.21.1-.24.03-.03.06-.13.1-.29l.05-.24c.03-.06.05-.16.05-.29.03-.13.05-.23.05-.29v-.24c.03-.13.05-.23.05-.29V7.95c0-1.58-.58-2.91-1.74-4.01-1.13-1.13-2.51-1.69-4.13-1.69s-3.02.56-4.18,1.69c-1.13,1.09-1.69,2.43-1.69,4.01v41.24L121.23,4.47c-.77-.97-1.74-1.63-2.93-1.98-.56-.16-1.12-.24-1.67-.24-.65,0-1.29.11-1.92.34',
  'M63.52,2.06c-19.81,0-35.86,15.59-35.86,34.81s15.95,34.71,35.67,34.81h.38c19.72-.1,35.67-15.65,35.67-34.81S83.33,2.06,63.52,2.06M62.82,60.34c-12.47-.34-22.78-10.07-23.45-22.16-.62-11.17,6.81-20.75,17.17-23.78.19-.06.39-.05.58.01.6.2,1.28.66,1.83,1.63,1.65,2.92,2.3,6.38-.38,9-1.01.99-2.29,1.67-3.35,2.6-.94.82-1.77,1.72-2.43,2.77-1.42,2.21-2.07,4.83-1.87,7.43.02.24.05.49.08.73.77,5.7,5.4,10.02,11.3,10.57,7.57.71,13.94-5.04,13.94-12.24,0-2.56-.84-5.09-2.38-7.17-.75-1.01-1.65-1.91-2.68-2.64-2.88-2.03-5.4-4.31-4.01-8.97.21-.7.55-1.37.95-1.99.02-.03.04-.06.06-.08.56-1,1.27-1.45,1.87-1.63.15-.05.31-.05.46,0,9.96,2.9,17.22,11.86,17.22,22.48,0,12.96-10.83,23.47-24.18,23.47-.23,0-.46,0-.7,0',
];

const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Tagline structure. Words flagged em render in italic + brand purple.
type Segment = { text: string; em?: boolean };
const LINE_1: Segment[] = [{ text: 'Charge ' }, { text: 'faster', em: true }];
const LINE_2: Segment[] = [{ text: 'Drive longer' }];

export default function IonSplash({
  onComplete,
  version = 'v1.0.0',
  credit = 'Built with ♥ in the UAE',
  holdAfterTypingMs = 600,
  style,
}: IonSplashProps) {
  const { width: screenW } = Dimensions.get('window');
  const logoWidth = Math.min(220, screenW * 0.48);
  const logoHeight = logoWidth * (LOGO_VB.height / LOGO_VB.width);

  // Logo reveal: animate the mask rect's y from logoHeight (hidden) to 0 (full).
  const maskY = useSharedValue(LOGO_VB.height);
  const animatedMaskProps = useAnimatedProps(() => ({ y: maskY.value }));

  // Typed-out tagline state. We render the lines in fully-formed "ghost" form
  // first to lock their width, then progressively reveal characters.
  const [line1Chars, setLine1Chars] = useState(0);
  const [line2Chars, setLine2Chars] = useState(0);
  const [taglineVisible, setTaglineVisible] = useState(false);

  const completedRef = useRef(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(
      setTimeout(() => {
        maskY.value = withTiming(0, {
          duration: LOGO_REVEAL_DURATION_MS,
          easing: Easing.bezier(0.65, 0, 0.35, 1),
        });
      }, LOGO_REVEAL_DELAY_MS)
    );

    timers.push(
      setTimeout(() => {
        setTaglineVisible(true);
        const line1Len = totalLen(LINE_1);
        const line2Len = totalLen(LINE_2);
        for (let i = 1; i <= line1Len; i++) {
          timers.push(setTimeout(() => setLine1Chars(i), CHAR_DELAY_MS * i));
        }
        const line2Start = CHAR_DELAY_MS * line1Len + LINE_GAP_MS;
        for (let i = 1; i <= line2Len; i++) {
          timers.push(setTimeout(() => setLine2Chars(i), line2Start + CHAR_DELAY_MS * i));
        }
        const totalMs = line2Start + CHAR_DELAY_MS * line2Len + holdAfterTypingMs;
        timers.push(
          setTimeout(() => {
            if (!completedRef.current) {
              completedRef.current = true;
              onComplete?.();
            }
          }, totalMs)
        );
      }, TYPE_TRIGGER_DELAY_MS)
    );

    return () => timers.forEach(clearTimeout);
  }, [maskY, onComplete, holdAfterTypingMs]);

  return (
    <View style={[styles.stage, style]}>
      <ImageBackground
        source={require('./assets/station@3x.jpg')}
        style={styles.bgPhoto}
        imageStyle={styles.bgPhotoImage}
        resizeMode="cover"
      />

      {/* Brand diagonal gradient overlay (matches the CTA gradient) */}
      <LinearGradient
        colors={[
          'rgba(91, 61, 240, 0.55)',
          'rgba(123, 63, 228, 0.55)',
          'rgba(168, 85, 247, 0.55)',
          'rgba(217, 70, 239, 0.55)',
        ]}
        locations={[0, 0.35, 0.65, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Soft vignette darkening the edges (approximates the radial overlay) */}
      <LinearGradient
        colors={[
          'rgba(15, 10, 46, 0.6)',
          'rgba(15, 10, 46, 0.25)',
          'rgba(15, 10, 46, 0.6)',
        ]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Lottie grid pulse — loops in the background. */}
      <LottieView
        source={require('./splash.json')}
        autoPlay
        loop
        resizeMode="contain"
        style={styles.lottie}
      />

      {/* Logo: outline + masked white fill that rises bottom→top. */}
      <View
        pointerEvents="none"
        style={[styles.logoWrap, { width: logoWidth, height: logoHeight }]}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${LOGO_VB.width} ${LOGO_VB.height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <Defs>
            <Mask id="reveal" x="0" y="0" width={LOGO_VB.width} height={LOGO_VB.height}>
              <Rect x={0} y={0} width={LOGO_VB.width} height={LOGO_VB.height} fill="black" />
              <AnimatedRect
                x={0}
                width={LOGO_VB.width}
                height={LOGO_VB.height}
                fill="white"
                animatedProps={animatedMaskProps}
              />
            </Mask>
          </Defs>

          {LOGO_PATHS.map((d, i) => (
            <Path
              key={`outline-${i}`}
              d={d}
              fill="none"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth={0.4}
            />
          ))}

          <G mask="url(#reveal)">
            {LOGO_PATHS.map((d, i) => (
              <Path key={`fill-${i}`} d={d} fill="#ffffff" />
            ))}
          </G>
        </Svg>
      </View>

      {/* Tagline */}
      <View pointerEvents="none" style={styles.taglineWrap}>
        <View style={[styles.taglineInner, { opacity: taglineVisible ? 1 : 0 }]}>
          <Text style={styles.taglineLine} numberOfLines={1}>
            {renderTyped(LINE_1, line1Chars)}
          </Text>
          <Text style={[styles.taglineLine, styles.taglineIndent]} numberOfLines={1}>
            {renderTyped(LINE_2, line2Chars)}
          </Text>
        </View>
      </View>

      <Text pointerEvents="none" style={styles.appVersion}>{version}</Text>
      {credit !== null ? (
        <Text pointerEvents="none" style={styles.credit}>{credit}</Text>
      ) : null}
    </View>
  );
}

function totalLen(segs: Segment[]) {
  return segs.reduce((n, s) => n + s.text.length, 0);
}

function renderTyped(segs: Segment[], visibleCount: number) {
  const out: React.ReactNode[] = [];
  let consumed = 0;
  for (let i = 0; i < segs.length; i++) {
    const remaining = visibleCount - consumed;
    if (remaining <= 0) break;
    const slice = segs[i].text.slice(0, Math.max(0, remaining));
    if (slice.length === 0) break;
    out.push(
      <Text
        key={i}
        style={
          segs[i].em
            ? { fontStyle: 'italic', fontWeight: '600', color: '#C77DFF' }
            : undefined
        }
      >
        {slice}
      </Text>
    );
    consumed += segs[i].text.length;
  }
  return out;
}

const FONT_FAMILY = Platform.select({
  ios: 'Manrope',
  android: 'Manrope',
  default: 'Manrope',
});

const styles = StyleSheet.create({
  stage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F0A2E',
    overflow: 'hidden',
  },
  bgPhoto: {
    ...StyleSheet.absoluteFillObject,
  },
  bgPhotoImage: {
    opacity: 0.55,
  },
  lottie: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    width: '80%',
    aspectRatio: 1080 / 1920,
    transform: [{ translateY: -200 }],
  },
  logoWrap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -110 }, { translateY: -23 }],
  },
  taglineWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '60%',
    alignItems: 'center',
    transform: [{ translateY: 20 }],
  },
  taglineInner: {
    alignItems: 'flex-start',
  },
  taglineLine: {
    color: '#ffffff',
    fontFamily: FONT_FAMILY,
    fontSize: 28,
    fontWeight: '200',
    letterSpacing: 0.3,
    lineHeight: 32,
    textShadowColor: 'rgba(123, 63, 228, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  taglineIndent: {
    paddingLeft: 44,
  },
  appVersion: {
    position: 'absolute',
    bottom: 42,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.3)',
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '300',
    letterSpacing: 0.8,
  },
  credit: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.22)',
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: '300',
    letterSpacing: 0.8,
  },
});
