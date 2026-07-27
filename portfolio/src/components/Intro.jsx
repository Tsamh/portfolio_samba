import { useEffect, useRef, useCallback } from 'react';
import Avatar, { HAIR_POINT } from './Avatar';
import '../css/Intro.css';

const MAX_ZOOM = 34;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/* Compute the zoom origin (the avatar's black hair) in px,
   relative to the zoom container. Must run while unscaled. */
function setHairOrigin(zoomEl) {
  const box = zoomEl?.querySelector('.avatar-box');
  if (!zoomEl || !box) return false;
  const zr = zoomEl.getBoundingClientRect();
  const br = box.getBoundingClientRect();
  const ox = br.left - zr.left + br.width * HAIR_POINT.x;
  const oy = br.top - zr.top + br.height * HAIR_POINT.y;
  zoomEl.style.transformOrigin = `${ox}px ${oy}px`;
  return true;
}

/**
 * Full-screen intro overlay.
 * Avatar on the left, "Samba's Portfolio" on its right.
 * Scroll down → slow zoom into his black hair → reveal portfolio.
 */
export default function Intro({ onComplete }) {
  const overlayRef = useRef(null);
  const zoomRef    = useRef(null);
  const nameRef    = useRef(null);
  const hintRef    = useRef(null);
  const bobElRef   = useRef(null);
  const rafRef     = useRef(null);
  const target     = useRef(0);
  const current    = useRef(0);
  const done       = useRef(false);

  const tick = useCallback(() => {
    if (done.current) return;

    current.current = lerp(current.current, target.current, 0.038);
    const p = current.current;

    const overlay = overlayRef.current;
    const zoom    = zoomRef.current;
    const name    = nameRef.current;
    const hint    = hintRef.current;

    if (overlay && zoom) {
      const ch = Math.round(255 - (255 - 13) * Math.min(1, p * 1.5));
      overlay.style.background = `rgb(${ch},${ch},${ch})`;

      zoom.style.transform = `scale(${1 + p * MAX_ZOOM})`;
      zoom.dataset.zooming = p > 0.04 ? 'true' : 'false';
      zoom.style.opacity = String(p < 0.62 ? 1 : Math.max(0, 1 - (p - 0.62) * 3));

      if (!bobElRef.current) {
        bobElRef.current = overlay.querySelector('.avatar-bob');
      }
      if (bobElRef.current) {
        bobElRef.current.style.animationPlayState = p > 0.04 ? 'paused' : 'running';
      }

      if (name) name.style.opacity = String(Math.max(0, 1 - p * 6));
      if (hint) hint.style.opacity = String(Math.max(0, 1 - p * 10));

      const opa = p < 0.82 ? 1 : Math.max(0, 1 - (p - 0.82) * 6);
      overlay.style.opacity = String(opa);
    }

    if (p > 0.985 && !done.current) {
      done.current = true;
      onComplete();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [onComplete]);

  /* zoom origin on the hair — set at mount, refresh on resize */
  useEffect(() => {
    setHairOrigin(zoomRef.current);
    const onResize = () => {
      if (current.current < 0.02) setHairOrigin(zoomRef.current);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);

    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    const onWheel = (e) => {
      e.preventDefault();
      target.current = clamp01(target.current + e.deltaY * 0.0022);
    };

    let touchY = 0;
    const onTouchStart = (e) => { touchY = e.touches[0].clientY; };
    const onTouchMove  = (e) => {
      e.preventDefault();
      const dy = touchY - e.touches[0].clientY;
      target.current = clamp01(target.current + dy * 0.005);
      touchY = e.touches[0].clientY;
    };

    const onKey = (e) => {
      if (['ArrowDown', 'Space', 'Enter', 'PageDown'].includes(e.code))
        target.current = clamp01(target.current + 0.05);
      if (['ArrowUp', 'PageUp'].includes(e.code))
        target.current = clamp01(target.current - 0.05);
    };

    window.addEventListener('wheel',      onWheel,      { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });
    window.addEventListener('keydown',    onKey);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('keydown',    onKey);
    };
  }, [tick]);

  return (
    <div ref={overlayRef} className="intro-overlay">

      <div ref={zoomRef} className="intro-zoom">
        <div className="intro-layout">
          {/* title to the LEFT of the avatar */}
          <div ref={nameRef} className="intro-side-title">
            <span className="ist-line">Samba's</span>
            <span className="ist-line ist-accent">Portfolio</span>
            <span className="ist-sub">AI · Data · MLOps · DevOps · Fullstack</span>
          </div>

          <Avatar easterEgg />
        </div>
      </div>

      <div ref={hintRef} className="intro-hint">
        <span>Scroll to enter my head</span>
        <div className="intro-hint-arrow" />
      </div>
    </div>
  );
}
