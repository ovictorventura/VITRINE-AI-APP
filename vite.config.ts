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
      preview: {
        host: true,
        port: 8080,
        strictPort: true,
        // ▼▼▼ A LINHA QUE FALTAVA ESTÁ AQUI ▼▼▼
        allowedHosts: ['vitrine-ai-app.onrender.com'], 
      },
      server: {
        host: true,
        strictPort: true,
        port: 8080, 
      }
    };
});
