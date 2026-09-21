/**
 * Automatic image loading for the Extra and Random activity pages.
 *
 * One folder per activity: src/assets/extra/<slug>/ or
 * src/assets/random/<slug>/. Every photo inside is picked up automatically,
 * no code change needed; files loose at the root of extra/ or random/ are
 * ignored.
 * - the folder name is the activity slug (separators ignored, so
 *   "graduation_25" and "graduation25" are the same activity)
 * - a folder with no matching definition creates a new activity row
 *   (title generated from the folder name, placeholder description)
 * - galleries shorter than 5 photos are completed with the definition's
 *   `stock` photos, then with neutral placeholders
 */

/** free Unsplash photo by its image id ("1597914377769-db5167cb0221") */
export const unsplash = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

/** placeholders used to reach the 5-photo minimum */
export const pad = (slug, n) =>
  Array.from(
    { length: Math.max(0, n) },
    (_, i) => `https://picsum.photos/seed/${slug}-${i + 1}/900/600`
  );

/** normalize a slug: separators are ignored, so "graduation25_1.jpg"
    and "graduation_25_2.jpg" land in the SAME group ("graduation25") */
export const normalize = (s) => s.replace(/[_-]+/g, '').toLowerCase();

/** group a Vite import.meta.glob result (…/<folder>/<file>) by folder name */
export function loadGroups(glob) {
  const groups = {};
  Object.entries(glob)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([path, src]) => {
      const parts = path.split('/');
      const slug = normalize(parts[parts.length - 2]);
      (groups[slug] = groups[slug] || []).push(src);
    });
  return groups;
}

/**
 * Merge activity definitions with the local image groups.
 * @param {Array}  defs   - [{ slug, aliases?: string[], title, desc, stock?: string[] }]
 *                          aliases: other folder names that belong to this activity
 * @param {Object} groups - result of loadGroups()
 */
export function withImages(defs, groups) {
  const used = new Set();

  const list = defs.map((d) => {
    const keys = [d.slug, ...(d.aliases || [])].map(normalize);
    keys.forEach((k) => used.add(k));
    const local = keys.flatMap((k) => groups[k] || []);
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
      desc: ['Fresh photos just landed in the folder, story coming soon.'],
      images: [...imgs, ...pad(slug, 5 - imgs.length)],
    });
  });

  return list;
}
