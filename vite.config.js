import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiTarget = process.env.PASIM_API_TARGET || 'http://localhost:8089';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Preserve same-origin semantics when Vite forwards a browser request.
            // Requests from a different origin still go through backend CORS checks.
            const origin = req.headers.origin;
            if (!origin) return;
            try {
              if (new URL(origin).host === req.headers.host) {
                proxyReq.setHeader('Origin', new URL(apiTarget).origin);
              }
            } catch {
              // Leave malformed origins untouched for the backend to reject.
            }
          });
        }
      }
    }
  }
});
