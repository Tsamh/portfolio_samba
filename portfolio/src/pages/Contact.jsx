import { useEffect, useRef } from 'react';
import Reveal from '../components/Reveal';
import LordIcon from '../components/LordIcon';
import { EMAIL, SOCIALS } from '../lib/links';
import '../css/pages.css';

const META = [
  { label: 'Location',  value: 'Dakar, Sénégal' },
  { label: 'Timezone',  value: 'GMT (UTC+0)' },
  { label: 'Response',  value: '< 24 hours' },
  { label: 'Languages', value: 'FR / EN' },
];

export default function Contact() {
  const voidRef = useRef(null);

  /* Entering the black void (60% visible) smoothly opens the outro —
     no need to fight the scroll to reach the exact bottom, which is
     especially tedious with a thumb. */
  useEffect(() => {
    const el = voidRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const pageActive = el.closest('.page')?.classList.contains('active');
        if (pageActive && entry.intersectionRatio >= 0.6) {
          window.dispatchEvent(new Event('portfolio:outro'));
        }
      },
      { threshold: [0.6] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ── Big statement + CTA ── */}
      <section className="content-section alt">
        <Reveal from="left">
        <div className="contact-statement">
          <h2>
            Have a project in mind?<br />
            Let's make it <span className="accent">intelligent</span>.
          </h2>
          <p>
            AI systems, data platforms, cloud infrastructure or fullstack apps:
            whether you have a precise brief or just an idea, my inbox is open.
          </p>
          <div className="contact-cta-row">
            <a href={`mailto:${EMAIL}`} className="contact-cta-btn">
              Say hello
            </a>
            <span className="availability">
              <span className="availability-text">
                Available for freelance &amp; full-time opportunities
              </span>
            </span>
          </div>
        </div>
        </Reveal>
      </section>

      {/* ── Channels + practical info ── */}
      <section className="content-section">
        <Reveal from="right">
        <div className="contact-main">

          <div className="contact-links">
            {SOCIALS.map(({ icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                className="contact-link-card"
                {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className="contact-link-icon">
                  <LordIcon name={icon} size={40} />
                </span>
                <span>
                  <span className="contact-link-label">{label}</span>
                  <span className="contact-link-value">{value}</span>
                </span>
              </a>
            ))}
          </div>

          <div className="contact-meta">
            {META.map(({ label, value }) => (
              <div key={label} className="contact-meta-item">
                <span className="contact-meta-label">{label}</span>
                <span className="contact-meta-value">{value}</span>
              </div>
            ))}
            <p className="contact-meta-note">
              Based in Dakar, working globally. Open to remote, on-site and
              hybrid setups.
            </p>
          </div>
        </div>
        </Reveal>
      </section>

      {/* ── Giant closing CTA (classic portfolio footer) ── */}
      <section className="content-section alt">
        <Reveal from="left">
          <a href={`mailto:${EMAIL}`} className="big-cta">
            <span className="big-cta-hint">Don't be a stranger</span>
            <span className="big-cta-text">Let's work together</span>
          </a>
        </Reveal>
      </section>

      {/* ── Black void before leaving the head (outro) ── */}
      <section className="void-section" ref={voidRef}>
        <span className="void-hint">Keep scrolling to leave my head</span>
      </section>
    </>
  );
}
