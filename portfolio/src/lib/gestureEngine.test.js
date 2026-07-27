import { describe, it, expect } from 'vitest';
import {
  DEFAULTS,
  palmCenter,
  handScale,
  mapToViewport,
  smoothStep,
} from './gestureEngine';

/**
 * Builds a synthetic 21-landmark hand.
 * The five palm landmarks (0, 5, 9, 13, 17) average exactly to (cx, cy),
 * dist(0, 9) is exactly `scale`, and dist(thumb 4, index 8) is
 * `pinchGap * scale` — so `pinchGap` IS the pinch ratio.
 */
export function makeHand({ cx = 0.5, cy = 0.5, scale = 0.2, pinchGap = 1 } = {}) {
  const pts = Array.from({ length: 21 }, () => ({ x: cx, y: cy, z: 0 }));
  pts[0]  = { x: cx,             y: cy + scale / 2, z: 0 }; // wrist
  pts[9]  = { x: cx,             y: cy - scale / 2, z: 0 }; // middle MCP
  pts[5]  = { x: cx - scale / 2, y: cy,             z: 0 };
  pts[13] = { x: cx + scale / 2, y: cy,             z: 0 };
  pts[17] = { x: cx,             y: cy,             z: 0 };
  pts[4]  = { x: cx,                        y: cy, z: 0 }; // thumb tip
  pts[8]  = { x: cx + pinchGap * scale,     y: cy, z: 0 }; // index tip
  return pts;
}

const VP = { width: 1000, height: 800 };

describe('palmCenter', () => {
  it('averages the five palm landmarks', () => {
    const c = palmCenter(makeHand({ cx: 0.4, cy: 0.6, scale: 0.2 }));
    expect(c.x).toBeCloseTo(0.4, 6);
    expect(c.y).toBeCloseTo(0.6, 6);
  });
});

describe('handScale', () => {
  it('is the wrist-to-middle-MCP distance', () => {
    expect(handScale(makeHand({ scale: 0.25 }))).toBeCloseTo(0.25, 6);
  });

  it('never returns zero, so callers can divide safely', () => {
    const degenerate = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
    expect(handScale(degenerate)).toBeGreaterThan(0);
  });
});

describe('mapToViewport', () => {
  it('mirrors the X axis for a selfie-view camera', () => {
    // 0.35 is left-of-centre in camera space -> right-of-centre on screen
    const p = mapToViewport({ x: 0.35, y: 0.5 }, VP, DEFAULTS);
    expect(p.x).toBeGreaterThan(VP.width / 2);
  });

  it('maps the centre of the frame to the centre of the viewport', () => {
    const p = mapToViewport({ x: 0.5, y: 0.5 }, VP, DEFAULTS);
    expect(p.x).toBeCloseTo(VP.width / 2, 6);
    expect(p.y).toBeCloseTo(VP.height / 2, 6);
  });

  it('stretches the active region across the whole viewport', () => {
    // activeMin 0.2 on the mirrored axis is the right edge
    expect(mapToViewport({ x: DEFAULTS.activeMin, y: DEFAULTS.activeMin }, VP, DEFAULTS).y)
      .toBeCloseTo(0, 6);
    expect(mapToViewport({ x: DEFAULTS.activeMax, y: DEFAULTS.activeMax }, VP, DEFAULTS).y)
      .toBeCloseTo(VP.height, 6);
  });

  it('clamps points outside the active region to the viewport edges', () => {
    const p = mapToViewport({ x: -0.5, y: 1.9 }, VP, DEFAULTS);
    expect(p.x).toBe(VP.width);
    expect(p.y).toBe(VP.height);
  });
});

describe('smoothStep', () => {
  it('returns the target unchanged when there is no previous point', () => {
    expect(smoothStep(null, { x: 10, y: 20 }, DEFAULTS)).toEqual({ x: 10, y: 20 });
  });

  it('never overshoots the target', () => {
    const out = smoothStep({ x: 0, y: 0 }, { x: 100, y: 0 }, DEFAULTS);
    expect(out.x).toBeGreaterThan(0);
    expect(out.x).toBeLessThanOrEqual(100);
  });

  it('converges on the target when applied repeatedly', () => {
    let p = { x: 0, y: 0 };
    for (let i = 0; i < 60; i++) p = smoothStep(p, { x: 100, y: 50 }, DEFAULTS);
    expect(p.x).toBeCloseTo(100, 1);
    expect(p.y).toBeCloseTo(50, 1);
  });

  it('smooths small movements more heavily than large ones', () => {
    const slow = smoothStep({ x: 0, y: 0 }, { x: 2, y: 0 }, DEFAULTS);
    const fast = smoothStep({ x: 0, y: 0 }, { x: 200, y: 0 }, DEFAULTS);
    expect(slow.x / 2).toBeLessThan(fast.x / 200); // fraction travelled
  });
});
