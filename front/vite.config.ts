import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
// Import dotenv
import { config } from 'dotenv';
config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react', 'lucide-react/dist/esm/icon/*'],
  },
  server: {
    https: {
      key: fs.readFileSync(process.env.CERTS_DIR + '/localhost-key.pem'),
      cert: fs.readFileSync(process.env.CERTS_DIR + '/localhost.pem'),
    },
    host: 'localhost',
    port: 3000,
  },
});
