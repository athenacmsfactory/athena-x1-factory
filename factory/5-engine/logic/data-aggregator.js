import fs from 'fs';
import path from 'path';

/**
 * 🔗 Athena Data Aggregator (v2.0 - MPA Support)
 * Merges all individual JSON files into a single all_data.json for optimized loading.
 * Supports nested page structures for Multi-Page Applications.
 */
export class DataAggregator {
    static aggregate(projectDir) {
        const dataDir = path.join(projectDir, 'src/data');
        if (!fs.existsSync(dataDir)) return null;

        const aggregated = {};

        // 1. Root Level Data
        const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'all_data.json');
        files.forEach(file => {
            const key = file.replace('.json', '');
            try {
                aggregated[key] = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
            } catch (e) {
                console.warn(`⚠️ [DataAggregator] Failed to parse ${file}: ${e.message}`);
            }
        });

        // 2. Nested Pages Data (MPA Support)
        const pagesDir = path.join(dataDir, 'pages');
        if (fs.existsSync(pagesDir)) {
            aggregated._pages = {};
            const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.json'));
            pageFiles.forEach(file => {
                const key = file.replace('.json', '');
                try {
                    aggregated._pages[key] = JSON.parse(fs.readFileSync(path.join(pagesDir, file), 'utf8'));
                } catch (e) {
                    console.warn(`⚠️ [DataAggregator] Failed to parse page ${file}: ${e.message}`);
                }
            });
        }

        const outputPath = path.join(dataDir, 'all_data.json');
        fs.writeFileSync(outputPath, JSON.stringify(aggregated, null, 2));
        console.log(`✅ [DataAggregator] Consolidated data for ${files.length} tables and ${Object.keys(aggregated._pages || {}).length} pages.`);
        
        return aggregated;
    }
}
