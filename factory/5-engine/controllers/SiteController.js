/**
 * SiteController.js
 * @description Headless business logic for managing generated sites.
 */

import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { createProject, validateProjectName } from '../core/factory.js';
import { deployProject } from '../wizards/deploy-wizard.js';
import { AthenaDataManager } from '../lib/DataManager.js';
import { AthenaInterpreter } from '../core/interpreter.js';
import { InstallManager } from '../lib/InstallManager.js';

export class SiteController {
    constructor(configManager, executionService, processManager) {
        this.configManager = configManager;
        this.execService = executionService;
        this.pm = processManager;
        this.root = configManager.get('paths.root');
        this.sitesDir = configManager.get('paths.sites');
        this.sitesExternalDir = configManager.get('paths.sitesExternal');
        this.dataManager = new AthenaDataManager(configManager.get('paths.factory'));
        this.interpreter = new AthenaInterpreter(configManager);
        this.installManager = new InstallManager(this.root);
    }

    /**
     * Update a site based on a natural language instruction
     */
    async updateFromInstruction(projectName, instruction) {
        // 1. Haal de huidige data op voor context (beperkt voor AI token limits)
        const paths = this.dataManager.resolvePaths(projectName);
        const basisData = this.dataManager.loadJSON(path.join(paths.dataDir, 'basis.json')) || [];
        const settings = this.dataManager.loadJSON(path.join(paths.dataDir, 'site_settings.json')) || {};
        
        const context = {
            availableFiles: fs.existsSync(paths.dataDir) ? fs.readdirSync(paths.dataDir).filter(f => f.endsWith('.json')) : [],
            basisSample: basisData[0],
            settingsSample: Array.isArray(settings) ? settings[0] : settings
        };

        // 2. Laat de AI de instructie interpreteren
        console.log(`🤖 AI interpreteert instructie: "${instruction}"`);
        const aiResponse = await this.interpreter.interpretUpdate(instruction, context);
        
        // 3. Pas de patches toe
        for (const patch of aiResponse.patches) {
            this.dataManager.patchData(projectName, patch.file, patch.index, patch.key, patch.value);
        }

        // 4. Sync naar Google Sheet indien nodig (Sheets-First!)
        if (aiResponse.syncRequired) {
            console.log(`📡 Wijzigingen worden gesynchroniseerd naar de Google Sheet van ${projectName}...`);
            await this.dataManager.syncToSheet(projectName);
        }

        return {
            success: true,
            message: "Site succesvol bijgewerkt op basis van de instructie.",
            patches: aiResponse.patches,
            syncPerformed: aiResponse.syncRequired
        };
    }

    /**
     * List all generated sites with their current status
     */
    list() {
        const nativeSites = this._scanDir(this.sitesDir, true);
        const externalSites = this._scanDir(this.sitesExternalDir, false);
        return [...nativeSites, ...externalSites];
    }

