import ActivityRow from '../components/ActivityRow';
import FACTS from '../content/random';
import { localize, useLang } from '../i18n';
import '../css/pages.css';

export default function Random() {
  const { lang, t } = useLang();

  return (
    <>
      <div className="hero-section hero-fun">
        <h1 className="title">{t('random.title')}</h1>
        <p className="subtitle">{t('random.subtitle')}</p>
      </div>

      {/* keyed by slug, so a language switch never remounts a row */}
      {FACTS.map((f, i) => (
        <section key={f.slug} className={`content-section${i % 2 === 0 ? ' alt' : ''}`}>
          <ActivityRow {...localize(f, lang)} reverse={i % 2 === 1} />
        </section>
      ))}
    </>
  );
}
