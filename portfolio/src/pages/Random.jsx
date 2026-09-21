import ActivityRow from '../components/ActivityRow';
import ComingSoon from '../components/ComingSoon';
import FACTS from '../content/random';
import '../css/pages.css';

/* FACTS is empty in the published build — vite.config.js swaps the content
   module for a stub — and the page falls back to the placeholder. */
export default function Random() {
  return (
    <>
      <div className="hero-section hero-fun">
        <h1 className="title">Random</h1>
        <p className="subtitle">Random things about me</p>
      </div>

      {FACTS.length === 0 && (
        <ComingSoon note="The shelves, the screens and the rest are being packed for the web." />
      )}

      {FACTS.map((f, i) => (
        <section key={f.title} className={`content-section${i % 2 === 0 ? ' alt' : ''}`}>
          <ActivityRow {...f} reverse={i % 2 === 1} />
        </section>
      ))}
    </>
  );
}
