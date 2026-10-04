import { defineConfig } from 'vite';

export default defineConfig({
  // For GitHub Pages project site (https://bizrohitt.github.io/animotion/) set base: '/animotion/'
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    // @ts-ignore — allow preview proxy host (e2b.app)
    allowedHosts: true as unknown as string[],
    headers: { 'X-Frame-Options': 'ALLOWALL' },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    // @ts-ignore
    allowedHosts: true as unknown as string[],
  },
  appType: 'mpa',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        how: 'pages/how.html',
        faq: 'pages/faq.html',
        about: 'pages/about.html',
        privacy: 'pages/privacy.html',
        terms: 'pages/terms.html',
      },
    },
  },
});
