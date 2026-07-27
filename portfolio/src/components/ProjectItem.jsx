import '../css/ProjectItem.css';

/**
 * Single project row in the Projects page.
 * @param {string}   num   - e.g. "01"
 * @param {string}   year
 * @param {string}   title
 * @param {string}   desc
 * @param {string[]} tags
 */
export default function ProjectItem({ num, year, title, desc, tags }) {
  return (
    <div className="project-item">
      <div className="project-meta">
        <span>{num}</span>
        <span>{year}</span>
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <div className="tags">
        {tags.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}
