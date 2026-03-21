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
        if (!dir || !fs.existsSync(dir)) return [];
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
                } else isDataEmpty = true;
            } else isDataEmpty = true;

            if (fs.existsSync(deployFile)) {
                try {
                    deployData = JSON.parse(fs.readFileSync(deployFile, 'utf8'));
                    status = deployData.status || 'live';

                    // Fallback for missing liveUrl/repoUrl if status is live
                    if (status === 'live' && !deployData.liveUrl) {
                        const githubUser = process.env.GITHUB_USER || this.configManager.get('GITHUB_USER');
                        const githubOrg = process.env.GITHUB_ORG || this.configManager.get('GITHUB_ORG');
                        const owner = githubOrg || githubUser || 'athena-cms-factory';
                        deployData.liveUrl = `https://${owner}.github.io/${site}/`;
                        if (!deployData.repoUrl) deployData.repoUrl = `https://github.com/${owner}/${site}`;
                    }
                } catch (e) {
                    console.error(`Error parsing deployment for ${site}:`, e.message);
                }
            }

            if (fs.existsSync(sheetFile)) {
                try {
                    const json = JSON.parse(fs.readFileSync(sheetFile, 'utf8'));
                    const firstKey = Object.keys(json)[0];
                    if (firstKey) sheetData = json[firstKey].editUrl;
                } catch (e) {}
            }

            // Get SiteType from athena-config.json
            let siteType = null;
            const configPath = path.join(sitePath, 'athena-config.json');
            if (fs.existsSync(configPath)) {
                try {
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    siteType = config.siteType;
                } catch (e) { }
            }

            const isInstalled = fs.existsSync(path.join(sitePath, 'node_modules'));
            const port = this.getSitePort(site, sitePath);

            return { name: site, status, deployData, sheetUrl: sheetData, isDataEmpty, siteType, isInstalled, port, isNative };
        });
    }

    /**
     * Generate a new site from blueprint and source project
     */
    async create(params) {
        const { projectName, sourceProject, siteType, layoutName, styleName, siteModel, autoSheet, clientEmail } = params;
        const config = {
            projectName: validateProjectName(projectName),
            sourceProject: sourceProject ? validateProjectName(sourceProject) : undefined,
            siteType,
            layoutName,
            styleName,
            siteModel: siteModel || 'SPA',
            autoSheet: autoSheet === true || autoSheet === 'true',
            clientEmail,
            blueprintFile: path.join(siteType, 'blueprint', `${siteType}.json`)
        };
        await createProject(config);
        return { success: true, message: `Project ${config.projectName} created!` };
    }

    /**
     * Get the full structure and data of a site for the Dock
     */
    getSiteStructure(id) {
        // Try native first, then external
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);
        
        const dataDir = path.join(siteDir, 'src/data');
        const data = {};

        if (fs.existsSync(dataDir)) {
            const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
            files.forEach(file => {
                const name = file.replace('.json', '');
                try {
                    const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
                    data[name] = content;
                } catch (e) {
                    console.error(`Error loading ${file}:`, e.message);
                }
            });
        }

        // Return combined structure
        return {
            id,
            data,
            url: this.getSiteUrl(id, siteDir)
        };
    }

    getSiteUrl(id, siteDir) {
        const port = this.getSitePort(id, siteDir);
        return `http://localhost:${port}/${id}/`;
    }

    /**
     * Directly update a data field in a site's JSON
     */
    updateData(id, { table, rowId, field, value }) {
        // Find site dir
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);

        const filePath = path.join(siteDir, 'src', 'data', `${table.toLowerCase()}.json`);
        if (!fs.existsSync(filePath)) throw new Error(`Tabel ${table} niet gevonden.`);

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let updated = false;

        if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].id == rowId || data[i].uuid == rowId || i == rowId) {
                    data[i][field] = value;
                    updated = true;
                    break;
                }
            }
        } else if (data && typeof data === 'object') {
            // Support object-based tables (like section_settings.json)
            if (rowId && data[rowId]) {
                data[rowId][field] = value;
                updated = true;
            } else if (!rowId) {
                // Direct update for simple config objects
                data[field] = value;
                updated = true;
            }
        }

        if (updated) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            return { success: true };
        }
        throw new Error(`Rij of key "${rowId}" niet gevonden in ${table}.`);
    }

    /**
     * Update settings for a specific section (e.g. visibility, background color, layout)
     */
    updateSectionSettings(id, { section, settings }) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);

        const dataDir = path.join(siteDir, 'src', 'data');

        // 1. Handle Section Settings (Visuals)
        const sectionSettingsPath = path.join(dataDir, 'section_settings.json');
        let sectionData = fs.existsSync(sectionSettingsPath) ? JSON.parse(fs.readFileSync(sectionSettingsPath, 'utf8')) : {};
        
        // Extract layout if present
        const { layout, ...visualSettings } = settings;

        sectionData[section] = {
            ...(sectionData[section] || {}),
            ...visualSettings
        };
        fs.writeFileSync(sectionSettingsPath, JSON.stringify(sectionData, null, 2));

        // 2. Handle Layout Settings (Structural)
        if (layout) {
            const layoutPath = path.join(dataDir, 'layout_settings.json');
            let layoutData = fs.existsSync(layoutPath) ? JSON.parse(fs.readFileSync(layoutPath, 'utf8')) : {};
            layoutData[section] = layout;
            fs.writeFileSync(layoutPath, JSON.stringify(layoutData, null, 2));
        }

        return { success: true, message: `Instellingen voor ${section} bijgewerkt.` };
    }

    /**
     * Add a new section to the site's layout and data
     */
    addSection(id, { sectionId }) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);

        const orderPath = path.join(siteDir, 'src', 'data', 'section_order.json');
        const dataDir = path.join(siteDir, 'src', 'data');

        if (!fs.existsSync(orderPath)) throw new Error("section_order.json niet gevonden.");

        // 1. Update order
        const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
        const newSectionName = `${sectionId}_${Date.now().toString().slice(-4)}`;
        order.push(newSectionName);
        fs.writeFileSync(orderPath, JSON.stringify(order, null, 2));

        // 2. Create default data for the section
        // We could fetch fields from SECTION_LIBRARY.json here
        const libraryPath = path.join(process.cwd(), 'output/SECTION_LIBRARY.json');
        let defaultData = [{}];
        
        if (fs.existsSync(libraryPath)) {
            const library = JSON.parse(fs.readFileSync(libraryPath, 'utf8'));
            const sectionTemplate = library.sections.find(s => s.id === sectionId);
            if (sectionTemplate) {
                const row = {};
                sectionTemplate.fields.forEach(f => row[f] = `Nieuwe ${f}`);
                defaultData = [row];
            }
        }

        fs.writeFileSync(path.join(dataDir, `${newSectionName}.json`), JSON.stringify(defaultData, null, 2));

        return { success: true, message: `Sectie ${newSectionName} toegevoegd.`, sectionName: newSectionName };
    }

    /**
     * Update the core configuration of a site (athena-config.json)
     */
    updateConfig(id, newConfig) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);

        const configPath = path.join(siteDir, 'athena-config.json');
        if (!fs.existsSync(configPath)) throw new Error("athena-config.json niet gevonden.");

        const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const updatedConfig = { ...currentConfig, ...newConfig };

        fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
        
        // Also trigger a rebuild to apply structural changes (like footer swap)
        console.log(`🔄 Config updated for ${id}. Structural changes may require a rebuild.`);
        
        return { success: true, message: "Configuratie bijgewerkt.", config: updatedConfig };
    }

    /**
     * Update display configuration for a section (field visibility)
     */
    updateDisplayConfig(id, { section, config }) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);

        const filePath = path.join(siteDir, 'src', 'data', 'display_config.json');
        let displayData = {};
        
        if (fs.existsSync(filePath)) {
            displayData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        displayData[section] = {
            ...(displayData[section] || {}),
            ...config
        };

        fs.writeFileSync(filePath, JSON.stringify(displayData, null, 2));
        return { success: true, message: `Display config voor ${section} bijgewerkt.` };
    }

    /**
     * Save the current site's styling as a new reusable preset.
     */
    saveStylePreset(id, { name }) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);

        const stylePath = path.join(siteDir, 'src', 'data', 'style_config.json');
        if (!fs.existsSync(stylePath)) throw new Error("style_config.json niet gevonden.");

        const currentStyle = JSON.parse(fs.readFileSync(stylePath, 'utf8'));
        const presetsPath = path.join(process.cwd(), 'config/style-presets.json');
        
        let presetsData = { presets: [] };
        if (fs.existsSync(presetsPath)) {
            presetsData = JSON.parse(fs.readFileSync(presetsPath, 'utf8'));
        }

        const newPreset = {
            id: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            name: name,
            colors: { ...currentStyle }
        };

        presetsData.presets.push(newPreset);
        fs.writeFileSync(presetsPath, JSON.stringify(presetsData, null, 2));

        return { success: true, message: `Stijl '${name}' opgeslagen als preset.`, preset: newPreset };
    }

    /**
     * Save the current site's layout as a new reusable preset.
     */
    saveLayoutPreset(id, { name, description }) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);

        const orderPath = path.join(siteDir, 'src', 'data', 'section_order.json');
        if (!fs.existsSync(orderPath)) throw new Error("section_order.json niet gevonden.");

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
    duplicateSection(id, { sectionName }) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);

        const orderPath = path.join(siteDir, 'src', 'data', 'section_order.json');
        const dataDir = path.join(siteDir, 'src', 'data');

        if (!fs.existsSync(orderPath)) throw new Error("section_order.json niet gevonden.");

        const newSectionName = `${sectionName}_copy_${Date.now().toString().slice(-4)}`;

        // 1. Clone data file
        const oldDataPath = path.join(dataDir, `${sectionName}.json`);
        const newDataPath = path.join(dataDir, `${newSectionName}.json`);
        if (fs.existsSync(oldDataPath)) {
            fs.copyFileSync(oldDataPath, newDataPath);
        }

        // 2. Clone settings
        const settingsPath = path.join(dataDir, 'section_settings.json');
        if (fs.existsSync(settingsPath)) {
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            if (settings[sectionName]) {
                settings[newSectionName] = { ...settings[sectionName] };
                fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
            }
        }

        // 3. Clone display config
        const displayPath = path.join(dataDir, 'display_config.json');
        if (fs.existsSync(displayPath)) {
            const display = JSON.parse(fs.readFileSync(displayPath, 'utf8'));
            if (display[sectionName]) {
                display[newSectionName] = { ...display[sectionName] };
                fs.writeFileSync(displayPath, JSON.stringify(display, null, 2));
            }
        }

        // 4. Update order (insert after original)
        const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
        const index = order.indexOf(sectionName);
        if (index !== -1) {
            order.splice(index + 1, 0, newSectionName);
        } else {
            order.push(newSectionName);
        }
        fs.writeFileSync(orderPath, JSON.stringify(order, null, 2));

        return { success: true, message: `Sectie ${sectionName} gedupliceerd naar ${newSectionName}.`, newSectionName };
    }

    /**
     * Rename a section (updates file and section_order.json)
     */
    renameSection(id, { oldName, newName }) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);

        const orderPath = path.join(siteDir, 'src', 'data', 'section_order.json');
        const dataDir = path.join(siteDir, 'src', 'data');

        if (!fs.existsSync(orderPath)) throw new Error("section_order.json niet gevonden.");

        const safeNewName = newName.toLowerCase().replace(/[^a-z0-9]/g, '_');

        // 1. Update order
        const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
        const newOrder = order.map(s => s === oldName ? safeNewName : s);
        fs.writeFileSync(orderPath, JSON.stringify(newOrder, null, 2));

        // 2. Rename data file
        const oldDataPath = path.join(dataDir, `${oldName}.json`);
        const newDataPath = path.join(dataDir, `${safeNewName}.json`);
        if (fs.existsSync(oldDataPath)) {
            fs.renameSync(oldDataPath, newDataPath);
        }

        // 3. Update settings if exists
        const settingsPath = path.join(dataDir, 'section_settings.json');
        if (fs.existsSync(settingsPath)) {
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            if (settings[oldName]) {
                settings[safeNewName] = settings[oldName];
                delete settings[oldName];
                fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
            }
        }

        return { success: true, message: `Sectie hernoemd van ${oldName} naar ${safeNewName}.`, newName: safeNewName };
    }

    /**
     * Delete a section from the site's layout and data
     */
    deleteSection(id, { sectionName }) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);

        const orderPath = path.join(siteDir, 'src', 'data', 'section_order.json');
        const dataDir = path.join(siteDir, 'src', 'data');

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

    /**
     * Create a new athenified version of an external site
     */
    async athenifySite(id) {
        const sourceDir = path.join(this.sitesExternalDir, id);
        if (!fs.existsSync(sourceDir)) throw new Error("Bron site niet gevonden in external.");

        const newName = `${id}-ath`;
        const targetDir = path.join(this.sitesDir, newName);

        if (fs.existsSync(targetDir)) throw new Error(`Doelmap '${newName}' bestaat al.`);

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
     * Helper to get site port (duplicated from ServerController for autonomy)
     */
    getSitePort(siteId, siteDir) {
        const registryPath = path.join(this.configManager.get('paths.factory'), 'config/site-ports.json');
        if (fs.existsSync(registryPath)) {
            try {
                const ports = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
                if (ports[siteId]) return ports[siteId];
            } catch (e) { }
        }
        return 5100;
    }

    /**
     * Update deployment settings manually
     */
    updateDeployment(data) {
        const { projectName, status, liveUrl, repoUrl } = data;
        const sitePath = path.join(this.sitesDir, projectName);
        const settingsDir = path.join(sitePath, 'project-settings');
        const deployFile = path.join(settingsDir, 'deployment.json');

        if (!fs.existsSync(settingsDir)) fs.mkdirSync(settingsDir, { recursive: true });

        const deployData = {
            deployedAt: new Date().toISOString(),
            repoUrl: repoUrl || "",
            liveUrl: liveUrl || "",
            status: status || 'live'
        };

        fs.writeFileSync(deployFile, JSON.stringify(deployData, null, 2));
        return { success: true, message: "Deployment settings updated." };
    }

    /**
     * Get all deployments for the Live Manager GUI
     */
    getAllDeployments() {
        const nativeDeps = this._scanDeployments(this.sitesDir);
        const externalDeps = this._scanDeployments(this.sitesExternalDir);
        return [...nativeDeps, ...externalDeps];
    }

    _scanDeployments(dir) {
        if (!dir || !fs.existsSync(dir)) return [];
        const projects = fs.readdirSync(dir).filter(f => 
            fs.statSync(path.join(dir, f)).isDirectory() && !f.startsWith('.')
        );

        return projects.map(project => {
            const projectPath = path.join(dir, project);
            const deployFile = path.join(projectPath, 'project-settings', 'deployment.json');
            let deployData = { liveUrl: '', repoUrl: '', status: 'local' };
            let flags = { liveUrlFallback: false, repoUrlFallback: false };
            
            const port = this.getSitePort(project, projectPath);
            const localUrl = `http://localhost:${port}/${project}/`;

            if (fs.existsSync(deployFile)) {
                try { 
                    deployData = JSON.parse(fs.readFileSync(deployFile, 'utf8')); 
                    
                    if (deployData.status === 'live' || !deployData.status) {
                        const githubUser = process.env.GITHUB_USER || this.configManager.get('GITHUB_USER');
                        const githubOrg = process.env.GITHUB_ORG || this.configManager.get('GITHUB_ORG');
                        const owner = githubOrg || githubUser || 'athena-cms-factory';
                        
                        if (!deployData.liveUrl) {
                            deployData.liveUrl = `https://${owner}.github.io/${project}/`;
                            flags.liveUrlFallback = true;
                        }
                        if (!deployData.repoUrl) {
                            deployData.repoUrl = `https://github.com/${owner}/${project}`;
                            flags.repoUrlFallback = true;
                        }
                        if (!deployData.status) deployData.status = 'live';
                    }
                } catch (e) {}
            }
            return { id: project, localUrl, ...deployData, ...flags };
        });
    }

    /**
     * Link a Google Sheet to a site
     */
    async linkSheet(id, sheetUrl) {
        return this.execService.runEngineScript('sheet-linker-wizard.js', [id, sheetUrl]);
    }

    /**
     * Auto-provision a Google Sheet for a site
     */
    async autoProvision(id) {
        return this.execService.runEngineScript('auto-sheet-provisioner.js', [id]);
    }

    /**
     * Compare Local, GitHub, and Google Sheet data for a site
     */
    async compareSiteSources(id) {
        const paths = this.dataManager.resolvePaths(id);
        const dataDir = paths.dataDir;
        if (!fs.existsSync(dataDir)) throw new Error("Data directory not found.");

        const report = {
            hasRepo: false,
            hasDrift: false,
            files: {}
        };

        // 0. Check if it's a git repo (within the monorepo context)
        try {
            execSync('git rev-parse --is-inside-work-tree', { cwd: this.root, stdio: 'ignore' });
            report.hasRepo = true;
            // Fetch origin to ensure drift check is against current server state
            console.log("📡 Fetching origin to check for drift...");
            execSync('git fetch origin main', { cwd: this.root, stdio: 'ignore' });
        } catch (e) {
            return report; // Early exit if no git context
        }

        const jsonFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'schema.json');

        // 1. Fetch GitHub version (origin/main)
        const getGithubContent = (file) => {
            try {
                const relPath = path.relative(this.root, path.join(dataDir, file));
                return JSON.parse(execSync(`git show origin/main:${relPath}`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString());
            } catch (e) { return null; }
        };

        for (const file of jsonFiles) {
            const localData = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
            const githubData = getGithubContent(file);
            
            const fileReport = {
                localVsGitHub: this._compareArrays(localData, githubData),
                drift: false
            };

            if (fileReport.localVsGitHub.changed) {
                report.hasDrift = true;
                fileReport.drift = true;
            }

            report.files[file] = fileReport;
        }

        return report;
    }

    /**
     * Safe pull: Backup local data before pulling from GitHub
     */
    async safePullFromGitHub(id) {
        const paths = this.dataManager.resolvePaths(id);
        console.log(`📦 Creating safety backup for ${id} before surgical sync...`);
        this.dataManager.backupData(paths.siteDir, paths.dataDir);

        const relPath = path.relative(this.root, paths.siteDir);
        const dataPath = path.join(relPath, 'src/data');
        
        console.log(`📡 Surgically syncing ${dataPath} from GitHub main...`);
        
        try {
            // 1. Haal de laatste status op van de remote (verandert geen lokale bestanden)
            execSync('git fetch origin main', { cwd: this.root, stdio: 'ignore' });
            
            // 2. We resetten eerst de index voor deze specifieke map om conflicten bij checkout te vermijden
            execSync(`git reset origin/main -- ${dataPath}`, { cwd: this.root, stdio: 'ignore' });

            // 3. Overschrijf chirurgisch alleen de bestanden in de DATA-map met de versie van GitHub main
            // Dit raakt geen andere sites aan en laat de factory/dock/logs volledig met rust.
            execSync(`git checkout origin/main -- ${dataPath}`, { cwd: this.root, stdio: 'inherit' });
            
            return { success: true, message: `GitHub Sync voltooid voor ${id} (na backup). Content is bijgewerkt vanaf GitHub.` };
        } catch (err) {
            console.error("❌ Surgical Sync failed:", err);
            throw new Error(`Surgische sync mislukt: ${err.message}. Controleer je internetverbinding of Git status.`);
        }
    }

    _compareArrays(arr1, arr2) {
        if (!arr1 || !arr2) return { changed: true, reason: !arr1 ? "Local missing" : "GitHub missing" };
        const s1 = JSON.stringify(arr1);
        const s2 = JSON.stringify(arr2);
        if (s1 === s2) return { changed: false };

        return {
            changed: true,
            lengthDiff: arr1.length !== arr2.length,
            diffCount: Math.abs(arr1.length - arr2.length)
        };
    }

    /**
     * Pull latest changes from GitHub (Monorepo)
     */
    async pullFromGitHub() {
        console.log(`📡 Pulling latest changes from GitHub monorepo...`);
        try {
            execSync('git pull origin main', { cwd: this.root, stdio: 'inherit' });
            return { success: true, message: "Monorepo succesvol bijgewerkt vanaf GitHub." };
        } catch (err) {
            console.error("❌ Git Pull failed:", err);
            throw new Error(`Git Pull mislukt: ${err.message}`);
        }
    }

    /**
     * Sync local JSON data to Google Sheet
     */
    async syncToSheet(id) {
        await this.dataManager.syncToSheet(id);
        return { success: true, message: "Sync naar Google Sheet voltooid." };
    }

    /**
     * Pull data from Google Sheet to local JSON
     */
    async pullFromSheet(id) {
        await this.dataManager.syncFromSheet(id);
        return { success: true, message: "Data opgehaald uit Google Sheet." };
    }

    /**
     * Pull data from Google Sheet to a temporary directory
     */
    async pullToTemp(id) {
        await this.dataManager.pullToTemp(id);
        return { success: true, message: "Data tijdelijk opgehaald uit Google Sheet voor controle." };
    }

    /**
     * Deploy site to GitHub Pages
     */
    async deploy(projectName, commitMsg) {
        const result = await deployProject(projectName, commitMsg);
        return { success: true, result };
    }

    /**
     * Get available visual styles from the boilerplate
     */
    getStyles() {
        const stylesDir = path.join(this.configManager.get('paths.templates'), 'boilerplate/docked/css');
        if (!fs.existsSync(stylesDir)) return [];
        return fs.readdirSync(stylesDir)
            .filter(f => f.endsWith('.css'))
            .map(f => f.replace('.css', ''));
    }

    /**
     * Get available layouts for a specific sitetype
     */
    getLayouts(siteType) {
        // siteType can be "track/name"
        const [track, name] = siteType.includes('/') ? siteType.split('/') : ['docked', siteType];
        const webDir = path.join(this.configManager.get('paths.sitetypes'), track, name, 'web');
        
        if (!fs.existsSync(webDir)) return [];
        return fs.readdirSync(webDir).filter(f => 
            fs.statSync(path.join(webDir, f)).isDirectory() && !f.startsWith('.')
        );
    }

    /**
     * Run a maintenance script (e.g. sync-deployment-status)
     */
    runScript(script, args) {
        return this.execService.runEngineScript(script, args);
    }
}
