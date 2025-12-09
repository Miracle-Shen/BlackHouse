import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import checker from 'vite-plugin-checker';
import { visualizer } from "rollup-plugin-visualizer";
import { fa } from 'zod/v4/locales';
export default defineConfig({
    plugins: [
        react(), checker({ typescript: true }),
        visualizer({
            filename: "stats.html",
            gzipSize: true,
            brotliSize: true,
            template: "treemap",
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'), // 将 @ 映射到 src 目录
        },
    },
    build: {
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return id.toString().split('node_modules/')[1].split('/')[0].toString();
                    }
                },
            },
        },

    },
});
