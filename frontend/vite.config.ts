import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'GameJournal',
                short_name: 'Journal',
                start_url: '/',
                display: 'standalone',
                theme_color: '#e0e5ec',
                background_color: '#e0e5ec',
                icons: [
                    {
                        src: 'android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'apple-touch-icon.png',
                        sizes: '180x180',
                        type: 'image/png',
                        purpose: 'any',
                    },
                ],
            },
            workbox: {
                runtimeCaching: [
                    // NEVER cache statistics
                    {
                        urlPattern: ({ url }) =>
                            url.pathname === '/api/v1/entries/statistics',
                        handler: 'NetworkOnly',
                    },

                    // Normal API calls
                    {
                        urlPattern: ({ url }) =>
                            url.pathname.startsWith('/api/v1'),
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            networkTimeoutSeconds: 3,
                        },
                    },
                ],
            },
        }),
    ],
});
