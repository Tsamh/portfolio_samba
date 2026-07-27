import { describe, it, expect } from 'vitest';
import {
  DEFAULTS,
  palmCenter,
  handScale,
  mapToViewport,
  smoothStep,
  pinchRatio,
  createEngine,
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

describe('pinchRatio', () => {
  it('reports the gap between thumb and index as a fraction of hand size', () => {
    expect(pinchRatio(makeHand({ pinchGap: 0.3 }))).toBeCloseTo(0.3, 6);
  });

  it('is invariant to how far the hand is from the camera', () => {
    const near = pinchRatio(makeHand({ scale: 0.4, pinchGap: 0.25 }));
    const far  = pinchRatio(makeHand({ scale: 0.1, pinchGap: 0.25 }));
    expect(near).toBeCloseTo(far, 6);
  });

  it('is invariant to where the hand sits in the frame', () => {
    const left  = pinchRatio(makeHand({ cx: 0.25, cy: 0.3, pinchGap: 0.25 }));
    const right = pinchRatio(makeHand({ cx: 0.75, cy: 0.7, pinchGap: 0.25 }));
    expect(left).toBeCloseTo(right, 6);
  });

  it('crosses the close threshold only for a tight pinch', () => {
    expect(pinchRatio(makeHand({ pinchGap: 0.2 }))).toBeLessThan(DEFAULTS.pinchClose);
    expect(pinchRatio(makeHand({ pinchGap: 0.8 }))).toBeGreaterThan(DEFAULTS.pinchOpen);
  });
});

describe('createEngine', () => {
  const OPEN = { pinchGap: 0.9 };
  const SHUT = { pinchGap: 0.2 };

  it('reports no hand and emits no action when the hand is absent', () => {
    const e = createEngine();
    const out = e.update(null, 0, VP);
    expect(out.hand).toBe(false);
    expect(out.action).toBe(null);
    expect(out.pinching).toBe(false);
  });

  it('holds pinch state through the dead band', () => {
    const e = createEngine();
    e.update(makeHand(OPEN), 0, VP);

    // close it
    expect(e.update(makeHand(SHUT), 16, VP).pinching).toBe(true);

    // ratios inside the dead band must not re-open it
    expect(e.update(makeHand({ pinchGap: 0.4 }), 32, VP).pinching).toBe(true);
    expect(e.update(makeHand({ pinchGap: 0.49 }), 48, VP).pinching).toBe(true);

    // only crossing pinchOpen releases it
    expect(e.update(makeHand({ pinchGap: 0.55 }), 64, VP).pinching).toBe(false);
  });

  it('emits a click for a quick, still pinch', () => {
    const e = createEngine();
    e.update(makeHand(OPEN), 0, VP);
    e.update(makeHand(SHUT), 100, VP);
    const out = e.update(makeHand(OPEN), 300, VP); // 200 ms, no movement

    expect(out.action.type).toBe('click');
    expect(typeof out.action.x).toBe('number');
    expect(typeof out.action.y).toBe('number');
  });

  it('does not emit a click when the pinch is held too long', () => {
    const e = createEngine();
    e.update(makeHand(OPEN), 0, VP);
    e.update(makeHand(SHUT), 0, VP);
    e.update(makeHand(SHUT), 500, VP); // past clickMaxMs -> becomes a drag
    const out = e.update(makeHand(OPEN), 600, VP);

    expect(out.action).toBe(null);
  });

  it('emits scroll deltas while dragging, and no click on release', () => {
    const e = createEngine();
    e.update(makeHand({ ...OPEN, cy: 0.5 }), 0, VP);
    e.update(makeHand({ ...SHUT, cy: 0.5 }), 16, VP);

    // move the hand far enough to turn the pinch into a drag
    let out;
    for (let i = 1; i <= 12; i++) {
      out = e.update(makeHand({ ...SHUT, cy: 0.5 - i * 0.02 }), 16 + i * 16, VP);
    }
    expect(out.action.type).toBe('scroll');

    // hand moving up must scroll the page down: positive wheel deltaY
    expect(out.action.deltaY).toBeGreaterThan(0);

    expect(e.update(makeHand({ ...OPEN, cy: 0.26 }), 400, VP).action).toBe(null);
  });

  it('does not dump accumulated movement into the first scroll frame', () => {
    const e = createEngine();
    e.update(makeHand({ ...OPEN, cy: 0.5 }), 0, VP);
    e.update(makeHand({ ...SHUT, cy: 0.5 }), 16, VP);

    const deltas = [];
    for (let i = 1; i <= 12; i++) {
      const out = e.update(makeHand({ ...SHUT, cy: 0.5 - i * 0.02 }), 16 + i * 16, VP);
      if (out.action?.type === 'scroll') deltas.push(out.action.deltaY);
    }

    // The frame that first admits the drag must scroll by that frame's own
    // movement, not by everything banked since the pinch closed. Smoothing is
    // still ramping up here, so this frame is if anything slightly smaller
    // than the steady state; the defect made it ~57% larger.
    expect(deltas.length).toBeGreaterThan(1);
    expect(deltas[0]).toBeLessThanOrEqual(deltas[deltas.length - 1]);
  });

  it('scrolls the other way when the hand moves down', () => {
    const e = createEngine();
    e.update(makeHand({ ...OPEN, cy: 0.5 }), 0, VP);
    e.update(makeHand({ ...SHUT, cy: 0.5 }), 16, VP);

    let out;
    for (let i = 1; i <= 12; i++) {
      out = e.update(makeHand({ ...SHUT, cy: 0.5 + i * 0.02 }), 16 + i * 16, VP);
    }
    expect(out.action.deltaY).toBeLessThan(0);
  });

  it('treats a pinch that moves a long way as a drag, not a click', () => {
    const e = createEngine();
    e.update(makeHand({ ...OPEN, cx: 0.5 }), 0, VP);
    e.update(makeHand({ ...SHUT, cx: 0.5 }), 0, VP);
    e.update(makeHand({ ...SHUT, cx: 0.2 }), 100, VP); // big jump, still quick
    const out = e.update(makeHand({ ...OPEN, cx: 0.2 }), 150, VP);

    expect(out.action).toBe(null);
  });

  it('drops the pinch when the hand disappears mid-gesture', () => {
    const e = createEngine();
    e.update(makeHand(OPEN), 0, VP);
    e.update(makeHand(SHUT), 16, VP);

    expect(e.update(null, 32, VP).pinching).toBe(false);

    // the hand coming back open must not fire a stale click
    expect(e.update(makeHand(OPEN), 48, VP).action).toBe(null);
  });

  it('keeps the cursor inside the viewport', () => {
    const e = createEngine();
    for (let i = 0; i < 30; i++) {
      e.update(makeHand({ cx: 0.02, cy: 0.98, ...OPEN }), i * 16, VP);
    }
    const { cursor } = e.update(makeHand({ cx: 0.02, cy: 0.98, ...OPEN }), 999, VP);
    expect(cursor.x).toBeGreaterThanOrEqual(0);
    expect(cursor.x).toBeLessThanOrEqual(VP.width);
    expect(cursor.y).toBeGreaterThanOrEqual(0);
    expect(cursor.y).toBeLessThanOrEqual(VP.height);
  });
});
