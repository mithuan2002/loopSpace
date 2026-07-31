import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Reliable config-file directory — works even when Vite compiles the config
// to a temp path before importing it (import.meta.dirname is Node 20.11+ only).
const configDir = path.dirname(fileURLToPath(import.meta.url));

// PORT is only required when running the dev/preview server, not during `vite build`
const rawPort = process.env.PORT;
const isBuild = process.argv.includes('build');

if (!isBuild && !rawPort) {
  throw new Error(
    'PORT environment variable is required but was not provided.',
  );
}

const port = rawPort ? Number(rawPort) : 3000;

if (rawPort && (Number.isNaN(port) || port <= 0)) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    'BASE_PATH environment variable is required but was not provided.',
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss({ optimize: false }),
    ...(process.env.NODE_ENV !== 'production'
      ? [
          (await import('@replit/vite-plugin-runtime-error-modal')).default(),
        ]
      : []),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(configDir, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(configDir, 'src'),
      '@assets': path.resolve(configDir, '..', '..', 'attached_assets'),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    // On Vercel write to repo-root public/ (vercel.json#outputDirectory: "public").
    // Everywhere else (Replit, local) write to dist/public inside this artifact.
    outDir: process.env.VERCEL
      ? path.resolve(configDir, '..', '..', 'public')
      : path.resolve(configDir, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
