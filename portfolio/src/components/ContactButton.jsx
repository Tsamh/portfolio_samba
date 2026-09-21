import { useEffect, useRef, useState } from 'react';
import LordIcon from './LordIcon';
import { SOCIALS } from '../lib/links';
import '../css/ContactButton.css';

/**
 * Top-right contact button.
 * On hover (mouse only) → dropdown with Email, LinkedIn and GitHub
 * (no gap so hover stays active).
 * On a phone, a long press opens the same dropdown; a plain tap navigates.
 * On click → navigate to the Contact page.
 */
const LONG_PRESS_MS = 350;

export default function ContactButton({ onContactPage }) {
  const [open, setOpen] = useState(false);
  const pressTimer = useRef(null);
  const longPressed = useRef(false);

  const startPress = () => {
    longPressed.current = false;
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      setOpen(true);
    }, LONG_PRESS_MS);
  };

  const endPress = () => clearTimeout(pressTimer.current);

  /* a tap anywhere else closes the list opened by a long press */
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!e.target.closest('.contact-btn-wrap')) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <div
      className={`contact-btn-wrap${open ? ' open' : ''}`}
      /* pointerType: a tap fires mouseenter too, and the dropdown then
         stayed open (and the button stayed highlighted) on phones */
      onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
    >
      {/* Main button */}
      <button
        className="contact-btn"
        onTouchStart={startPress}
        onTouchEnd={endPress}
        onTouchMove={endPress}
        onTouchCancel={endPress}
        onContextMenu={(e) => e.preventDefault()}   /* no menu on long press */
        onClick={() => {
          if (longPressed.current) {   // the press already opened the list
            longPressed.current = false;
            return;
          }
          setOpen(false);
          onContactPage();
        }}
      >
        Contact
      </button>

      {/* Hover dropdown: padding-top bridges the gap */}
      <div className={`contact-dropdown${open ? ' open' : ''}`}>
        <div className="contact-dropdown-inner">
          {SOCIALS.map(({ icon, label, href }) => (
            <a
              key={label}
              href={href}
              className="contact-dropdown-item"
              onClick={(e) => e.stopPropagation()}
              {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <LordIcon name={icon} size={24} className="dropdown-icon" />
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
