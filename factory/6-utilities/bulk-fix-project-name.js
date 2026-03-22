import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITES_DIR = path.resolve(__dirname, '../../sites');

function toTitleCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function fixSite(siteId) {
  const sitePath = path.join(SITES_DIR, siteId);
  if (!fs.existsSync(sitePath)) return;

  const siteName = toTitleCase(siteId);
  console.log(`\n🏗️  Fixing Site: ${siteId} -> "${siteName}"`);

  // 1. Fix Header.jsx
  const headerPath = path.join(sitePath, 'src/components/Header.jsx');
  if (fs.existsSync(headerPath)) {
    let content = fs.readFileSync(headerPath, 'utf8');
    if (content.includes('{{PROJECT_NAME}}')) {
      console.log(`  ✅ Updating Header.jsx`);
      // Replace the fallback literal
      content = content.replace(/'{{PROJECT_NAME}}'/g, `'${siteName}'`);
      content = content.replace(/"{{PROJECT_NAME}}"/g, `"${siteName}"`);
      // Also catch cases where it might be in a template string or similar
      content = content.replace(/{{PROJECT_NAME}}/g, siteName);
      fs.writeFileSync(headerPath, content);
    }
  }

  // 2. Fix manifest.json
  const manifestPath = path.join(sitePath, 'public/manifest.json');
  const manifestPathAlt = path.join(sitePath, 'shared/public/manifest.json');
  [manifestPath, manifestPathAlt].forEach(p => {
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      if (content.includes('{{PROJECT_NAME}}')) {
        console.log(`  ✅ Updating manifest.json`);
        content = content.replace(/{{PROJECT_NAME}}/g, siteName);
        fs.writeFileSync(p, content);
      }
    }
  });

  // 3. Fix Data Files (site_settings.json, basis.json, etc)
  const dataDir = path.join(sitePath, 'src/data');
  if (fs.existsSync(dataDir)) {
    const dataFiles = ['site_settings.json', 'basis.json', 'site_basis.json', 'header.json'];
    dataFiles.forEach(file => {
      const p = path.join(dataDir, file);
      if (fs.existsSync(p)) {
        try {
          let content = fs.readFileSync(p, 'utf8');
          let changed = false;

          // Detect [object Object] corruption
          if (content.includes('[object Object]')) {
              console.log(`  ⚠️  Repairing corrupted ${file}`);
              content = content.replace(/"\[object Object\]":\s*""/g, `"site_name": "${siteName}"`);
              changed = true;
          }

          // Replace placeholder in data
          if (content.includes('{{PROJECT_NAME}}')) {
             console.log(`  ✅ Replacing placeholder in ${file}`);
             content = content.replace(/{{PROJECT_NAME}}/g, siteName);
             changed = true;
          }

          if (changed) fs.writeFileSync(p, content);
        } catch (e) {
          console.error(`  ❌ Error processing ${file}: ${e.message}`);
        }
      }
    });
  }
}

async function main() {
  const sites = fs.readdirSync(SITES_DIR).filter(f => fs.statSync(path.join(SITES_DIR, f)).isDirectory());
  console.log(`🚀 Starting Bulk Project Name Fix for ${sites.length} sites...`);

  for (const site of sites) {
    await fixSite(site);
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);
