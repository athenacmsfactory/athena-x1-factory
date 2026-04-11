/**
 * storage-prune.js
 * @description Cleans up storage by dehydrating sites that should be dormant and removing old temp data.
 */

import { AthenaConfigManager } from '../5-engine/lib/ConfigManager.js';
import { DoctorController } from '../5-engine/controllers/DoctorController.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../..');

const config = new AthenaConfigManager(root);
const doctor = new DoctorController(config);

async function run() {
    console.log("🧹 Start Storage Prune...");
    
    // 1. Audit sites
    const report = doctor.audit();
    let dehydratedCount = 0;
    
    for (const r of report) {
        // We only prune sites that are specifically set to 'dormant' but are still 'hydrated'
        if (r.policy === 'dormant' && r.hydration === 'hydrated') {
            const result = doctor.dehydrate(r.site);
            if (result.success) {
                console.log(`✅ ${r.site} op 'dormant' gezet (vrijgemaakt).`);
                dehydratedCount++;
            }
        }
    }
    
    // 2. Cleanup Temp Data
    const tempResult = await doctor.cleanupTempData();
    console.log(tempResult.message);
    
    // 3. Global PNPM Prune
    const pnpmResult = doctor.prunePnpmStore();
    console.log(pnpmResult.message);
    
    console.log(`\n✨ Prune afgerond. ${dehydratedCount} sites gedehydrateerd.`);
    return { success: true, dehydratedCount };
}

run().catch(console.error);
