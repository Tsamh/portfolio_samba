import ActivityRow from '../components/ActivityRow';
import ComingSoon from '../components/ComingSoon';
import ACTIVITIES from '../content/extra';
import '../css/pages.css';

/* ACTIVITIES is empty in the published build — vite.config.js swaps the
   content module for a stub — and the page falls back to the placeholder. */
export default function Extra() {
  return (
    <>
      <div className="hero-section hero-social">
        <h1 className="title">Extra</h1>
        <p className="subtitle">Community, events &amp; giving back</p>
      </div>

      {ACTIVITIES.length === 0 && (
        <ComingSoon note="The photos and the stories behind them are still being sorted out." />
      )}

      {ACTIVITIES.map((a, i) => (
        <section key={a.title} className={`content-section${i % 2 === 0 ? ' alt' : ''}`}>
          <ActivityRow {...a} reverse={i % 2 === 1} />
        </section>
      ))}
    </>
  );
}
