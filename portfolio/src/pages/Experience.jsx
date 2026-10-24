import ActivityRow from '../components/ActivityRow';
import ACTIVITIES from '../content/experience';
import { localize, useLang } from '../i18n';
import '../css/pages.css';

export default function Experience() {
  const { lang, t } = useLang();

  return (
    <>
      <div className="hero-section hero-social">
        <h1 className="title">{t('experience.title')}</h1>
        <p className="subtitle">{t('experience.subtitle')}</p>
      </div>

      {/* keyed by slug: a language switch rewrites the rows, never remounts
          them (their entrance animation would play again) */}
      {ACTIVITIES.map((a, i) => (
        <section key={a.slug} className={`content-section${i % 2 === 0 ? ' alt' : ''}`}>
          <ActivityRow {...localize(a, lang)} reverse={i % 2 === 1} />
        </section>
      ))}
    </>
  );
}
