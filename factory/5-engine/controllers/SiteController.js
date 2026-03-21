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

    async updateFromInstruction(projectName, instruction) {
        const paths = this.dataManager.resolvePaths(projectName);
        const basisData = this.dataManager.loadJSON(path.join(paths.dataDir, 'basis.json')) || [];
        const settings = this.dataManager.loadJSON(path.join(paths.dataDir, 'site_settings.json')) || {};

        const context = {
            availableFiles: fs.existsSync(paths.dataDir) ? fs.readdirSync(paths.dataDir).filter(f => f.endsWith('.json')) : [],
            basisSample: basisData[0],
            settingsSample: Array.isArray(settings) ? settings[0] : settings
        };

        const aiResponse = await this.interpreter.interpretUpdate(instruction, context);
        for (const patch of aiResponse.patches) {
            this.dataManager.patchData(projectName, patch.file, patch.index, patch.key, patch.value);
        }

        if (aiResponse.syncRequired) {
            await this.dataManager.pushToSheet(projectName);
        }

        return {
            success: true,
            message: "Site succesvol bijgewerkt op basis van de instructie.",
            patches: aiResponse.patches,
            syncPerformed: aiResponse.syncRequired
        };
    }

    list() {
        const nativeSites = this._scanDir(this.sitesDir, true);
        const externalSites = this._scanDir(this.sitesExternalDir, false);
        return [...nativeSites, ...externalSites];
    }

    _scanDir(dir, isNative) {
        if (!dir || !fs.existsSync(dir)) return [];
        const sites = fs.readdirSync(dir).filter(f =>
            fs.statSync(path.join(dir, f)).isDirectory() && !f.startsWith('.') && f !== 'athena-cms'
        );

        return sites.map(site => {
            const sitePath = path.join(dir, site);
            let siteType = isNative ? 'basis' : 'static-legacy';
            let status = 'local';
            const hasPackageJson = fs.existsSync(path.join(sitePath, 'package.json'));
            let isInstalled = fs.existsSync(path.join(sitePath, 'node_modules'));

            // Override siteType if it's actually an app in the external folder
            if (!isNative && hasPackageJson) {
                siteType = 'vite-app';
            }

            const configPath = path.join(sitePath, 'athena-config.json');
            if (fs.existsSync(configPath)) {
                try {
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    if (config.siteType) siteType = config.siteType;
                    if (config.status) status = config.status;
                } catch (e) { }
            }

            let deployData = null;
            const deployPath = path.join(sitePath, 'project-settings', 'deployment.json');
            if (fs.existsSync(deployPath)) {
                try {
                    deployData = JSON.parse(fs.readFileSync(deployPath, 'utf8'));
                } catch (e) { }
            }

            const sitePort = this.getSitePort(site, sitePath);
            return {
                id: site,
                name: site,
                isNative,
                isExternal: !isNative,
                hasPackageJson,
                path: sitePath,
                port: sitePort,
                localUrl: `http://localhost:5000/previews/${site}/`,
                deployData,
                siteType,
                status,
                isInstalled
            };
        });
    }

    /**
     * Start/Get preview server for a site
     */
    async preview(id) {
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
        const activeProcesses = this.pm.listActive();

        // 1. Controleer of de site AL DRAAIT op deze poort
        if (activeProcesses[previewPort] && activeProcesses[previewPort].id === id) {
            console.log(`✅ Site '${id}' is already running on port ${previewPort}.`);
            return { success: true, status: 'ready', url: `http://localhost:${previewPort}/${id}/` };
        }

        // 2. STOP ALLE ANDERE PREVIEWS (om resources te besparen en poort vrij te maken)
        for (const port in activeProcesses) {
            if (activeProcesses[port].type === 'preview') {
                console.log(`🧹 Stopping previous preview on port ${port} ('${activeProcesses[port].id}')...`);
                await this.pm.stopProcessByPort(parseInt(port));
            }
        }

        // 3. Start de juiste server op basis van site type
        let siteType = 'basis';
        const configPath = path.join(siteDir, 'athena-config.json');
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
                console.error(`Fout bij starten preview ${id}:`, e.message);
                throw e;
            }
        }

        // 4. 🔱 v8.8.1 RACE CONDITION FIX: Wacht tot de server ECHT reageert op de poort
        console.log(`⏳ Waiting for ${id} to be reachable on port ${previewPort}...`);
        const isReachable = await this._waitForPort(previewPort, 30);
        
        if (!isReachable) {
            throw new Error(`Timeout: Site '${id}' start niet op binnen 30 seconden op poort ${previewPort}.`);
        }

        console.log(`✅ Site '${id}' is now reachable!`);

        // 🔱 v8.8.1 Native Preview: Geef de DIRECTE URL terug (poort 5100+)
        // Dit omzeilt proxy-complexiteit nu we zeker weten dat de server up is.
        return { success: true, status: 'ready', url: `http://localhost:${previewPort}/${id}/` };
    }

    /**
     * Helper to wait for a port to be reachable
     */
    async _waitForPort(port, timeoutSeconds) {
        const start = Date.now();
        const timeout = timeoutSeconds * 1000;
        
        while (Date.now() - start < timeout) {
            try {
                const response = await fetch(`http://127.0.0.1:${port}`, { 
                    method: 'GET',
                    signal: AbortSignal.timeout(500) // Korte timeout voor elke poging
                });
                // Als we een response krijgen (ongeacht de status), is de server up
                return true;
            } catch (e) {
                // Nog niet bereikbaar, even wachten
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        return false;
    }

    getSitePort(id, siteDir) {
        // Load from central registry if possible
        try {
            const registryPath = path.join(this.root, 'port-manager/registry.json');
            if (fs.existsSync(registryPath)) {
                const reg = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
                if (reg.services && reg.services[id]) return reg.services[id].port;
            }
        } catch (e) { }

        // Fallback: use legacy ports file
        const portsFile = path.join(this.root, 'factory/config/site-ports.json');
        if (fs.existsSync(portsFile)) {
            const ports = JSON.parse(fs.readFileSync(portsFile, 'utf8'));
            if (ports[id]) return ports[id];
        }

        // Default range 5100+
        return 5100;
    }

    async stopPreview(id) {
        const active = this.pm.listActive();
        for (const port in active) {
            if (active[port].id === id) {
                await this.pm.stopProcessByPort(parseInt(port));
                return { success: true };
            }
        }
        return { success: false, message: "Geen actieve preview gevonden voor deze site." };
    }

    async pullFromSheet(id) { return await this.dataManager.pullFromSheet(id); }
    async pullToTemp(id) { return await this.dataManager.pullToTemp(id); }
    async pushToSheet(id) { return await this.dataManager.pushToSheet(id); }
    async safePullFromGitHub(id) { return await this.execService.runSafePull(id); }
    async compareSiteSources(id) { return await this.dataManager.compareSources(id); }

    getSiteStructure(id) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);
        if (!fs.existsSync(siteDir)) throw new Error(`Site '${id}' niet gevonden.`);

        const urlSheetPath = path.join(siteDir, 'project-settings', 'url-sheet.json');
        let sheetUrl = null;

        if (fs.existsSync(urlSheetPath)) {
            try {
                const urlConfig = JSON.parse(fs.readFileSync(urlSheetPath, 'utf8'));
                // Use the first valid editUrl we find (usually site_settings or _system)
                const firstKey = Object.keys(urlConfig)[0];
                if (firstKey && urlConfig[firstKey].editUrl) {
                    sheetUrl = urlConfig[firstKey].editUrl.split('#')[0]; // Strip the #gid part
                }
            } catch (e) {
                console.error(`Fout bij laden van url-sheet.json voor ${id}:`, e.message);
            }
        }

        return {
            id,
            sheetUrl,
            hasUrlSheet: fs.existsSync(urlSheetPath)
        };
    }

    /**
     * Update a JSON data file for a specific site
     */
    updateData(id, { file, index, key, value, action }) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);
        if (!fs.existsSync(siteDir)) throw new Error(`Site '${id}' niet gevonden.`);

        const filePath = path.join(siteDir, 'src', 'data', `${file.toLowerCase()}.json`);
        if (!fs.existsSync(filePath)) throw new Error(`Tabel ${file} niet gevonden.`);

        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let updated = false;

        // Handle Add Action
        if (action === 'add' && Array.isArray(data)) {
            data.push({});
            updated = true;
        } 
        // Handle Delete Action
        else if (action === 'delete' && Array.isArray(data)) {
            if (index !== undefined && data[index]) {
                data.splice(index, 1);
                updated = true;
            }
        }
        // Handle Update Action
        else if (Array.isArray(data)) {
            if (index !== undefined && data[index]) {
                data[index][key] = value;
                updated = true;
            }
        } else if (data && typeof data === 'object') {
            // Support dot-notation (e.g. "hero.visible")
            if (key.includes('.')) {
                const [section, subkey] = key.split('.');
                if (data[section]) {
                    data[section][subkey] = value;
                    updated = true;
                }
            } else if (index !== null && index !== undefined && data[index]) {
                data[index][key] = value;
                updated = true;
            } else {
                data[key] = value;
                updated = true;
            }
        }

        if (updated) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            return { success: true };
        }
        throw new Error(`Geen wijziging kunnen doorvoeren in ${file} voor index/key ${index || key}`);
    }

    getStatus(name) {
        const sites = this.list();
        const site = sites.find(s => s.name === name);
        return site ? { status: site.status } : { status: 'unknown' };
    }

    async linkSheet(id, sheetUrl) {
        console.log(`🔗 Linking sheet for ${id}: ${sheetUrl}`);
        if (!sheetUrl) throw new Error("Geen Google Sheet URL opgegeven.");

        // Use the core sheet engine script to handle the linking logic
        return await this.execService.runEngineScript('core/sheet-engine.js', [id, sheetUrl]);
    }
}
