import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BADGES, CERTIFICATES } from '../lib/certificates';
import LordIcon from './LordIcon';
import { useBackClose } from '../hooks/useBackClose';
import '../css/Certificates.css';

/** Certificates and attestations, with a lightbox on the paper itself. */
/* badges first, then attestations: one list for the lightbox to walk */
const ALL = [...BADGES, ...CERTIFICATES];

export default function Certificates() {
  const [open, setOpen] = useState(-1);
  const close = useCallback(() => setOpen(-1), []);
  const shown = ALL[open];

  useBackClose(open >= 0, close);

  useEffect(() => {
    if (open < 0) return;
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <section className="certs">
      <header className="certs-head">
        <h2 className="certs-title">Certificates &amp; attestations</h2>
        <p className="certs-sub">Training badges and the paper trail: what I was trained on, ran or entered.</p>
      </header>

      {/* AWS training badges, in the shape Credly shows them */}
      <ul className="certs-badges">
        {BADGES.map((b, i) => (
          <li key={b.slug}>
            {/* the card itself enlarges the badge; the corner button is the
                only thing that leaves for Credly */}
            <button className="badge-card" type="button" onClick={() => setOpen(i)}>
              <span className="badge-media">
                <img src={b.image} alt="" loading="lazy" draggable={false} />
              </span>
              <strong className="badge-name">{b.title}</strong>
              <span className="badge-issuer">{b.issuer}</span>
              <span className="badge-date">{b.date}</span>
            </button>
            <a
              className="card-link"
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${b.title} on Credly`}
              title="Open on Credly"
            >
              <LordIcon name="link" size={22} />
            </a>
          </li>
        ))}
      </ul>

      <h3 className="certs-subtitle">Attestations</h3>

      <ul className="certs-grid">
        {CERTIFICATES.map((c, i) => (
          <li key={c.slug}>
            <button className="cert-card" type="button" onClick={() => setOpen(BADGES.length + i)}>
              <span className="cert-media">
                <img src={c.image} alt="" loading="lazy" draggable={false} />
              </span>
              <span className="cert-body">
                <strong className="cert-name">{c.title}</strong>
                <span className="cert-meta">{c.issuer} · {c.date}</span>
                <span className="cert-note">{c.note}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {shown && createPortal(
        <div
          className="cert-lightbox"
          onClick={close}
          onWheel={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={shown.title}
        >
          <button className="cert-lightbox-close" onClick={close} aria-label="Close" type="button">×</button>
          <figure className="cert-figure" onClick={(e) => e.stopPropagation()}>
            <img src={shown.image} alt={shown.title} draggable={false} />
            <figcaption>
              <strong>{shown.title}</strong>
              <span>{shown.issuer} · {shown.date}</span>
            </figcaption>
          </figure>
        </div>,
        document.body
      )}
    </section>
  );
}
