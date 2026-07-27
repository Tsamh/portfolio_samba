# Hand-Gesture Navigation — Design

**Date:** 2026-07-27
**Status:** Approved, pending implementation plan

## Goal

Add a floating camera button in the bottom-right corner of the portfolio. Clicking it
opens a modal explaining the three gestures and asking for camera permission. Once
enabled, the visitor navigates the entire site with their hand: an on-screen cursor
follows the palm, a quick pinch clicks, and a pinch-and-drag scrolls.

The feature is a novelty showcase. It must never degrade the site for visitors who
ignore it: zero cost to the initial bundle, zero changes to existing navigation logic.

## Guiding constraint: the gesture layer does not know the portfolio

The gesture layer synthesizes real DOM events (`pointermove`, `click`, `wheel`) at the
cursor position against `document.elementFromPoint()`. It never imports, wraps, or
receives the app's navigation functions.

Consequence: `usePortfolio`, `Navbar`, `NavList`, `ProjectCarousel`, and every page
component work unchanged. Anything clickable today becomes gesture-clickable for free,
including components added later.

The rejected alternative was passing `goTo` and `scrollRefs` into the gesture component
and calling them directly. That couples the two layers and only ever supports the
interactions explicitly wired up.

## Architecture

```
src/components/GestureNav.jsx       orchestrator: FAB, modal, engine lifecycle
src/components/GesturePreview.jsx   webcam thumbnail + skeleton canvas, collapsible
src/lib/handTracker.js              MediaPipe wrapper: init / start / stop
src/lib/gestureEngine.js            landmarks -> cursor, pinch, drag (pure logic)
src/lib/gestureDispatch.js          DOM event synthesis
src/css/GestureNav.css
public/mediapipe/wasm/              MediaPipe runtime, copied from node_modules
public/models/hand_landmarker.task  the model (~7 MB)
```

`GestureNav` is mounted once in `App.jsx`, as a sibling of `Terminal` and `Outro`. It
is the only edit to an existing file.

### Data flow

```
webcam frame
  -> handTracker (MediaPipe HandLandmarker, rAF loop)
  -> 21 normalized landmarks
  -> gestureEngine  (pure: smoothing, pinch state machine, click/drag arbitration)
  -> { cursor: {x, y} | null, pinching, hand, action }
  -> gestureDispatch (elementFromPoint + synthetic DOM events)
  -> the portfolio reacts as if a mouse did it
```

`gestureEngine` holds no DOM references and performs no side effects. It takes
landmarks plus a timestamp and returns the next state. This is what makes it testable.

### Module contracts

**`handTracker.js`**
- `createHandTracker()` -> `Promise<{ start, stop, setPaused }>`
- Lazily `import()`s `@mediapipe/tasks-vision`, resolves the WASM fileset from
  `/mediapipe/wasm`, loads the model from `/models/hand_landmarker.task`.
- Configured for one hand, `runningMode: 'VIDEO'`, GPU delegate falling back to CPU.
- `start(video, onFrame, onError?)` — begins the frame loop. Throws if called after
  `stop()`; a stopped tracker cannot be restarted.
- `onFrame(landmarks | null, timestampMs)` is called once per animation frame.
- `onError(err)` fires once, after the loop has already stopped itself, when detection
  has failed on `MAX_CONSECUTIVE_ERRORS` frames in a row. Without it a permanently
  broken detector would spin silently behind a frozen cursor.
- `setPaused(boolean)` suspends detection while keeping the landmarker and the stream
  alive, so a session hidden in a background tab resumes instantly.
- `stop()` closes the landmarker and cancels the loop, and is idempotent — closing a
  MediaPipe landmarker twice is a hard crash and several exit paths reach it. It does
  not own the MediaStream: `GestureNav` acquires the stream, passes the `<video>`
  element in, and is solely responsible for stopping the tracks. Keeping ownership in
  one place is what guarantees the camera is released on every exit path.

