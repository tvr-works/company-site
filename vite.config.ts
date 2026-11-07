import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { resolveSiteIndexing, resolveSiteOrigin } from './src/site-config.ts';

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), 'VITE_SITE_');
  const indexing = resolveSiteIndexing(environment.VITE_SITE_INDEXING, process.env.CF_PAGES_BRANCH);
  const origin = resolveSiteOrigin(environment.VITE_SITE_ORIGIN);
  return {
    define: {
      'import.meta.env.VITE_SITE_INDEXING': JSON.stringify(indexing),
      'import.meta.env.VITE_SITE_ORIGIN': JSON.stringify(origin),
    },
    plugins: [
      tailwindcss(),
      tanstackStart({
        prerender: { enabled: true, autoStaticPathsDiscovery: false, autoSubfolderIndex: false, crawlLinks: false, failOnError: true },
        pages: [{ path: '/' }, { path: '/privacy' }, { path: '/404', prerender: { outputPath: '/404.html' } }],
      }),
      react(),
    ],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    build: { license: { fileName: 'licenses/dependencies.md' } },
    server: { host: '127.0.0.1' },
  };
});
