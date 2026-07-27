import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import '../css/ProjectCarousel.css';

/* Replica of assets/carroussel.mp4 — deep diagonal cascade of portrait
   planes with a velocity-linked spacing wave.

   HOVER: browsers are unreliable at hit-testing 3D-transformed elements,
   so hover is computed MANUALLY: on every mouse move (and while the cards
   travel), each plane's projected rectangle (getBoundingClientRect — exact
   for unrotated planes) is tested against the cursor; among the planes
   under the cursor, the closest one (widest projection) wins. */

const localImages = Object.entries(
  import.meta.glob('../assets/projects/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG}', {
    eager: true,
    import: 'default',
  })
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, src]) => src);

const FALLBACK_IMAGES = Array.from(
  { length: 16 },
  (_, i) => `https://picsum.photos/seed/surf-${i + 1}/700/980`
);

const IMAGES = localImages.length > 0 ? localImages : FALLBACK_IMAGES;

/* ── Cascade geometry (tuned on the reference video) ── */
const DX = 190;
const SLOPE = 0.62;
/* Depth spacing is deliberately larger than before: the planes are now tilted,
   so each one occupies a slice of depth (±190·sin(ROT_Y)). Keeping the gap
   between neighbours wider than that slice guarantees they never intersect. */
const DEPTH = 0.82;

/* Hover: the plane only RISES. It must never come closer to the camera,
   otherwise it would jump in front of its neighbours. */
const HOVER_LIFT = 46;

/* Snake wave — the cascade is no longer a straight diagonal: planes ride a
   sine that makes them climb and dive as the carousel scrolls. */
const WAVE_AMP = 62;      // px of vertical swing
const WAVE_TARGET = 3.1;  // ≈ how many cards per wave period
const WAVE_TILT = 7;      // deg of roll, follows the slope of the wave

/* Static 3D attitude of every plane — this is what gives the images their
   angled, "coming out of the screen" look. */
const PLANE_ROT_Y = -17;
const PLANE_ROT_X = 3;

const FOLLOW = (index) => ({
  stiffness: 130,
  damping: 22,
  mass: 0.65 + index * 0.055,
});

const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/* ── Scrambled text ── */
const SCRAMBLE_CHARS = '!<>-_\\/[]{}=+*^?#________';

function ScrambleText({ text }) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      const revealed = Math.floor(frame / 3);
      setDisplay(
        text
          .split('')
          .map((c, i) =>
            i < revealed
              ? c
              : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
          )
          .join('')
      );
      if (revealed >= text.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [text]);

  return <span>{display}</span>;
}

/* ── Single plane ──
   Geometry is computed in "design units" (u) tuned for a 380px card, then
   multiplied by the live scale so the cascade keeps its proportions on every
   screen size — the card width itself comes from the --pc-w CSS variable. */
function Plane({ index, count, image, label, offset, hovered, registerRef, scaleRef }) {
  const span = count * DX;

  /* Snap the wavelength so a whole number of periods fits the wrap range:
     the sine then joins itself perfectly at the loop point — no visible seam
     when a plane recycles from one end of the cascade to the other. */
  const periods = Math.max(1, Math.round(count / WAVE_TARGET));
  const waveLen = span / periods;
  const phase = (v) => (v / waveLen) * Math.PI * 2;

  const follow = useSpring(offset, FOLLOW(index));

  const u = useTransform(follow, (v) =>
    wrap(-2.5 * DX, span - 2.5 * DX, v / (scaleRef.current || 1) + index * DX)
  );

  /* hover raises the plane vertically only — depth (z) stays untouched, so
     the stacking order never changes and no card jumps over another */
  const lift = useSpring(0, { stiffness: 300, damping: 24 });
  useEffect(() => {
    lift.set(hovered ? HOVER_LIFT : 0);
  }, [hovered, lift]);

  const x = useTransform(u, (v) => v * scaleRef.current);

  /* diagonal cascade + serpentine wave + hover lift */
  const y = useTransform([u, lift], ([uv, lv]) =>
    (-uv * SLOPE + Math.sin(phase(uv)) * WAVE_AMP) * scaleRef.current - lv
  );

  /* roll follows the wave's own slope → the chain reads like a snake */
  const rotateZ = useTransform(u, (v) => Math.cos(phase(v)) * WAVE_TILT);

  const z = useTransform(u, (v) => -v * DEPTH * scaleRef.current);

  return (
    <motion.div
      ref={(el) => registerRef(index, el)}
      className={`pc-plane${hovered ? ' hovered' : ''}`}
      style={{
        x, y, z, rotateZ,
        rotateY: PLANE_ROT_Y,
        rotateX: PLANE_ROT_X,
      }}
    >
      <span className="pc-num">{String(index).padStart(2, '0')}</span>

      <div className="pc-image-container">
        <img
          src={image}
          alt={label || `Plane ${index}`}
          className="pc-image"
          draggable={false}
          loading="lazy"
        />
      </div>

    </motion.div>
  );
}

