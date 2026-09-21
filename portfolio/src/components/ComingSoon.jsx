import '../css/ComingSoon.css';

/**
 * Placeholder shown instead of a page's real content. The published build
 * turns it on (VITE_SOON=1) for the pages whose material is not online yet:
 * the photos stay out of the repository, the page keeps its place in the
 * navigation and says so.
 *
 * @param {string} note - one line about what is going to land here
 */
export default function ComingSoon({ note }) {
  return (
    <section className="content-section soon">
      <p className="soon-kicker">Coming soon</p>
      <span className="soon-dash" />
      <p className="soon-note">{note}</p>
    </section>
  );
}
