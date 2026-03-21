/**
 * @file sync-sites-registry.js
 * @description Scans all projects in sites/ and sites-external/ and updates dock/public/sites.json.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FACTORY_ROOT = path.resolve(__dirname, '../..');
const SITES_DIR = path.join(FACTORY_ROOT, 'sites');
const EXTERNAL_SITES_DIR = path.join(FACTORY_ROOT, 'sites-external');
const OUTPUT_FILE = path.join(FACTORY_ROOT, 'dock/public/sites.json');
const PORTS_FILE = path.join(FACTORY_ROOT, 'port-manager/registry.json');
const LEGACY_PORTS_FILE = path.join(FACTORY_ROOT, 'factory/config/site-ports.json');

async function syncRegistry() {
    console.log("🔍 Scanning sites for deployment status...");
    
    const registry = [];
    let portMap = {};
    
    // Load ports logic
    if (fs.existsSync(PORTS_FILE)) {
        try { 
            const reg = JSON.parse(fs.readFileSync(PORTS_FILE, 'utf8'));
            if (reg.services) Object.keys(reg.services).forEach(k => { portMap[k] = reg.services[k].port; });
        } catch (e) {}
    }
    if (fs.existsSync(LEGACY_PORTS_FILE)) {
        try { 
            const legacyMap = JSON.parse(fs.readFileSync(LEGACY_PORTS_FILE, 'utf8'));
            portMap = { ...legacyMap, ...portMap };
        } catch (e) {}
    }

    const scanDir = (dir, isExternal) => {
        if (!fs.existsSync(dir)) return;
        const projects = fs.readdirSync(dir).filter(f => 
            fs.statSync(path.join(dir, f)).isDirectory() && !f.startsWith('.')
        );

        for (const project of projects) {
            const projectPath = path.join(dir, project);
            const deployPath = path.join(projectPath, 'project-settings/deployment.json');
            const configPath = path.join(projectPath, 'athena-config.json');
            
            let deployData = {};
            let configData = {};
            
            if (fs.existsSync(deployPath)) {
                try { deployData = JSON.parse(fs.readFileSync(deployPath, 'utf8')); } catch (e) {}
            }
            if (fs.existsSync(configPath)) {
                try { configData = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (e) {}
            }

            // 🔱 v8.8 Logic: 
            // Externe sites hebben GEEN eigen server en MOETEN via de API (5000)
            // Native sites hebben hun eigen dev-server poort.
            const port = isExternal ? 5000 : (portMap[project] || 5000);
            const localUrl = `http://localhost:${port}/${project}/`;

            registry.push({
                id: project,
                name: configData.projectName || project,
                isNative: !isExternal,
                isExternal: isExternal,
                siteType: configData.siteType || (isExternal ? 'static-legacy' : 'unknown'),
                generatedAt: configData.generatedAt || null,
                governance_mode: configData.governance_mode || 'dev-mode',
                repoUrl: deployData.repoUrl || null,
                liveUrl: deployData.liveUrl || null,
                localUrl: localUrl,
                port: isExternal ? null : port,
                status: deployData.status || 'local'
            });

        }
    };

    scanDir(SITES_DIR, false);
    scanDir(EXTERNAL_SITES_DIR, true);

    // Sorteren: live eerst, dan alfabetisch
    registry.sort((a, b) => {
        if (a.liveUrl && !b.liveUrl) return -1;
        if (!a.liveUrl && b.liveUrl) return 1;
        return a.id.localeCompare(b.id);
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(registry, null, 2));
    console.log(`✅ Registry updated with ${registry.length} sites. Saved to ${OUTPUT_FILE}`);
}

syncRegistry().catch(err => console.error(err));
