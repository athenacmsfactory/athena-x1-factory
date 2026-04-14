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
        this.sitetypesPreviewDir = path.join(this.root, 'sitetypes-preview');
        
        // 🔱 v10.2 Cache for Directory Scans (prevents battery drain)
        this._cache = {
            native: { data: null, timestamp: 0 },
            external: { data: null, timestamp: 0 }
        };
        this.CACHE_TTL = 30000; // 30 seconds
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

    /**
     * List all sitetype previews (from sitetypes-preview folder)
     */
    listPreviews() {
        return this._scanDir(this.sitetypesPreviewDir, true);
    }


    _scanDir(dir, isNative) {
        const cacheKey = isNative ? 'native' : 'external';
        const now = Date.now();

        if (this._cache[cacheKey].data && (now - this._cache[cacheKey].timestamp < this.CACHE_TTL)) {
            return this._cache[cacheKey].data;
        }

        console.log(`🔍 Scanning ${isNative ? 'NATIVE' : 'EXTERNAL'} directory: ${dir}`);
        if (!dir || !fs.existsSync(dir)) {
            console.log(`⚠️  Directory does not exist: ${dir}`);
            return [];
        }
        const sites = fs.readdirSync(dir).filter(f => {
            try {
                const fullPath = path.join(dir, f);
                return fs.statSync(fullPath).isDirectory() && !f.startsWith('.') && f !== 'athena-cms';
            } catch (e) {
                console.warn(`⚠️ Skipping invalid entry in site directory: ${f} (${e.message})`);
                return false;
            }
        });

        const results = sites.map(site => {
            const sitePath = path.join(dir, site);
            const deployFile = path.join(sitePath, 'project-settings', 'deployment.json');
            const sheetFile = path.join(sitePath, 'project-settings', 'url-sheet.json');
            const configPath = path.join(sitePath, 'athena-config.json');

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
                if (fs.existsSync(configPath)) {
                    try {
                        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                        if (config.siteType && config.siteType.startsWith('v9-')) {
                            isV9 = true;
                        }
                    } catch (e) { /* ignore config errors */ }
                }
            }

            const isAthena = fs.existsSync(configPath) || fs.existsSync(deployFile);
            const isInstalled = fs.existsSync(path.join(sitePath, 'node_modules'));

            return {
                id: site,
                name: site,
                path: sitePath,
                type: isNative ? 'native' : 'external',
                isNative, // <--- Explicit property for Dashboard filtering
                isAthena, // <--- New flag to hide Modernize button for Athena projects
                status: status,
                isDataEmpty,
                isV9, // <--- New flag for Evolution v9 sites
                isInstalled, // <--- Added for hydratation status
                repoUrl: deployData?.repoUrl || null,
                liveUrl: deployData?.liveUrl || null,
                sheetUrl: sheetData?.url || null,
                lastUpdate: deployData?.timestamp || deployData?.deployedAt || null,
                deployData: deployData // <--- Keep full object for legacy support
            };
        });

        this._cache[cacheKey] = {
            data: results,
            timestamp: now
        };

        return results;
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

        // 🔱 v8.8 Auto-Stop logic
        if (options.stopOthers) {
            console.log(`🧹 Auto-Stop active: Stopping other preview servers...`);
            await this.pm.stopAllProcesses('preview');
        }

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
     * Start een preview voor een sitetype/blueprint blueprint met mockup data
     */
    async previewSitetypePreview(name) {
        // We always use the 'athena-showcase' directory for live previews
        const showcasePath = path.join(this.sitetypesPreviewDir, 'athena-showcase');
        const previewPort = 3032; // Fixed port for Builder Previews
        
        console.log(`🔍 Using unified preview at: ${showcasePath}`);
        
        if (!fs.existsSync(showcasePath)) {
            return { 
                success: false, 
                error: 'Showcase template missing',
                message: `De template map 'athena-showcase' is niet gevonden in ${this.sitetypesPreviewDir}.`
            };
        }

        // Ensure the directory is synced with the requested sitetype first
        await this.syncSitetypePreview(name);
        
        // Stop any process already on this port
        await this.pm.stopProcessByPort(previewPort);

        console.log(`🚀 Starting Unified Sitetype Preview on port ${previewPort}...`);
        
        // Start Vite in the unified showcase directory
        await this.pm.startProcess(`showcase-preview-main`, 'showcase-preview', previewPort, 'pnpm', ['dev', '--port', previewPort.toString(), '--host'], { cwd: showcasePath });

        return { success: true, status: 'starting', url: `http://localhost:${previewPort}/` };
    }

    /**
     * Genereert een full working site in de showcase map voor een specifiek sitetype
     */
    async provisionSitetypePreview(name) {
        const showcasePath = path.join(this.sitetypesPreviewDir, name);
        if (fs.existsSync(showcasePath)) {
            return { success: true, message: "Preview bestaat al." };
        }

        console.log(`✨ Provisioning preview site for '${name}'...`);
        
        try {
            // Gebruik de bestaande createProject logica maar forceer de output naar showcaseDir
            // We simuleren een creatie-optie die de map overschrijft
            const sitetypesDir = this.configManager.get('paths.sitetypes');
            const blueprintFile = path.join(sitetypesDir, name, 'blueprint', `${name}.json`);
            
            if (!fs.existsSync(blueprintFile)) throw new Error(`Blueprint voor ${name} niet gevonden.`);
            
            const bp = JSON.parse(fs.readFileSync(blueprintFile, 'utf8'));
            
            // We kopiëren de sitetype/web/standard naar showcasePath
            const sourceWeb = path.join(sitetypesDir, name, 'web/standard');
            const fallbackWeb = path.join(sitetypesDir, name, 'web');
            const webPath = fs.existsSync(sourceWeb) ? sourceWeb : fallbackWeb;
            
            if (!fs.existsSync(webPath)) throw new Error(`Geen web bron gevonden voor ${name}`);

            execSync(`mkdir -p "${showcasePath}"`);
            execSync(`rsync -av --exclude 'node_modules' "${webPath}/" "${showcasePath}/"`);

            // 1. Ensure package.json exists
            const pkgPath = path.join(showcasePath, 'package.json');
            if (!fs.existsSync(pkgPath)) {
                console.log(`📝 Injecting default package.json for preview '${name}'...`);
                const pkg = {
                    name: `showcase-${name}`,
                    type: "module",
                    scripts: { "dev": "vite", "build": "vite build" },
                    dependencies: {
                        "react": "^19.0.0",
                        "react-dom": "^19.0.0",
                        "react-router-dom": "^6.20.0",
                        "lucide-react": "^0.300.0"
                    },
                    devDependencies: {
                        "vite": "^6.0.0",
                        "@vitejs/plugin-react": "^4.0.0"
                    }
                };
                fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
            }

            // 2. Ensure vite.config.js exists
            const viteConfigPath = path.join(showcasePath, 'vite.config.js');
            if (!fs.existsSync(viteConfigPath)) {
                console.log(`📝 Injecting default vite.config.js for preview '${name}'...`);
                const config = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    strictPort: true
  }
})
                `.trim();
                fs.writeFileSync(viteConfigPath, config);
            }

            // 3. Ensure index.html exists
            const htmlPath = path.join(showcasePath, 'index.html');
            if (!fs.existsSync(htmlPath)) {
                console.log(`📝 Injecting default index.html for preview '${name}'...`);
                const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Showcase: ${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/App.jsx"></script>
  </body>
</html>
                `.trim();
                fs.writeFileSync(htmlPath, html);
            }

            // Hydrateer met mock data
            const targetDataDir = path.join(showcasePath, 'src/data');
            if (!fs.existsSync(targetDataDir)) fs.mkdirSync(targetDataDir, { recursive: true });
            
            const mockData = this.generateMockData(bp.data_structure);
            for (const [table, rows] of Object.entries(mockData)) {
                fs.writeFileSync(path.join(targetDataDir, `${table}.json`), JSON.stringify(rows, null, 2));
            }

            // Voer npm install uit
            console.log(`📦 Installing dependencies for preview '${name}'...`);
            // Gebruik --prefer-offline om sneller te installeren op Chromebook
            execSync(`cd "${showcasePath}" && pnpm install --prefer-offline`, { stdio: 'inherit' });

            return { success: true, message: `Showcase voor '${name}' succesvol aangemaakt.` };
        } catch (e) {
            console.error("❌ Provisioning failed:", e.message);
            return { success: false, error: e.message };
        }
    }

    /**
     * Genereert mockup data op basis van een data_structure
     */
    generateMockData(structure) {
        const mock = {};
        if (!structure) return mock;

        structure.forEach(table => {
            const rows = [];
            // Genereer 3 mockup rijen per tabel
            for (let i = 1; i <= 3; i++) {
                const row = {};
                table.columns.forEach(col => {
                    const colName = typeof col === 'string' ? col : (col.name || 'field');
                    const colDesc = typeof col === 'string' ? '' : (col.description || '');
                    row[colName] = this.getRandomMockValue(colName, colDesc, i);
                });
                rows.push(row);
            }
            mock[table.table_name] = rows;
        });
        return mock;
    }

    getRandomMockValue(name, description, index) {
        const n = name.toLowerCase();
        if (n.includes('id')) return index;
        if (n.includes('prijs') || n.includes('price')) return (Math.random() * 100 + 10).toFixed(2);
        if (n.includes('naam') || n.includes('title') || n.includes('header')) return `Mock ${name} ${index}`;
        if (n.includes('image') || n.includes('foto') || n.includes('url')) return `https://picsum.photos/seed/ath${index}/800/600`;
        if (n.includes('email')) return `contact${index}@example.com`;
        if (n.includes('locatie') || n.includes('adres')) return `Mock Straat ${index}, Gent`;
        if (n.includes('datum')) return new Date().toISOString().split('T')[0];
        if (n.includes('score') || n.includes('rating')) return 5;
        
        return `${description || name} placeholder text #${index}`;
    }

    /**
     * Bepaalt poort voor een site via de centrale port-manager skill
     */
    getSitePort(id, siteDir) {
        const scriptPath = path.join(this.root, 'port-manager/scripts/manage_ports.py');
        const project = 'athena';
        const description = `Athena Site: ${id}`;
        
        try {
            // Roep de python script aan: python3 manage_ports.py get <service> <project> [desc]
            const cmd = `python3 "${scriptPath}" get "${id}" "${project}" "${description}"`;
            const output = execSync(cmd).toString();
            
            // Extract PORT=xxxx uit de output
            const match = output.match(/PORT=(\d+)/);
            if (match) {
                return parseInt(match[1]);
            }
            
            // Fallback als de script faalt maar output geeft
            throw new Error("Geen poort gevonden in script output.");
        } catch (e) {
            console.error("❌ Port Manager Skill failed:", e.message);
            // Hele veilige fallback naar oude methode/range als de skill echt niet werkt
            return 5100 + (Math.abs(id.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)) % 1000);
        }
    }

    /**
     * Bepaalt poort voor een site via de centrale port-manager skill
     */
    getSitePort(id, siteDir) {
        const scriptPath = path.join(this.root, 'port-manager/scripts/manage_ports.py');
        const project = 'athena';
        const description = `Athena Site: ${id}`;
        
        try {
            // Roep de python script aan: python3 manage_ports.py get <service> <project> [desc]
            const cmd = `python3 "${scriptPath}" get "${id}" "${project}" "${description}"`;
            const output = execSync(cmd).toString();
            
            // Extract PORT=xxxx uit de output
            const match = output.match(/PORT=(\d+)/);
            if (match) {
                return parseInt(match[1]);
            }
            
            // Fallback als de script faalt maar output geeft
            throw new Error("Geen poort gevonden in script output.");
        } catch (e) {
            console.error("❌ Port Manager Skill failed:", e.message);
            // Hele veilige fallback naar oude methode/range als de skill echt niet werkt
            return 5100 + (Math.abs(id.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)) % 1000);
        }
    }

    /**
     * Synchroniseert de huidige blueprint met de showcase preview site.
     * Dit zorgt ervoor dat wijzigingen in de Sitetype Builder direct zichtbaar zijn.
     */
    async syncSitetypePreview(name) {
        // We always use the 'athena-showcase' as the live synchronization target
        // to avoid provisioning a new Vite project for every sitetype.
        const showcasePath = path.join(this.sitetypesPreviewDir, 'athena-showcase');
        
        if (!fs.existsSync(showcasePath)) {
            // Fallback for extreme cases
            await this.provisionSitetypePreview('athena-showcase');
        }

        console.log(`📡 Synchronizing Sitetype Preview for '${name}' in 'athena-showcase'...`);

        try {
            const sitetypesDir = path.join(this.configManager.get('paths.factory'), '3-sitetypes/unified');
            const blueprintFile = path.join(sitetypesDir, name, 'blueprint', `${name}.json`);
            
            if (!fs.existsSync(blueprintFile)) throw new Error(`Blueprint voor ${name} niet gevonden.`);
            
            const bp = JSON.parse(fs.readFileSync(blueprintFile, 'utf8'));
            const sections = bp.sections || [];

            // 1. Update Mock Data
            const targetDataDir = path.join(showcasePath, 'src/data');
            if (!fs.existsSync(targetDataDir)) fs.mkdirSync(targetDataDir, { recursive: true });
            
            // We genereren mock data op basis van de blueprint secties
            const structureForMock = sections.map(s => ({
                table_name: s.component.toLowerCase(),
                columns: Object.keys(s.props || s.fields || {}).map(k => ({ name: k }))
            }));
            
            // Voeg altijd site_settings en section_order toe
            const mockData = this.generateMockData(structureForMock);
            for (const [table, rows] of Object.entries(mockData)) {
                fs.writeFileSync(path.join(targetDataDir, `${table}.json`), JSON.stringify(rows, null, 2));
            }

            // Update section_order.json
            const sectionOrder = ['site_settings', 'header', 'hero', ...sections.map(s => s.component.toLowerCase()), 'footer'];
            fs.writeFileSync(path.join(targetDataDir, 'section_order.json'), JSON.stringify(sectionOrder, null, 2));

            // 2. Sync Components (Legos)
            const targetCompDir = path.join(showcasePath, 'src/components');
            if (!fs.existsSync(targetCompDir)) fs.mkdirSync(targetCompDir, { recursive: true });

            const legosLib = this.getLegos();
            const usedLegos = sections.map(s => s.component);
            
            let importStatements = "";
            let mappingLogic = "";

            usedLegos.forEach((legoName, idx) => {
                // Fuzzy match: case-insensitive and stripping common suffixes/prefixes
                const cleanName = legoName.toLowerCase().replace(/legov[0-9]+$/, '').replace(/v[0-9]+$/, '');
                const lego = legosLib.find(l => {
                    const lName = l.name.toLowerCase().replace(/legov[0-9]+$/, '').replace(/v[0-9]+$/, '');
                    return lName === cleanName || l.name.toLowerCase() === legoName.toLowerCase();
                });

                if (lego) {
                    const fileName = lego.fileName;
                    // Kopieer de lego naar de showcase
                    const targetFile = path.join(targetCompDir, fileName);
                    fs.copyFileSync(lego.absolutePath, targetFile);

                    const compVar = `${legoName.replace(/[^a-zA-Z0-9]/g, '_')}_${idx}`;
                    importStatements += `import ${compVar} from './${lego.name}';\n`;
                    mappingLogic += `      if (lower === '${legoName.toLowerCase()}') return ${compVar};\n`;
                }
            });

            // 3. Update Section.jsx with new mapping
            const sectionJsxPath = path.join(showcasePath, 'src/components/Section.jsx');
            if (fs.existsSync(sectionJsxPath)) {
                let content = fs.readFileSync(sectionJsxPath, 'utf8');
                
                // We bewaren de template structuur door placeholders te gebruiken als we ze vinden, 
                // OF we overschrijven de specifieke blokken.
                // Voor de showcase builder overschrijven we de blokken tussen markers.
                
                const importStart = "/* {{IMPORTS_START}} */";
                const importEnd = "/* {{IMPORTS_END}} */";
                const mappingStart = "/* {{MAPPING_START}} */";
                const mappingEnd = "/* {{MAPPING_END}} */";

                // Als de markers er niet zijn, voegen we ze toe aan de placeholders
                if (!content.includes(importStart)) {
                    content = content.replace("/* {{IMPORTS}} */", `${importStart}\n${importEnd}`);
                }
                if (!content.includes(mappingStart)) {
                    content = content.replace("/* {{MAPPING_LOGIC}} */", `${mappingStart}\n${mappingEnd}`);
                }

                // Inject content
                content = content.replace(new RegExp(`${importStart.replace(/[\/\*\{\}]/g, '\\$&')}[\\s\\S]*?${importEnd.replace(/[\/\*\{\}]/g, '\\$&')}`), `${importStart}\n${importStatements}${importEnd}`);
                content = content.replace(new RegExp(`${mappingStart.replace(/[\/\*\{\}]/g, '\\$&')}[\\s\\S]*?${mappingEnd.replace(/[\/\*\{\}]/g, '\\$&')}`), `${mappingStart}\n${mappingLogic}${mappingEnd}`);

                // Update component return logic too
                const returnStart = "/* {{RETURN_START}} */";
                const returnEnd = "/* {{RETURN_END}} */";
                if (!content.includes(returnStart)) {
                    content = content.replace("/* {{COMPONENT_RETURN}} */", `${returnStart}\n${returnEnd}`);
                }

                const returnCode = `
        const Comp = getComponent(sectionName);
        return (
          <section key={idx} id={sectionName} data-dock-section={sectionName} className="py-20 border-b border-athena-border/5">
             <Comp data={items} sectionSettings={sectionSettings[sectionName]} />
          </section>
        );
                `.trim();

                content = content.replace(new RegExp(`${returnStart.replace(/[\/\*\{\}]/g, '\\$&')}[\\s\\S]*?${returnEnd.replace(/[\/\*\{\}]/g, '\\$&')}`), `${returnStart}\n${returnCode}\n${returnEnd}`);

                fs.writeFileSync(sectionJsxPath, content);
            }

            return { success: true, message: `Showcase voor '${name}' succesvol gesynchroniseerd.` };
        } catch (e) {
            console.error("❌ Sync failed:", e.message);
            return { success: false, error: e.message };
        }
    }
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
        const templatesDir = path.join(this.root, '2-templates');
        if (!fs.existsSync(templatesDir)) return [];
        return fs.readdirSync(templatesDir).filter(f => 
            fs.statSync(path.join(templatesDir, f)).isDirectory() && !f.startsWith('.')
        );
    }

    /**
     * Haalt alle beschikbare 'Legoblokken' (componenten) op uit de templates
     */
    getLegos() {
        const legosRoot = path.join(this.root, 'factory/2-templates/components/legos');
        if (!fs.existsSync(legosRoot)) return [];

        const categories = ['Common', 'Layout', 'Shop'];
        const results = [];

        categories.forEach(cat => {
            const catPath = path.join(legosRoot, cat);
            if (fs.existsSync(catPath)) {
                const files = fs.readdirSync(catPath).filter(f => 
                    fs.statSync(path.join(catPath, f)).isFile() && !f.startsWith('.') && (f.endsWith('.jsx') || f.endsWith('.js'))
                );
                files.forEach(file => {
                    const name = file.replace(/\.(jsx|js)$/, '');
                    results.push({
                        id: `${cat}-${name}`,
                        name: name,
                        category: cat,
                        fileName: file,
                        path: path.join(cat, file),
                        absolutePath: path.join(catPath, file)
                    });
                });
            }
        });

        return results;
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
     * Archive a site from Werkplaats to Vault (FORKLIFT integration)
     */
    async park(id) {
        const playgroundPath = path.join(this.sitesDir, id);
        if (!fs.existsSync(playgroundPath)) throw new Error(`Site '${id}' niet gevonden in Werkplaats.`);

        const scriptPath = path.resolve(this.root, '../control/forklift/push.sh');
        
        console.log(`🚜 Running Forklift Push for ${id}...`);
        
        try {
            // Run the push script with -y (auto-confirm) to allow UI integration
            // We use runSync from execService for unified logging
            const result = this.execService.runSync(`bash "${scriptPath}" ${id} -y`, {
                label: `Forklift Push: ${id}`,
                cwd: path.dirname(scriptPath)
            });

            if (!result.success) {
                throw new Error(`Forklift Push failed: ${result.error}`);
            }

            // Update registry (sync-sites-registry.js might be needed to reflect new external site)
            await this.execService.runEngineScript('sync-sites-registry.js', []);
            
            return { 
                success: true, 
                message: `Site '${id}' succesvol gearchiveerd in de Vault (via Forklift).`,
                output: result.output 
            };
        } catch (e) {
            console.error(`❌ Forklift Error for ${id}:`, e.message);
            throw e;
        }
    }

    /**
     * Delete a site physically from Werkplaats
     */
    async deleteSite(id) {
        const source = path.join(this.sitesDir, id);

        if (!fs.existsSync(source)) throw new Error(`Site '${id}' niet gevonden in Werkplaats.`);

        console.log(`🗑️  Deleting site ${id} from Werkplaats...`);
        fs.rmSync(source, { recursive: true, force: true });

        // Update registry
        await this.execService.runEngineScript('sync-sites-registry.js', []);
        return { success: true, message: `Site '${id}' is verwijderd uit de actieve Werkplaats.` };
    }

    /**
     * Delete a site physically from Vault
     */
    async deleteFromVault(id) {
        const source = path.join(this.sitesExternalDir, id);

        if (!fs.existsSync(source)) throw new Error(`Archief '${id}' niet gevonden in de Vault.`);

        console.log(`🗑️  Deleting archive ${id} from Vault...`);
        fs.rmSync(source, { recursive: true, force: true });

        // Update registry
        await this.execService.runEngineScript('sync-sites-registry.js', []);
        return { success: true, message: `Archief '${id}' is verwijderd uit de Vault.` };
    }

    /**
     * Activate a site from Vault to Werkplaats (COPY instead of Move)
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

        console.log(`🛠️  Activating ${id} from Vault (Copying)...`);
        execSync(`cp -r "${source}" "${target}"`);

        // Update registry
        await this.execService.runEngineScript('sync-sites-registry.js', []);
        return { success: true, message: `Site '${id}' is weer actief in de Werkplaats.` };
    }

    // ============================================================
    // V10.1 STUB METHODS — called from server.js, implementation pending
    // These prevent "is not a function" crashes on the dashboard.
    // ============================================================

    getAllDeployments() {
        const sites = this.list();
        return sites.map(s => ({ id: s.id, status: s.status, liveUrl: s.liveUrl, repoUrl: s.repoUrl }));
    }

    getStyles() {
        const stylesPath = path.join(this.root, 'config/style-presets.json');
        return fs.existsSync(stylesPath) ? JSON.parse(fs.readFileSync(stylesPath, 'utf8')) : { presets: [] };
    }

    getThemeInfo(id) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);
        const configPath = path.join(siteDir, 'athena-config.json');
        const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
        return { success: true, theme: config.theme || null, styleName: config.styleName || null };
    }

    updateData(id, data) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);
        const dataDir = path.join(siteDir, 'src', 'data');
        if (!fs.existsSync(dataDir)) return { success: false, error: 'Data directory not found.' };
        const { file, content } = data;
        if (!file) return { success: false, error: 'No file specified.' };
        fs.writeFileSync(path.join(dataDir, file), JSON.stringify(content, null, 2));
        return { success: true, message: `${file} bijgewerkt.` };
    }

    updateSectionSettings(id, data) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);
        const settingsPath = path.join(siteDir, 'src', 'data', 'section_settings.json');
        let settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, 'utf8')) : {};
        settings = { ...settings, ...data };
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        return { success: true };
    }

    updateDisplayConfig(id, data) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);
        const configPath = path.join(siteDir, 'athena-config.json');
        const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
        config.display = { ...(config.display || {}), ...data };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        return { success: true };
    }

    updateConfig(id, data) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);
        const configPath = path.join(siteDir, 'athena-config.json');
        const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
        const updated = { ...config, ...data };
        fs.writeFileSync(configPath, JSON.stringify(updated, null, 2));
        return { success: true, config: updated };
    }

    addSection(id, { sectionName }) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);
        const orderPath = path.join(siteDir, 'src', 'data', 'section_order.json');
        const order = fs.existsSync(orderPath) ? JSON.parse(fs.readFileSync(orderPath, 'utf8')) : [];
        if (!order.includes(sectionName)) order.push(sectionName);
        fs.writeFileSync(orderPath, JSON.stringify(order, null, 2));
        return { success: true, order };
    }

    renameSection(id, { oldName, newName }) {
        let siteDir = path.join(this.sitesDir, id);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, id);
        const dataDir = path.join(siteDir, 'src', 'data');
        const orderPath = path.join(dataDir, 'section_order.json');
        const oldFile = path.join(dataDir, `${oldName}.json`);
        const newFile = path.join(dataDir, `${newName}.json`);
        if (!fs.existsSync(oldFile)) return { success: false, error: `Sectie '${oldName}' niet gevonden.` };
        fs.renameSync(oldFile, newFile);
        if (fs.existsSync(orderPath)) {
            const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
            const idx = order.indexOf(oldName);
            if (idx !== -1) { order[idx] = newName; fs.writeFileSync(orderPath, JSON.stringify(order, null, 2)); }
        }
        return { success: true };
    }

    deleteSection(id, { sectionName }) {
        return this.removeSection(id, { sectionName });
    }

    saveStylePreset(id, data) {
        const presetsPath = path.join(this.root, 'config/style-presets.json');
        let presetsData = { presets: [] };
        if (fs.existsSync(presetsPath)) presetsData = JSON.parse(fs.readFileSync(presetsPath, 'utf8'));
        const newPreset = { id: (data.name || 'preset').toLowerCase().replace(/[^a-z0-9]/g, '_'), ...data };
        presetsData.presets = presetsData.presets.filter(p => p.id !== newPreset.id);
        presetsData.presets.push(newPreset);
        fs.writeFileSync(presetsPath, JSON.stringify(presetsData, null, 2));
        return { success: true, preset: newPreset };
    }

    saveLayoutPreset(id, data) {
        return this.saveAsPreset(id, data);
    }

    async safePullFromGitHub(id) {
        return this.execService.runEngineScript('safe-pull.js', [id]);
    }

    async compareSiteSources(id) {
        return { success: true, message: 'Vergelijking niet beschikbaar in V10.1.', id };
    }

    async pullToTemp(id) {
        return this.dataManager.pullToTemp(id);
    }

    updateDeployment(data) {
        const { projectName, ...deployData } = data;
        if (!projectName) return { success: false, error: 'projectName vereist.' };
        let siteDir = path.join(this.sitesDir, projectName);
        if (!fs.existsSync(siteDir)) siteDir = path.join(this.sitesExternalDir, projectName);
        const deployPath = path.join(siteDir, 'project-settings', 'deployment.json');
        const existing = fs.existsSync(deployPath) ? JSON.parse(fs.readFileSync(deployPath, 'utf8')) : {};
        const updated = { ...existing, ...deployData, updatedAt: new Date().toISOString() };
        fs.mkdirSync(path.dirname(deployPath), { recursive: true });
        fs.writeFileSync(deployPath, JSON.stringify(updated, null, 2));
        return { success: true };
    }
}