**`gestureEngine.js`** — pure, no imports
- `createEngine(config)` -> `{ update, reset }`
- `update(landmarks, timestampMs, viewport)` returns `{ cursor, pinching, hand, action }`.
  `cursor` is `{x, y}` in viewport pixels, or `null` before the first hand is seen.
  `hand` is false when no hand is visible, which is what drives the cursor's fade.
  `action` is `null`, `{ type: 'click', x, y }`, or `{ type: 'scroll', deltaY }`.
- `reset()` clears pinch and drag state without touching the cursor. `update` calls it
  itself whenever the hand disappears.

**`gestureDispatch.js`**
- `createDispatcher()` -> `{ moveTo, clickAt, scrollAt, isClickable, endDrag, clear }`
- `moveTo(x, y)` — tracks the element under the cursor and returns it, fires
  `pointermove` / `mousemove`, plus `mouseover`/`mouseout` and
  `mouseenter`/`mouseleave` when the target changes.
- `clickAt(x, y)` — fires `pointerdown`, `mousedown`, `mouseup`, `pointerup`, `click`.
- `scrollAt(x, y, deltaY)` — see below.
- `isClickable(el)` — whether the element sits inside something clickable; drives the
  cursor growing over targets.
- `endDrag()` — called when a pinch releases, so the next drag re-resolves its target.
- `clear()` — releases hover state properly, firing `mouseout`/`mouseleave` rather than
  merely forgetting the element, and drops the latched scroller.

## Gesture detection

| Signal | Method |
|---|---|
| Cursor | Palm center = mean of landmarks 0, 5, 9, 13, 17. Chosen over the index tip because it does not drift while pinching. X mirrored for selfie view. |
| Mapping | The active region 0.2–0.8 of the frame maps to the full viewport, so the visitor never has to reach the edge of the camera's field of view. Clamped to the viewport. |
| Smoothing | Exponential moving average with velocity-adaptive alpha: more smoothing when still (kills jitter), less when moving fast (kills lag). If jitter remains objectionable in practice, upgrade to a One Euro filter. |
| Pinch | `dist(thumb_tip 4, index_tip 8) / dist(wrist 0, middle_mcp 9)`. Normalizing by hand size makes the threshold invariant to how far the hand is from the camera. |
| Hysteresis | Pinch closes below ratio 0.35, opens above 0.5. The dead band prevents flicker at the boundary. |
| Click vs drag | On pinch close, record time and cursor position. Released within 350 ms **and** under 40 px of travel -> click. Otherwise it is a drag, and no click fires on release. |
| Scroll | While dragging, `deltaY` is proportional to vertical cursor travel since the previous frame. Natural touch-style mapping: dragging up scrolls down the page. |

When no hand is detected the cursor fades out and the preview shows a "no hand" state.
Pinch state resets so a lost hand cannot leave a phantom drag running.

## Scrolling without duplicating the app's logic

`usePortfolio.handleWheel` decides whether a wheel event scrolls within the current page
or transitions to the next one, based on whether the container is at its top or bottom
edge. The gesture layer must not reimplement that.

`scrollAt` therefore:

1. Dispatches a `WheelEvent` with `bubbles: true, cancelable: true` on the element under
   the cursor. React's root listener delivers it to `handleWheel`, which runs the page
   transition when it decides one is due.
2. Applies the movement itself, because synthetic events never trigger the browser's
   native scrolling — using `scrollTo({ behavior: 'instant' })` rather than assigning
   `scrollTop`, since `.page-scroll` sets `scroll-behavior: smooth` and the `scrollTop`
   setter honours it, which would restart an animation on every frame.
3. Resolves the scrollable element **once per drag** and keeps applying to that same
   element until the pinch releases.

Step 3 is what an earlier draft got wrong, and it is worth recording why. The original
design asked the app what it had done by reading `defaultPrevented` after dispatch. That
cannot work: React binds `wheel` at its root container as a **passive** listener, so
`handleWheel`'s `preventDefault()` never sets the event's canceled flag and the check is
always false. Re-resolving `elementFromPoint` every frame then handed the rest of a drag
to whichever page slid in behind the cursor, so a transition left the incoming page
already scrolled. Latching one scroller for the life of the gesture — which is also what
a touchscreen does — removes the need to interrogate the app at all.

