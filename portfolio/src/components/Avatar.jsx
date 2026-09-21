import { useEffect, useRef, useState } from 'react';
import avatarSrc from '../assets/avatar/normal.png';
import { findEgg } from '../lib/eggs';
import '../css/Avatar.css';

/* ── Calibration (percent of the image box, normal.png 964×1240) ── */
export const ZOOM_ORIGIN = '51% 22%';   // into the BLACK HAIR (legacy)
export const HAIR_POINT = { x: 0.51, y: 0.22 }; // hair position on the image box
/* measured on the artwork: printed eyes are Ø2.7% of the image width */
const EYES = {
  left:  { x: 44.25, y: 36.5 },
  right: { x: 58.05, y: 36.7 },
};
const EYE_SIZE = 6;       // % of image width (mask box, > printed eye)
const SKIN = '#6E4A33';   // exact skin colour, sampled from the artwork
/* Soft-edged mask: opaque over the printed eye, faded out well before the
   edge of the box — so no circle outline is ever visible, even at 34× zoom. */
const EYE_MASK = `radial-gradient(circle, ${SKIN} 0 58%, ${SKIN}00 76%)`;
/* pupil travel, expressed in % of the eye box → resolution/zoom independent */
const PUPIL_TRAVEL = 20;

/* pocket of the jacket (small dark rectangle, chest right) */
const POCKET = { x: 76.5, y: 85.3, w: 11, h: 5 };

const PAPER_MESSAGE = [
  'Going through my pockets?!',
  'Fine... here is my secret:',
  "I still google 'how to center a div'",
  'every single time.',
];

/**
 * Interactive avatar — breathing, random blinking, pupils that follow
 * the mouse, subtle head tilt, and a pocket easter egg (3 clicks pull
 * a paper out of the jacket pocket).
 *
 * Wrap it in a zoom container and set data-zooming="true" on any
 * ancestor to freeze the tilt while zooming.
 *
 * @param {boolean}   easterEgg - enable the pocket paper
 * @param {ReactNode} bubble    - optional speech bubble content
 */
export default function Avatar({ easterEgg = false, bubble = null }) {
  const rootRef   = useRef(null);
  const bobRef    = useRef(null);
  const pupilRefs = useRef({});
  const eyeRefs   = useRef({});
  const [paperStage, setPaperStage] = useState(0); // 0..3

  /* ── pupils follow the mouse + subtle head tilt ── */
  useEffect(() => {
    const onMove = (e) => {
      Object.values(pupilRefs.current).forEach((pupil) => {
        if (!pupil) return;
        const r = pupil.parentElement.getBoundingClientRect();
        if (!r.width) return;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        /* Normalise the distance by the eye's own on-screen size instead of a
           fixed pixel budget: when the intro zooms the avatar 34×, r.width
           explodes and a px-based offset threw the pupils out of the eye
           (they vanished). Percent units keep the motion identical at any
           zoom level. */
        const k = Math.min(1, dist / (r.width * 4));
        const t = PUPIL_TRAVEL * k;
        pupil.style.transform =
          `translate(${(dx / dist) * t}%, ${(dy / dist) * t}%)`;
      });

      const bob = bobRef.current;
      const zooming = rootRef.current?.closest('[data-zooming="true"]');
      if (bob && !zooming) {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        bob.style.rotate = `${nx * 2.4}deg`;
        bob.style.translate = `${nx * 8}px ${ny * 5}px`;
      } else if (bob) {
        bob.style.rotate = '0deg';
        bob.style.translate = '0px 0px';
      }
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* ── random natural blinking ── */
  useEffect(() => {
    let timeout;
    let alive = true;

    const setBlink = (on) =>
      Object.values(eyeRefs.current).forEach((el) =>
        el?.classList.toggle('blink', on)
      );

    const blink = () => {
      if (!alive) return;
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
      if (Math.random() < 0.25) {
        setTimeout(() => {
          setBlink(true);
          setTimeout(() => setBlink(false), 130);
        }, 260);
      }
      timeout = setTimeout(blink, 2200 + Math.random() * 3300);
    };

    timeout = setTimeout(blink, 1600);
    return () => { alive = false; clearTimeout(timeout); };
  }, []);

  const onPocketClick = (e) => {
    e.stopPropagation();
    setPaperStage((s) => {
      const next = s >= 3 ? 0 : s + 1;          // 4th click tucks it back
      if (next === 3) findEgg('pocket');        // the note is readable now
      return next;
    });
  };

  return (
    <div ref={rootRef} className="avatar-root">
      <div ref={bobRef} className="avatar-bob">
        <div className="avatar-box">
          <img
            src={avatarSrc}
            alt="Samba's avatar"
            className="avatar-img"
            draggable={false}
          />

          {/* live eyes */}
          {Object.entries(EYES).map(([side, pos]) => (
            <div
              key={side}
              ref={(el) => (eyeRefs.current[side] = el)}
              className="avatar-eye"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: `${EYE_SIZE}%`,
                background: EYE_MASK,
              }}
            >
              <div
                ref={(el) => (pupilRefs.current[side] = el)}
                className="avatar-pupil-move"
              >
                <div className="avatar-pupil" />
              </div>
            </div>
          ))}

          {/* ── pocket easter egg ── */}
          {easterEgg && (
            <>
              {/* paper sliding out of the pocket (stages 1 & 2 only —
                  hidden once the note is fully out) */}
              {paperStage < 3 && (
                <div
                  className="avatar-paper-slot"
                  style={{
                    left: `${POCKET.x}%`,
                    top: `${POCKET.y}%`,
                    width: `${POCKET.w - 2}%`,
                  }}
                >
                  <div className={`avatar-paper stage-${paperStage}`} />
                </div>
              )}

              {/* fully out — the note with the message (stage 3) */}
              {paperStage === 3 && (
                <div
                  className="avatar-note"
                  style={{ left: `${POCKET.x}%`, top: `${POCKET.y}%` }}
                  onClick={onPocketClick}
                  title="Ranger le papier"
                >
                  {PAPER_MESSAGE.map((line) => <p key={line}>{line}</p>)}
                </div>
              )}

              {/* invisible click zone over the pocket */}
              <button
                className="avatar-pocket-zone"
                style={{
                  left: `${POCKET.x}%`,
                  top: `${POCKET.y + POCKET.h / 2}%`,
                  width: `${POCKET.w}%`,
                  height: `${POCKET.h + 3}%`,
                }}
                onClick={onPocketClick}
                aria-label="Jacket pocket"
              />
            </>
          )}

          {/* optional speech bubble */}
          {bubble && <div className="avatar-bubble">{bubble}</div>}
        </div>
      </div>
    </div>
  );
}
