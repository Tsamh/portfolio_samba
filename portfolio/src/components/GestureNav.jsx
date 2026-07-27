import { useCallback, useEffect, useRef, useState } from 'react';
import { createEngine } from '../lib/gestureEngine';
import { createDispatcher } from '../lib/gestureDispatch';
import { createHandTracker } from '../lib/handTracker';
import GesturePreview from './GesturePreview';
import '../css/GestureNav.css';

/* idle → intro → loading → active, with error reachable from loading */
const IDLE = 'idle';
const INTRO = 'intro';
const LOADING = 'loading';
const ACTIVE = 'active';
const ERROR = 'error';

const FOCUSABLE =
  'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const GESTURES = [
  { icon: '🖐', title: 'Show Hand', text: 'Show your palm to move the cursor around the page' },
  { icon: '👌', title: 'Quick pinch', text: 'Pinch your thumb and index finger to click on elements' },
  { icon: '👌', title: 'Pinch & Drag', text: 'Pinch and drag up or down to scroll' },
];

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

  const videoRef      = useRef(null);
  const cursorRef     = useRef(null);
  const streamRef     = useRef(null);
  const trackerRef    = useRef(null);
  const engineRef     = useRef(null);
  const dispatcherRef = useRef(null);
  const landmarksRef  = useRef(null);
  const sessionRef    = useRef(0);
  const wasPinchingRef = useRef(false);

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

    // Update the drag mirror before the no-hand return. The engine resets its
    // own pinch state on exactly the frames this return discards, so leaving
    // it below would let a momentary tracking dropout strand the latched
    // scroller and hand the next drag to the wrong element.
    if (wasPinchingRef.current && !pinching) dispatcher.endDrag();
    wasPinchingRef.current = pinching;

    if (!hand || !cursor) return;

    const target = dispatcher.moveTo(cursor.x, cursor.y);
    if (node) node.classList.toggle('over-target', dispatcher.isClickable(target));

    if (action?.type === 'click') dispatcher.clickAt(action.x, action.y);
    else if (action?.type === 'scroll') dispatcher.scrollAt(cursor.x, cursor.y, action.deltaY);
  }, []);

  const modalRef = useRef(null);
  const returnFocusRef = useRef(null);

  const modalOpen = status === INTRO || status === LOADING || status === ERROR;

  const stop = useCallback(() => {
    // Bump the generation first. Start-up is several seconds of awaits, and
    // this is what tells one already in flight that it has been abandoned:
    // it will release what it acquired instead of storing it in the refs.
    sessionRef.current += 1;

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
    wasPinchingRef.current = false;
  }, []);

  /* Every way out of the feature goes through here, so no exit can forget to
     release the camera. Safe to call when nothing is running. */
  const close = useCallback(() => {
    stop();
    setStatus(IDLE);
  }, [stop]);

  const handleEnable = useCallback(async () => {
    const session = sessionRef.current;
    setStatus(LOADING);

    let stream = null;
    let tracker = null;

    /* Release whatever this attempt got hold of. Used when it is abandoned
       mid-flight, where the refs were never populated and stop() would have
       nothing to find. */
    const discard = () => {
      tracker?.stop();
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current && videoRef.current.srcObject === stream) {
        videoRef.current.srcObject = null;
      }
    };

    const abandoned = () => sessionRef.current !== session;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        const err = new Error('insecure context');
        err.name = 'InsecureContext';
        throw err;
      }

      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      if (abandoned()) return discard();

      // A revoked permission or an unplugged webcam ends the track. The
      // detection loop cannot notice: the video's currentTime simply stops
      // advancing, which is indistinguishable from a still hand.
      const onDeviceLost = () => {
        // A cancelled attempt can still be holding tracks; do not let its
        // device loss tear down whatever session is live now.
        if (abandoned()) return;
        stop();
        setErrorMessage(
          'The camera was disconnected, or its permission was revoked. Reconnect it and try again.'
        );
        setStatus(ERROR);
      };
      stream.getTracks().forEach((track) => {
        track.addEventListener('ended', onDeviceLost);
      });

      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      if (abandoned()) return discard();

      tracker = await createHandTracker();
      if (abandoned()) return discard();

      streamRef.current = stream;
      trackerRef.current = tracker;
      engineRef.current = createEngine();
      dispatcherRef.current = createDispatcher();
      tracker.start(video, onFrame, (err) => {
        // The tracker has already stopped its own loop by the time this runs.
        stop();
        setErrorMessage(describeError(err));
        setStatus(ERROR);
      });

      setStatus(ACTIVE);
    } catch (err) {
      discard();
      // Someone else already tore the session down and may have started a new
      // one; reporting this failure would clobber it.
      if (abandoned()) return;
      stop();
      setErrorMessage(describeError(err));
      setStatus(ERROR);
    }
  }, [onFrame, stop]);

  const handleFabClick = useCallback(() => {
    if (status === IDLE) setStatus(INTRO);
    else close();
  }, [status, close]);

  /* Move focus into the dialog on open and hand it back on close, so someone
     working without a mouse lands in the modal rather than behind it. */
  useEffect(() => {
    if (!modalOpen) return;
    returnFocusRef.current = document.activeElement;
    modalRef.current?.focus();
    return () => {
      const previous = returnFocusRef.current;
      returnFocusRef.current = null;
      if (previous && typeof previous.focus === 'function') previous.focus();
    };
  }, [modalOpen]);

  /* Keep Tab inside the dialog; otherwise it walks the navbar underneath. */
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const modal = modalRef.current;
      if (!modal) return;

      const focusable = modal.querySelectorAll(FOCUSABLE);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // Focus can drop out of the dialog without anyone pressing a key:
      // disabling the button that held it — which is exactly what happens
      // when "Enable camera" enters the loading state — hands focus to
      // <body>. Pull anything outside the panel back in before the boundary
      // checks below, which only recognise elements they can name.
      if (!modal.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }

      if (e.shiftKey && (active === first || active === modal)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  /* Escape closes the modal, and also exits an active session. It routes
     through close() so pressing it mid-load releases the camera too. */
  useEffect(() => {
    if (!modalOpen && status !== ACTIVE) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, status, close]);

  /* A hidden tab should not be running hand detection — but the session is
     only paused, not torn down, so switching back resumes immediately. */
  useEffect(() => {
    if (status !== ACTIVE) return;
    const onVisibility = () => {
      trackerRef.current?.setPaused(document.hidden);
      if (document.hidden) {
        engineRef.current?.reset();
        dispatcherRef.current?.endDrag();
        wasPinchingRef.current = false;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [status]);

  /* Never leave the camera running if this component goes away. */
  useEffect(() => stop, [stop]);

  return (
    <>
      {/* Never displayed: it only exists to give MediaPipe frames to read. */}
      <video ref={videoRef} className="gesture-video" muted playsInline />

      {status === ACTIVE && <div ref={cursorRef} className="gesture-cursor" />}
      {status === ACTIVE && (
        <GesturePreview videoRef={videoRef} landmarksRef={landmarksRef} />
      )}

      <button
        className={`gesture-fab${status === ACTIVE ? ' active' : ''}`}
        onClick={handleFabClick}
        aria-label={status === ACTIVE ? 'Stop hand navigation' : 'Navigate with hand gestures'}
        title={status === ACTIVE ? 'Stop hand navigation' : 'Navigate with hand gestures'}
      >
        {status === ACTIVE ? <StopIcon /> : <CameraIcon />}
      </button>

      {modalOpen && (
        <div className="gesture-overlay" onClick={close}>
          <div
            ref={modalRef}
            className="gesture-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gesture-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="gesture-title" id="gesture-title">Navigate with your hand</h2>
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
              <button className="gesture-btn ghost" onClick={close}>
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
