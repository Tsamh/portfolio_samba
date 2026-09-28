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

/* One short, soft chime for every egg, synthesised on the spot with the
   Web Audio API: no sound file, and no borrowed jingle. Two sine notes a
   fifth apart (E6 then B6), each with a quick fade-in and a short tail. */
const NOTES = [1318.5, 1975.5];   // Hz
const GAP = 0.07;                 // s between the two notes
const TAIL = 0.28;                // s each note takes to fade out
const VOLUME = 0.12;

let ctx;

/* Browsers keep audio muted until the visitor has clicked, tapped or
   pressed a key on the page, and no code can lift that. An egg found
   before any of those (the 404 page opened straight from the address
   bar) shows its notification at once and rings on that first gesture,
   which the page hands over as soon as it happens. */
const GESTURES = ['pointerdown', 'keydown', 'touchstart'];
let waiting = false;

function playChime() {
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
    if (waiting) return;
    waiting = true;
    const first = () => {
      GESTURES.forEach((t) => window.removeEventListener(t, first, true));
      waiting = false;
      ring();
    };
    GESTURES.forEach((t) => window.addEventListener(t, first, true));
    return;
  }
  ring();
}

function ring() {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t0 = ctx.currentTime + 0.01;

    NOTES.forEach((freq, i) => {
      const start = t0 + i * GAP;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(VOLUME, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + TAIL);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + TAIL + 0.02);
    });
  } catch {
    /* no audio: the notification still shows */
  }
}

/** ids of the easter eggs already found, in the order of EGGS */
export function foundEggs() {
  const found = read();
  return Object.keys(EGGS).filter((id) => found.has(id));
}

/** Forget every egg found in this browser (terminal: `eggs reset`). */
export function resetEggs() {
  write(new Set());
  window.dispatchEvent(new Event('portfolio:eggs-reset'));
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
  // in the same tick as the event the notification listens to
  playChime();
  window.dispatchEvent(
    new CustomEvent('portfolio:egg', {
      detail: { id, label: EGGS[id], count: found.size, total: EGG_TOTAL },
    })
  );
}
