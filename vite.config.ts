import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // For GitHub Pages project site (https://bizrohitt.github.io/animotion/) set base: '/animotion/'
  base: '/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['fonts/*', 'styles/*'],
      manifest: {
        name: 'MatchCutter — Text Match Cut Video Generator',
        short_name: 'MatchCutter',
        description: 'Pin one word, jitter the rest. Browser-only match cut videos.',
        theme_color: '#fdfbf7',
        background_color: '#fdfbf7',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 192 192%27%3E%3Crect width=%27192%27 height=%27192%27 rx=%2732%27 fill=%27%23b91c1c%27/%3E%3Ctext x=%2750%25%27 y=%2755%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27serif%27 font-size=%2788%27 fill=%27white%27%3EM%3C/text%3E%3C/svg%3E',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg}'],
        navigateFallback: 'index.html',
      },
      devOptions: { enabled: true, type: 'module' },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // @ts-expect-error — allow preview proxy host (e2b.app) not in vite types
    allowedHosts: true as unknown as string[],
    headers: { 'X-Frame-Options': 'ALLOWALL' },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    // @ts-expect-error — preview allowedHosts
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
