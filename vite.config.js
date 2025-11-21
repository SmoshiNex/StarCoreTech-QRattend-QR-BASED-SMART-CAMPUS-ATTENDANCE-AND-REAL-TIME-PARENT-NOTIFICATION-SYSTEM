import path from 'path';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    server: {
        host: true,
        port: 5173,
        strictPort: true,
        hmr: {
            host: '192.168.43.35', // my PC IP inside hotspot to connect on mobile phone
            protocol: 'ws',
            port: 5173,
        },
    },
});
