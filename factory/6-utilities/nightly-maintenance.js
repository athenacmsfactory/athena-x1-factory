/**
 * nightly-maintenance.js
 * @description Orchestrates various maintenance tasks like storage pruning, registry rebuilding, and log rotation.
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const utilDir = __dirname;

async function run() {
    console.log("🌙 Nightly Maintenance gestart...");
    
    try {
        console.log("\n1/3: Storage Pruning...");
        execSync(`node ${path.join(utilDir, 'storage-prune.js')}`, { stdio: 'inherit' });

        console.log("\n2/3: Rebuilding Site Registry...");
        // If rebuild-registry exists, run it. Otherwise skip.
        try {
            execSync(`node ${path.join(utilDir, 'rebuild-registry.js')}`, { stdio: 'inherit' });
        } catch (e) {
            console.log("⚠️ Rebuild Registry script niet gevonden, overgeslagen.");
        }

        console.log("\n3/3: Rotating Logs...");
        try {
            execSync(`node ${path.join(utilDir, 'rotate-logs.js')}`, { stdio: 'inherit' });
        } catch (e) {
            console.log("⚠️ Rotate Logs script niet gevonden, overgeslagen.");
        }

        console.log("\n✨ Nightly Maintenance succesvol afgerond.");
        return { success: true };
    } catch (e) {
        console.error("❌ Fout tijdens maintenance:", e.message);
        return { success: false, error: e.message };
    }
}

run().catch(console.error);