## Lifecycle

1. Click the FAB -> modal opens with the instructions and the privacy note.
2. Click "Enable camera" -> `getUserMedia({ video: { facingMode: 'user' } })`.
3. Granted -> dynamic import of MediaPipe and model load, with a progress state in the
   modal ("Loading model...").
4. Ready -> modal closes; cursor and preview appear; the FAB switches to its active
   state.
5. Exit via the FAB again or the `Escape` key: cancel the rAF loop, close the
   landmarker, and **stop every track on the MediaStream** so the camera indicator light
   goes out. That last step is what makes the privacy claim verifiable rather than just
   stated.
6. `visibilitychange` to hidden pauses the loop; returning resumes it. The stream stays
   open across a pause.

### Error states

Each renders in the modal with plain language and a way forward:

- Permission denied — explain how to re-enable it in the browser's site settings.
- No camera found.
- Insecure context (served over plain http from a non-localhost host), where
  `getUserMedia` is unavailable by design.
- Model or WASM failed to load.

### Where it does not appear

The FAB is hidden below 900 px viewport width and on coarse pointers. Hand tracking
while holding the phone that is doing the tracking is not a real use case.

## UI

**FAB** — bottom-right, fixed, matching the existing visual language (`--surface`,
`--line`, `--accent` from `index.css`, both themes). Camera icon as an inline SVG.
Active state uses `--accent`.

**Modal** — reuses the overlay pattern established by `Terminal`. Content in English,
matching the rest of the site:

- Title, then the three gestures:
  - 🖐 **Show Hand** — show your palm to move the cursor around the page
  - 👌 **Quick pinch** — to click on elements
  - 👌 **Pinch & Drag** — pinch and drag up/down to scroll
- Privacy note:
  > 🔒 **No spying, promise.** The video never leaves your browser — no upload, no
  > recording, no server, no secret folder of your face. It all runs locally, and the
  > camera shuts off the moment you exit. I'm a developer, not the NSA.
- Buttons: "Enable camera" and "Cancel".

**Cursor** — a small ring rendered in a fixed-position overlay at `pointer-events: none`
and a high z-index. It contracts on pinch and grows when hovering something clickable,
detected with `element.closest('a, button, [role="button"], .nav-link')`.

**Preview** — collapsible thumbnail, bottom-right above the FAB: mirrored video with the
hand skeleton drawn on a canvas overlay. Shown by default with a collapse control;
collapsed state persists in `localStorage`, consistent with how the theme is stored.

## Known limitation

CSS-only `:hover` rules will not fire, because browsers restrict `:hover` to trusted
input. React handlers (`onMouseEnter`, `onMouseLeave`) do fire, so component-driven
hover behavior such as the `ContactButton` dropdown works. Purely decorative CSS hover
effects will simply not appear during gesture mode. This does not affect navigation and
is accepted rather than worked around.

## Testing

The project currently has no test infrastructure. This design adds `vitest` as a
devDependency and tests exactly one module: `gestureEngine.js`.

That module is where the subtle bugs live and it is pure, so it can be tested with no
DOM, no camera, and no MediaPipe:

- pinch ratio is invariant to hand scale
- hysteresis: a ratio oscillating across a single threshold does not toggle state
- click/drag arbitration at each boundary (under/over 350 ms, under/over 40 px)
- coordinate mapping, including clamping outside the active region
- smoothing converges and does not overshoot
- losing the hand mid-pinch resets cleanly

Everything else — camera permission, model loading, event synthesis, visual polish — is
verified manually with `npm run dev`, since it depends on real hardware and real
browser trust semantics.

## Out of scope

- Two-handed gestures, rotation, zoom.
- Gesture-driven text input.
- Mobile or tablet support.
- Replacing any existing input method. This is strictly additive.
