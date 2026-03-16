import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

const isCodespace = !!process.env.CODESPACES;

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '$lib': path.resolve('./src/lib'),
    },
    conditions: ['browser'],
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: isCodespace
      ? { clientPort: 443, protocol: 'wss' }
      : undefined,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    server: {
      deps: {
        inline: ['svelte', '@sveltejs/vite-plugin-svelte'],
      },
    },
  },
});
