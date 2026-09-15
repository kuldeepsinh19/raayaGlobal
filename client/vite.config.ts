import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const copyLogoPlugin = {
  name: 'copy-logo',
  buildStart() {
    const src = resolve(__dirname, '../Raaya Global Solutions logo2.png');
    const dest = resolve(__dirname, 'public/logo.png');
    if (existsSync(src)) {
      copyFileSync(src, dest);
    }
  },
};

export default defineConfig({
  plugins: [react(), copyLogoPlugin],
  server: {
    proxy: {
      // Points at `vercel dev` (port 3000), which serves the functions in api/.
      //
      // This used to target localhost:5000 — the Express server in server/ —
      // while production served client/api/. Local development and production
      // therefore exercised two completely different backends, which is
      // precisely how the two implementations drifted apart until they returned
      // different response shapes. server/ has been removed; there is now one
      // backend, and `vercel dev` runs the same code Vercel deploys.
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
