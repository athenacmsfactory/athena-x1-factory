import fs from 'fs';
import path from 'path';

/**
 * Athena Data Aggregator (v8.1)
 * Combines all individual section JSON files into a single all_data.json
 * for high-performance site loading.
 */
export function aggregateAllData(sitePath) {
    try {
        const possibleDirs = [
            path.join(sitePath, 'src/data'),
            path.join(sitePath, 'data')
        ];
        
        let dataDir = null;
        for (const dir of possibleDirs) {
            if (fs.existsSync(dir)) {
                dataDir = dir;
                break;
            }
        }

        if (!dataDir) {
            console.warn(`[Aggregator] ⚠️ Data directory not found in ${sitePath}`);
            return false;
        }

        const allData = {};
        const dataFiles = fs.readdirSync(dataDir).filter(f => 
            f.endsWith('.json') && 
            f !== 'all_data.json' && 
            f !== 'all_data_showcase.json' &&
            !f.startsWith('.')
        );

        for (const file of dataFiles) {
            const key = file.replace('.json', '');
            const filePath = path.join(dataDir, file);
            try {
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                allData[key] = content;
            } catch (e) {
                console.error(`[Aggregator] ❌ Error parsing ${file}:`, e.message);
            }
        }

        const outputPath = path.join(dataDir, 'all_data.json');
        fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
        console.log(`[Aggregator] ✨ Successfully aggregated ${dataFiles.length} files into all_data.json`);
        return true;
    } catch (err) {
        console.error(`[Aggregator] 🛑 Critical Error:`, err.message);
        return false;
    }
}

/**
 * CLI support: node data-aggregator.js [site-path]
 */
const currentFile = import.meta.url;
const isMain = process.argv[1] && (currentFile.includes(process.argv[1]) || process.argv[1].endsWith('data-aggregator.js'));

if (isMain) {
    const target = process.argv[2];
    if (target) {
        aggregateAllData(path.resolve(process.cwd(), target));
    } else {
        console.log("Usage: node data-aggregator.js <site_path>");
    }
}
