import TypingText from '../components/TypingText';
import Reveal from '../components/Reveal';
import AvatarScene from '../components/AvatarScene';
import '../css/pages.css';

/* The former About page is now the site's Home. */

const ROLES = ['IA Engineer', 'Data Engineer', 'MLOps', 'DevOps', 'Fullstack Dev'];

const SKILLS = [
  'Python / TensorFlow / PyTorch',
  'LLMs / RAG / LangChain',
  'SQL / Spark / Kafka / Airflow',
  'Docker / Kubernetes / CI-CD',
  'AWS / Terraform / Linux',
  'React / Node.js / TypeScript',
];

const TIMELINE = [
  { year: '2025–now',  role: 'AI Engineer',         place: 'Building LLM & vision systems' },
  { year: '2024–2025', role: 'Data Engineer',        place: 'Pipelines, lakes & streaming' },
  { year: '2023–2024', role: 'DevOps Engineer',      place: 'Cloud infra & automation' },
  { year: '2022–2023', role: 'Fullstack Developer',  place: 'Web apps end to end' },
];

const SOCIALS = ['GitHub', 'LinkedIn', 'Kaggle'];

export default function Home() {
  return (
    <>
      <div className="hero-section hero-about">
        <h1 className="title">
          <TypingText words={ROLES} />
        </h1>
        <p className="subtitle">From data to deployment</p>
      </div>

      <section className="content-section alt">
        <Reveal from="left">
          <div className="about-grid">
            <div className="about-text">
              <h2>Hello.</h2>
              <p>
                I'm an engineer who lives across the whole stack of intelligence:
                I design and train models, build the data pipelines that feed them,
                automate the infrastructure they run on, and ship the web apps
                people use to interact with them.
              </p>
              <p>
                Based in Dakar, working globally. Available for freelance,
                full-time, and collaborations that push what machines can do.
              </p>
            </div>

            <div className="skills-list">
              <h3>Skills</h3>
              <ul>
                {SKILLS.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="content-section">
        <Reveal from="right">
          <div className="content-block centered">
            <h2>Experience</h2>
            <div className="timeline">
              {TIMELINE.map(({ year, role, place }) => (
                <div key={year} className="timeline-item">
                  <span className="timeline-year">{year}</span>
                  <div><strong>{role}</strong> — {place}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="content-section alt">
        <Reveal from="left">
          <AvatarScene variant="home" />
        </Reveal>
      </section>

      <section className="content-section">
        <Reveal from="right">
          <div className="contact-block">
            <h2>Get in touch</h2>
            <p>tsambahama@gmail.com</p>
            <div className="social-links">
              {SOCIALS.map((s) => <span key={s}>{s}</span>)}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
