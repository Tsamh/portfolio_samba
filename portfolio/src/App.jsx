import { useEffect, useState } from 'react';
import Intro          from './components/Intro';
import Navbar         from './components/Navbar';
import NavList        from './components/NavList';
import QuotesPanel    from './components/QuotesPanel';
import ContactButton  from './components/ContactButton';
import ThemeToggle    from './components/ThemeToggle';
import Terminal       from './components/Terminal';
import Outro          from './components/Outro';
import GestureNav     from './components/GestureNav';
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
  const [introComplete, setIntroComplete] = useState(false);
  const [terminalOpen, setTerminalOpen]   = useState(false);
  const [outroOpen, setOutroOpen]         = useState(false);

  /* ── theme (light by default) ── */
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  /* outro can also be opened by the black void section (Contact page) */
  useEffect(() => {
    const open = () => {
      if (introComplete) setOutroOpen(true);
    };
    window.addEventListener('portfolio:outro', open);
    return () => window.removeEventListener('portfolio:outro', open);
  }, [introComplete]);

  /* keyboard shortcut: Ctrl + Alt + T toggles the terminal */
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        setTerminalOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const {
    menuOpen, activePage, sliding, scrollDir,
    scrollRefs,
    openMenu, closeMenu, goTo, handleWheel,
  } = usePortfolio(PAGES.length, () => setOutroOpen(true));

  return (
    <>
      {/* ── PORTFOLIO (always in DOM — renders under the intro) ── */}
      <div style={{ width: '100%', height: '100%', visibility: introComplete ? 'visible' : 'hidden' }}>

        <Navbar
          menuOpen={menuOpen}
          onToggle={() => (menuOpen ? closeMenu() : openMenu())}
          onLogoClick={() => goTo(0)}
          onTerminal={() => setTerminalOpen(true)}
          themeToggle={
            <ThemeToggle
              theme={theme}
              onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            />
          }
          rightSlot={<ContactButton onContactPage={() => goTo(CONTACT_INDEX)} />}
        />

        {menuOpen && <div className="menu-close-overlay" onClick={closeMenu} />}

        <NavList show={menuOpen} onSelect={goTo} />

        <QuotesPanel visible={menuOpen} />

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
              >
                {page}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ── TERMINAL overlay ── */}
      <Terminal
        open={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        onNavigate={goTo}
        theme={theme}
        setTheme={setTheme}
      />

      {/* ── GESTURE NAVIGATION (camera button + overlay) ── */}
      {introComplete && <GestureNav />}

      {/* ── OUTRO overlay (scrolled past the last page) ── */}
      {outroOpen && (
        <Outro
          onExit={() => setOutroOpen(false)}
          onHome={() => { setOutroOpen(false); goTo(0); }}
        />
      )}

      {/* ── INTRO overlay (removed from DOM once complete) ── */}
      {!introComplete && (
        <Intro onComplete={() => setIntroComplete(true)} />
      )}
    </>
  );
}
