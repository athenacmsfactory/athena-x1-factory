import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'athena-api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url.includes('__athena/update-json') && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
              try {
                const payload = JSON.parse(body);
                const { file, index, key, value, data, action, direction } = payload;
                
                const dataDir = path.resolve(__dirname, 'src/data');
                const filePath = path.join(dataDir, `${file}.json`);
                
                console.log(`📦 [Athena API] Action: ${action || 'update'}, File: ${file || 'N/A'}`);

                if (action === 'reorder-sections') {
                  const orderPath = path.join(dataDir, 'section_order.json');
                  let order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
                  const idx = order.indexOf(key.toLowerCase());
                  if (idx !== -1) {
                    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
                    if (newIdx >= 0 && newIdx < order.length) {
                      const temp = order[idx];
                      order[idx] = order[newIdx];
                      order[newIdx] = temp;
                      fs.writeFileSync(orderPath, JSON.stringify(order, null, 2));
                    }
                  }
                } else if (action === 'delete' && fs.existsSync(filePath)) {
                  let content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                  if (Array.isArray(content) && index !== undefined) {
                    content.splice(index, 1);
                    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
                  }
                } else if (action === 'add' && fs.existsSync(filePath)) {
                  let content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                  if (Array.isArray(content)) {
                    const template = content.length > 0 ? { ...content[0] } : { name: "Nieuw Item" };
                    content.push(template);
                    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
                  }
                } else if (fs.existsSync(filePath)) {
                  let content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                  const isArray = Array.isArray(content);
                  const targetRow = isArray ? content[index || 0] : content;

                  if (data) {
                    Object.assign(targetRow, data);
                  } else if (key) {
                    const keys = key.split('.');
                    let current = targetRow;
                    for (let i = 0; i < keys.length - 1; i++) {
                      if (!current[keys[i]]) current[keys[i]] = {};
                      current = current[keys[i]];
                    }
                    current[keys[keys.length - 1]] = value;
                  }
                  
                  if (isArray) content[index || 0] = targetRow;
                  else content = targetRow;
                  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
                }

                // 🔱 v8.1 Auto-Aggregation (Refactored to inline for portability if script missing)
                const allData = {};
                const dataFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'all_data.json' && f !== 'all_data_showcase.json');
                for (const f of dataFiles) {
                  allData[f.replace('.json', '')] = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
                }
                fs.writeFileSync(path.join(dataDir, 'all_data.json'), JSON.stringify(allData, null, 2));
                
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (e) {
                console.error('❌ [Athena API] Error:', e.message);
                res.statusCode = 500;
                res.end(e.message);
              }
            });
            return;
          }
          next();
        });
      }
    }
  ],
  base: './',
  server: {
    cors: true,
    port: parseInt(process.env.PORT) || 6041,
      allowedHosts: true,
    host: true,
    fs: { allow: ['..'] }
  }
});
