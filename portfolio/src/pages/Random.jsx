import ActivityRow from '../components/ActivityRow';
import FACTS from '../content/random';
import '../css/pages.css';

export default function Random() {
  return (
    <>
      <div className="hero-section hero-fun">
        <h1 className="title">Random</h1>
        <p className="subtitle">Random things about me</p>
      </div>

      {FACTS.map((f, i) => (
        <section key={f.title} className={`content-section${i % 2 === 0 ? ' alt' : ''}`}>
          <ActivityRow {...f} reverse={i % 2 === 1} />
        </section>
      ))}
    </>
  );
}
