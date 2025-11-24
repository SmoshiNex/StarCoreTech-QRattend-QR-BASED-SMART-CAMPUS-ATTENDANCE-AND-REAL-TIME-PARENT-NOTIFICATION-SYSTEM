import path from 'path';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
            valetTls: false,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    server: {
        host: '0.0.0.0', // Allows access from network (for mobile testing)
        port: 5173,
        strictPort: true,
        hmr: {
            protocol: 'ws',
            // Use environment variable or detect automatically
            // For production builds, this is not used (assets are static)
            host: process.env.VITE_HMR_HOST || 'localhost',
            port: 5173,
        },
    },
});
