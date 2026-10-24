import logoSrc from '../assets/logo_samba.png';
import { useLang } from '../i18n';
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
  const { t } = useLang();

  return (
    <nav className="navbar">

      {/* ── 1: logo ── */}
      <div className="navbar-logo" onClick={onLogoClick} title={t('navbar.home')}>
        <img src={logoSrc} alt="SAMBA" className="navbar-logo-img" />
      </div>

      {/* ── 2: burger ── */}
      <div className="navbar-center">
        <div
          className={`toggle-btn${menuOpen ? ' open' : ''}`}
          onClick={onToggle}
          aria-label={t('navbar.menu')}
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
