import { defineConfig } from 'vite';

export default defineConfig({
  base: '/super-sudoku/',
  server: {
    port: 9753,
    strictPort: true,
  },
});
