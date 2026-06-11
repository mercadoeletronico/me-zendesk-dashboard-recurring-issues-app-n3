import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega as variaveis de ambiente do arquivo .env.<mode>
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const ssoUrl = env.VITE_SSO_URL ?? 'https://trunk.sso.mercadoe.com';
  const realm  = env.VITE_SSO_REALM ?? 'zerotrust';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Proxy da API backend
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        // Proxy do token SSO: evita CORS no browser durante dev
        // O dev server faz a requisicao server-to-server, sem restricao de CORS
        '/__sso/token': {
          target: ssoUrl,
          changeOrigin: true,
          secure: true,
          rewrite: () => `/realms/${realm}/protocol/openid-connect/token`,
        },
        '/__sso/logout': {
          target: ssoUrl,
          changeOrigin: true,
          secure: true,
          rewrite: () => `/realms/${realm}/protocol/openid-connect/logout`,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            charts: ['chart.js', 'react-chartjs-2'],
            query: ['@tanstack/react-query'],
            store: ['zustand'],
          },
        },
      },
    },
  };
});