    _scanDir(dir, isNative) {
        console.log(`🔍 Scanning ${isNative ? 'NATIVE' : 'EXTERNAL'} directory: ${dir}`);
        if (!dir || !fs.existsSync(dir)) {
            console.log(`⚠️  Directory does not exist: ${dir}`);
            return [];
        }
        const sites = fs.readdirSync(dir).filter(f => 
            fs.statSync(path.join(dir, f)).isDirectory() && !f.startsWith('.') && f !== 'athena-cms'
        );

        return sites.map(site => {
            const sitePath = path.join(dir, site);
            const deployFile = path.join(sitePath, 'project-settings', 'deployment.json');
            const sheetFile = path.join(sitePath, 'project-settings', 'url-sheet.json');

            let status = 'local';
            let deployData = null;
            let sheetData = null;
            let isDataEmpty = false;

            // Check if data exists
            const dataDir = path.join(sitePath, 'src', 'data');
            if (fs.existsSync(dataDir)) {
                const jsonFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'schema.json');
                if (jsonFiles.length > 0) {
                    let allEmpty = true;
                    for (const file of jsonFiles) {
                        if (fs.statSync(path.join(dataDir, file)).size > 5) {
                            allEmpty = false;
                            break;
                        }
                    }
                    isDataEmpty = allEmpty;
                } else {
                    isDataEmpty = true;
                }
            } else {
                isDataEmpty = true;
            }

            if (fs.existsSync(deployFile)) {
                deployData = JSON.parse(fs.readFileSync(deployFile, 'utf8'));
                status = deployData.status || 'deployed';
            }

            if (fs.existsSync(sheetFile)) {
                sheetData = JSON.parse(fs.readFileSync(sheetFile, 'utf8'));
            }

            // v9.2 Evolution Detection (Local LegoUtils OR v9- config)
            let isV9 = fs.existsSync(path.join(sitePath, 'src/lib/LegoUtils.jsx')) || 
                       fs.existsSync(path.join(sitePath, 'src/lib/LegoUtils.js'));
            
            if (!isV9) {
                const configPath = path.join(sitePath, 'athena-config.json');
                if (fs.existsSync(configPath)) {
                    try {
                        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                        if (config.siteType && config.siteType.startsWith('v9-')) {
                            isV9 = true;
                        }
                    } catch (e) { /* ignore config errors */ }
                }
            }

            const isInstalled = fs.existsSync(path.join(sitePath, 'node_modules'));

            return {
                id: site,
                name: site,
                path: sitePath,
                type: isNative ? 'native' : 'external',
                isNative, // <--- Explicit property for Dashboard filtering
                status: status,
                isDataEmpty,
                isV9, // <--- New flag for Evolution v9 sites
                isInstalled, // <--- Added for hydratation status
                deployData: deployData,
                sheetUrl: sheetData?.url || null,
                lastUpdate: deployData?.timestamp || deployData?.deployedAt || null
            };
        });
    }

    /**
     * Generate a new site from description
     */
    async create(name, description, options = {}) {
        if (!validateProjectName(name)) {
            throw new Error("Ongeldige projectnaam. Gebruik alleen kleine letters, cijfers en streepjes.");
        }

        const targetDir = path.join(this.sitesDir, name);
        if (fs.existsSync(targetDir)) {
            throw new Error(`Site '${name}' bestaat al.`);
        }

        console.log(`🏗️  Nieuwe site maken: ${name}...`);
        
        try {
            const result = await createProject(name, description, options);
            return { success: true, message: `Site '${name}' succesvol aangemaakt.`, path: targetDir };
        } catch (e) {
            console.error("❌ Creatie mislukt:", e.message);
            throw e;
        }
    }

    /**
     * Deploy a site to production (GitHub Pages)
     */
    async deploy(id) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);

        if (!fs.existsSync(siteDir)) throw new Error("Site niet gevonden.");

        console.log(`🚀 Site deployen: ${id}...`);
        try {
            const result = await deployProject(id, siteDir);
            return { success: true, message: `Site '${id}' succesvol gedeployd.`, url: result.url };
        } catch (e) {
            console.error("❌ Deployment mislukt:", e.message);
            throw e;
        }
    }

    /**
     * Save a new layout preset from an existing site's structure.
     */
    async saveAsPreset(id, { name, description }) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);

        const orderPath = path.join(siteDir, 'src', 'data', 'section_order.json');
        if (!fs.existsSync(orderPath)) throw new Error("Site heeft geen section_order.json.");

        const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
        const presetsPath = path.join(process.cwd(), 'config/layout-presets.json');
        
        let presetsData = { presets: [] };
        if (fs.existsSync(presetsPath)) {
            presetsData = JSON.parse(fs.readFileSync(presetsPath, 'utf8'));
        }

        const newPreset = {
            id: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            name: name,
            description: description || "Door gebruiker gedefinieerde layout.",
            order: order
        };

        presetsData.presets.push(newPreset);
        fs.writeFileSync(presetsPath, JSON.stringify(presetsData, null, 2));

        return { success: true, message: `Layout '${name}' opgeslagen als preset.`, preset: newPreset };
    }

    /**
     * Apply a predefined layout structure (preset) to a site.
     */
    async applyLayoutPreset(id, { presetId }) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);

        const presetsPath = path.join(process.cwd(), 'config/layout-presets.json');
        if (!fs.existsSync(presetsPath)) throw new Error("Presets niet gevonden.");

        const { presets } = JSON.parse(fs.readFileSync(presetsPath, 'utf8'));
        const preset = presets.find(p => p.id === presetId);
        if (!preset) throw new Error("Preset ongeldig.");

        const orderPath = path.join(siteDir, 'src', 'data', 'section_order.json');
        fs.writeFileSync(orderPath, JSON.stringify(preset.order, null, 2));

        // Use Healer to ensure all files in the new order exist
        const { SiteHealer } = await import('./SiteHealer.js');
        const healer = new SiteHealer(this.configManager);
        await healer.heal(id);

        return { success: true, message: `Preset '${preset.name}' toegepast.`, newOrder: preset.order };
    }

    /**
     * Duplicate an existing section (clones data and settings)
     */
    async duplicateSection(id, { sectionName, newSectionName }) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);

        const dataDir = path.join(siteDir, 'src', 'data');
        const orderPath = path.join(dataDir, 'section_order.json');

        if (!fs.existsSync(orderPath)) throw new Error("section_order.json niet gevonden.");

        // 1. Copy data file
        const sourcePath = path.join(dataDir, `${sectionName}.json`);
        const targetPath = path.join(dataDir, `${newSectionName}.json`);

        if (!fs.existsSync(sourcePath)) throw new Error(`Bron sectie ${sectionName} niet gevonden.`);
        if (fs.existsSync(targetPath)) throw new Error(`Doel sectie ${newSectionName} bestaat al.`);

        fs.copyFileSync(sourcePath, targetPath);

        // 2. Update order
        const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
        const index = order.indexOf(sectionName);
        if (index !== -1) {
            order.splice(index + 1, 0, newSectionName);
        } else {
            order.push(newSectionName);
        }
        fs.writeFileSync(orderPath, JSON.stringify(order, null, 2));

        return { success: true, message: `Sectie ${sectionName} gedupliceerd naar ${newSectionName}.` };
    }

    /**
     * Remove a section from a site
     */
    async removeSection(id, { sectionName }) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);

        const dataDir = path.join(siteDir, 'src', 'data');
        const orderPath = path.join(dataDir, 'section_order.json');

        if (!fs.existsSync(orderPath)) throw new Error("section_order.json niet gevonden.");

        // 1. Update order
        let order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
        order = order.filter(s => s !== sectionName);
        fs.writeFileSync(orderPath, JSON.stringify(order, null, 2));

        // 2. Remove data file
        const dataPath = path.join(dataDir, `${sectionName}.json`);
        if (fs.existsSync(dataPath)) {
            fs.unlinkSync(dataPath);
        }

        return { success: true, message: `Sectie ${sectionName} verwijderd.` };
    }

    /**
     * Get installation status (node_modules existence + active progress)
     */
    getStatus(name) {
        let siteDir = path.join(this.sitesDir, name);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, name);

        const nodeModules = path.join(siteDir, 'node_modules');
        const installInfo = this.installManager.getStatus(name);

        return {
            isInstalled: fs.existsSync(nodeModules),
            installStatus: installInfo.status,
            installLog: installInfo.logTail,
            isInstalling: installInfo.status === 'running'
        };
    }

    /**
     * Install dependencies for a site
     */
    async install(name) {
        let siteDir = path.join(this.sitesDir, name);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, name);

        if (!fs.existsSync(siteDir)) throw new Error("Site niet gevonden");

        return await this.installManager.install(name, siteDir);
    }

    /**
     * Start/Get preview server for a site
     */
    async preview(id, options = {}) {
        let siteDir = path.join(this.sitesDir, id);
        let isExternal = false;

        if (!fs.existsSync(siteDir)) {
            siteDir = path.join(this.sitesExternalDir, id);
            isExternal = true;
        }

        if (!fs.existsSync(siteDir)) throw new Error(`Site '${id}' niet gevonden.`);

        const hasPackageJson = fs.existsSync(path.join(siteDir, 'package.json'));

        // 🔱 v8.8 Intelligent Preview
        // Alleen ECHT statische sites (zonder package.json) via de API Hub direct serveren
        if (isExternal && !hasPackageJson) {
            console.log(`📂 Serving external static site ${id} via API static root`);
            return { success: true, status: 'ready', url: `http://localhost:5000/previews/${id}/` };
        }

        const previewPort = this.getSitePort(id, siteDir);

        // Check of proces al draait
        const active = this.pm.listActive();
        if (active[previewPort]) {
            console.log(`✅ Site '${id}' draait al op poort ${previewPort}.`);
            return { success: true, status: 'ready', url: `http://localhost:${previewPort}/${id}/` };
        }

        // Bepaal de start-methode
        const configPath = path.join(siteDir, 'athena-config.json');
        let siteType = 'react-vite';
        if (fs.existsSync(configPath)) {
            try { siteType = JSON.parse(fs.readFileSync(configPath, 'utf8')).siteType; } catch (e) { }
        }

        if (siteType === 'static-legacy') {
            console.log(`📦 Starting light server (sirv) for static site ${id} on port ${previewPort}...`);
            await this.pm.startProcess(id, 'preview', previewPort, 'sirv', [siteDir, '--port', previewPort.toString(), '--host', '--dev', '--single'], { cwd: siteDir });
        } else {
            console.log(`🚀 Starting Vite preview for ${id} on port ${previewPort}...`);
            try {
                await this.pm.startProcess(id, 'preview', previewPort, 'pnpm', ['dev', '--port', previewPort.toString(), '--host'], { cwd: siteDir });
            } catch (e) {
                // Fallback voor sites zonder pnpm scripts?
                await this.pm.startProcess(id, 'preview', previewPort, 'npx', ['vite', '--port', previewPort.toString(), '--host'], { cwd: siteDir });
            }
        }

        // Wachten tot poort bereikbaar is
        console.log(`⏳ Wachten tot ${id} bereikbaar is op poort ${previewPort}...`);
        let ready = false;
        for (let i = 0; i < 15; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            try {
                const { execSync } = await import('child_process');
                execSync(`nc -z localhost ${previewPort}`);
                ready = true;
                break;
            } catch (e) {}
        }

        if (ready) {
            console.log(`✅ Site '${id}' is nu bereikbaar!`);
            return { success: true, status: 'ready', url: `http://localhost:${previewPort}/${id}/` };
        } else {
            return { success: true, status: 'starting', url: `http://localhost:${previewPort}/${id}/` };
        }
    }

    /**
     * Bepaalt poort voor een site (of haalt op uit register)
     */
    getSitePort(id, siteDir) {
        const portsPath = path.join(this.root, 'factory/config/site-ports.json');
        let ports = {};
        if (fs.existsSync(portsPath)) {
            ports = JSON.parse(fs.readFileSync(portsPath, 'utf8'));
        }

        if (ports[id]) return ports[id];

        // Nieuwe poort toewijzen (vanaf 5100)
        const usedPorts = Object.values(ports);
        let nextPort = 5100;
        while (usedPorts.includes(nextPort)) nextPort++;

        ports[id] = nextPort;
        fs.writeFileSync(portsPath, JSON.stringify(ports, null, 2));
        return nextPort;
    }

    /**
     * Stop preview server
     */
    async stopPreview(id) {
        const active = this.pm.listActive();
        for (const port in active) {
            if (active[port].id === id && active[port].type === 'preview') {
                await this.pm.stopProcessByPort(parseInt(port));
                return { success: true, message: `Site ${id} gestopt.` };
            }
        }
        return { success: false, message: "Geen actief proces gevonden." };
    }

    /**
     * Create a new athenified version of an external site
     */
    async athenifySite(id) {
        const sourceDir = path.join(this.sitesExternalDir, id);
        if (!fs.existsSync(sourceDir)) throw new Error("Bron site niet gevonden in external.");

        const newName = `${id}-ath`;
        const targetDir = path.join(this.sitesDir, newName);

        if (fs.existsSync(targetDir)) {
            console.log(`⚠️ Overwriting existing target directory: ${targetDir}`);
            execSync(`rm -rf "${targetDir}"`);
        }

        console.log(`✨ Athenifying ${id} to ${newName}...`);
        
        try {
            // 1. Maak kopie (zonder node_modules)
            execSync(`mkdir -p "${targetDir}"`);
            execSync(`rsync -av --exclude 'node_modules' --exclude '.git' "${sourceDir}/" "${targetDir}/"`);

            // 2. Update/Create athena-config.json
            const config = {
                projectName: newName,
                safeName: newName,
                siteType: 'athenified-legacy',
                sourceLegacy: id,
                athenifiedAt: new Date().toISOString()
            };
            fs.writeFileSync(path.join(targetDir, 'athena-config.json'), JSON.stringify(config, null, 2));

            // 3. Run Athenafier engine script
            await this.execService.runEngineScript('athenafier.js', [newName]);

            return { success: true, newName };
        } catch (e) {
            console.error("❌ Athenify failed:", e.message);
            return { success: false, error: e.message };
        }
    }

    /**
     * Get all site templates
     */
    getTemplates() {
        const templatesDir = path.join(this.root, 'factory/2-templates');
        if (!fs.existsSync(templatesDir)) return [];
        return fs.readdirSync(templatesDir).filter(f => 
            fs.statSync(path.join(templatesDir, f)).isDirectory() && !f.startsWith('.')
        );
    }

    /**
     * Run a maintenance script (e.g. sync-deployment-status)
     */
    runScript(script, args) {
        return this.execService.runEngineScript(script, args);
    }

    /**
     * Get site structure (athena-config.json and sheet info)
     */
    getSiteStructure(id) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);
        if (!fs.existsSync(siteDir)) throw new Error("Site niet gevonden.");

        const configPath = path.join(siteDir, 'athena-config.json');
        const sheetPath = path.join(siteDir, 'project-settings', 'url-sheet.json');

        const structure = {
            name: id,
            config: fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {},
            sheetUrl: null
        };

        if (fs.existsSync(sheetPath)) {
            const sheetData = JSON.parse(fs.readFileSync(sheetPath, 'utf8'));
            structure.sheetUrl = sheetData.url;
        }

        return structure;
    }

    /**
     * Link a Google Sheet to a site
     */
    async linkSheet(id, sheetUrl) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);
        if (!fs.existsSync(siteDir)) throw new Error("Site niet gevonden.");

        const projectSettingsDir = path.join(siteDir, 'project-settings');
        if (!fs.existsSync(projectSettingsDir)) fs.mkdirSync(projectSettingsDir, { recursive: true });

        const sheetPath = path.join(projectSettingsDir, 'url-sheet.json');
        const sheetData = { url: sheetUrl, updatedAt: new Date().toISOString() };
        
        fs.writeFileSync(sheetPath, JSON.stringify(sheetData, null, 2));
        return { success: true, sheetUrl };
    }

    /**
     * Pull data from Google Sheet
     */
    async pullFromSheet(id) {
        return this.execService.runEngineScript('sync-sheet-to-json.js', [id]);
    }

    /**
     * Push data to Google Sheet
     */
    async syncToSheet(id) {
        return this.execService.runEngineScript('sync-json-to-sheet.js', [id]);
    }

    /**
     * Auto-provision a Google Sheet
     */
    async autoProvision(id) {
        return this.execService.runEngineScript('auto-sheet-provisioner.js', [id]);
    }

    /**
     * Move a site from Werkplaats to Vault
     */
    async park(id) {
        const source = path.join(this.sitesDir, id);
        const target = path.join(this.sitesExternalDir, id);

        if (!fs.existsSync(source)) throw new Error(`Site '${id}' niet gevonden in Werkplaats.`);
        
        // Ensure vault exists
        if (!fs.existsSync(this.sitesExternalDir)) {
            fs.mkdirSync(this.sitesExternalDir, { recursive: true });
        }

        if (fs.existsSync(target)) {
            // Backup existing if duplicate
            const backup = path.join(this.sitesExternalDir, `${id}_backup_${Date.now()}`);
            console.log(`⚠️  Target already exists in Vault. Backing up existing to: ${backup}`);
            fs.renameSync(target, backup);
        }

        console.log(`📦 Parking ${id} to Vault...`);
        fs.renameSync(source, target);
        
        // Update registry
        await this.execService.runEngineScript('sync-sites-registry.js', []);
        return { success: true, message: `Site '${id}' succesvol geparkeerd in de Vault.` };
    }

    /**
     * Move a site from Vault to Werkplaats
     */
    async unpark(id) {
        const source = path.join(this.sitesExternalDir, id);
        const target = path.join(this.sitesDir, id);

        if (!fs.existsSync(source)) throw new Error(`Site '${id}' niet gevonden in Vault.`);
        
        // Ensure sitesDir exists
        if (!fs.existsSync(this.sitesDir)) {
            fs.mkdirSync(this.sitesDir, { recursive: true });
        }

        if (fs.existsSync(target)) {
            throw new Error(`Site '${id}' bestaat al in de Werkplaats. Verwijder deze eerst of hernoem hem.`);
        }

        console.log(`🛠️  Unparking ${id} to Werkplaats...`);
        fs.renameSync(source, target);

        // Update registry
        await this.execService.runEngineScript('sync-sites-registry.js', []);
        return { success: true, message: `Site '${id}' is weer actief in de Werkplaats.` };
    }
}
