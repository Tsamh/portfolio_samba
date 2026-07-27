import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Reveal from './Reveal';
import '../css/Activity.css';

/**
 * Activity row: title + description on one side, and a "creative image
 * hover" container on the other (3 diagonal clip-path slices — hovering
 * a slice expands it, as in assets/ref). Clicking a slice opens a
 * lightbox: big image centered, thumbnail strip below, arrow navigation.
 *
 * @param {string}   title
 * @param {string[]} desc     - paragraphs
 * @param {string[]} images   - at least 5 (first 3 shown in the clips)
 * @param {boolean}  reverse  - swap sides + slide from the right
 */
export default function ActivityRow({ title, desc, images, reverse = false }) {
  const [lightbox, setLightbox] = useState(-1);
  const [active, setActive] = useState(-1);   // hovered slice, JS-driven
  const count = images.length;
  const slices = images.slice(0, 3);

  const prev = () => setLightbox((i) => (i - 1 + count) % count);
  const next = () => setLightbox((i) => (i + 1) % count);

  /* keyboard navigation while the lightbox is open */
  useEffect(() => {
    if (lightbox < 0) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(-1);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]); // eslint-disable-line

  return (
    <>
      <Reveal from={reverse ? 'right' : 'left'}>
        <div className={`activity-row${reverse ? ' reverse' : ''}`}>
          <div className="activity-text">
            <h2>{title}</h2>
            {desc.map((p) => <p key={p}>{p}</p>)}
          </div>

          {/* creative hover container (assets/ref effect) —
              hover is driven by React state, not by CSS :hover. The old
              pure-CSS version folded EVERY slice away on container hover, so
              sweeping quickly across the images left a frame with no slice
              expanded yet: the empty dark box the user saw. Here the three
              slices always tile the box; only the hovered one grows on top,
              so no pixel is ever uncovered. */}
          <div className="activity-media">
            <div
              className="clip-container"
              onMouseLeave={() => setActive(-1)}
            >
              {slices.map((src, i) => (
                <div
                  key={i}
                  className={`clip clip${i + 1}${active === i ? ' active' : ''}`}
                  style={{ backgroundImage: `url(${src})` }}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setLightbox(i)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${title} — photo ${i + 1}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setLightbox(i);
                    }
                  }}
                />
              ))}
            </div>
            <span className="activity-hint">Click to see more</span>
          </div>
        </div>
      </Reveal>

      {/* ── lightbox ── */}
      <AnimatePresence>
        {lightbox >= 0 && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightbox(-1)}
          >
            <button
              className="lb-arrow lb-left"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous photo"
            >
              &#8592;
            </button>

            <div className="lb-main" onClick={(e) => e.stopPropagation()}>
              <button
                className="lb-close"
                onClick={() => setLightbox(-1)}
                aria-label="Close"
              >
                &#10005;
              </button>
              <motion.img
                key={lightbox}
                src={images[lightbox]}
                alt={`${title} — photo ${lightbox + 1}`}
                className="lb-image"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                draggable={false}
              />
              <div className="lb-caption">
                {title} <span>{lightbox + 1} / {count}</span>
              </div>
              <div className="lb-thumbs">
                {images.map((s, i) => (
                  <img
                    key={i}
                    src={s}
                    alt=""
                    className={i === lightbox ? 'active' : ''}
                    onClick={() => setLightbox(i)}
                    draggable={false}
                  />
                ))}
              </div>
            </div>

            <button
              className="lb-arrow lb-right"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next photo"
            >
              &#8594;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
