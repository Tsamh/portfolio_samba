import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import LordIcon from './LordIcon';
import { useBackClose } from '../hooks/useBackClose';
import '../css/ProjectModal.css';

const DURATION = 520;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * Transform that puts the modal's image exactly over the clicked card.
 * The card and the modal image share the same 4:3 ratio, so a single uniform
 * scale is enough and nothing gets stretched while it animates.
 */
function fromCard(panel, image, card) {
  const p = panel.getBoundingClientRect();
  const i = image.getBoundingClientRect();
  const s = card.width / i.width;
  const x = card.left - (p.left + (i.left - p.left) * s);
  const y = card.top - (p.top + (i.top - p.top) * s);
  return `translate(${x}px, ${y}px) scale(${s})`;
}

/**
 * Project details, grown out of the clicked card and shrunk back into it.
 * @param {object}   project
 * @param {function} getCardRect - current rect of the card (it may have moved)
 * @param {function} onClosed    - called once the closing animation is done
 */
export default function ProjectModal({ project, getCardRect, onClosed }) {
  const panelRef = useRef(null);
  const imageRef = useRef(null);
  const backdropRef = useRef(null);
  const closing = useRef(false);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const card = getCardRect();
    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    panel.animate(
      [
        { transform: fromCard(panel, imageRef.current, card), backgroundColor: 'transparent', boxShadow: 'none' },
        { transform: 'none' },
      ],
      { duration: DURATION, easing: EASE }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const panel = panelRef.current;
    const card = getCardRect();
    panel.classList.add('closing');
    backdropRef.current?.classList.add('closing');

    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onClosed();
      return;
    }
    const animation = panel.animate(
      [
        { transform: 'none' },
        { transform: fromCard(panel, imageRef.current, card), backgroundColor: 'transparent', boxShadow: 'none' },
      ],
      { duration: DURATION - 80, easing: 'cubic-bezier(0.55, 0, 0.3, 1)', fill: 'forwards' }
    );
    // a hidden tab pauses the animation timeline: never leave the modal stuck
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onClosed();
    };
    animation.onfinish = finish;
    setTimeout(finish, DURATION + 150);
  }, [getCardRect, onClosed]);

  useBackClose(true, close);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  const stop = (e) => e.stopPropagation();

  /* portal: the page sits in a 3D-transformed container that would trap a
     fixed element; wheel/touch must not reach the page navigation either */
  return createPortal(
    <div className="pm-root" onWheel={stop} onTouchStart={stop} onTouchEnd={stop}>
      <div ref={backdropRef} className="pm-backdrop" onClick={close} />

      <article
        ref={panelRef}
        className="pm-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-title"
      >
        <div className="pm-media">
          <img ref={imageRef} src={project.image} alt="" draggable={false} />
        </div>

        <div className="pm-body">
          <button className="pm-close" onClick={close} aria-label="Close" type="button">×</button>

          <h2 className="pm-title" id="pm-title">{project.title}</h2>
          <p className="pm-summary">{project.summary}</p>

          {project.details.map((d) => <p key={d} className="pm-text">{d}</p>)}

          <ul className="pm-stack">
            {project.stack.map((s) => <li key={s}>{s}</li>)}
          </ul>

          {(project.github || project.live) && (
            <div className="pm-links">
              {project.github && (
                <a className="pm-link" href={project.github} target="_blank" rel="noopener noreferrer">
                  <LordIcon name="logo-github" size={26} />
                  GitHub
                </a>
              )}
              {project.live && (
                <a className="pm-link primary" href={project.live} target="_blank" rel="noopener noreferrer">
                  <LordIcon name="link" size={26} />
                  Live site
                </a>
              )}
            </div>
          )}
        </div>
      </article>
    </div>,
    document.body
  );
}
