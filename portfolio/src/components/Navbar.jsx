import logoSrc from '../assets/s.png';
import '../css/Navbar.css';

/**
 * Fixed top navbar — 5-column grid, fully transparent:
 *  [logo]  [terminal]  [burger]  [theme toggle]  [rightSlot]
 *  terminal sits midway logo↔burger, toggle midway burger↔rightSlot.
 *
 * @param {boolean}   menuOpen
 * @param {function}  onToggle     - burger click
 * @param {function}  onLogoClick  - navigate to Home
 * @param {function}  onTerminal   - open the terminal overlay
 * @param {ReactNode} themeToggle  - theme switch node
 * @param {ReactNode} rightSlot    - right column (ContactButton)
 */
export default function Navbar({ menuOpen, onToggle, onLogoClick, onTerminal, themeToggle, rightSlot }) {
  return (
    <nav className="navbar">

      {/* ── 1: logo ── */}
      <div className="navbar-logo" onClick={onLogoClick} title="Back to Home">
        <img src={logoSrc} alt="SAMBA" className="navbar-logo-img" />
      </div>

      {/* ── 2: terminal (midway logo ↔ burger) ── */}
      <div className="navbar-slot">
        <span className="terminal-wrap">
          <button
            className="terminal-btn"
            onClick={onTerminal}
            aria-label="Open terminal (Ctrl + Alt + T)"
          >
            &gt;_
          </button>
          <span className="terminal-combo">(Ctrl + Alt + T)</span>
        </span>
      </div>

      {/* ── 3: burger ── */}
      <div className="navbar-center">
        <div
          className={`toggle-btn${menuOpen ? ' open' : ''}`}
          onClick={onToggle}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </div>
      </div>

      {/* ── 4: theme toggle (midway burger ↔ contact) ── */}
      <div className="navbar-slot">
        {themeToggle}
      </div>

      {/* ── 5: right slot ── */}
      <div className="navbar-right">
        {rightSlot}
      </div>
    </nav>
  );
}
