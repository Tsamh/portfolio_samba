import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* The published build keeps the Extra and Random pages as placeholders: the
   photos are not in the repository and the write-ups are not ready. Rather
   than hiding them at render time — which would still ship every word in the
   bundle — the content modules are swapped for an empty list, so nothing of
   them reaches dist/. Drop VITE_SOON to publish the real pages. */
function comingSoon() {
  const STUB = '\0coming-soon';
  return {
    name: 'coming-soon',
    apply: 'build',
    enforce: 'pre',
    resolveId(source) {
      return /(^|\/)content\/(extra|random)$/.test(source) ? STUB : null;
    },
    load(id) {
      return id === STUB ? 'export default [];' : null;
    },
  };
}

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/; BASE_PATH is set by the
  // deploy workflow. Local dev and any root-level host keep '/'.
  base: process.env.BASE_PATH || '/',
  plugins: [react(), ...(process.env.VITE_SOON === '1' ? [comingSoon()] : [])],
  // photos exported by phones often have uppercase extensions
  assetsInclude: ['**/*.JPG', '**/*.JPEG', '**/*.PNG', '**/*.HEIC'],
  server: {
    // leading dot allows every ngrok tunnel subdomain
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app'],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
