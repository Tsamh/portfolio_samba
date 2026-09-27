import { useEffect, useRef, useState } from 'react';
import '../css/ScrollHint.css';

const SHOW_MS = 2800;

function Hint({ edge, shown }) {
  const arrow = (
    <svg className="scroll-hint-arrow" viewBox="0 0 24 24" width="22" height="22"
         fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round">
      <path d={edge === 'top' ? 'M12 19V6M6 12l6-6 6 6' : 'M12 5v13M6 12l6 6 6-6'} />
    </svg>
  );
  return (
    <div className={`scroll-hint ${edge}${shown ? ' on' : ''}`} aria-hidden="true">
      {edge === 'top' && arrow}
      <span className="scroll-hint-text">keep scrolling</span>
      {edge === 'bottom' && arrow}
    </div>
  );
}

/**
 * Small bouncing arrow saying "keep scrolling", shown for a moment when the
 * visitor reaches an edge of a page that leads somewhere:
 * – at the top, pointing up, when there is a page above (never on Home);
 * – at the bottom, pointing down, when there is a page below.
 * Never on the last page: its black void says it already.
 *
 * @param {number}  active     - index of the current page
 * @param {number}  total      - number of pages
 * @param {object}  scrollRefs - refs of every page scroller
 * @param {boolean} enabled    - false while the menu, outro or loader is up
 */
export default function ScrollHint({ active, total, scrollRefs, enabled }) {
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

  return (
    <>
      <Hint edge="top" shown={top} />
      <Hint edge="bottom" shown={bottom} />
    </>
  );
}
