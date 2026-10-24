import { useState, useEffect } from 'react';
import { EGG_TOTAL, foundEggs } from '../lib/eggs';
import { translate, useLang } from '../i18n';
import '../css/QuotesPanel.css';

/* The quotes themselves are `quotes` in i18n/: the English ones back up the
   quotable.io API, the French ones are the only source in French (the API
   only speaks English). */
const pick = (lang) => {
  const list = translate('quotes', null, lang);
  return list[Math.floor(Math.random() * list.length)];
};

async function fetchQuote(lang) {
  if (lang !== 'en') return pick(lang);
  try {
    const r = await fetch('https://api.quotable.io/quotes/random?tags=technology,knowledge,wisdom&limit=1', { signal: AbortSignal.timeout(3000) });
    if (!r.ok) throw new Error();
    const [data] = await r.json();
    return { text: data.content, author: data.author };
  } catch {
    return pick(lang);
  }
}

export default function QuotesPanel({ visible }) {
  const { lang, t } = useLang();
  const [quote,   setQuote]   = useState(() => t('quotes')[0]);
  const [fading,  setFading]  = useState(false);

  // a fresh quote when the panel opens or the language changes, then a new
  // one every 15 s
  useEffect(() => {
    if (!visible) return;

    let alive = true;
    fetchQuote(lang).then((q) => alive && setQuote(q));

    const interval = setInterval(async () => {
      setFading(true);
      await new Promise(r => setTimeout(r, 400));
      const q = await fetchQuote(lang);
      if (!alive) return;
      setQuote(q);
      setFading(false);
    }, 15000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [visible, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  /* easter egg counter, refreshed whenever one is found */
  const [found, setFound] = useState(foundEggs);

  useEffect(() => {
    const refresh = () => setFound(foundEggs());
    window.addEventListener('portfolio:egg', refresh);
    window.addEventListener('portfolio:eggs-reset', refresh);
    return () => {
      window.removeEventListener('portfolio:egg', refresh);
      window.removeEventListener('portfolio:eggs-reset', refresh);
    };
  }, []);

  useEffect(() => {
    if (visible) setFound(foundEggs());
  }, [visible]);

  return (
    <div className={`quotes-panel${visible ? ' visible' : ''}`}>
      <div className="quotes-eggs">
        <span className="quotes-eggs-count">
          {t('eggs.counter')} <strong>{found.length}/{EGG_TOTAL}</strong>
        </span>
        {/* only the ones already found are named */}
        {found.map((id) => (
          <span key={id} className="quotes-egg">{t(`eggs.names.${id}`)}</span>
        ))}
      </div>
      <div className="quotes-deco">{ '//' }</div>
      <blockquote className={`quotes-text${fading ? ' fade' : ''}`}>
        {t('quoteMarks.open')}{quote.text}{t('quoteMarks.close')}
      </blockquote>
      <cite className={`quotes-author${fading ? ' fade' : ''}`}>
        {quote.author}
      </cite>
    </div>
  );
}
