# Hand-Gesture Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bottom-right camera button that lets a visitor drive the whole portfolio with hand gestures — palm moves a cursor, quick pinch clicks, pinch-and-drag scrolls.

**Architecture:** A self-contained gesture layer reads webcam frames through MediaPipe HandLandmarker, converts landmarks to a cursor position and gesture actions in a pure module, then synthesizes real DOM events (`pointermove`, `click`, `wheel`) against `document.elementFromPoint()`. Because it drives the page through events rather than calling the app's navigation functions, every existing component — `usePortfolio`, `Navbar`, `NavList`, `ProjectCarousel` — works unchanged.

**Tech Stack:** React 18, Vite 5, `@mediapipe/tasks-vision` 0.10.x (lazily imported, self-hosted), Vitest 3 for unit tests.

**Spec:** `docs/superpowers/specs/2026-07-27-gesture-navigation-design.md`

## Global Constraints

- All working paths are relative to `c:/Users/samba/Documents/DIT/3.0/me/portfolio`. The git repository root is one level up, at `c:/Users/samba/Documents/DIT/3.0/me`, so committed paths are prefixed with `portfolio/`.
- **Never write the assistant's name, an AI tool name, or a `Co-Authored-By` trailer** into commit messages, code, comments, or documentation.
- **Pin `vitest@^3.2.7`.** Vitest 4 declares a peer dependency of `vite ^6.0.0 || ^7.0.0 || ^8.0.0` and this project runs `vite ^5.4.0`. Installing Vitest 4 breaks the install.
- Pin `@mediapipe/tasks-vision@^0.10.35`.
- All user-facing copy is in **English**, matching the rest of the site.
- Styling uses the existing CSS variables from `src/css/index.css` (`--bg`, `--surface`, `--text`, `--text-soft`, `--line`, `--accent`) so both light and dark themes work with no extra code.
- Follow existing component conventions: one `src/css/<Name>.css` per component, imported as `'../css/<Name>.css'`; icons are inline `<svg>` with `stroke="currentColor"`; interactive elements get an `aria-label`.
- Z-index ladder: FAB `150`, existing Terminal overlay `200` (do not change), gesture modal `300`, gesture cursor `1000`.
- The gesture cursor is moved by **mutating `element.style.transform` directly through a ref**, never by React state. State updates at 60 fps would re-render the page on every frame.

---

### Task 1: Gesture geometry and smoothing

Sets up Vitest and implements the pure landmark math: palm center, hand scale, viewport mapping, and cursor smoothing.

**Files:**
- Modify: `package.json` (add `vitest` devDependency and `test` script)
- Modify: `vite.config.js` (add the `test` block)
- Create: `src/lib/gestureEngine.js`
- Test: `src/lib/gestureEngine.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `DEFAULTS` — config object, see code below.
  - `palmCenter(landmarks) -> {x, y}` — normalized, not mirrored.
  - `handScale(landmarks) -> number` — distance between landmark 0 and 9.
  - `mapToViewport(point, viewport, cfg) -> {x, y}` — pixels, X mirrored, clamped. `viewport` is `{width, height}`.
  - `smoothStep(prev, next, cfg) -> {x, y}` — `prev` may be `null`.

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest@^3.2.7
```

Expected: installs without an `ERESOLVE` peer-dependency error. If you see one, you installed Vitest 4 — remove it and reinstall with the `^3.2.7` range.

- [ ] **Step 2: Add the test script to `package.json`**

In the `"scripts"` block, add a `test` entry so it reads:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

- [ ] **Step 3: Configure Vitest in `vite.config.js`**

Replace the whole file with:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // photos exported by phones often have uppercase extensions
  assetsInclude: ['**/*.JPG', '**/*.JPEG', '**/*.PNG', '**/*.HEIC'],
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
```

- [ ] **Step 4: Write the failing tests**

Create `src/lib/gestureEngine.test.js`:

```js
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
```

- [ ] **Step 5: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./gestureEngine"`.

- [ ] **Step 6: Implement the geometry module**

Create `src/lib/gestureEngine.js`:

```js
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
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — 11 tests passing in `src/lib/gestureEngine.test.js`.

- [ ] **Step 8: Commit**

```bash
cd c:/Users/samba/Documents/DIT/3.0/me
git add portfolio/package.json portfolio/package-lock.json portfolio/vite.config.js portfolio/src/lib/gestureEngine.js portfolio/src/lib/gestureEngine.test.js
git commit -m "Add gesture geometry and cursor smoothing"
```

---

### Task 2: Pinch detection with hysteresis

**Files:**
- Modify: `src/lib/gestureEngine.js` (add `pinchRatio`)
- Test: `src/lib/gestureEngine.test.js` (append)

**Interfaces:**
- Consumes: `handScale`, `DEFAULTS` from Task 1.
- Produces: `pinchRatio(landmarks) -> number` — `dist(4, 8) / handScale(landmarks)`.

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/gestureEngine.test.js` (and add `pinchRatio` to the existing import from `./gestureEngine`):

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `pinchRatio is not a function`.

- [ ] **Step 3: Implement `pinchRatio`**

