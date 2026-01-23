import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [['babel-plugin-react-compiler']],
            },
        }),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'Game Journal',
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
        }),
    ],
    server: {
        allowedHosts: ['choice-joint-ghost.ngrok-free.app'],
        proxy: {
            '/api/v1': {
                target: 'http://localhost:5173',
                changeOrigin: true,
            },
        },
    },
});
