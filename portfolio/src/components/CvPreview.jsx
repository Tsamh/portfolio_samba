import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import LordIcon from './LordIcon';
import { DEFAULT_KIND, KINDS, cvDocument } from '../lib/cv';
import { useBackClose } from '../hooks/useBackClose';
import { useLang } from '../i18n';
import '../css/CvPreview.css';

/**
 * Renders every page of the CV into canvases with pdf.js, so the preview
 * looks the same on every browser (phones do not display PDFs in iframes).
 * pdf.js is only downloaded when the preview is opened.
 */
async function renderPdf(url, container, isCancelled) {
  const pdfjs = await import('pdfjs-dist');
  const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const doc = await pdfjs.getDocument(url).promise;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);

  for (let n = 1; n <= doc.numPages; n++) {
    if (isCancelled()) return;
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const scale = (Math.min(container.clientWidth, 820) / base.width) * ratio;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.className = 'cv-page';
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    if (isCancelled()) return;
    container.appendChild(canvas);
  }
}

/**
 * "See CV" modal: preview first, download from inside the preview.
 * Opens on the document in the site's language (ATS resume in English,
 * designed CV in French); the button left of Download switches between the
 * two.
 * @param {boolean}  open
 * @param {function} onClose
 */
export default function CvPreview({ open, onClose }) {
  const { lang, t } = useLang();
  const pagesRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [kind, setKind] = useState(DEFAULT_KIND);      // resume | cv

  const doc = cvDocument(kind);
  const other = KINDS.find((k) => k.id !== kind);

  /* every time the modal opens, the document written in the site's
     language: the ATS resume is in English, the designed CV in French */
  useEffect(() => {
    if (!open) return;
    setKind(lang === 'fr' ? 'cv' : DEFAULT_KIND);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const container = pagesRef.current;
    container.replaceChildren();
    setStatus('loading');
    renderPdf(doc.url, container, () => cancelled)
      .then(() => !cancelled && setStatus('ready'))
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
      if (container) container.replaceChildren();
    };
  }, [open, doc.url]);

  useBackClose(open, onClose);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  /* portal: the Home page sits inside the 3D-transformed page container,
     which would otherwise trap this fixed overlay */
  return createPortal(
    <div
      className="cv-overlay"
      onClick={onClose}
      /* a portal still bubbles through the React tree: keep scrolling the
         preview from flipping the page underneath */
      onWheel={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <div
        className="cv-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t('cv.label')}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="cv-header">
          <div className="cv-actions">
            <button
              className="cv-btn"
              onClick={() => setKind(other.id)}
              type="button"
              title={t('cv.switchTo', { kind: t(`cv.kinds.${other.id}`) })}
            >
              {t(`cv.kinds.${other.id}`)}
            </button>
            <a className="cv-btn primary" href={doc.url} download={doc.filename}>
              <LordIcon name="arrows-down" size={22} />
              <span className="cv-btn-label">{t('cv.download')}</span>
            </a>
            <button className="cv-btn close" onClick={onClose} aria-label={t('cv.close')} type="button">
              ×
            </button>
          </div>
        </header>

        {/* clicking beside the pages closes the preview, like the backdrop */}
        <div
          className="cv-scroll"
          onClick={(e) => { if (!e.target.closest('.cv-page')) onClose(); }}
        >
          {status === 'loading' && <p className="cv-status">{t('cv.loading')}</p>}
          {status === 'error' && <p className="cv-status">{t('cv.error')}</p>}
          <div ref={pagesRef} className="cv-pages" />
        </div>
      </div>
    </div>,
    document.body
  );
}
