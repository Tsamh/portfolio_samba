/**
 * Thin wrapper over MediaPipe's HandLandmarker.
 *
 * The library is behind a dynamic import so its several megabytes stay out
 * of the initial bundle — visitors who never press the camera button never
 * download it.
 */

/* BASE_URL is '/' locally and '/<repo>/' on GitHub Pages */
const WASM_PATH = `${import.meta.env.BASE_URL}mediapipe/wasm`;
const MODEL_PATH = `${import.meta.env.BASE_URL}models/hand_landmarker.task`;

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

  // A short streak of failures is dropped frames; a detector that fails on
  // every frame is broken, and spinning on it forever would leave gesture mode
  // looking active with a frozen cursor and nothing to explain why.
  const MAX_CONSECUTIVE_ERRORS = 30; // roughly half a second at 60 fps

  let rafId = null;
  let running = false;
  let paused = false;
  let closed = false;
  let lastVideoTime = -1;
  let consecutiveErrors = 0;

  function start(video, onFrame, onError) {
    if (closed) {
      throw new Error('this hand tracker was stopped and cannot be restarted');
    }
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

      // One reading, used for both the detector and the consumer, so the
      // landmarks and the timestamp the engine reasons about describe the
      // same instant.
      const timestampMs = performance.now();

      let result;
      try {
        result = landmarker.detectForVideo(video, timestampMs);
        consecutiveErrors = 0;
      } catch (err) {
        consecutiveErrors += 1;
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          stop();
          onError?.(err);
        }
        return;
      }

      onFrame(result?.landmarks?.[0] ?? null, timestampMs);
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

    // Closing a MediaPipe landmarker twice is a hard crash, and this runs from
    // several exit paths — the button, Escape, and component teardown.
    if (closed) return;
    closed = true;
    landmarker.close();
  }

  return { start, stop, setPaused };
}
