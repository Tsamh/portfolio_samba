import ProjectCarousel from '../components/ProjectCarousel';
import Reveal from '../components/Reveal';
import AvatarScene from '../components/AvatarScene';
import '../css/pages.css';

const PROJECTS = [
  {
    num: '01', year: '2025',
    title: 'RAG Knowledge Assistant',
    desc: 'LLM-powered assistant grounded on private documents — retrieval, reranking and guarded generation.',
    tags: ['Python', 'LangChain', 'FastAPI'],
  },
  {
    num: '02', year: '2025',
    title: 'Streaming Data Platform',
    desc: 'Real-time ETL pipeline ingesting millions of events per day with exactly-once guarantees.',
    tags: ['Kafka', 'Spark', 'Airflow'],
  },
  {
    num: '03', year: '2024',
    title: 'MLOps Delivery Pipeline',
    desc: 'Automated training, versioning and deployment of ML models on Kubernetes with full observability.',
    tags: ['Docker', 'Kubernetes', 'GitHub Actions'],
  },
  {
    num: '04', year: '2024',
    title: 'Analytics Dashboard',
    desc: 'Fullstack real-time analytics app — typed API, live charts and role-based access.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
  },
];

export default function Projects() {
  return (
    <>
      <div className="hero-section hero-project">
        <h1 className="title">Projects</h1>
        <p className="subtitle">AI, data &amp; engineering — selected works</p>
      </div>

      <section className="carousel-section">
        {/* side lanes: hover here to keep scrolling the page */}
        <div className="carousel-side" aria-hidden="true">
          <div className="scroll-lane">
            <span className="scroll-chevron" />
            <span className="scroll-chevron" />
          </div>
        </div>

        <ProjectCarousel projects={PROJECTS} title="Selected Works" />

        <div className="carousel-side" aria-hidden="true">
          <div className="scroll-lane">
            <span className="scroll-chevron" />
            <span className="scroll-chevron" />
          </div>
        </div>
      </section>

      {/* ── Simple section below the carousel ── */}
      <section className="content-section">
        <Reveal from="right">
          <div className="content-block centered">
            <h2>Behind the work</h2>
            <p>
              Every project above follows the same discipline: understand the
              data, design the pipeline, automate the delivery, and polish the
              interface. Surf the carousel to browse — or reach out if you want
              the full story behind any of them.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="content-section alt">
        <Reveal from="left">
          <AvatarScene variant="projects" />
        </Reveal>
      </section>
    </>
  );
}
