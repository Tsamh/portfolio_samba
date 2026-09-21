import { useCallback, useEffect, useRef, useState } from 'react';
import { findEgg } from '../lib/eggs';
import '../css/LostPage.css';

/* ── game constants (canvas units, the canvas is scaled to its box) ── */
const W = 720;
const H = 240;
const GROUND = H - 40;
const GRAVITY = 0.62;
const JUMP = -11.5;
const START_SPEED = 4.2;
const CHARS = ['4', '0', '4'];
const BEST_KEY = 'portfolio-404-best';

/**
 * 404 screen, reached by /404, an unknown hash or the terminal's `404`.
 * The message itself is the game: the 4, the 0 and the 4 come at you and
 * you jump over them.
 * @param {function} onLeave
 */
export default function LostPage({ onLeave }) {
  const canvasRef = useRef(null);
  const jumpRef = useRef(() => {});
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem(BEST_KEY) || 0));
  const [over, setOver] = useState(false);

  useEffect(() => { findEgg('lost'); }, []);

  const leave = useCallback(() => onLeave(), [onLeave]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#dc2626';
    const ink = getComputedStyle(document.body).getPropertyValue('--text').trim() || '#111';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let player = { x: 90, y: GROUND, vy: 0 };
    let obstacles = [];
    let speed = START_SPEED;
    let passed = 0;
    let dead = false;
    let raf;
    let last = performance.now();
    let spawnIn = 60;

    const reset = () => {
      player = { x: 90, y: GROUND, vy: 0 };
      obstacles = [];
      speed = START_SPEED;
      passed = 0;
      spawnIn = 60;
      dead = false;
      setScore(0);
      setOver(false);
    };

    const jump = () => {
      if (dead) { reset(); return; }
      if (player.y >= GROUND) player.vy = JUMP;
    };
    jumpRef.current = jump;

    const size = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * ratio;
      canvas.height = H * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    size();

    const step = (now) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min((now - last) / 16.7, 2.5);   // in frames, capped
      last = now;

      if (!dead) {
        player.vy += GRAVITY * dt;
        player.y = Math.min(GROUND, player.y + player.vy * dt);

        spawnIn -= dt;
        if (spawnIn <= 0) {
          obstacles.push({ x: W + 40, char: CHARS[obstacles.length % CHARS.length], counted: false });
          spawnIn = 55 + Math.random() * 45;
          speed = Math.min(9, speed + 0.12);
        }

        obstacles.forEach((o) => { o.x -= speed * dt; });
        obstacles = obstacles.filter((o) => o.x > -60);

        obstacles.forEach((o) => {
          // the glyph box, a little tighter than the drawn character
          const hit = Math.abs(o.x - player.x) < 26 && player.y > GROUND - 34;
          if (hit) {
            dead = true;
            setOver(true);
            setBest((b) => {
              const next = Math.max(b, passed);
              try { localStorage.setItem(BEST_KEY, String(next)); } catch { /* ignore */ }
              return next;
            });
          }
          if (!o.counted && o.x < player.x - 20) {
            o.counted = true;
            passed += 1;
            setScore(passed);
          }
        });
      }

      /* ── draw ── */
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = ink;
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.moveTo(0, GROUND + 14);
      ctx.lineTo(W, GROUND + 14);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = accent;
      ctx.fillRect(player.x - 13, player.y - 26, 26, 26);

      ctx.fillStyle = ink;
      ctx.font = '700 46px "Bebas Neue", Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      obstacles.forEach((o) => ctx.fillText(o.char, o.x, GROUND + 8));

      if (reduced) cancelAnimationFrame(raf);
    };

    raf = requestAnimationFrame(step);

    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', size);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', size);
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && leave();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [leave]);

  return (
    <div className="lost" role="dialog" aria-modal="true" aria-label="Page not found">
      <p className="lost-code">404</p>
      <p className="lost-title">You found the lost page</p>
      <p className="lost-text">
        Nothing lives here, so jump over the 4, the 0 and the 4 instead.
        Space, or tap the board.
      </p>

      <div
        className="lost-game"
        onPointerDown={(e) => { e.preventDefault(); jumpRef.current(); }}
        role="button"
        tabIndex={0}
        aria-label="Jump"
        onKeyDown={(e) => { if (e.key === 'Enter') jumpRef.current(); }}
      >
        <canvas ref={canvasRef} className="lost-canvas" />
        <span className="lost-score">{score} <span>best {best}</span></span>
        {over && <span className="lost-over">Hit. Tap or press space to start again</span>}
      </div>

      <button className="lost-btn" onClick={leave} type="button">Back to the site</button>
    </div>
  );
}
