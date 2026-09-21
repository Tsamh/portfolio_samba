import '../css/NavList.css';

/* `extra` is dropped on narrow screens, where the full label would run
   over the tilted page */
const LABELS = [
  { label: 'Home' },
  { label: 'Projects', extra: ' & Certificates' },
  { label: 'Extra' },
  { label: 'Random' },
  { label: 'Contact' },
];

/**
 * Side navigation list shown when the menu is open.
 * @param {boolean}  show            - visibility state
 * @param {number}   active          - index of the current page (shown in red)
 * @param {function} onSelect(index) - called when a link is clicked
 */
export default function NavList({ show, active, onSelect }) {
  return (
    <ul className={`nav-list${show ? ' show' : ''}`}>
      {LABELS.map(({ label, extra }, i) => (
        <li
          key={label}
          className={`nav-link${i === active ? ' active' : ''}`}
          aria-current={i === active ? 'page' : undefined}
          onClick={() => onSelect(i)}
        >
          {label}
          {extra && <span className="nav-extra">{extra}</span>}
        </li>
      ))}
    </ul>
  );
}
