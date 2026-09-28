import { useCallback, useState } from 'react';
import TypingText from '../components/TypingText';
import Reveal from '../components/Reveal';
import LordIcon from '../components/LordIcon';
import CvPreview from '../components/CvPreview';
import { SOCIALS } from '../lib/links';
import SkillsPanel from '../components/SkillsPanel';
import chibiSrc from '../assets/avatar/chibime.png';
import '../css/pages.css';

/* The former About page is now the site's Home. */

/* typed in red, with a fixed "Engineer" after them */
const ROLES = ['Data & AI', 'Software'];



/* hand-drawn red stars, spread along the About section: one next to the
   title, one halfway down, one at the very bottom. Each one spins. */
function Star({ className, size }) {
  return (
    <span className={`about-star ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="-20 -20 40 40" fill="none" stroke="var(--accent)" strokeWidth="6"
           strokeLinecap="round" aria-hidden="true">
        <path d="M0-16V16M-14-8 14 8M-14 8 14-8" />
      </svg>
    </span>
  );
}

export default function Home() {
  const [cvOpen, setCvOpen] = useState(false);
  const closeCv = useCallback(() => setCvOpen(false), []);

  return (
    <>
      <div className="hero-section hero-about">
        <div className="hero-about-text">
          <h1 className="title">
            <span className="title-typed"><TypingText words={ROLES} /></span>{' '}
            Engineer
          </h1>
          <p className="subtitle">Pipelines, platforms and models, end to end</p>

          <button className="see-cv-btn" onClick={() => setCvOpen(true)} type="button">
            See CV
          </button>
        </div>

        <div className="hero-visual">
          <img src={chibiSrc} alt="Chibi Samba" className="hero-chibi" draggable={false} />

          <div className="hero-socials">
            {SOCIALS.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                className="hero-link"
                aria-label={label}
                title={label}
                {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <LordIcon name={icon} size={42} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <section className="content-section alt about-section">
        {/* red stars in the empty space left of the text */}
        <span className="about-stars" aria-hidden="true">
          <Star className="s0" size={72} />
          <Star className="s1" size={112} />
          <Star className="s2" size={46} />
        </span>

        <Reveal from="left">
          <div className="about-grid">
            <div className="about-text">
              <h2>Hello.</h2>
              <p>
                I'm an engineer who lives across the whole stack of intelligence:
                I design and train models, build the data pipelines that feed them,
                automate the infrastructure they run on, and ship the web apps
                people use to interact with them.
              </p>
              <p>
                Based in Dakar, working globally. Available for freelance,
                full-time, and collaborations that push what machines can do.
              </p>
            </div>

            <SkillsPanel />
          </div>
        </Reveal>
      </section>

      <CvPreview open={cvOpen} onClose={closeCv} />
    </>
  );
}
