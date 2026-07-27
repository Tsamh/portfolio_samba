import '../css/NavList.css';

const LABELS = ['Home', 'Projects', 'Extra', 'Random', 'Contact'];

/**
 * Side navigation list shown when the menu is open.
 * @param {boolean}  show            - visibility state
 * @param {function} onSelect(index) - called when a link is clicked
 */
export default function NavList({ show, onSelect }) {
  return (
    <ul className={`nav-list${show ? ' show' : ''}`}>
      {LABELS.map((label, i) => (
        <li
          key={label}
          className="nav-link"
          onClick={() => onSelect(i)}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
