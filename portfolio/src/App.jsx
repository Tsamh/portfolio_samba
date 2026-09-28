import { useCallback, useEffect, useState } from 'react';
import Loader         from './components/Loader';
import Navbar         from './components/Navbar';
import NavList        from './components/NavList';
import QuotesPanel    from './components/QuotesPanel';
import ContactButton  from './components/ContactButton';
import ThemeToggle    from './components/ThemeToggle';
import Terminal       from './components/Terminal';
import Outro          from './components/Outro';
import GestureNav     from './components/GestureNav';
import EggToast       from './components/EggToast';
import PageProgress   from './components/PageProgress';
import ScrollHint     from './components/ScrollHint';
import LostPage       from './components/LostPage';
import Home           from './pages/Home';
import Projects       from './pages/Projects';
import Extra          from './pages/Extra';
import Random         from './pages/Random';
import Contact        from './pages/Contact';
import { usePortfolio } from './hooks/usePortfolio';
import './css/App.css';

/* Page order: Home → Projects → Extra → Random → Contact */
const PAGES = [<Home />, <Projects />, <Extra />, <Random />, <Contact />];
const CONTACT_INDEX = 4;

export default function App() {
  const [loaded, setLoaded]               = useState(false); // site visible
  const [loaderGone, setLoaderGone]       = useState(false); // smoke finished
  const [terminalOpen, setTerminalOpen]   = useState(false);
  const [outroOpen, setOutroOpen]         = useState(false);
  const [lost, setLost]                   = useState(false);   // the 404 page

  const handleReveal = useCallback(() => setLoaded(true), []);
  const handleLoaderDone = useCallback(() => setLoaderGone(true), []);

  /* ── theme (light by default) ── */
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  /* 404: the /404 address, any unknown hash (ex: /#/nowhere), or the
     terminal's `404` command */
  useEffect(() => {
    const check = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const path = window.location.pathname.replace(/\/+$/, '');
      setLost(hash.length > 0 || path.endsWith('/404'));
    };
    check();
    const open = () => {
      window.location.hash = '/404';
      setLost(true);
    };
    window.addEventListener('hashchange', check);
    window.addEventListener('portfolio:lost', open);
    return () => {
      window.removeEventListener('hashchange', check);
      window.removeEventListener('portfolio:lost', open);
    };
  }, []);

  const leaveLost = useCallback(() => {
    const path = window.location.pathname.replace(/\/404\/?$/, '/');
    history.replaceState(null, '', path + window.location.search);
    setLost(false);
  }, []);

  /* outro can also be opened by the black void section (Contact page) */
  useEffect(() => {
    const open = () => {
      if (loaded) setOutroOpen(true);
    };
    window.addEventListener('portfolio:outro', open);
    return () => window.removeEventListener('portfolio:outro', open);
  }, [loaded]);

  const {
    menuOpen, activePage, sliding, scrollDir,
    scrollRefs,
    openMenu, closeMenu, goTo, handleWheel,
    handleTouchStart, handleTouchMove, handleTouchEnd,
  } = usePortfolio(PAGES.length, () => setOutroOpen(true));

  return (
    <>
      {/* ── PORTFOLIO (always in DOM — renders under the loader) ── */}
      <div style={{ width: '100%', height: '100%', visibility: loaded ? 'visible' : 'hidden' }}>

        <Navbar
          menuOpen={menuOpen}
          onToggle={() => (menuOpen ? closeMenu() : openMenu())}
          onLogoClick={() => goTo(0)}
          themeToggle={
            <ThemeToggle
              theme={theme}
              onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            />
          }
          rightSlot={<ContactButton onContactPage={() => goTo(CONTACT_INDEX)} />}
        />

        {menuOpen && <div className="menu-close-overlay" onClick={closeMenu} />}

        <NavList show={menuOpen} active={activePage} onSelect={goTo} />

        <QuotesPanel visible={menuOpen} />

        <PageProgress
          active={activePage}
          total={PAGES.length}
          scrollRefs={scrollRefs}
          hidden={menuOpen}
        />

        <ScrollHint
          active={activePage}
          total={PAGES.length}
          scrollRefs={scrollRefs}
          enabled={loaderGone && !menuOpen && !outroOpen && !lost}
          onNavigate={goTo}
        />

        <div
          className={`page-container${menuOpen ? ' active' : ''}`}
          data-scroll-dir={scrollDir || undefined}
        >
          <span
            className="overlay"
            style={{ animation: sliding ? 'slide 1s linear 1' : 'none' }}
          />

          {PAGES.map((page, i) => (
            <section
              key={i}
              className={`page${activePage === i ? ' active' : ''}`}
            >
              <div
                ref={(el) => (scrollRefs.current[i] = el)}
                className="page-scroll"
                onWheel={(e) => handleWheel(e, i)}
                onTouchStart={(e) => handleTouchStart(e, i)}
                onTouchMove={(e) => handleTouchMove(e, i)}
                onTouchEnd={handleTouchEnd}
              >
                {page}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ── TERMINAL (button bottom-left + docked window) ── */}
      {loaded && (
        <Terminal
          open={terminalOpen}
          onOpen={() => setTerminalOpen(true)}
          onClose={() => setTerminalOpen(false)}
          onNavigate={goTo}
          theme={theme}
          setTheme={setTheme}
        />
      )}

      {/* ── GESTURE NAVIGATION (camera button + overlay) ── */}
      {loaded && <GestureNav />}

      {/* ── OUTRO overlay (scrolled past the last page) ── */}
      {outroOpen && (
        <Outro
          onExit={() => setOutroOpen(false)}
          onHome={() => { setOutroOpen(false); goTo(0); }}
        />
      )}

      {/* ── EASTER EGGS: flash notification and the lost page ── */}
      <EggToast />
      {lost && <LostPage onLeave={leaveLost} ready={loaderGone} />}

      {/* ── LOADER (removed from DOM once the site is ready) ── */}
      {!loaderGone && <Loader onReveal={handleReveal} onComplete={handleLoaderDone} />}
    </>
  );
}
