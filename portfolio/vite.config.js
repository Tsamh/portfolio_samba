import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/; BASE_PATH is set by the
  // deploy workflow. Local dev and any root-level host keep '/'.
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
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
