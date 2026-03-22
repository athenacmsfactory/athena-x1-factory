import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITES_DIR = path.resolve(__dirname, '../../sites');

async function fixDependencies(siteId) {
  const sitePath = path.join(SITES_DIR, siteId);
  const pkgPath = path.join(sitePath, 'package.json');
  if (!fs.existsSync(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const componentsDir = path.join(sitePath, 'src/components');
  
  if (!fs.existsSync(componentsDir)) return;

  let needsRouter = false;
  const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.jsx'));
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
    if (content.includes('react-router-dom')) {
      needsRouter = true;
      break;
    }
  }

  if (needsRouter && (!pkg.dependencies || !pkg.dependencies['react-router-dom'])) {
    console.log(`📦 Adding react-router-dom to ${siteId}`);
    pkg.dependencies = pkg.dependencies || {};
    pkg.dependencies['react-router-dom'] = '^6.22.0'; // Modern version compatible with React 19
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    
    // Pro-actively suggest pnpm install if node_modules exists
    if (fs.existsSync(path.join(sitePath, 'node_modules'))) {
       console.log(`  🔗 site has node_modules, might need pnpm install`);
    }
  }
}

async function main() {
  const sites = fs.readdirSync(SITES_DIR).filter(f => fs.statSync(path.join(SITES_DIR, f)).isDirectory());
  console.log(`🚀 Starting Bulk Dependency Fix for ${sites.length} sites...`);

  for (const site of sites) {
    await fixDependencies(site);
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);