Add to `src/lib/gestureEngine.js`, after `handScale`:

```js
/**
 * Distance between thumb tip and index tip, divided by hand size.
 * Dividing by hand size is what makes a single threshold work whether the
 * visitor is leaning into the camera or sitting back from it.
 */
export function pinchRatio(landmarks) {
  return distance(landmarks[THUMB_TIP], landmarks[INDEX_TIP]) / handScale(landmarks);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — 15 tests passing.

- [ ] **Step 5: Commit**

```bash
cd c:/Users/samba/Documents/DIT/3.0/me
git add portfolio/src/lib/gestureEngine.js portfolio/src/lib/gestureEngine.test.js
git commit -m "Add scale-invariant pinch ratio"
```

---

### Task 3: The engine state machine

Assembles the per-frame engine: hysteresis, click-versus-drag arbitration, scroll deltas, and recovery when the hand leaves the frame.

**Files:**
- Modify: `src/lib/gestureEngine.js` (add `createEngine`)
- Test: `src/lib/gestureEngine.test.js` (append)

**Interfaces:**
- Consumes: everything from Tasks 1 and 2.
- Produces: `createEngine(userCfg?) -> { update, reset }`
  - `update(landmarks, timestampMs, viewport) -> { cursor, pinching, hand, action }`
    - `landmarks` is the 21-point array, or `null` when no hand is visible.
    - `cursor` is `{x, y}` in pixels, or `null` before the first hand is seen.
    - `action` is `null`, `{ type: 'click', x, y }`, or `{ type: 'scroll', deltaY }`.
  - `reset()` clears pinch and drag state without touching the cursor.

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/gestureEngine.test.js` (add `createEngine` to the import):

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `createEngine is not a function`.

- [ ] **Step 3: Implement `createEngine`**

Append to `src/lib/gestureEngine.js`:

```js
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
      if (dragging) {
        const dy = cursor.y - lastDragY;
        lastDragY = cursor.y;
        // Touch-style mapping: dragging the hand up pulls the page up,
        // which means scrolling down — a positive wheel deltaY.
        if (dy !== 0) action = { type: 'scroll', deltaY: -dy * cfg.scrollGain };
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — 24 tests passing.

- [ ] **Step 5: Commit**

```bash
cd c:/Users/samba/Documents/DIT/3.0/me
git add portfolio/src/lib/gestureEngine.js portfolio/src/lib/gestureEngine.test.js
git commit -m "Add gesture state machine for click, drag and scroll"
```

---

### Task 4: Synthetic DOM event dispatch

Turns cursor positions and actions into real DOM events. Per the spec this module is verified manually rather than unit-tested, because jsdom's event semantics differ from a real browser's in exactly the ways that matter here.

**Files:**
- Create: `src/lib/gestureDispatch.js`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `createDispatcher() -> { moveTo, clickAt, scrollAt, isClickable, clear }`
  - `moveTo(x, y) -> Element | null` — returns the element under the cursor.
  - `clickAt(x, y) -> void`
  - `scrollAt(x, y, deltaY) -> void`
  - `isClickable(el) -> boolean` — whether the element sits inside something clickable. Task 7 uses it to grow the cursor over targets.
  - `clear() -> void` — drops hover state; call when gesture mode exits.

- [ ] **Step 1: Write the module**

Create `src/lib/gestureDispatch.js`:

```js
/**
 * Translates gesture actions into DOM events aimed at whatever sits under
 * the cursor.
 *
 * Driving the page through events rather than through the app's own
 * navigation functions is what keeps this layer decoupled: anything that
 * already responds to a mouse responds to a hand, including components
 * added long after this was written.
 */

const CLICKABLE = 'a, button, [role="button"], .nav-link, input, textarea, select, label';

function mouseInit(x, y, extra) {
  return {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y,
    ...extra,
  };
}

function fire(el, type, x, y, extra = {}) {
  const init = mouseInit(x, y, extra);
  const event = type.startsWith('pointer')
    ? new PointerEvent(type, { pointerId: 1, pointerType: 'mouse', isPrimary: true, ...init })
    : new MouseEvent(type, init);
  el.dispatchEvent(event);
  return event;
}

/** mouseenter/mouseleave do not bubble, so they get their own init. */
function fireNonBubbling(el, type, x, y, relatedTarget) {
  el.dispatchEvent(
    new MouseEvent(type, {
      bubbles: false,
      cancelable: false,
      view: window,
      clientX: x,
      clientY: y,
      relatedTarget,
    })
  );
}

/**
 * Nearest ancestor that can actually scroll. In this portfolio that is
 * normally the `.page-scroll` container of the active page.
 */
