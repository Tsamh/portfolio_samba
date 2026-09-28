import { useEffect, useRef, useState } from 'react';
import LordIcon from '../components/LordIcon';
import { EMAIL, SOCIALS } from '../lib/links';
import '../css/pages.css';
import '../css/Contact.css';

const META = [
  { label: 'Location',  value: 'Dakar, Sénégal' },
  { label: 'Timezone',  value: 'GMT (UTC+0)' },
  { label: 'Response',  value: '< 24 hours' },
  { label: 'Languages', value: 'FR / EN' },
];

/* what the sentence form lets the visitor pick, straight from the intro */
const TOPICS = ['an AI system', 'a data platform', 'cloud infrastructure', 'a fullstack app', 'just an idea'];

const MARQUEE = ["Let's make it happen", 'Say hello', "Don't be a stranger"];

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

  const run = [...MARQUEE, ...MARQUEE];
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
  const [name, setName] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);   // null: the custom bubble
  const [custom, setCustom] = useState('');
  const [reply, setReply] = useState('');

  const send = (e) => {
    e.preventDefault();
    const who = name.trim() || 'someone';
    // the custom bubble becomes the email subject as it is typed
    const own = topic === null && custom.trim();
    const about = topic ?? (own || 'something else');
    const subject = own || `Project: ${about}`;
    const body =
      `Hi Samba,\n\nMy name is ${who} and I'd like to talk about ${about}.\n` +
      (reply.trim() ? `You can reach me at ${reply.trim()}.\n` : '');
    window.location.href =
      `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };


  return (
    <form className="ct-form" onSubmit={send}>
      <p className="ct-form-line">
        Hi Samba, my name is{' '}
        <Field value={name} onChange={setName} placeholder="your name" label="Your name" autoComplete="name" />{' '}
        and I'd like to talk about
      </p>
      <div className="ct-topics" role="radiogroup" aria-label="Topic">
        {TOPICS.map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={topic === t}
            className={`ct-topic${topic === t ? ' on' : ''}`}
            onClick={() => setTopic(t)}
          >
            {t}
          </button>
        ))}
        <label className={`ct-topic ct-topic-custom${topic === null ? ' on' : ''}`}>
          <span className="ct-field-size" aria-hidden="true">{custom || 'your own subject…'}</span>
          <input
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setTopic(null); }}
            onFocus={() => setTopic(null)}
            placeholder="your own subject…"
            aria-label="Your own subject"
            maxLength={80}
          />
        </label>
      </div>
      <p className="ct-form-line">
        You can reach me at{' '}
        <Field value={reply} onChange={setReply} placeholder="your email" label="Your email" autoComplete="email" type="email" />
        .
      </p>
      <button className="ct-send" type="submit">
        <span className="ct-roll" data-text="Send it"><span>Send it</span></span>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
             strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 19L19 5M9 5h10v10" />
        </svg>
      </button>
    </form>
  );
}

export default function Contact() {
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

  const bigText = "Let's work together";

  return (
    <>
      {/* ── Big statement, then the channels straight away ── */}
      <section ref={rootRef} className="content-section alt ct-hero" data-reveal>
        <div className="ct-wrap">
          <h2 className="ct-title">
            <span className="ct-line">
              <span style={{ '--i': 0 }}>
                Let's make your project{' '}
                <span className="accent ct-scribble">
                  intelligent
                  <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M4 16c60-9 130-12 200-8 34 2 62 5 92 1" />
                  </svg>
                </span>!
              </span>
            </span>
          </h2>

          <p className="ct-lead">
            AI systems, data platforms, cloud infrastructure or fullstack apps:
            whether you have a precise brief or just an idea, my inbox is open.
          </p>

          <p className="ct-kicker">Find me on</p>

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
            <span>Right now in Dakar</span>
            <span className="ct-clock"><DakarTime /></span>
          </div>

          <div className="ct-meta">
            {META.map(({ label, value }, i) => (
              <div key={label} className="ct-meta-item" style={{ '--i': i }}>
                <span className="ct-meta-label">{label}</span>
                <span className="ct-meta-value">{value}</span>
              </div>
            ))}
          </div>
          <p className="ct-meta-note">
            Based in Dakar, working globally. Open to remote, on-site and
            hybrid setups.
          </p>
        </div>
      </section>

      {/* ── Sentence form, sent from the visitor's mail app ── */}
      <section className="content-section alt ct-write" data-reveal>
        <div className="ct-wrap">
          <p className="ct-kicker">Or write it here</p>
          <SentenceForm />
        </div>
      </section>

      {/* ── Giant closing CTA (classic portfolio footer) ── */}
      <section className="content-section ct-end" data-reveal>
        <a href={`mailto:${EMAIL}`} className="ct-big">
          <span className="ct-big-hint">Don't be a stranger</span>
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
                <textPath href="#ct-badge-path" textLength="286" lengthAdjust="spacing">SAY HELLO ✺ SAY HELLO ✺ SAY HELLO ✺ </textPath>
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
        <span className="void-hint">Keep scrolling to leave my head</span>
      </section>
    </>
  );
}
