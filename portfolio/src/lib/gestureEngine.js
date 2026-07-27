/**
 * Pure gesture logic: MediaPipe hand landmarks in, cursor position and
 * gesture actions out. No DOM, no camera, no side effects — which is what
 * makes this the one module worth unit-testing.
 *
 * Landmark indices follow the MediaPipe hand model:
 *   0 wrist   4 thumb tip   5 index MCP   8 index tip
 *   9 middle MCP   13 ring MCP   17 pinky MCP
 */

const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_TIP = 8;
const MIDDLE_MCP = 9;
const PALM_POINTS = [0, 5, 9, 13, 17];

const EPSILON = 1e-6;

export const DEFAULTS = {
  // The hand rarely reaches the edge of the camera's field of view, so only
  // the middle of the frame is mapped — and it is stretched to fill the screen.
  activeMin: 0.2,
  activeMax: 0.8,

  // Pinch thresholds, as a fraction of hand size. The gap between them is a
  // dead band: without it the state flickers when the ratio sits on the edge.
  pinchClose: 0.35,
  pinchOpen: 0.5,

  // A pinch is a click only if it is released quickly and barely moved.
  clickMaxMs: 350,
  clickMaxPx: 40,

  scrollGain: 1.6,

  // Velocity-adaptive smoothing: heavy when still (kills jitter),
  // light when moving fast (kills lag).
  smoothMin: 0.35,
  smoothMax: 0.9,
  smoothVelRef: 60, // px/frame at which smoothing reaches smoothMax
};

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function palmCenter(landmarks) {
  let x = 0;
  let y = 0;
  for (const i of PALM_POINTS) {
    x += landmarks[i].x;
    y += landmarks[i].y;
  }
  return { x: x / PALM_POINTS.length, y: y / PALM_POINTS.length };
}

export function handScale(landmarks) {
  return Math.max(distance(landmarks[WRIST], landmarks[MIDDLE_MCP]), EPSILON);
}

/**
 * Distance between thumb tip and index tip, divided by hand size.
 * Dividing by hand size is what makes a single threshold work whether the
 * visitor is leaning into the camera or sitting back from it.
 */
export function pinchRatio(landmarks) {
  return distance(landmarks[THUMB_TIP], landmarks[INDEX_TIP]) / handScale(landmarks);
}

export function mapToViewport(point, viewport, cfg = DEFAULTS) {
  const span = cfg.activeMax - cfg.activeMin;
  const mirroredX = 1 - point.x; // the webcam image is a mirror
  const nx = (mirroredX - cfg.activeMin) / span;
  const ny = (point.y - cfg.activeMin) / span;
  return {
    x: clamp(nx, 0, 1) * viewport.width,
    y: clamp(ny, 0, 1) * viewport.height,
  };
}

export function smoothStep(prev, next, cfg = DEFAULTS) {
  if (!prev) return next;
  const travelled = Math.hypot(next.x - prev.x, next.y - prev.y);
  const t = Math.min(travelled / cfg.smoothVelRef, 1);
  const alpha = cfg.smoothMin + (cfg.smoothMax - cfg.smoothMin) * t;
  return {
    x: prev.x + (next.x - prev.x) * alpha,
    y: prev.y + (next.y - prev.y) * alpha,
  };
}

/**
 * Per-frame gesture state machine.
 *
 * The interesting decision is click-versus-drag. Both start as a pinch, so
 * the engine waits: a pinch that is released quickly and barely moved is a
 * click; one that outlives `clickMaxMs` or travels past `clickMaxPx` becomes
 * a drag, and is then committed to scrolling — releasing it emits nothing.
 */
export function createEngine(userCfg = {}) {
  const cfg = { ...DEFAULTS, ...userCfg };

  let cursor = null;
  let pinching = false;
  let pinchStart = null;
  let dragging = false;
  let lastDragY = 0;

  function reset() {
    pinching = false;
    pinchStart = null;
    dragging = false;
  }

  function update(landmarks, timestampMs, viewport) {
    if (!landmarks || landmarks.length === 0) {
      // Losing the hand mid-pinch must not leave a phantom drag running,
      // nor fire a click when the hand comes back.
      reset();
      return { cursor, pinching: false, hand: false, action: null };
    }

    const target = mapToViewport(palmCenter(landmarks), viewport, cfg);
    cursor = smoothStep(cursor, target, cfg);

    const ratio = pinchRatio(landmarks);
    const wasPinching = pinching;
    if (pinching) {
      if (ratio > cfg.pinchOpen) pinching = false;
    } else if (ratio < cfg.pinchClose) {
      pinching = true;
    }

    let action = null;

    if (!wasPinching && pinching) {
      pinchStart = { t: timestampMs, x: cursor.x, y: cursor.y };
      dragging = false;
      lastDragY = cursor.y;
    } else if (wasPinching && pinching) {
      const heldMs = timestampMs - pinchStart.t;
      const movedPx = Math.hypot(cursor.x - pinchStart.x, cursor.y - pinchStart.y);

      if (!dragging && (heldMs > cfg.clickMaxMs || movedPx > cfg.clickMaxPx)) {
        dragging = true;
      }

      // The reference advances on every held frame, not only while dragging.
      // Left frozen at the pinch position, the first frame after the drag is
      // recognised would dump all the movement that led up to it in one jolt.
      // The travel that is dropped here is the arbitration dead band — the
      // same slop a touchscreen discards before it admits a drag.
      const dy = cursor.y - lastDragY;
      lastDragY = cursor.y;

      // Touch-style mapping: dragging the hand up pulls the page up,
      // which means scrolling down — a positive wheel deltaY.
      if (dragging && dy !== 0) {
        action = { type: 'scroll', deltaY: -dy * cfg.scrollGain };
      }
    } else if (wasPinching && !pinching) {
      const heldMs = timestampMs - pinchStart.t;
      const movedPx = Math.hypot(cursor.x - pinchStart.x, cursor.y - pinchStart.y);

      if (!dragging && heldMs <= cfg.clickMaxMs && movedPx <= cfg.clickMaxPx) {
        action = { type: 'click', x: cursor.x, y: cursor.y };
      }
      pinchStart = null;
      dragging = false;
    }

    return { cursor, pinching, hand: true, action };
  }

  return { update, reset };
}
