import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // ▼▼▼ ADICIONE ESTE BLOCO DE CÓDIGO ABAIXO ▼▼▼
      preview: {
        host: true,
        port: 8080,
        strictPort: true,
      },
      server: {
        host: true,
        strictPort: true,
        port: 8080, 
      }
    };
});
