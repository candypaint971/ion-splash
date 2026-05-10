export const FPS = 60;
export const TOTAL_FRAMES = 360; // 6s at 60fps (3s reveal + 3s breathing loop)

export const sec = (s) => Math.round(s * FPS);

export const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
};

export const COLORS = {
  background: hexToRgb('#0F0A2E'),
  stroke: hexToRgb('#FFFFFF'),
  accent: hexToRgb('#00E5FF'),
};

// Premium ease: cubic-bezier(0.65, 0, 0.35, 1) → Lottie keyframe easing
export const PREMIUM_EASE = {
  i: { x: [0.35], y: [1] },
  o: { x: [0.65], y: [0] },
};

export const EASE_OUT = {
  i: { x: [0.25], y: [1] },
  o: { x: [0.5], y: [1] },
};