function findScrollable(start) {
  let node = start;
  while (node && node !== document.body && node !== document.documentElement) {
    const overflowY = getComputedStyle(node).overflowY;
    if (
      /(auto|scroll|overlay)/.test(overflowY) &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return document.scrollingElement;
}

export function createDispatcher() {
  let hovered = null;

  function elementAt(x, y) {
    return document.elementFromPoint(x, y);
  }

  function setHovered(el, x, y) {
    if (el === hovered) return;
    if (hovered) {
      fire(hovered, 'mouseout', x, y, { relatedTarget: el });
      fireNonBubbling(hovered, 'mouseleave', x, y, el);
      hovered.removeAttribute('data-gesture-hover');
    }
    if (el) {
      // React derives onMouseEnter/onMouseLeave from mouseover/mouseout at
      // the root, so this pair is what makes component hover logic work.
      fire(el, 'mouseover', x, y, { relatedTarget: hovered });
      fireNonBubbling(el, 'mouseenter', x, y, hovered);
      el.setAttribute('data-gesture-hover', '');
    }
    hovered = el;
  }

  function moveTo(x, y) {
    const el = elementAt(x, y);
    if (!el) {
      setHovered(null, x, y);
      return null;
    }
    setHovered(el, x, y);
    fire(el, 'pointermove', x, y);
    fire(el, 'mousemove', x, y);
    return el;
  }

  function clickAt(x, y) {
    const el = elementAt(x, y);
    if (!el) return;
    setHovered(el, x, y);

    const down = { button: 0, buttons: 1, detail: 1 };
    const up = { button: 0, buttons: 0, detail: 1 };

    fire(el, 'pointerdown', x, y, down);
    fire(el, 'mousedown', x, y, down);

    const focusTarget = el.closest(CLICKABLE);
    if (focusTarget && typeof focusTarget.focus === 'function') {
      focusTarget.focus({ preventScroll: true });
    }

    fire(el, 'pointerup', x, y, up);
    fire(el, 'mouseup', x, y, up);
    fire(el, 'click', x, y, up);
  }

  function scrollAt(x, y, deltaY) {
    const el = elementAt(x, y);
    if (!el) return;

    const wheel = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y,
      deltaY,
      deltaMode: 0,
    });
    el.dispatchEvent(wheel);

    // The app's own wheel handler calls preventDefault() when it decides to
    // run a page transition. Deferring to that flag lets this module follow
    // the app's decision without duplicating the logic behind it.
    if (wheel.defaultPrevented) return;

    // Synthetic events never trigger the browser's native scrolling, so the
    // in-page case has to be applied by hand.
    const scroller = findScrollable(el);
    if (scroller) scroller.scrollTop += deltaY;
  }

  function isClickable(el) {
    return Boolean(el && el.closest(CLICKABLE));
  }

  function clear() {
    if (hovered) {
      hovered.removeAttribute('data-gesture-hover');
      hovered = null;
    }
  }

  return { moveTo, clickAt, scrollAt, isClickable, clear };
}
```

- [ ] **Step 2: Verify manually in the browser**

Run: `npm run dev`, open the printed URL, wait for the intro to finish, then open DevTools and run:

```js
const { createDispatcher } = await import('/src/lib/gestureDispatch.js');
const d = createDispatcher();

// 1. Hover: the Contact button's dropdown should open
const contact = document.querySelector('.contact-btn');
const r = contact.getBoundingClientRect();
d.moveTo(r.left + r.width / 2, r.top + r.height / 2);

// 2. Click: this should navigate to the Contact page
d.clickAt(r.left + r.width / 2, r.top + r.height / 2);

// 3. Scroll: the active page should scroll down
const page = document.querySelector('.page.active .page-scroll');
const p = page.getBoundingClientRect();
d.scrollAt(p.left + p.width / 2, p.top + p.height / 2, 200);
```

Expected: the dropdown opens on step 1, the site navigates to Contact on step 2, and the page scrolls down on step 3. Then scroll to the bottom of a page and run `scrollAt` again with a positive delta — the site should transition to the next page, driven by the existing `usePortfolio` handler.

- [ ] **Step 3: Run the existing tests to confirm nothing regressed**

Run: `npm test`
Expected: PASS — 24 tests, unchanged.

- [ ] **Step 4: Commit**

```bash
cd c:/Users/samba/Documents/DIT/3.0/me
git add portfolio/src/lib/gestureDispatch.js
git commit -m "Add synthetic DOM event dispatch for gesture input"
```

---

### Task 5: MediaPipe hand tracker and self-hosted assets

**Files:**
- Create: `src/lib/handTracker.js`
- Create: `public/mediapipe/wasm/` (copied from `node_modules`)
- Create: `public/models/hand_landmarker.task` (downloaded)
- Modify: `package.json` (add `@mediapipe/tasks-vision`)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `createHandTracker() -> Promise<{ start, stop, setPaused }>`
  - `start(videoElement, onFrame)` — begins a `requestAnimationFrame` loop.
  - `onFrame(landmarks | null, timestampMs)` — `landmarks` is the 21-point array for the first detected hand, matching what `createEngine().update()` expects.
  - `setPaused(boolean)` — suspends detection while keeping the landmarker and the MediaStream alive, so a paused session can resume instantly.
  - `stop()` — cancels the loop and closes the landmarker. It does **not** stop the MediaStream; `GestureNav` owns that.

- [ ] **Step 1: Install MediaPipe**

```bash
npm install @mediapipe/tasks-vision@^0.10.35
```

- [ ] **Step 2: Copy the WASM runtime into `public/`**

The package ships its WebAssembly runtime as plain files that must be served over HTTP; they cannot be bundled by Vite.

```bash
mkdir -p public/mediapipe/wasm
cp node_modules/@mediapipe/tasks-vision/wasm/* public/mediapipe/wasm/
ls -la public/mediapipe/wasm/
```

Expected: four files — `vision_wasm_internal.js`, `vision_wasm_internal.wasm`, `vision_wasm_nosimd_internal.js`, `vision_wasm_nosimd_internal.wasm`. If the `wasm` directory is not at that path, locate it with `ls node_modules/@mediapipe/tasks-vision/` and copy from wherever it actually lives.

- [ ] **Step 3: Download the model**

```bash
mkdir -p public/models
curl -L -o public/models/hand_landmarker.task \
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
ls -la public/models/hand_landmarker.task
```

Expected: a file of roughly 7–8 MB. If `curl` fails with a connection or TLS error, the sandbox is blocking outbound HTTPS — rerun it outside the sandbox, or use PowerShell:

```powershell
Invoke-WebRequest -Uri "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task" -OutFile "public/models/hand_landmarker.task"
```

Verify the size is in the megabytes, not a few hundred bytes — a tiny file means an error page was saved instead of the model. If the URL 404s, find the current one under "HandLandmarker → Models" in the MediaPipe solutions documentation.

- [ ] **Step 4: Write the tracker**

Create `src/lib/handTracker.js`:

```js
/**
 * Thin wrapper over MediaPipe's HandLandmarker.
 *
 * The library is behind a dynamic import so its several megabytes stay out
 * of the initial bundle — visitors who never press the camera button never
 * download it.
 */

