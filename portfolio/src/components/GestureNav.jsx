import { useEffect, useRef, useState } from 'react';
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

  const modalRef = useRef(null);
  const returnFocusRef = useRef(null);

  const modalOpen = status === INTRO || status === LOADING || status === ERROR;

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
      const focusable = modalRef.current?.querySelectorAll(FOCUSABLE);
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || active === modalRef.current)) {
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
