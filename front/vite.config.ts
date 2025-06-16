import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react', 'lucide-react/dist/esm/icon/*'],
  },
  server: {
    https: {
      key: fs.readFileSync('../..//localhost-key.pem'),
      cert: fs.readFileSync('../../localhost.pem'),
    },
    host: 'localhost',
    port: 3000,
  },
});
