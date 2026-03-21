/**
 * BuildController.js
 * @description Manages production builds for Athena sites.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export class BuildController {
    constructor(configManager, executionService) {
        this.configManager = configManager;
        this.execService = executionService;
        this.sitesDir = configManager.get('paths.sites');
    }

    /**
     * Build a specific site
     */
    async build(siteName) {
        const sitePath = path.join(this.sitesDir, siteName);
        if (!fs.existsSync(sitePath)) throw new Error(`Site ${siteName} niet gevonden.`);

        console.log(`🏗️ Building site: ${siteName}...`);
        
        try {
            // We use pnpm build. If node_modules are missing, pnpm will fail,
            // so we should check for that or run install first.
            if (!fs.existsSync(path.join(sitePath, 'node_modules'))) {
                console.log(`💧 node_modules missing for ${siteName}, installing first...`);
                execSync('pnpm install --no-frozen-lockfile', { cwd: sitePath, stdio: 'inherit' });
            }

            const output = execSync('pnpm build', { cwd: sitePath }).toString();
            return { success: true, message: `Build van ${siteName} voltooid.`, output };
        } catch (e) {
            console.error(`❌ Build failed for ${siteName}:`, e.message);
            return { success: false, error: e.message };
        }
    }

    /**
     * Build multiple sites in sequence
     */
    async batchBuild(siteNames) {
        const results = [];
        for (const site of siteNames) {
            results.push(await this.build(site));
        }
        return results;
    }
}
