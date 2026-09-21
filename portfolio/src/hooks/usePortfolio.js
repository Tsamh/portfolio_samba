import { useState, useRef, useCallback } from 'react';

/**
 * Central state hook for the portfolio.
 * – menu open / close
 * – click navigation  (overlay slide)
 * – scroll navigation (CSS transition driven by data-scroll-dir)
 * @param {number}   totalPages   - number of pages in the site
 * @param {function} onEndReached - called when scrolling past the bottom
 *                                  of the very last page (exit animation)
 */
export function usePortfolio(totalPages = 4, onEndReached) {
  const TOTAL_PAGES = totalPages;
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [sliding,    setSliding]    = useState(false);  // click overlay
  const [scrollDir,  setScrollDir]  = useState(null);   // 'up' | 'down' | null

  const scrollRefs = useRef([]);
  const cooling    = useRef(false);   // shared cooldown for scroll

  /* ── menu ─────────────────────────────────────────────────── */
  const openMenu = useCallback(() => {
    // Do NOT reset scroll — show the section the user was on
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  /* ── click navigation ─────────────────────────────────────── */
  const goTo = useCallback((index) => {
    closeMenu();

    /* already on that page → just glide back to the top (logo / nav click) */
    if (index === activePage) {
      const el = scrollRefs.current[index];
      if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSliding(true);
    setTimeout(() => {
      if (scrollRefs.current[index]) scrollRefs.current[index].scrollTop = 0;
      setActivePage(index);
    }, 500);
    setTimeout(() => setSliding(false), 1000);
  }, [activePage, closeMenu]);

  /* ── scroll navigation ────────────────────────────────────── */
  function edges(el) {
    return {
      atBottom: el.scrollTop + el.clientHeight >= el.scrollHeight - 2,
      atTop:    el.scrollTop <= 0,
    };
  }

  /* Leaves the page when it is already pinned against the edge the
     visitor keeps pushing on. Returns true when a navigation happened. */
  function leavePage(pageIndex, goingDown, { atTop, atBottom }) {
    if (goingDown && atBottom && pageIndex < TOTAL_PAGES - 1) {
      _scrollTo(pageIndex + 1, 'down');
      return true;
    }
    if (goingDown && atBottom && pageIndex === TOTAL_PAGES - 1 && onEndReached) {
      // past the very last page → exit animation
      cooling.current = true;
      setTimeout(() => { cooling.current = false; }, 1500);
      onEndReached();
      return true;
    }
    if (!goingDown && atTop && pageIndex > 0) {
      _scrollTo(pageIndex - 1, 'up');
      return true;
    }
    return false;
  }

  const handleWheel = useCallback((e, pageIndex) => {
    if (cooling.current || menuOpen) return;

    const el = scrollRefs.current[pageIndex];
    if (!el) return;

    if (leavePage(pageIndex, e.deltaY > 0, edges(el))) e.preventDefault();
  }, [menuOpen, onEndReached]); // eslint-disable-line

  /* ── touch navigation (phones have no wheel) ──────────────────
     A wheel keeps firing while the page is already pinned at its edge, which
     is what flips the page on a desktop in one go. A finger has to do the
     same: we count how far it keeps pulling once the page can no longer
     scroll, and change page during the gesture instead of waiting for the
     finger to lift and a second swipe to start. */
  const OVERSCROLL = 48;   // px of pull past the edge before leaving
  const touch = useRef(null);

  const handleTouchStart = useCallback((e, pageIndex) => {
    const el = scrollRefs.current[pageIndex];
    if (!el || e.touches.length !== 1) return;
    const { clientX, clientY } = e.touches[0];
    touch.current = { x: clientX, y: clientY, pull: 0, fired: false };
  }, []);

  const handleTouchMove = useCallback((e, pageIndex) => {
    const t = touch.current;
    if (!t || t.fired || cooling.current || menuOpen || e.touches.length !== 1) return;

    const el = scrollRefs.current[pageIndex];
    if (!el) return;

    const { clientX, clientY } = e.touches[0];
    const dy = t.y - clientY;          // > 0 → finger up → going down the page
    const dx = clientX - t.x;
    t.y = clientY;
    t.x = clientX;
    if (Math.abs(dy) < Math.abs(dx)) return;   // horizontal swipe: not for us

    const { atTop, atBottom } = edges(el);
    if (dy > 0 && atBottom) t.pull = Math.max(0, t.pull) + dy;
    else if (dy < 0 && atTop) t.pull = Math.min(0, t.pull) + dy;
    else t.pull = 0;                            // still scrolling inside

    if (Math.abs(t.pull) > OVERSCROLL) {
      t.fired = leavePage(pageIndex, t.pull > 0, edges(el));
    }
  }, [menuOpen, onEndReached]); // eslint-disable-line

  const handleTouchEnd = useCallback(() => {
    touch.current = null;
  }, []);

  function _scrollTo(nextIndex, dir) {
    cooling.current = true;
    setScrollDir(dir);

    // going down starts the next page at its top; going up lands on the
    // previous page's LAST section, the one directly above where we were.
    // 'instant' overrides the container's smooth scroll-behavior.
    const next = scrollRefs.current[nextIndex];
    if (next) {
      next.scrollTo({ top: dir === 'up' ? next.scrollHeight : 0, behavior: 'instant' });
    }

    // switch page on the next frame so the CSS animation class is ready
    requestAnimationFrame(() => {
      setActivePage(nextIndex);
    });

    // clear direction + cooldown after animation completes
    setTimeout(() => {
      setScrollDir(null);
      cooling.current = false;
    }, 800);
  }

  return {
    menuOpen, activePage, sliding, scrollDir,
    scrollRefs,
    openMenu, closeMenu, goTo, handleWheel,
    handleTouchStart, handleTouchMove, handleTouchEnd,
  };
}
