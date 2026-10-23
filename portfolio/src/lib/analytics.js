/* Visit tracking with GoatCounter (https://samba.goatcounter.com).
   The script in index.html counts the landing page on its own; the site is a
   single page, so each section change is sent here as a virtual page view.
   GoatCounter ignores localhost, so dev visits are not counted. */
const SECTIONS = ['', 'projects', 'experience', 'random', 'contact'];

export function trackPage(index) {
  const name = SECTIONS[index];
  if (name === undefined) return;
  window.goatcounter?.count?.({ path: import.meta.env.BASE_URL + name });
}
