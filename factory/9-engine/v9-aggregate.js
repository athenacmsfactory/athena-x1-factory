import fs from 'fs';
import path from 'path';

/**
 * 🧱 v9.0 Data Aggregator Bridge
 * Fixed for Athena Y1 Symlink Architecture.
 */
async function aggregate() {
  const projectName = process.argv[2];
  
  // Zoek de 'sites' map relatief aan de project root (factory/)
  const SITES_DIR = path.resolve(process.cwd(), '../sites');

  if (!projectName) {
    console.error('❌ Geef een projectnaam op.');
    process.exit(1);
  }

  const projectDir = path.join(SITES_DIR, projectName);
  const dataDir = path.join(projectDir, 'src/data');

  console.log(`🏗️  KDClaw: Aggregating data for [${projectName}]...`);
  console.log(`📂 Path: ${dataDir}`);

  if (!fs.existsSync(dataDir)) {
    console.error(`❌ Data map niet gevonden: ${dataDir}`);
    process.exit(1);
  }

  const aggregated = {};
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'all_data.json');

  files.forEach(file => {
    const key = file.replace('.json', '');
    try {
      const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
      aggregated[key] = JSON.parse(content);
    } catch (e) {
      console.warn(`⚠️ Fout bij parsen van ${file}: ${e.message}`);
    }
  });

  fs.writeFileSync(path.join(dataDir, 'all_data.json'), JSON.stringify(aggregated, null, 2));
  console.log(`✅ Succes: ${files.length} bestanden geaggregeerd in all_data.json`);
}

aggregate();
