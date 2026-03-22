/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/issuer-simulator',
  server: {
    port: 4202,
    host: 'localhost',
  },
  preview: {
    port: 4202,
    host: 'localhost',
  },
  plugins: [tailwindcss(), react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  build: {
    outDir: '../../dist/apps/issuer-simulator',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
