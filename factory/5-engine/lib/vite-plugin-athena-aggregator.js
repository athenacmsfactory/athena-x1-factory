import { DataAggregator } from '../logic/data-aggregator.js';
import path from 'path';

/**
 * 🔄 Athena Data Aggregator Vite Plugin
 * Automatically rebuilds all_data.json whenever a JSON file in src/data changes.
 */
export default function athenaAggregatorPlugin() {
    return {
        name: 'vite-plugin-athena-aggregator',
        handleHotUpdate({ file, server }) {
            if (file.endsWith('.json') && file.includes('/src/data/') && !file.endsWith('all_data.json')) {
                console.log(`\n🔄 [Athena Aggregator] Change detected in ${path.basename(file)}. Rebuilding all_data.json...`);
                try {
                    const projectRoot = server.config.root;
                    DataAggregator.aggregate(projectRoot);
                    
                    // Optional: trigger a full reload or just let HMR handle it
                    // server.ws.send({ type: 'full-reload' });
                } catch (err) {
                    console.error(`❌ [Athena Aggregator] Failed: ${err.message}`);
                }
            }
        },
        configureServer(server) {
            // Initial aggregation on startup to ensure all_data.json exists
            const projectRoot = server.config.root;
            console.log(`🚀 [Athena Aggregator] Initializing for ${projectRoot}`);
            DataAggregator.aggregate(projectRoot);
        }
    };
}
