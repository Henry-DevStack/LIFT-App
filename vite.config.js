import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Service worker: guarda os arquivos do app em cache pra que ele
    // abra e funcione sem internet. Isso importa muito num app de
    // academia, onde o sinal costuma ser ruim justamente na hora do uso.
    // Como todos os dados já são locais (localStorage), o app é 100%
    // funcional offline — só faltava o navegador conseguir carregá-lo.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Fit App',
        short_name: 'Fit App',
        description: 'Treinos, alimentação e evolução — tudo em um só lugar.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0d0f0e',
        theme_color: '#0d0f0e',
        orientation: 'portrait',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Tudo que o app precisa pra rodar entra no cache na primeira visita.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        // Fontes do Google: usa o cache mas revalida quando há rede.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // A API do assistente NUNCA deve ser cacheada: respostas antigas
            // apareceriam como se fossem novas.
            urlPattern: /^https:\/\/api\.anthropic\.com\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
      devOptions: {
        // Deixa testar o comportamento offline com `npm run dev`.
        enabled: false,
      },
    }),
  ],
})
