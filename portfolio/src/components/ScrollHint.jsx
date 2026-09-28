import { useEffect, useRef, useState } from 'react';
import '../css/ScrollHint.css';

const SHOW_MS = 2800;
const AFTER_HOVER_MS = 1200;   // lingers a little once the pointer leaves

function Hint({ edge, shown, onClick, onHold, onRelease }) {
  const arrow = (
    <svg className="scroll-hint-arrow" viewBox="0 0 24 24" width="16" height="16"
         fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round">
      <path d={edge === 'top' ? 'M12 19V6M6 12l6-6 6 6' : 'M12 5v13M6 12l6 6 6-6'} />
    </svg>
  );
  return (
    <button
      type="button"
      className={`scroll-hint ${edge}${shown ? ' on' : ''}`}
      onClick={onClick}
      onMouseEnter={onHold}
      onMouseLeave={onRelease}
      onFocus={onHold}
      onBlur={onRelease}
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      aria-label={edge === 'top' ? 'Go to the previous page' : 'Go to the next page'}
    >
      {edge === 'top' && arrow}
      <span className="scroll-hint-text">can scroll</span>
      {edge === 'bottom' && arrow}
    </button>
  );
}

/**
 * Small bouncing arrow saying "can scroll", shown for a moment when the
 * visitor reaches an edge of a page that leads somewhere:
 * – at the top, pointing up, when there is a page above (never on Home);
 * – at the bottom, pointing down, when there is a page below.
 * Never on the last page: its black void says it already.
 * While it shows, clicking it goes straight to that page, and it stays up
 * as long as the pointer rests on it.
 *
 * @param {number}  active     - index of the current page
 * @param {number}  total      - number of pages
 * @param {object}  scrollRefs - refs of every page scroller
 * @param {boolean} enabled    - false while the menu, outro or loader is up
 * @param {function} onNavigate - goes to a page index
 */
export default function ScrollHint({ active, total, scrollRefs, enabled, onNavigate }) {
  const [top, setTop] = useState(false);
  const [bottom, setBottom] = useState(false);
  const timers = useRef({});

  useEffect(() => {
    const last = active === total - 1;
    if (!enabled || last) return undefined;
    const el = scrollRefs.current[active];
    if (!el) return undefined;

    const flash = (set, key) => {
      clearTimeout(timers.current[key]);
      set(true);
      timers.current[key] = setTimeout(() => set(false), SHOW_MS);
    };
    const hide = (set, key) => { clearTimeout(timers.current[key]); set(false); };

    const edges = () => ({
      atTop: el.scrollTop <= 2,
      atBottom: el.scrollTop + el.clientHeight >= el.scrollHeight - 2,
    });

    // arriving on the page: whichever edge it opens on
    let prev = edges();
    if (prev.atTop && active > 0) flash(setTop, 'top');
    if (prev.atBottom) flash(setBottom, 'bottom');

    // reaching an edge again later — once, until the visitor leaves it
    const onScroll = () => {
      const now = edges();
      if (now.atTop && !prev.atTop && active > 0) flash(setTop, 'top');
      if (now.atBottom && !prev.atBottom) flash(setBottom, 'bottom');
      if (!now.atTop) hide(setTop, 'top');
      if (!now.atBottom) hide(setBottom, 'bottom');
      prev = now;
    };
    el.addEventListener('scroll', onScroll, { passive: true });

    const t = timers.current;
    return () => {
      el.removeEventListener('scroll', onScroll);
      clearTimeout(t.top);
      clearTimeout(t.bottom);
      setTop(false);
      setBottom(false);
    };
  }, [active, total, scrollRefs, enabled]);

  /* hovering holds the hint on screen; leaving restarts a short timer */
  const hold = (key) => clearTimeout(timers.current[key]);
  const release = (set, key) => {
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => set(false), AFTER_HOVER_MS);
  };

  return (
    <>
      <Hint
        edge="top"
        shown={top}
        onClick={() => onNavigate(active - 1)}
        onHold={() => hold('top')}
        onRelease={() => top && release(setTop, 'top')}
      />
      <Hint
        edge="bottom"
        shown={bottom}
        onClick={() => onNavigate(active + 1)}
        onHold={() => hold('bottom')}
        onRelease={() => bottom && release(setBottom, 'bottom')}
      />
    </>
  );
}
