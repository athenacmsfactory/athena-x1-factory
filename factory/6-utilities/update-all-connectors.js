import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve(process.cwd(), '..');
const SITES_DIR = path.join(ROOT_DIR, 'sites');
const EXTERNAL_SITES_DIR = path.join(ROOT_DIR, 'sites-external');
const MASTER_CONNECTOR_PATH = path.join(ROOT_DIR, 'factory/5-engine/dock-connector.js');

async function updateAllConnectors() {
  if (!fs.existsSync(MASTER_CONNECTOR_PATH)) {
    console.error(`❌ Master connector niet gevonden op: ${MASTER_CONNECTOR_PATH}`);
    process.exit(1);
  }

  const masterContent = fs.readFileSync(MASTER_CONNECTOR_PATH, 'utf8');
  console.log(`🚀 Start met het uitrollen van de Master dock-connector.js (v8.8)...`);

  const processDir = (dir) => {
    if (!fs.existsSync(dir)) return;
    const sites = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory());

    for (const site of sites) {
      let updated = false;
      const possiblePaths = [
        path.join(dir, site, 'public', 'dock-connector.js'),
        path.join(dir, site, 'src', 'dock-connector.js'),
        path.join(dir, site, 'src', 'dock-connector.jsx')
      ];

      for (const connectorPath of possiblePaths) {
        if (fs.existsSync(connectorPath)) {
          fs.writeFileSync(connectorPath, masterContent, 'utf8');
          updated = true;
        }
      }
      
      if (updated) {
         console.log(`✅ ${site}: dock-connector geüpgraded.`);
      }
    }
  };

  processDir(SITES_DIR);
  processDir(EXTERNAL_SITES_DIR);

  console.log("✨ Alle connectors zijn succesvol gesynchroniseerd met de master versie!");
}

updateAllConnectors();
