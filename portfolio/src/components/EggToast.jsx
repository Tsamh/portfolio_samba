import { useEffect, useState } from 'react';
import '../css/EggToast.css';

const VISIBLE_MS = 4000;

/** Flash notification shown when an easter egg is found. */
export default function EggToast() {
  const [egg, setEgg] = useState(null);   // { label, count, total }
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const onEgg = (e) => {
      setEgg(e.detail);
      setLeaving(false);
    };
    window.addEventListener('portfolio:egg', onEgg);
    return () => window.removeEventListener('portfolio:egg', onEgg);
  }, []);

  useEffect(() => {
    if (!egg) return;
    const out = setTimeout(() => setLeaving(true), VISIBLE_MS);
    const gone = setTimeout(() => setEgg(null), VISIBLE_MS + 400);
    return () => { clearTimeout(out); clearTimeout(gone); };
  }, [egg]);

  if (!egg) return null;

  return (
    <div className={`egg-toast${leaving ? ' leaving' : ''}`} role="status">
      <span className="egg-toast-count">{egg.count}/{egg.total}</span>
      <span className="egg-toast-text">
        <strong>Easter egg found</strong>
        <span className="egg-toast-label">{egg.label}</span>
      </span>
    </div>
  );
}
