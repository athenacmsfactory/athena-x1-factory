import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITES_DIR = path.resolve(__dirname, '../../sites');

function fixRouter(siteId) {
  const sitePath = path.join(SITES_DIR, siteId);
  const pkgPath = path.join(sitePath, 'package.json');
  const appPath = path.join(sitePath, 'src/App.jsx');

  if (!fs.existsSync(pkgPath) || !fs.existsSync(appPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const hasRouterDep = pkg.dependencies && pkg.dependencies['react-router-dom'];

  if (!hasRouterDep) return;

  let content = fs.readFileSync(appPath, 'utf8');

  // Check if it already has a Router
  if (content.includes('Router') || content.includes('BrowserRouter') || content.includes('HashRouter')) {
    console.log(`✅ ${siteId} already has a Router.`);
    return;
  }

  console.log(`🚀 Injecting HashRouter into ${siteId}/src/App.jsx`);

  // 1. Add import
  if (!content.includes('import { HashRouter as Router }')) {
    content = "import { HashRouter as Router } from 'react-router-dom';\n" + content;
  }

  // 2. Wrap the return content
  // We search for the first return ( likely of the App component)
  const returnMatch = content.match(/return\s*\(\s*(<[\s\S]*>)\s*\);?\s*}\s*;/);
  
  if (returnMatch) {
     const originalReturnBody = returnMatch[1];
     const newReturnBody = `<Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>\n        ${originalReturnBody}\n      </Router>`;
     content = content.replace(originalReturnBody, newReturnBody);
  } else {
     // Fallback search for simpler return
     const simpleReturnMatch = content.match(/return\s*(<[\s\S]*>)/);
     if (simpleReturnMatch) {
         const originalReturnBody = simpleReturnMatch[1];
         const newReturnBody = `<Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>${originalReturnBody}</Router>`;
         content = content.replace(originalReturnBody, newReturnBody);
     } else {
         console.warn(`  ⚠️ Could not find return statement in ${siteId}/src/App.jsx`);
         return;
     }
  }

  fs.writeFileSync(appPath, content);
}

async function main() {
  const sites = fs.readdirSync(SITES_DIR).filter(f => fs.statSync(path.join(SITES_DIR, f)).isDirectory());
  console.log(`🚀 Starting Bulk Router Fix for ${sites.length} sites...`);

  for (const site of sites) {
    fixRouter(site);
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);