/* ── Carousel ── */
export default function ProjectCarousel({ projects = [], title = 'Selected Works' }) {
  const offset = useMotionValue(0);
  const viewportRef = useRef(null);
  const planeRefs = useRef([]);
  const mouse = useRef({ x: -1, y: -1 });
  const rafId = useRef(0);
  const hoveredRef = useRef(-1);
  const scaleRef = useRef(1);
  const [hoveredIndex, setHoveredIndex] = useState(-1);

  const registerRef = (index, el) => {
    planeRefs.current[index] = el;
  };

  /* manual hover: test the cursor against each plane's projected rect.
     The hovered plane gets its rect grown back down by HOVER_LIFT, otherwise
     the lift itself would pull the card out from under the cursor and the
     hover would oscillate. */
  const updateHover = () => {
    const { x, y } = mouse.current;
    if (x < 0) {
      hoveredRef.current = -1;
      setHoveredIndex(-1);
      return;
    }
    let best = -1;
    let bestWidth = 0;
    planeRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const bottom = r.bottom + (hoveredRef.current === i ? HOVER_LIFT : 0);
      if (x >= r.left && x <= r.right && y >= r.top && y <= bottom) {
        // widest projection = closest to the camera = on top
        if (r.width > bestWidth) {
          bestWidth = r.width;
          best = i;
        }
      }
    });
    hoveredRef.current = best;
    setHoveredIndex(best);
  };

  const scheduleHover = () => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(updateHover);
  };

  /* keep the cascade proportional: read the card width the CSS breakpoints
     decided on, and re-evaluate the derived transforms */
  useEffect(() => {
    const compute = () => {
      const el = viewportRef.current;
      if (!el) return;
      const w = parseFloat(getComputedStyle(el).getPropertyValue('--pc-w'));
      scaleRef.current = w > 0 ? w / 380 : 1;
      offset.set(offset.get() + 0.0001); // nudge → transforms recompute
      scheduleHover();
    };
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('orientationchange', compute);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('orientationchange', compute);
    };
  }, [offset]); // eslint-disable-line

  /* native non-passive wheel: only the cards move, never the page */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      offset.set(offset.get() - (e.deltaY + e.deltaX) * 1.1);
      scheduleHover(); // cards travel under a still cursor
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(rafId.current);
    };
  }, [offset]); // eslint-disable-line

  const count = Math.max(IMAGES.length, 10);
  const planes = Array.from({ length: count }, (_, i) => ({
    index: i,
    image: IMAGES[i % IMAGES.length],
    label: projects.length > 0 ? projects[i % projects.length].title : '',
  }));

  const hoveredLabel = hoveredIndex >= 0 ? planes[hoveredIndex]?.label : '';

  return (
    <motion.div
      ref={viewportRef}
      className="pc-viewport"
      onMouseMove={(e) => {
        mouse.current = { x: e.clientX, y: e.clientY };
        scheduleHover();
      }}
      onMouseLeave={() => {
        mouse.current = { x: -1, y: -1 };
        hoveredRef.current = -1;
        setHoveredIndex(-1);
      }}
      onPan={(_, info) => {
        offset.set(offset.get() + (info.delta.x - info.delta.y) * 1.4);
        scheduleHover();
      }}
    >
      <h2 className="pc-title">
        {title}
        <sup>({String(IMAGES.length).padStart(2, '0')})</sup>
      </h2>

      <div className="pc-scene">
        <div className="pc-anchor">
          {planes.map((p) => (
            <Plane
              key={p.index}
              {...p}
              count={count}
              offset={offset}
              hovered={hoveredIndex === p.index}
              registerRef={registerRef}
              scaleRef={scaleRef}
            />
          ))}
        </div>
      </div>

      {/* Hovered project name.
          It lives in the viewport (not on the card) and sits in the
          bottom-right corner: simulating a full scroll cycle at 1100×620,
          1440×740 and 1920×900 shows that corner is never reached by any
          plane, so the name always lands on pure black and stays readable —
          it can never be printed over another image. */}
      <AnimatePresence>
        {hoveredLabel && (
          <motion.div
            className="pc-hoverline"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="pc-hoverline-rule"
              initial={{ width: 0 }}
              animate={{ width: 40 }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
            <span className="pc-hoverline-text">
              <ScrambleText key={hoveredLabel} text={hoveredLabel} />
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="pc-hint">Scroll&nbsp;to&nbsp;surf</span>
    </motion.div>
  );
}
