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
