import { useEffect, useRef, useState } from 'react';
import LordIcon from '../components/LordIcon';
import { EMAIL, SOCIALS } from '../lib/links';
import { useLang } from '../i18n';
import '../css/pages.css';
import '../css/Contact.css';

/* The practical info (contact.meta), the topics the sentence form lets the
   visitor pick (contact.topics) and the marquee words live in i18n/. */

const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Dakar', hour: '2-digit', minute: '2-digit', second: '2-digit',
});

/** Local time in Dakar, ticking. */
function DakarTime() {
  const [now, setNow] = useState(() => clock.format(new Date()));
  useEffect(() => {
    const id = setInterval(() => setNow(clock.format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return <time className="ct-clock-time">{now}</time>;
}

/** Endless band of words; scrolling the page speeds it up and turns it
    the way the visitor scrolls. */
function Marquee() {
  const { t } = useLang();
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const scroller = track.closest('.page-scroll');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    let x = 0;
    let dir = -1;
    let boost = 0;
    let lastTop = scroller?.scrollTop ?? 0;
    let last = performance.now();
    let raf;

    const onScroll = () => {
      const top = scroller.scrollTop;
      const delta = top - lastTop;
      lastTop = top;
      if (delta) dir = delta > 0 ? -1 : 1;
      boost = Math.min(18, boost + Math.abs(delta) * 0.25);
    };
    scroller?.addEventListener('scroll', onScroll, { passive: true });

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 50) / 16.7;
      last = now;
      if (!track.closest('.page')?.classList.contains('active')) return;
      boost *= 0.92;
      x += dir * (0.6 + boost) * dt;
      const half = track.scrollWidth / 2;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px, 0, 0) skewX(${(-dir * boost * 0.4).toFixed(2)}deg)`;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      scroller?.removeEventListener('scroll', onScroll);
    };
  }, []);

  const words = t('contact.marquee');
  const run = [...words, ...words];
  return (
    <div className="ct-marquee" aria-hidden="true">
      <div ref={trackRef} className="ct-marquee-track">
        {[...run, ...run].map((w, i) => (
          <span key={i} className={`ct-marquee-item${i % 2 ? ' ghost' : ''}`}>
            {w}<span className="ct-marquee-star">✺</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Inline text field as wide as what is typed in it (or its placeholder):
    an invisible copy of the text sets the width. */
function Field({ value, onChange, placeholder, label, ...rest }) {
  return (
    <span className="ct-field-wrap">
      <span className="ct-field-size" aria-hidden="true">{value || placeholder}</span>
      <input
        className="ct-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        {...rest}
      />
    </span>
  );
}

/** "Hi Samba, my name is …": a sentence to fill in, sent through the
    visitor's own mail app — nothing goes through a server. */
function SentenceForm() {
  const { lang, t } = useLang();
  const topics = t('contact.topics');
  const [name, setName] = useState('');
  // index in the topics, so the choice survives a language switch;
  // null: the custom bubble
  const [topic, setTopic] = useState(0);
  const [custom, setCustom] = useState('');
  const [reply, setReply] = useState('');

  const send = (e) => {
    e.preventDefault();
    const who = name.trim() || t('contact.mail.someone');
    // the custom bubble becomes the email subject as it is typed
    const own = topic === null && custom.trim();
    const about = topic === null ? (own || t('contact.mail.other')) : topics[topic];
    const subject = own || t('contact.mail.subject', { about });
    const body =
      t('contact.mail.body', { who, about }) +
      (reply.trim() ? t('contact.mail.reply', { reply: reply.trim() }) : '');
    window.location.href =
      `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };


  return (
    /* in French the topics finish the sentence ("j'aimerais vous parler
       d'un système d'IA"), so they follow it on the same line */
    <form className={`ct-form${lang === 'fr' ? ' ct-form-inline' : ''}`} onSubmit={send}>
      <p className="ct-form-line">
        {t('contact.form.hi')}{' '}
        <Field value={name} onChange={setName} placeholder={t('contact.form.name')} label={t('contact.form.nameLabel')} autoComplete="name" />{' '}
        {t('contact.form.talk')}
      </p>
      <div className="ct-topics" role="radiogroup" aria-label={t('contact.form.topic')}>
        {topics.map((label, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={topic === i}
            className={`ct-topic${topic === i ? ' on' : ''}`}
            onClick={() => setTopic(i)}
          >
            {label}
          </button>
        ))}
        <label className={`ct-topic ct-topic-custom${topic === null ? ' on' : ''}`}>
          <span className="ct-field-size" aria-hidden="true">{custom || t('contact.form.own')}</span>
          <input
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setTopic(null); }}
            onFocus={() => setTopic(null)}
            placeholder={t('contact.form.own')}
            aria-label={t('contact.form.ownLabel')}
            maxLength={80}
          />
        </label>
      </div>
      <p className="ct-form-line">
        {t('contact.form.reach')}{' '}
        <Field value={reply} onChange={setReply} placeholder={t('contact.form.email')} label={t('contact.form.emailLabel')} autoComplete="email" type="email" />
        .
      </p>
      <button className="ct-send" type="submit">
        <span className="ct-roll" data-text={t('contact.form.send')}><span>{t('contact.form.send')}</span></span>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
             strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 19L19 5M9 5h10v10" />
        </svg>
      </button>
    </form>
  );
}

