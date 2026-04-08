import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async ({ command }) => {
  const isDev = command === 'serve';
  let athenaEditorPlugin = null;
  let athenaAggregatorPlugin = null;

  if (isDev) {
    const editorPluginPath = path.resolve(__dirname, '../../factory/5-engine/lib/vite-plugin-athena-editor.js');
    const aggPluginPath = path.resolve(__dirname, '../../factory/5-engine/lib/vite-plugin-athena-aggregator.js');
    
    if (fs.existsSync(editorPluginPath)) {
      try {
        const mod = await import(`file://${editorPluginPath}`);
        athenaEditorPlugin = mod.default;
      } catch (e) { }
    }

    // 🔄 v10.1 Auto-Aggregator
    if (fs.existsSync(aggPluginPath)) {
      try {
        const mod = await import(`file://${aggPluginPath}`);
        athenaAggregatorPlugin = mod.default;
      } catch (e) { }
    }
  }

  return {
    base: isDev ? `/${path.basename(__dirname)}/` : './',
    plugins: [
      react(),
      tailwindcss(),
      athenaEditorPlugin ? athenaEditorPlugin() : null,
      athenaAggregatorPlugin ? athenaAggregatorPlugin() : null
    ].filter(Boolean),
    server: {
      host: true,
      port: 6485,
      watch: {
        // src/data wordt niet genegeerd voor HMR
      }
    },
  build: {
  outDir: 'dist',
  emptyOutDir: true
}
  }
})