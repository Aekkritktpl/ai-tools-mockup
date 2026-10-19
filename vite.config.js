import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' makes the build work from any GitHub Pages path
// (https://<user>.github.io/<repo>/) without extra configuration.
export default defineConfig({
  plugins: [react()],
  base: './',
});
