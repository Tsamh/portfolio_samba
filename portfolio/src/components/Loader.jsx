import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createSmoke } from '../lib/smoke';
import '../css/Loader.css';

/* Inspired by mattjinn.com: a lowercase serif wordmark whose letters rise in
   a wave, then the screen dissolves away like smoke to reveal the site. */
const WORD = 'samba';
const MIN_MS = 2400;   // at least one or two full waves
const MAX_MS = 7000;   // never hold the site hostage to a slow asset
const WORD_FADE_MS = 400;
const DISSOLVE_MS = 2800; // slow enough to watch the smoke drift away

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {function} onReveal   - the site may become visible (smoke starts)
 * @param {function} onComplete - the loader is gone, unmount it
 */
export default function Loader({ onReveal, onComplete }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const smokeRef = useRef(null);
  const [phase, setPhase] = useState('loading'); // loading → fading → dissolving

  /* wait for fonts + page load (bounded), then fade the wordmark out */
  useEffect(() => {
    let alive = true;
    const pageLoaded = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((r) => window.addEventListener('load', r, { once: true }));
    const ready = Promise.all([pageLoaded, document.fonts?.ready]);

    Promise.all([wait(MIN_MS), Promise.race([ready, wait(MAX_MS)])])
      .then(() => alive && setPhase('fading'))
      .then(() => wait(WORD_FADE_MS))
      .then(() => alive && setPhase('dissolving'));

    return () => { alive = false; };
  }, []);

  /* Draw the opaque smoke frame BEFORE the browser paints the now
     transparent loader, so the site never flashes through. */
  useLayoutEffect(() => {
    if (phase !== 'dissolving') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bg = getComputedStyle(document.body).getPropertyValue('--bg') || '#fff';
    const probe = document.createElement('span');
    probe.style.color = bg;
    document.body.appendChild(probe);
    const rgb = getComputedStyle(probe).color;
    probe.remove();

    smokeRef.current = reduced ? null : createSmoke(canvasRef.current, rgb);
    rootRef.current?.classList.toggle('no-smoke', !smokeRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'dissolving') return;
    let alive = true;
    onReveal();

    const smoke = smokeRef.current;
    const done = smoke ? smoke.play(DISSOLVE_MS) : wait(600); // CSS fade fallback
    done.then(() => {
      smoke?.destroy();
      if (alive) onComplete();
    });

    return () => { alive = false; };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={rootRef} className={`loader ${phase}`} role="status" aria-label="Loading">
      <canvas ref={canvasRef} className="loader-canvas" aria-hidden="true" />
      <div className="loader-word" aria-hidden="true">
        {WORD.split('').map((letter, i) => (
          <span key={i} className="loader-letter" style={{ '--i': i }}>{letter}</span>
        ))}
      </div>
    </div>
  );
}
