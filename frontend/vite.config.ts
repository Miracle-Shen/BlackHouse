import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import checker from 'vite-plugin-checker'
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

});