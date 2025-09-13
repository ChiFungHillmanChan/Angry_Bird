import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 5173,
    open: false
  },
  build: {
    sourcemap: true,
    outDir: 'dist'
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || '0.1.0'),
    __DEV__: JSON.stringify(mode !== 'production')
  }
}));


