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
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
