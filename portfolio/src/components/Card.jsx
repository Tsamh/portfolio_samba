import '../css/Card.css';

/**
 * Small preview card used on the Home page.
 * @param {string} year
 * @param {string} title
 * @param {string} desc
 */
export default function Card({ year, title, desc }) {
  return (
    <div className="card">
      <span className="card-tag">{year}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}
