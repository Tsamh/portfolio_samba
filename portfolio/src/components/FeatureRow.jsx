import { motion } from 'motion/react';
import '../css/pages.css';

/**
 * Image + text row used on Social & Fun pages.
 * Slides in from the left (even rows) or the right (odd rows)
 * when scrolled into view.
 *
 * @param {string}   title
 * @param {string}   img
 * @param {string[]} paragraphs
 * @param {boolean}  reverse - image on the right + slide from the right
 */
export default function FeatureRow({ title, img, paragraphs, reverse = false }) {
  const fromX = reverse ? 90 : -90;

  return (
    <motion.div
      className={`feature-row${reverse ? ' reverse' : ''}`}
      initial={{ opacity: 0, x: fromX }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="feature-img">
        <img src={img} alt={title} loading="lazy" />
      </div>
      <div className="feature-text">
        <h2>{title}</h2>
        {paragraphs.map((p) => <p key={p}>{p}</p>)}
      </div>
    </motion.div>
  );
}
