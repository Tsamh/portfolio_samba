import ActivityRow from '../components/ActivityRow';
import ACTIVITIES from '../content/experience';
import '../css/pages.css';

export default function Experience() {
  return (
    <>
      <div className="hero-section hero-social">
        <h1 className="title">Experience</h1>
        <p className="subtitle">Community, events &amp; giving back</p>
      </div>

      {ACTIVITIES.map((a, i) => (
        <section key={a.title} className={`content-section${i % 2 === 0 ? ' alt' : ''}`}>
          <ActivityRow {...a} reverse={i % 2 === 1} />
        </section>
      ))}
    </>
  );
}
