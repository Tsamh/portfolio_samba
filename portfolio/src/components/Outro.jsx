import { useEffect, useRef, useState, useCallback } from 'react';
import Avatar, { HAIR_POINT } from './Avatar';
import { findEgg } from '../lib/eggs';
import '../css/Outro.css';

const MAX_ZOOM = 34;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Exit overlay — mirror of the intro, fully scroll-driven.
 * We start inside the black hair; scrolling DOWN pulls us out of the
 * avatar's head, and he waves goodbye. Scrolling back UP dives back
 * in and returns to the site. Once out, the jacket pocket hides the
 * paper easter egg (3 clicks).
 *
 * On touch screens it comes out on its own as soon as it opens; a swipe
 * down dives back in. Any swipe finishes by itself once the finger lifts.
 *
 * @param {function} onExit - close the outro (back to the site), on scroll
 * @param {function} onHome - close and navigate back to Home
 */
export default function Outro({ onExit, onHome }) {
  const overlayRef = useRef(null);
  const zoomRef    = useRef(null);
  const rafRef     = useRef(null);
  const target     = useRef(1);   // 1 = inside the hair, 0 = fully out
  const current    = useRef(1);
  const closed     = useRef(false);
  const originSet  = useRef(false);
  const leftHair   = useRef(false); // has the visitor started to come out yet?
  const [idle, setIdle] = useState(false); // fully out → bubble + actions

  const tick = useCallback(() => {
    if (closed.current) return;

    /* measure the hair origin on the very first frame,
       while the element is still untransformed */
    if (!originSet.current && zoomRef.current) {
      const box = zoomRef.current.querySelector('.avatar-box');
      if (box) {
        const zr = zoomRef.current.getBoundingClientRect();
        const br = box.getBoundingClientRect();
        const ox = br.left - zr.left + br.width * HAIR_POINT.x;
        const oy = br.top - zr.top + br.height * HAIR_POINT.y;
        zoomRef.current.style.transformOrigin = `${ox}px ${oy}px`;
        originSet.current = true;
      }
    }

    current.current = lerp(current.current, target.current, 0.038);
    const p = current.current;

    const overlay = overlayRef.current;
    const zoom    = zoomRef.current;

    if (overlay && zoom) {
      // black (inside the hair) → white
      const ch = Math.round(255 - (255 - 13) * Math.min(1, p * 1.5));
      overlay.style.background = `rgb(${ch},${ch},${ch})`;

      zoom.style.transform = `scale(${1 + p * MAX_ZOOM})`;
      zoom.style.opacity = String(p < 0.62 ? 1 : Math.max(0, 1 - (p - 0.62) * 3));
      zoom.dataset.zooming = p > 0.04 ? 'true' : 'false';
    }

    setIdle(p < 0.03);
    if (p < 0.03) findEgg('avatar');   // fully out: the avatar is on screen
    if (target.current < 0.9) leftHair.current = true;

    // scrolled all the way back up → dive back into the site.
    // Only after having left: the outro OPENS at p = 1, and without this
    // guard it closed itself on its very first frame whenever no scroll was
    // in progress — always the case on phones, where it opens from momentum.
    if (leftHair.current && p > 0.985 && target.current > 0.985) {
      closed.current = true;
      onExit();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [onExit]);

  /* Touch screens: come out on our own — a thumb should not have to fight
     for it. The visitor can still swipe back down to dive in again. */
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) target.current = 0;
  }, []);

  /* mouse / trackpad: scroll drives the exit */
  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);

    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    const onWheel = (e) => {
      e.preventDefault();
      // scroll down → emerge (target decreases), scroll up → dive back
      target.current = clamp01(target.current - e.deltaY * 0.0022);
    };

    let touchY = 0;
    let touchFrom = 1;
    const onTouchStart = (e) => {
      touchY = e.touches[0].clientY;
      touchFrom = target.current;
    };
    const onTouchMove  = (e) => {
      e.preventDefault();
      const dy = touchY - e.touches[0].clientY;
      target.current = clamp01(target.current - dy * 0.005);
      touchY = e.touches[0].clientY;
    };
    /* snap: no need to drag the whole way on a phone */
    const onTouchEnd = () => {
      const moved = target.current - touchFrom;
      if (moved < -0.02) target.current = 0;
      else if (moved > 0.1) target.current = 1;
    };

    const onKey = (e) => {
      if (['ArrowDown', 'Space', 'PageDown'].includes(e.code))
        target.current = clamp01(target.current - 0.05);
      if (['ArrowUp', 'PageUp'].includes(e.code))
        target.current = clamp01(target.current + 0.05);
      if (e.key === 'Escape') { closed.current = true; onExit(); }
    };

    window.addEventListener('wheel',      onWheel,      { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });
    window.addEventListener('touchend',   onTouchEnd);
    window.addEventListener('keydown',    onKey);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('touchend',   onTouchEnd);
      window.removeEventListener('keydown',    onKey);
    };
  }, [tick, onExit]);

  return (
    <div ref={overlayRef} className="intro-overlay outro-overlay">

      <div ref={zoomRef} className="intro-zoom">
        <Avatar
          easterEgg
          bubble={
            idle ? (
              <>
                Goodbye! <span className="wave">&#9995;</span>
                <br />
                Thanks for visiting.
              </>
            ) : null
          }
        />
      </div>

      {idle && (
        <div className="outro-actions">
          <button className="outro-btn" onClick={onHome}>Back to start</button>
        </div>
      )}
    </div>
  );
}
