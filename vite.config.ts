/* eslint @typescript-eslint/indent: ["error", 2] */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/sudoku-react/',
  server: {
    host: '0.0.0.0'
  },
  preview: {
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      'src': path.resolve(__dirname, './src')
    }
  }
});
