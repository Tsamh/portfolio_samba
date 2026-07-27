import { useEffect, useRef, useState } from 'react';

/** MediaPipe's standard 21-point hand skeleton. */
const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

const STORAGE_KEY = 'gesture-preview-collapsed';

/**
 * Small mirrored camera thumbnail with the detected hand drawn over it.
 *
 * Beyond helping the visitor frame themselves, it makes the privacy claim
 * concrete: this is exactly what the page sees, and it goes nowhere.
 */
export default function GesturePreview({ videoRef, landmarksRef }) {
  const canvasRef = useRef(null);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (collapsed) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    let rafId;

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      const { width, height } = canvas;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Mirror so the visitor sees themselves the way a mirror shows them.
      ctx.translate(width, 0);
      ctx.scale(-1, 1);

      if (video.readyState >= 2) ctx.drawImage(video, 0, 0, width, height);

      const landmarks = landmarksRef.current;
      if (landmarks) {
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.9)';
        ctx.lineWidth = 2;
        for (const [a, b] of CONNECTIONS) {
          ctx.beginPath();
          ctx.moveTo(landmarks[a].x * width, landmarks[a].y * height);
          ctx.lineTo(landmarks[b].x * width, landmarks[b].y * height);
          ctx.stroke();
        }
        ctx.fillStyle = '#fff';
        for (const point of landmarks) {
          ctx.beginPath();
          ctx.arc(point.x * width, point.y * height, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      if (!landmarks) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('show your hand', width / 2, height - 12);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [collapsed, videoRef, landmarksRef]);

  return (
    <div className={`gesture-preview${collapsed ? ' collapsed' : ''}`}>
      <button
        className="gesture-preview-toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Show camera preview' : 'Hide camera preview'}
      >
        {collapsed ? 'Show camera' : 'Hide'}
      </button>
      {!collapsed && <canvas ref={canvasRef} width={192} height={144} />}
    </div>
  );
}
