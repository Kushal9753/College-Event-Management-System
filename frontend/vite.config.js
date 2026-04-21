import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const apiUrl = env.VITE_API_URL;
  const proxyTarget =
    env.VITE_PROXY_TARGET || (apiUrl ? apiUrl.replace(/\/api\/?$/, '') : undefined);

  return {
    plugins: [react(), tailwindcss()],
    server: proxyTarget
      ? {
        proxy: {
          '/api': {
            target: proxyTarget,
            changeOrigin: true,
          },
        },
      }
      : undefined,
  };
});