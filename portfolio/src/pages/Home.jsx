import { useCallback, useState } from 'react';
import TypingText from '../components/TypingText';
import Reveal from '../components/Reveal';
import LordIcon from '../components/LordIcon';
import CvPreview from '../components/CvPreview';
import { SOCIALS } from '../lib/links';
import SkillsPanel from '../components/SkillsPanel';
import { useLang } from '../i18n';
import chibiSrc from '../assets/avatar/chibime.png';
import '../css/pages.css';

/* The former About page is now the site's Home. The roles are typed in red
   next to a fixed "Engineer" (home.roles and home.title in i18n/). */


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
  const { lang, t } = useLang();
  const [cvOpen, setCvOpen] = useState(false);
  const closeCv = useCallback(() => setCvOpen(false), []);
  const { before, after } = t('home.title');

  return (
    <>
      <div className="hero-section hero-about">
        <div className="hero-about-text">
          <h1 className="title">
            {before && <>{before}{' '}</>}
            {/* keyed by language: the typing starts over on the new words */}
            <span className="title-typed"><TypingText key={lang} words={t('home.roles')} /></span>
            {after && <>{' '}{after}</>}
          </h1>
          <p className="subtitle">{t('home.subtitle')}</p>

          <button className="see-cv-btn" onClick={() => setCvOpen(true)} type="button">
            {t('home.seeCv')}
          </button>
        </div>

        <div className="hero-visual">
          <img src={chibiSrc} alt={t('home.chibi')} className="hero-chibi" draggable={false} />

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
              <h2>{t('home.hello')}</h2>
              {t('home.about').map((p, i) => <p key={i}>{p}</p>)}
            </div>

            <SkillsPanel />
          </div>
        </Reveal>
      </section>

      <CvPreview open={cvOpen} onClose={closeCv} />
    </>
  );
}
