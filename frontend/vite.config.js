import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import checker from 'vite-plugin-checker';
import { visualizer } from "rollup-plugin-visualizer";

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
                   if (
                        id.includes('/src/pages/Login') ||
                        id.includes('/src/pages/Register')
                    ) {
                        return 'auth-module'
                    }

                    // post 模块：帖子相关页面 
                    if (
                        id.includes('/src/pages/PostDetails') ||
                        id.includes('/src/pages/Edit')
                    ) {
                        return 'post-module'
                    }

                    if(
                        id.includes('/src/pages/Feed') 
                    )
                    {
                        return 'index-module'
                    }
                    // 可选：用户相关
                    if (
                        id.includes('/src/pages/User') ||  
                        id.includes('/src/pages/Mine') ) {
                     return 'user-module'
                    }
                },
            },
        },

    },
    server: {
        proxy: {
        "/chat": {
            target: "https://blackhouse-04o3.onrender.com/",
            changeOrigin: true,
            ws: false, 
        },
        },
    },
});
