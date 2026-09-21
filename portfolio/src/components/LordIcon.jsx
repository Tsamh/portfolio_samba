import '../css/LordIcon.css';

/* Lordicon — Wired Lineal, free icons (https://lordicon.com/icons/wired/lineal).
   Every SVG dropped in src/assets/icons/ is available by its file name. */
const SOURCES = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/icons/*.svg', { eager: true, import: 'default' })
  ).map(([path, url]) => [path.split('/').pop().replace('.svg', ''), url])
);

/**
 * Lordicon SVG in its original Wired Lineal colours.
 * Rendered as an <img>, not inline: the icons draw parts of themselves with
 * masks and filters that browsers only composite correctly in an image
 * context (inlined, the GitHub cat disappears).
 * @param {string} name  - file name in src/assets/icons (without .svg)
 * @param {number} size  - px
 * @param {string} className
 */
export default function LordIcon({ name, size = 28, className = '' }) {
  return (
    <span className={`lord-icon ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <img src={SOURCES[name]} alt="" width={size} height={size} draggable={false} />
    </span>
  );
}