const WASM_PATH = '/mediapipe/wasm';
const MODEL_PATH = '/models/hand_landmarker.task';

export async function createHandTracker() {
  const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
  const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);

  const options = {
    baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
    runningMode: 'VIDEO',
    numHands: 1,
  };

  let landmarker;
  try {
    landmarker = await HandLandmarker.createFromOptions(fileset, options);
  } catch {
    // Some machines and browsers have no usable WebGL backend.
    landmarker = await HandLandmarker.createFromOptions(fileset, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: 'CPU' },
    });
  }

  let rafId = null;
  let running = false;
  let paused = false;
  let lastVideoTime = -1;

  function start(video, onFrame) {
    running = true;

    const loop = () => {
      if (!running) return;
      rafId = requestAnimationFrame(loop);

      if (paused) return;
      if (video.readyState < 2) return;
      // The camera produces fewer frames than the display refreshes; running
      // detection on a frame already processed wastes work and confuses the
      // landmarker's timestamp bookkeeping.
      if (video.currentTime === lastVideoTime) return;
      lastVideoTime = video.currentTime;

      let result;
      try {
        result = landmarker.detectForVideo(video, performance.now());
      } catch {
        return; // a dropped frame is not worth tearing the session down
      }

      onFrame(result?.landmarks?.[0] ?? null, performance.now());
    };

    rafId = requestAnimationFrame(loop);
  }

  /**
   * Suspends detection without releasing anything, so a session hidden in a
   * background tab costs nothing but resumes the instant the tab is shown.
   */
  function setPaused(value) {
    paused = value;
    if (!value) lastVideoTime = -1; // the video moved on while we were away
  }

  function stop() {
    running = false;
    paused = false;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    landmarker.close();
  }

  return { start, stop, setPaused };
}
```

- [ ] **Step 5: Verify tracking works**

Run: `npm run dev`, open the site, and in DevTools run:

```js
const { createHandTracker } = await import('/src/lib/handTracker.js');
const video = document.createElement('video');
video.muted = true;
video.playsInline = true;
video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
await video.play();

const tracker = await createHandTracker();
let n = 0;
tracker.start(video, (lm) => { if (n++ % 30 === 0) console.log(lm ? `hand: ${lm.length} points` : 'no hand'); });
```

Expected: the camera light comes on and the console logs `hand: 21 points` when your hand is in frame, `no hand` otherwise. Then clean up and confirm the camera light goes **off**:

```js
tracker.stop();
video.srcObject.getTracks().forEach((t) => t.stop());
```

- [ ] **Step 6: Commit**

```bash
cd c:/Users/samba/Documents/DIT/3.0/me
git add portfolio/package.json portfolio/package-lock.json portfolio/src/lib/handTracker.js portfolio/public/mediapipe portfolio/public/models
git commit -m "Add MediaPipe hand tracker with self-hosted runtime and model"
```

---

### Task 6: Camera button and instructions modal

Builds the visible entry point with no tracking behind it yet, so the button, modal, copy, and theming can be reviewed on their own.

**Files:**
- Create: `src/components/GestureNav.jsx`
- Create: `src/css/GestureNav.css`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: nothing yet — Task 7 wires in the engine, dispatcher, and tracker.
- Produces: `<GestureNav />`, a default export taking no props, mounted once in `App`.

- [ ] **Step 1: Write the component**

Create `src/components/GestureNav.jsx`:

```jsx
import { useEffect, useState } from 'react';
import '../css/GestureNav.css';

