import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
const backendTarget = `http://localhost:${process.env.BACKEND_PORT ?? 5174}`;

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.FRONTEND_PORT ?? 5173),
    proxy: {
      '/api': backendTarget,
      '/uploads': backendTarget,
    },
  },
});
