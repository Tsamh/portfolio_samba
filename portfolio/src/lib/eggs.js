/* One sound per egg: the files in assets/sounds/ start with 1, 2 and 3 */
const SOUNDS = Object.entries(
  import.meta.glob('../assets/sounds/*.mp3', { eager: true, import: 'default' })
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, url]) => url);

/* Three easter eggs hide in the site. Finding one flashes a notification;
   what has already been found is kept in localStorage, so the same egg only
   notifies once per browser. */

export const EGGS = {
  pocket: 'The note in his pocket',
  avatar: 'The avatar behind the site',
  lost:   'The lost page',
};

export const EGG_TOTAL = Object.keys(EGGS).length;

const KEY = 'portfolio-eggs';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();   // private mode, blocked storage…
  }
}

function write(found) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...found]));
  } catch {
    /* nothing to do: the egg simply notifies again next time */
  }
}

/** the nth chime, quietly: this is a notification, not a concert */
function playChime(nth) {
  const url = SOUNDS[nth - 1];
  if (!url) return;
  try {
    const audio = new Audio(url);
    audio.volume = 0.25;
    audio.play().catch(() => {});   // a browser may refuse to autoplay
  } catch {
    /* no audio: the notification still shows */
  }
}

/** ids of the easter eggs already found, in the order of EGGS */
export function foundEggs() {
  const found = read();
  return Object.keys(EGGS).filter((id) => found.has(id));
}

/**
 * Mark an easter egg as found. Fires `portfolio:egg` the first time only.
 * @param {keyof EGGS} id
 */
export function findEgg(id) {
  if (!EGGS[id]) return;
  const found = read();
  if (found.has(id)) return;

  found.add(id);
  write(found);
  playChime(found.size);
  window.dispatchEvent(
    new CustomEvent('portfolio:egg', {
      detail: { id, label: EGGS[id], count: found.size, total: EGG_TOTAL },
    })
  );
}