export default function Contact() {
  const { t } = useLang();
  const rootRef = useRef(null);
  const voidRef = useRef(null);

  /* Reaching the last screen of the black void (60% of it visible)
     smoothly opens the outro — no need to fight the scroll to reach the
     exact bottom, which is especially tedious with a thumb. The void is
     much taller than the screen, so what is watched is a screen-high
     marker at its bottom, not the void itself. */
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

  /* Blocks play their entrance each time they come into view, and rewind
     when they leave, like the Reveal used on the other pages. */
  useEffect(() => {
    const blocks = rootRef.current.parentElement.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('in', e.isIntersecting)),
      { threshold: 0.2 }
    );
    blocks.forEach((b) => observer.observe(b));
    return () => observer.disconnect();
  }, []);

  const bigText = t('contact.big');

  return (
    <>
      {/* ── Big statement, then the channels straight away ── */}
      <section ref={rootRef} className="content-section alt ct-hero" data-reveal>
        <div className="ct-wrap">
          <h2 className="ct-title">
            <span className="ct-line">
              <span style={{ '--i': 0 }}>
                {t('contact.title.before')}{' '}
                <span className="accent ct-scribble">
                  {t('contact.title.word')}
                  <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M4 16c60-9 130-12 200-8 34 2 62 5 92 1" />
                  </svg>
                </span>{t('contact.title.after')}
              </span>
            </span>
          </h2>

          <p className="ct-lead">{t('contact.lead')}</p>

          <p className="ct-kicker">{t('contact.findMe')}</p>

          <div className="ct-rows">
            {SOCIALS.map(({ icon, label, value, href }, i) => (
              <a
                key={label}
                href={href}
                className="ct-row"
                style={{ '--i': i }}
                {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className="ct-row-icon"><LordIcon name={icon} size={34} /></span>
                <span className="ct-row-label">{label}</span>
                <span className="ct-row-value">{value}</span>
                <svg className="ct-row-arrow" viewBox="0 0 24 24" width="26" height="26" fill="none"
                     stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
                     strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 18L18 6M8 6h10v10" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Marquee />

      {/* ── Practical info, with the live clock ── */}
      <section className="content-section ct-info" data-reveal>
        <div className="ct-wrap">
          <div className="ct-eyebrow">
            <span>{t('contact.now')}</span>
            <span className="ct-clock"><DakarTime /></span>
          </div>

          <div className="ct-meta">
            {t('contact.meta').map(({ label, value }, i) => (
              <div key={i} className="ct-meta-item" style={{ '--i': i }}>
                <span className="ct-meta-label">{label}</span>
                <span className="ct-meta-value">{value}</span>
              </div>
            ))}
          </div>
          <p className="ct-meta-note">{t('contact.note')}</p>
        </div>
      </section>

      {/* ── Sentence form, sent from the visitor's mail app ── */}
      <section className="content-section alt ct-write" data-reveal>
        <div className="ct-wrap">
          <p className="ct-kicker">{t('contact.write')}</p>
          <SentenceForm />
        </div>
      </section>

      {/* ── Giant closing CTA (classic portfolio footer) ── */}
      <section className="content-section ct-end" data-reveal>
        <a href={`mailto:${EMAIL}`} className="ct-big">
          <span className="ct-big-hint">{t('contact.bigHint')}</span>
          <span className="ct-big-text" aria-label={bigText}>
            {bigText.split(' ').map((word, w, words) => {
              // letter index across the whole line, for the rolling delay
              const start = words.slice(0, w).join(' ').length + (w ? 1 : 0);
              return (
                <span key={w} className="ct-word" aria-hidden="true">
                  {word.split('').map((c, i) => (
                    <span key={i} className="ct-char" style={{ '--i': start + i }} data-c={c}>
                      <span>{c}</span>
                    </span>
                  ))}
                </span>
              );
            })}
          </span>
          <span className="ct-badge" aria-hidden="true">
            <svg viewBox="0 0 120 120" className="ct-badge-ring">
              <defs>
                <path id="ct-badge-path" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" />
              </defs>
              <text>
                <textPath href="#ct-badge-path" textLength="286" lengthAdjust="spacing">{t('contact.badge')}</textPath>
              </text>
            </svg>
            <svg viewBox="0 0 24 24" className="ct-badge-arrow" fill="none" stroke="currentColor"
                 strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 18L18 6M8 6h10v10" />
            </svg>
          </span>
        </a>
      </section>

      {/* ── Black void before leaving the head (outro) ── */}
      <section className="void-section" data-progress-end>
        <span className="void-trigger" ref={voidRef} aria-hidden="true" />
        <span className="void-hint">{t('contact.void')}</span>
      </section>
    </>
  );
}
