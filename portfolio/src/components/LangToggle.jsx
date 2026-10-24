import { useLang } from '../i18n';
import '../css/ThemeToggle.css';

/**
 * EN / FR switch, twin of the theme toggle: same ring, and the two codes
 * swap with the same spin as the sun and the moon.
 */
export default function LangToggle() {
  const { lang, toggle, t } = useLang();

  return (
    <button
      className="theme-toggle lang-toggle"
      onClick={toggle}
      aria-label={t('lang.toggle')}
      title={t('lang.switchTo')}
      type="button"
    >
      <span className={`theme-icon${lang === 'en' ? ' visible' : ''}`} lang="en">EN</span>
      <span className={`theme-icon${lang === 'fr' ? ' visible' : ''}`} lang="fr">FR</span>
    </button>
  );
}
