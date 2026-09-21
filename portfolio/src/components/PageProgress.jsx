import { useEffect, useState } from 'react';
import '../css/PageProgress.css';

/**
 * Thin vertical bar on the left edge, halfway between the logo and the
 * terminal button: how far down the current page you are. A shorter, dimmer
 * stub above and below says there is a page before or after (none above on
 * Home, none below on Contact).
 *
 * @param {number}  active     - index of the current page
 * @param {number}  total      - number of pages
 * @param {object}  scrollRefs - refs of every page scroller
 * @param {boolean} hidden     - hide it while the menu is open
 */
export default function PageProgress({ active, total, scrollRefs, hidden }) {
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    const el = scrollRefs.current[active];
    if (!el) return;

    const update = () => {
      const max = el.scrollHeight - el.clientHeight;
      setRatio(max > 4 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [active, scrollRefs]);

  return (
    <div className={`pp${hidden ? ' hidden' : ''}`} aria-hidden="true">
      <span className={`pp-stub${active > 0 ? ' on' : ''}`} />
      <span className="pp-track">
        <span className="pp-fill" style={{ transform: `scaleY(${ratio})` }} />
      </span>
      <span className={`pp-stub${active < total - 1 ? ' on' : ''}`} />
    </div>
  );
}
