import logoSrc from '../assets/s.png';
import '../css/Navbar.css';

/**
 * Fixed top navbar — 3-column grid:
 *  [logo]  [burger]  [theme toggle · rightSlot]
 * The burger stays centred; the terminal lives in a floating button
 * at the bottom-left (see Terminal).
 *
 * @param {boolean}   menuOpen
 * @param {function}  onToggle     - burger click
 * @param {function}  onLogoClick  - navigate to Home
 * @param {ReactNode} themeToggle  - theme switch node
 * @param {ReactNode} rightSlot    - right column (ContactButton)
 */
export default function Navbar({ menuOpen, onToggle, onLogoClick, themeToggle, rightSlot }) {
  return (
    <nav className="navbar">

      {/* ── 1: logo ── */}
      <div className="navbar-logo" onClick={onLogoClick} title="Back to Home">
        <img src={logoSrc} alt="SAMBA" className="navbar-logo-img" />
      </div>

      {/* ── 2: burger ── */}
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

      {/* ── 3: theme toggle + right slot ── */}
      <div className="navbar-right">
        {themeToggle}
        {rightSlot}
      </div>
    </nav>
  );
}
