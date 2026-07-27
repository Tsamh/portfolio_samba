import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // photos exported by phones often have uppercase extensions
  assetsInclude: ['**/*.JPG', '**/*.JPEG', '**/*.PNG', '**/*.HEIC'],
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
