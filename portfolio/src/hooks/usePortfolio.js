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
  const handleWheel = useCallback((e, pageIndex) => {
    if (cooling.current || menuOpen) return;

    const el = scrollRefs.current[pageIndex];
    if (!el) return;

    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    const atTop    = el.scrollTop <= 0;
    const goingDown = e.deltaY > 0;

    if (goingDown && atBottom && pageIndex < TOTAL_PAGES - 1) {
      e.preventDefault();
      _scrollTo(pageIndex + 1, 'down');
    } else if (goingDown && atBottom && pageIndex === TOTAL_PAGES - 1 && onEndReached) {
      // past the very last page → exit animation
      e.preventDefault();
      cooling.current = true;
      setTimeout(() => { cooling.current = false; }, 1500);
      onEndReached();
    } else if (!goingDown && atTop && pageIndex > 0) {
      e.preventDefault();
      _scrollTo(pageIndex - 1, 'up');
    }
  }, [menuOpen, onEndReached]); // eslint-disable-line

  function _scrollTo(nextIndex, dir) {
    cooling.current = true;
    setScrollDir(dir);

    // reset the target page's scroll position immediately
    if (scrollRefs.current[nextIndex]) {
      scrollRefs.current[nextIndex].scrollTop = 0;
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
  };
}
