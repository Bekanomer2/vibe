import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';

const pages = [
  'index', 'product', 'cart', 'orders', 'login', 'admin', 'admin-orders',
];

// Передаёт в браузер ТОЛЬКО переменные с префиксом VITE_ (window.__ENV__).
// Секретные ключи (без VITE_) сюда не попадают.
function injectEnv(mode) {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    name: 'inject-env',
    transformIndexHtml() {
      return [{
        tag: 'script',
        children: `window.__ENV__=${JSON.stringify(env)};`,
        injectTo: 'head-prepend',
      }];
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [injectEnv(mode)],
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((p) => [p, resolve(process.cwd(), `${p}.html`)])
      ),
    },
  },
}));
