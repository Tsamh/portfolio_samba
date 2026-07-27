/**
 * Automatic image loading for the Extra and Random activity pages.
 *
 * Drop photos in src/assets/extra/ or src/assets/random/ — they are
 * picked up automatically, no code change needed:
 * - files sharing a prefix belong to the same activity
 *   (indabax_1.jpg, indabax_2.jpg → activity slug "indabax")
 * - a brand new prefix creates a new activity row automatically
 *   (title generated from the file name, placeholder description)
 * - every gallery is padded to at least 5 photos with placeholders
 */

/** placeholders used to reach the 5-photo minimum */
export const pad = (slug, n) =>
  Array.from(
    { length: Math.max(0, n) },
    (_, i) => `https://picsum.photos/seed/${slug}-${i + 1}/900/600`
  );

/** normalize a slug: separators are ignored, so "graduation25_1.jpg"
    and "graduation_25_2.jpg" land in the SAME group ("graduation25") */
export const normalize = (s) => s.replace(/[_-]+/g, '').toLowerCase();

/** group a Vite import.meta.glob result by filename prefix */
export function loadGroups(glob) {
  const groups = {};
  Object.entries(glob)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([path, src]) => {
      const name = path.split('/').pop().replace(/\.[^.]+$/, '');
      const slug = normalize(name.replace(/[_-]?\d+$/, ''));
      (groups[slug] = groups[slug] || []).push(src);
    });
  return groups;
}

/**
 * Merge activity definitions with the local image groups.
 * @param {Array}  defs   - [{ slug, title, desc, stock?: string[] }]
 * @param {Object} groups - result of loadGroups()
 */
export function withImages(defs, groups) {
  const used = new Set();

  const list = defs.map((d) => {
    const key = normalize(d.slug);
    used.add(key);
    const local = groups[key] || [];
    const stock = d.stock || [];
    const images = [...local, ...stock];
    return { ...d, images: [...images, ...pad(d.slug, 5 - images.length)] };
  });

  /* new prefixes found in the folder → automatic activity rows */
  Object.entries(groups).forEach(([slug, imgs]) => {
    if (used.has(slug)) return;
    list.push({
      slug,
      title: slug
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      desc: ['Fresh photos just landed in the folder — story coming soon.'],
      images: [...imgs, ...pad(slug, 5 - imgs.length)],
    });
  });

  return list;
}
