/**
 * Smoke dissolve for the loader: a full-screen layer of the page colour that
 * burns away from the centre outwards. Its edge turns into contrasting smoke
 * (black over a light page, white over a dark one) that thins out along
 * drifting fractal-noise wisps. Plain WebGL, no library.
 */

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision mediump float;
uniform vec2  uRes;
uniform float uProgress;   // 0 = opaque, 1 = gone
uniform float uTime;
uniform vec3  uColor;     // page background
uniform vec3  uSmoke;     // contrasting smoke colour

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  float d = length(p);

  // two drifting noise layers: large billows + fine wisps
  float billow = fbm(p * 2.6 + vec2(0.0, -uTime * 0.25));
  float wisp   = fbm(p * 7.0 + vec2(uTime * 0.18, uTime * 0.1));
  float field  = d * 0.95 + billow * 0.6 + wisp * 0.18;

  // the threshold sweeps outwards (far enough to clear the corners)
  float t = uProgress * 2.5 - 0.3;

  // what is left of the page-coloured layer
  float layer = smoothstep(t, t + 0.2, field);

  // smoke: a soft band just inside the edge, broken up by the fine wisps
  float band  = smoothstep(t - 0.3, t, field) * (1.0 - layer);
  float smoke = band * (0.55 + 0.45 * wisp) * 0.9;

  // premultiplied: page layer over smoke
  vec3  rgb = uColor * layer + uSmoke * smoke * (1.0 - layer);
  float a   = layer + smoke * (1.0 - layer);
  gl_FragColor = vec4(rgb, a);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

/** "rgb(246, 246, 244)" → [0.96, 0.96, 0.95] */
function parseColor(css) {
  const [r, g, b] = (css.match(/\d+(\.\d+)?/g) || [255, 255, 255]).map(Number);
  return [r / 255, g / 255, b / 255];
}

/**
 * Prepare the smoke layer on a canvas and draw its first, fully opaque frame.
 * Returns null when WebGL is unavailable (the caller falls back to a fade).
 * @param {HTMLCanvasElement} canvas
 * @param {string} cssColor - computed colour of the page background
 */
export function createSmoke(canvas, cssColor) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  } catch {
    return null;
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, 'uRes');
  const uProgress = gl.getUniformLocation(program, 'uProgress');
  const uTime = gl.getUniformLocation(program, 'uTime');
  const color = parseColor(cssColor);
  gl.uniform3fv(gl.getUniformLocation(program, 'uColor'), color);
  // black smoke over a light page, white smoke over a dark one
  const luminance = 0.2126 * color[0] + 0.7152 * color[1] + 0.0722 * color[2];
  gl.uniform3fv(gl.getUniformLocation(program, 'uSmoke'), luminance > 0.5 ? [0, 0, 0] : [1, 1, 1]);

  // half resolution: smoke is soft anyway, and phones keep 60 fps
  const resize = () => {
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * 0.5));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * 0.5));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  };

  const draw = (progress, time) => {
    gl.uniform1f(uProgress, progress);
    gl.uniform1f(uTime, time);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  resize();
  draw(0, 0);

  return {
    /** Play the dissolve; resolves when the layer is fully gone. */
    play(duration = 2600) {
      return new Promise((resolve) => {
        const start = performance.now();
        const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
        const frame = (now) => {
          const x = Math.min(1, (now - start) / duration);
          draw(ease(x), (now - start) / 1000);
          if (x < 1) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      });
    },
    destroy() {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
