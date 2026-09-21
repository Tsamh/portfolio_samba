import { useCallback, useEffect, useRef, useState } from 'react';
import ProjectModal from '../components/ProjectModal';
import Certificates from '../components/Certificates';
import { DOMAINS, PROJECTS } from '../lib/projects';
import '../css/Projects.css';

/* Layout inspired by anubi.io (refs in src/assets/ref/):
   right — the domains, the selected one in red with its keywords around it;
   left  — a small wordmark with the domain's projects orbiting around it.
   Clicking a project grows it into a details modal. */

const SPEED = 0.00012; // radians per ms — one lap every ~50 s

/** Hand-drawn stroke behind the wordmark, one per domain.
    Redrawn on every domain change. */
function Scribbles({ mark }) {
  return (
    <svg className="pj-scribbles" viewBox="0 0 400 300" aria-hidden="true">
      {/* Data: two green bars standing on each side of the word */}
      {mark === 'bars' && (
        <>
          <path className="s-green" d="M74 96c-6 34-6 70-2 106" />
          <path className="s-green" d="M328 92c5 36 4 72-1 108" />
        </>
      )}
      {/* Software: a yellow swirl on the right */}
      {mark === 'swirl' && (
        <path className="s-yellow" d="M300 70c10 40-6 90-40 120-20 18-42 10-30-8 12-16 46-10 70 6" />
      )}
      {/* AI: a red loop tightened around the I */}
      {mark === 'loop' && (
        <path className="s-red" d="M223 78c-12-2-20 30-20 70 0 32 7 50 17 49 10-1 16-23 16-59 0-33-5-58-14-60-6-1-11 6-14 16" />
      )}
    </svg>
  );
}

function Orbit({ domain, paused: frozen, onOpen }) {
  const boxRef = useRef(null);
  const cardRefs = useRef([]);
  const angle = useRef(0);
  const hovered = useRef(false);
  const frozenRef = useRef(frozen);
  frozenRef.current = frozen;

  const projects = domain.projects.map((slug) => PROJECTS[slug]);
  const count = useRef(projects.length);
  count.current = projects.length;

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf;
    let last = performance.now();

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 50);
      last = now;

      const box = boxRef.current;
      // pages stay mounted: only animate the one on screen
      if (!box || !box.closest('.page')?.classList.contains('active')) return;
      if (!hovered.current && !frozenRef.current && !reduced) angle.current += dt * SPEED;

      const rx = box.clientWidth * 0.42;
      const ry = box.clientHeight * 0.4;
      // refs of a previous, larger domain linger in the array: count, not length
      const n = count.current;

      cardRefs.current.slice(0, n).forEach((el, i) => {
        if (!el) return;
        const a = angle.current + (i / n) * Math.PI * 2 - Math.PI / 2;
        const depth = (Math.sin(a) + 1) / 2;          // 0 = back (top), 1 = front (bottom)
        const scale = 0.74 + depth * 0.36;
        el.style.transform =
          `translate(-50%, -50%) translate(${Math.cos(a) * rx}px, ${Math.sin(a) * ry}px) scale(${scale})`;
        el.style.zIndex = String(10 + Math.round(depth * 10));
      });
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [domain.id]);

  const hold = () => { hovered.current = true; };
  const release = () => { hovered.current = false; };

  return (
    <div ref={boxRef} className="pj-orbit">
      <div className="pj-mark" key={`mark-${domain.id}`}>
        <Scribbles mark={domain.mark} />
        <span className="pj-word">{domain.word}</span>
        <span className="pj-caption">{domain.caption}</span>
      </div>

      {projects.map((p, i) => (
        <button
          key={`${domain.id}-${p.slug}`}
          ref={(el) => (cardRefs.current[i] = el)}
          className="pj-card"
          type="button"
          data-project={p.slug}
          style={{ '--tilt': `${(i % 2 ? 1 : -1) * (3 + (i % 3) * 2)}deg`, '--delay': `${i * 60}ms` }}
          onMouseEnter={hold}
          onMouseLeave={release}
          onFocus={hold}
          onBlur={release}
          onClick={() => onOpen(p.slug)}
          aria-label={`${p.title}: ${p.summary} Open details`}
        >
          <span className="pj-card-inner">
            <img src={p.image} alt="" loading="lazy" draggable={false} />
          </span>
          <span className="pj-card-caption" aria-hidden="true">
            <strong>{p.title}</strong>
            <span className="pj-card-desc">{p.summary}</span>
            <span className="pj-card-more">Click for details</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export default function Projects() {
  const [active, setActive] = useState(DOMAINS[0].id);
  const [open, setOpen] = useState(null); // slug of the project in the modal
  const domain = DOMAINS.find((d) => d.id === active);

  /* the card the modal grows out of (and shrinks back into) */
  const getCardRect = useCallback(() => {
    const card = document.querySelector(`.pj-card[data-project="${open}"] .pj-card-inner img`);
    return card?.getBoundingClientRect() ?? null;
  }, [open]);

  const closeModal = useCallback(() => setOpen(null), []);

  return (
    <>
    <section className="pj">
      <header className="pj-head">
        <h1 className="pj-title">
          Selected <span className="pj-underline">projects</span>
        </h1>
        <p className="pj-sub">
          From raw data to shipped products. Pick a domain, then click a project for the details.
        </p>
      </header>

      <div className="pj-stage">
        <Orbit domain={domain} paused={open !== null} onOpen={setOpen} />

        <div className="pj-picker">
          <p className="pj-pick-hint">Pick a domain</p>

          <ul className="pj-domains" aria-label="Domains">
          {DOMAINS.map((d) => {
            const isActive = d.id === active;
            return (
              <li key={d.id} className={`pj-domain${isActive ? ' active' : ''}`}>
                <button
                  type="button"
                  onClick={() => setActive(d.id)}
                  aria-pressed={isActive}
                >
                  {d.label}
                </button>
                {isActive && (
                  <span className="pj-keywords" aria-hidden="true">
                    {d.keywords.map((k, i) => (
                      <span key={k} className={`pj-keyword k${i}`}>{k}</span>
                    ))}
                  </span>
                )}
              </li>
              );
            })}
          </ul>
        </div>
      </div>

      {open && (
        <ProjectModal
          key={open}
          project={PROJECTS[open]}
          getCardRect={getCardRect}
          onClosed={closeModal}
        />
      )}
    </section>

    <Certificates />
    </>
  );
}
