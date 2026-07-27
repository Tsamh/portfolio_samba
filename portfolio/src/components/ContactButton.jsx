import { useState } from 'react';
import '../css/ContactButton.css';

/**
 * Top-right contact button.
 * On hover → dropdown with Email + LinkedIn (no gap so hover stays active).
 * On click → navigate to the Contact page.
 */
export default function ContactButton({ onContactPage }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="contact-btn-wrap"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Main button */}
      <button className="contact-btn" onClick={onContactPage}>
        Contact
      </button>

      {/* Hover dropdown — padding-top bridges the gap */}
      <div className={`contact-dropdown${open ? ' open' : ''}`}>
        <div className="contact-dropdown-inner">
          <a
            href="mailto:tsambahama@gmail.com"
            className="contact-dropdown-item"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="dropdown-icon">✉</span>
            Email
          </a>
          <a
            href="https://linkedin.com/in/yourhandle"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-dropdown-item"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="dropdown-icon">in</span>
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}
