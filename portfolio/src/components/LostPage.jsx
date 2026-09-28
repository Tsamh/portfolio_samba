import { useCallback, useEffect, useRef, useState } from 'react';
import { findEgg } from '../lib/eggs';
import '../css/LostPage.css';

const LIVES = 3;
const FONT = '"Bebas Neue", Impact, sans-serif';

/**
 * 404 screen, reached by /404, an unknown hash or the terminal's `404`.
 * The message itself is the game: the big 404 is made of bricks and you
 * knock it down, Breakout style, with the whole screen as the playfield.
 * @param {function} onLeave
 * @param {boolean}  ready   - false while the loader still covers the site
 */
export default function LostPage({ onLeave, ready = true }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const launchRef = useRef(() => {});
  const [left, setLeft] = useState(null);     // bricks still standing
  const [lives, setLives] = useState(LIVES);
  const [phase, setPhase] = useState('ready'); // ready | play | lost | won

  /* The egg is announced once the visitor can see it and hear it. Reached
     straight from the address bar, the page opened under the loader: the
     notification played out behind it, and the browser muted the chime
     because nobody had interacted with the page yet. So: wait for the
     loader, then, if the page has had no click or key press so far, wait
     for the first one (the game needs it anyway). */
  useEffect(() => {
    if (!ready) return undefined;
    if (navigator.userActivation?.hasBeenActive ?? true) {
      findEgg('lost');
      return undefined;
    }
    const EVENTS = ['pointerdown', 'keydown', 'touchstart'];
    const first = () => {
      EVENTS.forEach((t) => window.removeEventListener(t, first, true));
      findEgg('lost');
    };
    EVENTS.forEach((t) => window.addEventListener(t, first, true));
    return () => EVENTS.forEach((t) => window.removeEventListener(t, first, true));
  }, [ready]);

  const leave = useCallback(() => onLeave(), [onLeave]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const css = getComputedStyle(document.body);
    const accent = css.getPropertyValue('--accent').trim() || '#dc2626';
    const ink = css.getPropertyValue('--text').trim() || '#111';

    let W = 0;
    let H = 0;
    let grid = null;       // { ox, oy, cell, cols, rows, alive: Uint8Array, count }
    let paddle = { x: 0, w: 120, y: 0, h: 10 };
    let ball = { x: 0, y: 0, vx: 0, vy: 0, r: 7, stuck: true };
    let speed = 6;
    let lifeCount = LIVES;
    let state = 'ready';
    let chips = [];        // falling bits of broken bricks
    let keys = { left: false, right: false };
    let raf;
    let last = performance.now();
    let cancelled = false;

    const set = (next) => { state = next; setPhase(next); };

    /* the 404 is drawn once off-screen, then sampled into a grid of bricks */
    const buildBricks = () => {
      const top = root.querySelector('.lost-head')?.getBoundingClientRect().bottom ?? H * 0.25;
      const areaTop = top + 24;
      const areaBottom = paddle.y - Math.max(90, H * 0.14);
      const fontSize = Math.min(W * (W < 700 ? 0.72 : 0.5), (areaBottom - areaTop) * 1.15);
      const cell = Math.max(7, Math.round(fontSize / 24));

      const off = document.createElement('canvas');
      const octx = off.getContext('2d');
      octx.font = `400 ${fontSize}px ${FONT}`;
      const m = octx.measureText('404');
      const tw = Math.ceil(m.width);
      const th = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent);
      off.width = tw;
      off.height = th;
      octx.font = `400 ${fontSize}px ${FONT}`;
      octx.textBaseline = 'alphabetic';
      octx.fillText('404', 0, m.actualBoundingBoxAscent);
      const data = octx.getImageData(0, 0, tw, th).data;

      const cols = Math.floor(tw / cell);
      const rows = Math.floor(th / cell);
      const alive = new Uint8Array(cols * rows);
      let count = 0;
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const px = Math.floor((c + 0.5) * cell);
          const py = Math.floor((r + 0.5) * cell);
          if (data[(py * tw + px) * 4 + 3] > 128) { alive[r * cols + c] = 1; count += 1; }
        }
      }
      const ox = Math.round((W - cols * cell) / 2);
      const oy = Math.round(areaTop + Math.max(0, (areaBottom - areaTop - rows * cell) / 2));
      grid = { ox, oy, cell, cols, rows, alive, count };
      setLeft(count);
    };

    const stickBall = () => {
      ball.stuck = true;
      ball.vx = 0;
      ball.vy = 0;
      ball.x = paddle.x;
      ball.y = paddle.y - ball.r - 1;
    };

    const layout = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * ratio;
      canvas.height = H * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      paddle.w = Math.max(90, Math.min(170, W * 0.13));
      paddle.y = H - Math.max(56, H * 0.08);
      paddle.x = paddle.x || W / 2;
      ball.r = Math.max(5, Math.min(8, W / 160));
      speed = Math.max(5, Math.min(W, H) * 0.0105);
    };

    const newGame = () => {
      lifeCount = LIVES;
      setLives(LIVES);
      chips = [];
      layout();
      buildBricks();
      stickBall();
      set('ready');
    };

    const launch = () => {
      if (state === 'lost' || state === 'won') { newGame(); return; }
      if (!ball.stuck) return;
      const a = (-Math.PI / 2) + (Math.random() - 0.5) * 0.7;
      ball.vx = Math.cos(a) * speed;
      ball.vy = Math.sin(a) * speed;
      ball.stuck = false;
      set('play');
    };
    launchRef.current = launch;

    /* bricks under a circle; each one knocked out leaves a few chips */
    const hitBricks = (x, y) => {
      const { ox, oy, cell, cols, rows, alive } = grid;
      const c0 = Math.max(0, Math.floor((x - ball.r - ox) / cell));
      const c1 = Math.min(cols - 1, Math.floor((x + ball.r - ox) / cell));
      const r0 = Math.max(0, Math.floor((y - ball.r - oy) / cell));
      const r1 = Math.min(rows - 1, Math.floor((y + ball.r - oy) / cell));
      let hit = false;
      for (let r = r0; r <= r1; r += 1) {
        for (let c = c0; c <= c1; c += 1) {
          const i = r * cols + c;
          if (!alive[i]) continue;
          alive[i] = 0;
          grid.count -= 1;
          hit = true;
          const bx = ox + c * cell;
          const by = oy + r * cell;
          for (let k = 0; k < 3; k += 1) {
            chips.push({
              x: bx + Math.random() * cell, y: by + Math.random() * cell,
              vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 2,
              s: cell * (0.25 + Math.random() * 0.25), life: 1,
            });
          }
        }
      }
      return hit;
    };

    const moveBall = (dt) => {
      // small steps: a fast ball must not tunnel through a one-brick wall
      const steps = Math.ceil((Math.hypot(ball.vx, ball.vy) * dt) / (ball.r * 0.8));
      for (let s = 0; s < steps; s += 1) {
        const sx = (ball.vx * dt) / steps;
        const sy = (ball.vy * dt) / steps;

        ball.x += sx;
        if (hitBricks(ball.x, ball.y)) { ball.x -= sx; ball.vx = -ball.vx; }
        ball.y += sy;
        if (hitBricks(ball.x, ball.y)) { ball.y -= sy; ball.vy = -ball.vy; }

        // screen edges are the walls
        if (ball.x < ball.r)     { ball.x = ball.r;     ball.vx = Math.abs(ball.vx); }
        if (ball.x > W - ball.r) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
        if (ball.y < ball.r)     { ball.y = ball.r;     ball.vy = Math.abs(ball.vy); }

        // paddle: where it lands sets the angle
        if (ball.vy > 0
          && ball.y + ball.r >= paddle.y && ball.y + ball.r <= paddle.y + paddle.h + ball.vy
          && Math.abs(ball.x - paddle.x) <= paddle.w / 2 + ball.r) {
          const off = (ball.x - paddle.x) / (paddle.w / 2);
          const a = -Math.PI / 2 + Math.max(-1, Math.min(1, off)) * 1.05;
          const v = Math.min(speed * 1.6, Math.hypot(ball.vx, ball.vy) * 1.01);
          ball.vx = Math.cos(a) * v;
          ball.vy = Math.sin(a) * v;
          ball.y = paddle.y - ball.r;
        }

        if (ball.y - ball.r > H) {
          lifeCount -= 1;
          setLives(lifeCount);
          if (lifeCount <= 0) set('lost');
          else set('ready');
          stickBall();
          return;
        }
      }

      setLeft(grid.count);
      if (grid.count === 0) { set('won'); stickBall(); }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // the 404
      const { ox, oy, cell, cols, rows, alive } = grid;
      ctx.fillStyle = accent;
      const gap = Math.max(1, cell * 0.12);
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          if (alive[r * cols + c]) {
            ctx.fillRect(ox + c * cell, oy + r * cell, cell - gap, cell - gap);
          }
        }
      }

      // chips
      chips.forEach((p) => {
        ctx.globalAlpha = Math.max(0, p.life) * 0.8;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      });
      ctx.globalAlpha = 1;

      // paddle and ball
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.roundRect(paddle.x - paddle.w / 2, paddle.y, paddle.w, paddle.h, paddle.h / 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();
    };

    const step = (now) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min((now - last) / 16.7, 2.5);   // in frames, capped
      last = now;

      const kv = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      if (kv) paddle.x += kv * 11 * dt;
      paddle.x = Math.max(paddle.w / 2, Math.min(W - paddle.w / 2, paddle.x));

      if (ball.stuck) { ball.x = paddle.x; ball.y = paddle.y - ball.r - 1; }
      else if (state === 'play') moveBall(dt);

      chips.forEach((p) => {
        p.vy += 0.25 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= 0.02 * dt;
      });
      chips = chips.filter((p) => p.life > 0);

      draw();
    };

    const onPointer = (e) => { paddle.x = e.clientX; };
    const onKey = (e) => {
      const down = e.type === 'keydown';
      if (e.key === 'ArrowLeft')  { keys.left = down; e.preventDefault(); }
      if (e.key === 'ArrowRight') { keys.right = down; e.preventDefault(); }
      if (down && (e.code === 'Space' || e.key === 'ArrowUp')) { e.preventDefault(); launch(); }
    };
    const onResize = () => {
      // a new size means a new brick grid: start the round over
      layout();
      buildBricks();
      stickBall();
      if (state === 'play') set('ready');
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    window.addEventListener('resize', onResize);

    // wait for Bebas Neue, or the bricks would spell 404 in the fallback font
    document.fonts.load(`400 100px ${FONT}`).catch(() => {}).then(() => {
      if (cancelled) return;
      newGame();
      raf = requestAnimationFrame(step);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && leave();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [leave]);

  const message = {
    ready: lives === LIVES ? 'Click or press space to launch' : 'Missed. Click to launch again',
    play: '',
    lost: 'The 404 stands. Click to try again',
    won: 'Nothing left to find. Click to rebuild it',
  }[phase];

  return (
    <div
      ref={rootRef}
      className="lost"
      role="dialog"
      aria-modal="true"
      aria-label="Page not found"
      onPointerDown={(e) => {
        if (e.target.closest('button')) return;
        if (e.pointerType !== 'mouse') {
          // on a touch screen the finger drags the paddle too
          e.currentTarget.setPointerCapture?.(e.pointerId);
        }
        launchRef.current();
      }}
    >
      <canvas ref={canvasRef} className="lost-canvas" aria-hidden="true" />

      <header className="lost-head">
        <p className="lost-title">You found the lost page</p>
        <p className="lost-text">
          Nothing lives here, so knock the 404 down. Move with the mouse or the
          arrow keys.
        </p>
        <button className="lost-btn" onClick={leave} type="button">Back to the site</button>
      </header>

      <p className="lost-status" aria-live="polite">
        {left !== null && (
          <>
            {left} bricks left
            <span>{'●'.repeat(lives)}{'○'.repeat(LIVES - lives)}</span>
          </>
        )}
      </p>

      {message && <p className="lost-msg">{message}</p>}
    </div>
  );
}
