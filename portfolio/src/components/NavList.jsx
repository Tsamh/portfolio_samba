import { useLang } from '../i18n';
import '../css/NavList.css';

/* `extra` is dropped on narrow screens, where the full label would run
   over the tilted page */
const LABELS = ['home', 'projects', 'experience', 'random', 'contact'];

/**
 * Side navigation list shown when the menu is open.
 * @param {boolean}  show            - visibility state
 * @param {number}   active          - index of the current page (shown in red)
 * @param {function} onSelect(index) - called when a link is clicked
 */
export default function NavList({ show, active, onSelect }) {
  const { t } = useLang();

  return (
    <ul className={`nav-list${show ? ' show' : ''}`}>
      {LABELS.map((id, i) => {
        const { label, extra } = t(`nav.${id}`);
        return (
          <li
            key={id}
            className={`nav-link${i === active ? ' active' : ''}`}
            aria-current={i === active ? 'page' : undefined}
            onClick={() => onSelect(i)}
          >
            {label}
            {extra && <span className="nav-extra">{extra}</span>}
          </li>
        );
      })}
    </ul>
  );
}