/* idle → intro → loading → active, with error reachable from loading */
const IDLE = 'idle';
const INTRO = 'intro';
const LOADING = 'loading';
const ACTIVE = 'active';
const ERROR = 'error';

const GESTURES = [
  { icon: '🖐', title: 'Show Hand', text: 'Show your palm to move the cursor around the page' },
  { icon: '👌', title: 'Quick pinch', text: 'Pinch your thumb and index finger to click on elements' },
  { icon: '👌', title: 'Pinch & Drag', text: 'Pinch and drag up or down to scroll' },
];

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

export default function GestureNav() {
  const [status, setStatus] = useState(IDLE);
  const [errorMessage, setErrorMessage] = useState('');

  const modalOpen = status === INTRO || status === LOADING || status === ERROR;

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setStatus(IDLE);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  /* Replaced in Task 7 by the real camera + tracking start-up. */
  function handleEnable() {
    setStatus(LOADING);
  }

  function handleFabClick() {
    if (status === ACTIVE) setStatus(IDLE);
    else setStatus(INTRO);
  }

  return (
    <>
      <button
        className={`gesture-fab${status === ACTIVE ? ' active' : ''}`}
        onClick={handleFabClick}
        aria-label={status === ACTIVE ? 'Stop hand navigation' : 'Navigate with hand gestures'}
        title={status === ACTIVE ? 'Stop hand navigation' : 'Navigate with hand gestures'}
      >
        {status === ACTIVE ? <StopIcon /> : <CameraIcon />}
      </button>

      {modalOpen && (
        <div className="gesture-overlay" onClick={() => setStatus(IDLE)}>
          <div className="gesture-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="gesture-title">Navigate with your hand</h2>
            <p className="gesture-subtitle">
              Point your webcam at yourself and drive the whole site without touching anything.
            </p>

            <ul className="gesture-list">
              {GESTURES.map((g) => (
                <li key={g.title} className="gesture-item">
                  <span className="gesture-emoji" aria-hidden="true">{g.icon}</span>
                  <span>
                    <strong>{g.title}</strong>
                    <span className="gesture-desc">{g.text}</span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="gesture-privacy">
              🔒 <strong>No spying, promise.</strong> The video never leaves your browser — no
              upload, no recording, no server, no secret folder of your face. It all runs
              locally, and the camera shuts off the moment you exit. I'm a developer, not the NSA.
            </p>

            {status === ERROR && <p className="gesture-error">{errorMessage}</p>}

            <div className="gesture-actions">
              <button className="gesture-btn ghost" onClick={() => setStatus(IDLE)}>
                Cancel
              </button>
              <button
                className="gesture-btn primary"
                onClick={handleEnable}
                disabled={status === LOADING}
              >
                {status === LOADING ? 'Loading model…' : 'Enable camera'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Write the stylesheet**

Create `src/css/GestureNav.css`:

```css
/* ─── FLOATING CAMERA BUTTON ─────────────────────────────────── */
.gesture-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 150;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s ease, background-color 0.25s ease, color 0.25s ease;
}

.gesture-fab:hover  { transform: translateY(-2px) scale(1.05); }
.gesture-fab.active { background: var(--accent); color: #fff; border-color: transparent; }

/* Hand tracking on the phone that is doing the tracking is not a use case. */
@media (max-width: 900px), (pointer: coarse) {
  .gesture-fab { display: none; }
}

/* ─── INSTRUCTIONS MODAL ─────────────────────────────────────── */
.gesture-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  animation: gesture-fade 0.25s ease;
}

@keyframes gesture-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.gesture-modal {
  width: min(460px, 92vw);
  max-height: 88vh;
  overflow-y: auto;
  padding: 28px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.45);
  animation: gesture-pop 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes gesture-pop {
  from { transform: translateY(24px) scale(0.97); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}

.gesture-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.9rem;
  letter-spacing: 0.02em;
}

.gesture-subtitle {
  margin-top: 6px;
  font-size: 0.9rem;
  color: var(--text-soft);
}

.gesture-list {
  list-style: none;
  margin: 22px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.gesture-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 0.9rem;
}

.gesture-emoji { font-size: 1.4rem; line-height: 1.2; }

.gesture-desc {
  display: block;
  margin-top: 2px;
  color: var(--text-soft);
}

.gesture-privacy {
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--bg-alt);
  border: 1px solid var(--line);
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--text-soft);
}

.gesture-error {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--accent);
  color: var(--accent);
  font-size: 0.85rem;
  line-height: 1.5;
}

.gesture-actions {
  margin-top: 22px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.gesture-btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.gesture-btn:hover:not(:disabled) { transform: translateY(-1px); }
.gesture-btn:disabled             { opacity: 0.6; cursor: default; }

.gesture-btn.ghost {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--text-soft);
}

.gesture-btn.primary {
  background: var(--accent);
  border: 1px solid transparent;
  color: #fff;
}
```

- [ ] **Step 3: Mount it in `App.jsx`**

Add the import alongside the other component imports:

```jsx
import GestureNav     from './components/GestureNav';
```

Then, inside the returned fragment, insert it immediately **before** the `{/* ── OUTRO overlay */}` comment block:

```jsx
      {/* ── GESTURE NAVIGATION (camera button + overlay) ── */}
      {introComplete && <GestureNav />}
```

Gating on `introComplete` keeps the button from appearing over the intro animation, matching how the rest of the chrome behaves.

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev` and open the site.

Expected:
- A round camera button sits in the bottom-right corner once the intro finishes.
- Clicking it opens the modal with the three gestures and the privacy note.
- "Cancel", clicking the backdrop, and pressing `Escape` all close it.
- "Enable camera" switches the button label to "Loading model…" and disables it — no camera is requested yet.
- Toggling the site's theme keeps the button and modal legible in both.
- Narrowing the window below 900 px hides the button.

- [ ] **Step 5: Commit**

```bash
cd c:/Users/samba/Documents/DIT/3.0/me
git add portfolio/src/components/GestureNav.jsx portfolio/src/css/GestureNav.css portfolio/src/App.jsx
git commit -m "Add camera button and gesture instructions modal"
```

---

### Task 7: Wire up camera, tracking loop and cursor

Turns the modal's "Enable camera" into a working session: permission, model load, per-frame tracking, the on-screen cursor, and full teardown.

**Files:**
- Modify: `src/components/GestureNav.jsx`
- Modify: `src/css/GestureNav.css` (append the cursor rules)

**Interfaces:**
- Consumes: `createEngine` (Task 3), `createDispatcher` (Task 4), `createHandTracker` (Task 5).
- Produces: a working gesture session. Exposes `videoRef` and `landmarksRef` internally for Task 8's preview.

- [ ] **Step 1: Add the imports and refs**

In `src/components/GestureNav.jsx`, replace the import block at the top with:

```jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { createEngine } from '../lib/gestureEngine';
import { createDispatcher } from '../lib/gestureDispatch';
import { createHandTracker } from '../lib/handTracker';
import '../css/GestureNav.css';
```

- [ ] **Step 2: Add the error-message helper**

Add above the `GestureNav` component:

```jsx
function describeError(err) {
  if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') {
    return 'Camera access was blocked. Allow it for this site in your browser settings (the icon at the left of the address bar), then try again.';
  }
  if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
    return 'No camera found. Plug one in and try again.';
  }
  if (err?.name === 'NotReadableError') {
    return 'The camera is already in use by another application. Close it and try again.';
  }
  if (err?.name === 'InsecureContext') {
    return 'Camera access needs a secure connection. Open this site over https, or on localhost.';
  }
  return 'Hand tracking failed to start. Reload the page and try again.';
}
```

- [ ] **Step 3: Add the refs and the per-frame handler**

Inside `GestureNav`, immediately after the `useState` declarations, add:

```jsx
  const videoRef      = useRef(null);
  const cursorRef     = useRef(null);
  const streamRef     = useRef(null);
  const trackerRef    = useRef(null);
  const engineRef     = useRef(null);
  const dispatcherRef = useRef(null);
  const landmarksRef  = useRef(null);

  /**
   * Runs up to 60 times a second. The cursor is positioned by writing to the
   * DOM node directly — routing this through React state would re-render the
   * whole page on every frame.
   */
  const onFrame = useCallback((landmarks, timestampMs) => {
    landmarksRef.current = landmarks;

    const engine = engineRef.current;
    const dispatcher = dispatcherRef.current;
    if (!engine || !dispatcher) return;

    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const { cursor, pinching, hand, action } = engine.update(landmarks, timestampMs, viewport);

    const node = cursorRef.current;
    if (node && cursor) {
      node.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0) translate(-50%, -50%)`;
      node.classList.toggle('visible', hand);
      node.classList.toggle('pinching', pinching);
    }

    if (!hand || !cursor) return;

    const target = dispatcher.moveTo(cursor.x, cursor.y);
    if (node) node.classList.toggle('over-target', dispatcher.isClickable(target));

    if (action?.type === 'click') dispatcher.clickAt(action.x, action.y);
    else if (action?.type === 'scroll') dispatcher.scrollAt(cursor.x, cursor.y, action.deltaY);
  }, []);
```

- [ ] **Step 4: Replace `handleEnable` and `handleFabClick` with the real lifecycle**

Replace both placeholder functions with:

```jsx
  const stop = useCallback(() => {
    trackerRef.current?.stop();
    trackerRef.current = null;

    // Releasing every track is what actually turns the camera light off —
    // the part of the privacy promise a visitor can verify for themselves.
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) videoRef.current.srcObject = null;

    dispatcherRef.current?.clear();
    dispatcherRef.current = null;
    engineRef.current = null;
    landmarksRef.current = null;
  }, []);

  const handleEnable = useCallback(async () => {
    setStatus(LOADING);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        const err = new Error('insecure context');
        err.name = 'InsecureContext';
        throw err;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      streamRef.current = stream;

      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();

      trackerRef.current = await createHandTracker();
      engineRef.current = createEngine();
      dispatcherRef.current = createDispatcher();
      trackerRef.current.start(video, onFrame);

      setStatus(ACTIVE);
    } catch (err) {
      stop();
      setErrorMessage(describeError(err));
      setStatus(ERROR);
    }
  }, [onFrame, stop]);

  const handleFabClick = useCallback(() => {
    if (status === ACTIVE) {
      stop();
      setStatus(IDLE);
    } else {
      setStatus(INTRO);
    }
  }, [status, stop]);
```

- [ ] **Step 5: Extend the Escape handler and add teardown effects**

Replace the existing `Escape` effect with these three:

```jsx
  /* Escape closes the modal, and also exits an active session. */
  useEffect(() => {
    if (!modalOpen && status !== ACTIVE) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (status === ACTIVE) stop();
      setStatus(IDLE);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, status, stop]);

  /* A hidden tab should not be running hand detection — but the session is
     only paused, not torn down, so switching back resumes immediately. */
  useEffect(() => {
    if (status !== ACTIVE) return;
    const onVisibility = () => {
      trackerRef.current?.setPaused(document.hidden);
      if (document.hidden) engineRef.current?.reset();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [status]);

  /* Never leave the camera running if this component goes away. */
  useEffect(() => stop, [stop]);
```

- [ ] **Step 6: Render the video element and the cursor**

Inside the returned fragment, immediately **before** the `<button className={...gesture-fab...}>`, add:

```jsx
      {/* Never displayed: it only exists to give MediaPipe frames to read. */}
      <video ref={videoRef} className="gesture-video" muted playsInline />

      {status === ACTIVE && <div ref={cursorRef} className="gesture-cursor" />}
```

- [ ] **Step 7: Append the cursor styles**

Add to the end of `src/css/GestureNav.css`:

```css
/* ─── HIDDEN CAMERA FEED ─────────────────────────────────────── */
/* Kept in the layout but invisible: a display:none video stops
   producing frames in some browsers. */
.gesture-video {
  position: fixed;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  top: 0;
  left: 0;
}

/* ─── GESTURE CURSOR ─────────────────────────────────────────── */
.gesture-cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 34px;
  height: 34px;
  border: 2px solid var(--accent);
  border-radius: 50%;
  background: rgba(220, 38, 38, 0.14);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease, width 0.12s ease, height 0.12s ease,
              background-color 0.12s ease;
  will-change: transform;
}

.gesture-cursor.visible     { opacity: 1; }
.gesture-cursor.over-target { width: 46px; height: 46px; background: rgba(220, 38, 38, 0.24); }

.gesture-cursor.pinching {
  width: 20px;
  height: 20px;
  background: var(--accent);
}
```

- [ ] **Step 8: Verify the whole feature in the browser**

Run: `npm run dev` and open the site.

Expected, in order:
1. Click the camera button, then "Enable camera" — the browser asks for permission.
2. After a short "Loading model…", the modal closes and the button turns red with a stop icon.
3. Showing your palm makes a red ring appear and follow your hand. Moving your hand right moves the cursor right (mirrored, like a selfie).
4. The ring grows over links and buttons.
5. A quick pinch on a nav item navigates to that page.
6. Pinching and dragging up scrolls the page down; keep going past the bottom and the site transitions to the next page.
7. Switching to another browser tab and coming back resumes tracking immediately, with no permission prompt and no reload — the session was paused, not torn down.
8. Clicking the button again, or pressing `Escape`, ends the session — **and the camera indicator light goes off**.
9. Denying permission shows the "Camera access was blocked" message instead of crashing.

- [ ] **Step 9: Confirm the unit tests still pass**

Run: `npm test`
Expected: PASS — 24 tests.

- [ ] **Step 10: Commit**

```bash
cd c:/Users/samba/Documents/DIT/3.0/me
git add portfolio/src/components/GestureNav.jsx portfolio/src/css/GestureNav.css
git commit -m "Wire camera, tracking loop and gesture cursor"
```

---

### Task 8: Collapsible webcam preview

**Files:**
- Create: `src/components/GesturePreview.jsx`
- Modify: `src/components/GestureNav.jsx` (render it while active)
- Modify: `src/css/GestureNav.css` (append the preview rules)

**Interfaces:**
- Consumes: `videoRef` and `landmarksRef` from Task 7.
- Produces: `<GesturePreview videoRef={...} landmarksRef={...} />`.

The preview hardcodes the hand-skeleton connection pairs rather than importing them from MediaPipe, so this component stays free of the heavy dependency.

- [ ] **Step 1: Write the component**

Create `src/components/GesturePreview.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react';

/** MediaPipe's standard 21-point hand skeleton. */
const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

const STORAGE_KEY = 'gesture-preview-collapsed';

/**
 * Small mirrored camera thumbnail with the detected hand drawn over it.
 *
 * Beyond helping the visitor frame themselves, it makes the privacy claim
 * concrete: this is exactly what the page sees, and it goes nowhere.
 */
export default function GesturePreview({ videoRef, landmarksRef }) {
  const canvasRef = useRef(null);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (collapsed) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    let rafId;

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      const { width, height } = canvas;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Mirror so the visitor sees themselves the way a mirror shows them.
      ctx.translate(width, 0);
      ctx.scale(-1, 1);

      if (video.readyState >= 2) ctx.drawImage(video, 0, 0, width, height);

      const landmarks = landmarksRef.current;
      if (landmarks) {
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.9)';
        ctx.lineWidth = 2;
        for (const [a, b] of CONNECTIONS) {
          ctx.beginPath();
          ctx.moveTo(landmarks[a].x * width, landmarks[a].y * height);
          ctx.lineTo(landmarks[b].x * width, landmarks[b].y * height);
          ctx.stroke();
        }
        ctx.fillStyle = '#fff';
        for (const point of landmarks) {
          ctx.beginPath();
          ctx.arc(point.x * width, point.y * height, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      if (!landmarks) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('show your hand', width / 2, height - 12);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [collapsed, videoRef, landmarksRef]);

  return (
    <div className={`gesture-preview${collapsed ? ' collapsed' : ''}`}>
      <button
        className="gesture-preview-toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Show camera preview' : 'Hide camera preview'}
      >
        {collapsed ? 'Show camera' : 'Hide'}
      </button>
      {!collapsed && <canvas ref={canvasRef} width={192} height={144} />}
    </div>
  );
}
```

- [ ] **Step 2: Render it from `GestureNav`**

Add the import:

```jsx
import GesturePreview from './GesturePreview';
```

and render it next to the cursor, replacing the cursor line from Task 7 Step 6 with:

```jsx
      {status === ACTIVE && <div ref={cursorRef} className="gesture-cursor" />}
      {status === ACTIVE && (
        <GesturePreview videoRef={videoRef} landmarksRef={landmarksRef} />
      )}
```

- [ ] **Step 3: Append the preview styles**

Add to the end of `src/css/GestureNav.css`:

```css
/* ─── CAMERA PREVIEW ─────────────────────────────────────────── */
.gesture-preview {
  position: fixed;
  right: 24px;
  bottom: 92px;
  z-index: 150;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.gesture-preview canvas {
  display: block;
  width: 192px;
  height: 144px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.gesture-preview-toggle {
  padding: 4px 10px;
  font-size: 0.7rem;
  font-family: inherit;
  color: var(--text-soft);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 6px;
  cursor: pointer;
}

.gesture-preview-toggle:hover { color: var(--text); }

@media (max-width: 900px), (pointer: coarse) {
  .gesture-preview { display: none; }
}
```

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev`, start gesture mode.

Expected:
- A small mirrored thumbnail sits above the camera button, showing you.
- A red skeleton with white joints tracks your hand.
- With no hand in frame, it reads "show your hand".
- "Hide" collapses it to just the toggle; "Show camera" brings it back.
- The collapsed choice survives a page reload.

- [ ] **Step 5: Commit**

```bash
cd c:/Users/samba/Documents/DIT/3.0/me
git add portfolio/src/components/GesturePreview.jsx portfolio/src/components/GestureNav.jsx portfolio/src/css/GestureNav.css
git commit -m "Add collapsible webcam preview with hand skeleton"
```

---

### Task 9: End-to-end verification and README note

Final pass over the whole feature and a short note in the README.

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Confirm the production build works**

```bash
npm run build
```

Expected: builds with no errors. In the output, `@mediapipe/tasks-vision` appears as its **own chunk**, not inside the main entry chunk — that is the dynamic import doing its job. If it is in the main chunk, the `import()` in `src/lib/handTracker.js` was changed to a static import somewhere; revert that.

- [ ] **Step 2: Verify the built site**

```bash
npm run preview
```

Open the printed URL and run the full pass: enable gestures, move the cursor, pinch a nav link, pinch-drag to scroll through to the next page, collapse and restore the preview, exit with `Escape`, and confirm the camera light goes out.

- [ ] **Step 3: Confirm the site is untouched for everyone else**

With gesture mode never enabled, check that mouse and wheel navigation, the theme toggle, the terminal (`Ctrl + Alt + T`), the contact dropdown, and the project carousel all behave exactly as before. The gesture layer must be inert until the button is pressed.

- [ ] **Step 4: Run the unit tests**

Run: `npm test`
Expected: PASS — 24 tests.

- [ ] **Step 5: Add a README note**

Add this section to `README.md`, near the other feature descriptions:

```markdown
## Hand-gesture navigation

Press the camera button in the bottom-right corner to drive the site with
your hand: show your palm to move the cursor, pinch to click, pinch and drag
to scroll.

Hand detection runs entirely in the browser through MediaPipe. The video is
never uploaded, recorded, or sent anywhere, and the camera is released the
moment you exit.

The MediaPipe runtime lives in `public/mediapipe/wasm/` and the model in
`public/models/hand_landmarker.task`. Both are self-hosted, and the library
is loaded on demand so visitors who never press the button never download it.
```

- [ ] **Step 6: Commit**

```bash
cd c:/Users/samba/Documents/DIT/3.0/me
git add portfolio/README.md
git commit -m "Document hand-gesture navigation"
```
