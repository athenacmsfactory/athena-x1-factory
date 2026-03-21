/**
 * SiteHealer.js
 * @description The surgical recovery unit of Athena Factory.
 * Automatically restores missing or corrupt data files based on blueprints.
 */

import fs from 'fs';
import path from 'path';

export class SiteHealer {
    constructor(configManager) {
        this.configManager = configManager;
        this.sitesDir = configManager.get('paths.sites');
        this.sitetypesDir = configManager.get('paths.sitetypes');
    }

    /**
     * Heal a specific site by comparing its data files to its blueprint.
     */
    async heal(siteName) {
        const sitePath = path.join(this.sitesDir, siteName);
        const configPath = path.join(sitePath, 'athena-config.json');
        
        if (!fs.existsSync(configPath)) {
            return { success: false, error: "athena-config.json missing. Cannot determine sitetype for healing." };
        }

        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const siteType = config.siteType;
            
            // Resolve blueprint
            const [track, typeName] = siteType.includes('/') ? siteType.split('/') : ['docked', siteType];
            const blueprintPath = path.join(this.sitetypesDir, track, typeName, 'blueprint', `${typeName}.json`);

            if (!fs.existsSync(blueprintPath)) {
                return { success: false, error: `Blueprint for ${siteType} not found at ${blueprintPath}` };
            }

            const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));
            const dataDir = path.join(sitePath, 'src/data');
            const results = { restored: [], repaired: [], fixedLinks: 0, errors: [] };

            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

            // 0. LINK RELATIVIZER PASS (Zenith Stability)
            try {
                const { AthenaDataManager } = await import('../lib/DataManager.js');
                const dataManager = new AthenaDataManager(this.configManager.get('paths.factory'));
                const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
                
                for (const file of files) {
                    const filePath = path.join(dataDir, file);
                    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    const fixedContent = dataManager.deepFixLinks(content);
                    
                    if (JSON.stringify(content) !== JSON.stringify(fixedContent)) {
                        fs.writeFileSync(filePath, JSON.stringify(fixedContent, null, 2));
                        results.fixedLinks++;
                    }
                }
            } catch (e) { console.warn("⚠️ Link Relativizer failed during heal:", e.message); }

            // 1. Check every table in the data structure
            for (const table of blueprint.data_structure || []) {
                const tableName = table.table_name;
                const filePath = path.join(dataDir, `${tableName}.json`);

                if (!fs.existsSync(filePath)) {
                    // RESTORE MISSING FILE
                    const defaultRow = {};
                    table.columns.forEach(col => defaultRow[col] = "");
                    fs.writeFileSync(filePath, JSON.stringify([defaultRow], null, 2));
                    results.restored.push(`${tableName}.json`);
                } else {
                    // REPAIR CORRUPT OR EMPTY FILE
                    try {
                        const content = fs.readFileSync(filePath, 'utf8').trim();
                        if (content === "" || content === "[]" || content === "[ ]") {
                            const defaultRow = {};
                            table.columns.forEach(col => defaultRow[col] = "");
                            fs.writeFileSync(filePath, JSON.stringify([defaultRow], null, 2));
                            results.repaired.push(`${tableName}.json (filled empty file)`);
                        } else {
                            JSON.parse(content); // Validate JSON
                        }
                    } catch (e) {
                        // File is corrupt JSON - backup and overwrite with empty valid structure
                        fs.renameSync(filePath, `${filePath}.corrupt.${Date.now()}`);
                        const defaultRow = {};
                        table.columns.forEach(col => defaultRow[col] = "");
                        fs.writeFileSync(filePath, JSON.stringify([defaultRow], null, 2));
                        results.repaired.push(`${tableName}.json (fixed corruption)`);
                    }
                }
            }

            return { 
                success: true, 
                message: `Heal operation completed for ${siteName}`,
                results: {
                    ...results,
                    assets: this.restoreMissingAssets(siteName)
                } 
            };

        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    /**
     * Restores critical missing assets from factory templates.
     */
    restoreMissingAssets(siteName) {
        const sitePath = path.join(this.sitesDir, siteName);
        const publicDir = path.join(sitePath, 'public');
        const factoryPublic = path.join(process.cwd(), 'athena-dashboard-ui/public'); // Fallback source
        
        const criticalAssets = [
            { name: 'site-logo.svg', source: 'athena-icon.svg' },
            { name: 'favicon.ico', source: 'favicon.ico' },
            { name: 'athena-icon.svg', source: 'athena-icon.svg' }
        ];

        const restored = [];

        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

        criticalAssets.forEach(asset => {
            const destPath = path.join(publicDir, asset.name);
            if (!fs.existsSync(destPath)) {
                const srcPath = path.join(factoryPublic, asset.source);
                if (fs.existsSync(srcPath)) {
                    fs.copyFileSync(srcPath, destPath);
                    restored.push(asset.name);
                }
            }
        });

        return restored;
    }
}
