/**
 * JulesController.js
 * @description Proxy for AI-driven code suggestions and system optimization.
 * Integrates with Jules 2.0 (via CLI/AI-Engine).
 */

import fs from 'fs';
import path from 'path';
import { generateWithAI } from '../core/ai-engine.js';

export class JulesController {
    constructor(configManager) {
        this.configManager = configManager;
        this.sitesDir = configManager.get('paths.sites');
        this.sitetypesDir = configManager.get('paths.sitetypes');
    }

    /**
     * Get a code suggestion for a specific context
     */
    async getAdvice(prompt, siteId = null) {
        console.log(`🧠 Jules AI Assistant: Processing request${siteId ? ` for ${siteId}` : ''}...`);
        
        let siteContext = "";
        if (siteId) {
            siteContext = await this.getSiteContext(siteId);
        }
        
        const systemInstruction = `
            Je bent 'Jules 2.0', de AI Architect van de Athena CMS Factory.
            Je helpt developers bij het optimaliseren van hun React/Vite/Tailwind code.
            
            ${siteId ? `HUIDIGE SITE CONTEXT:
            ${siteContext}` : ""}
            
            Geef kort, technisch en direct advies of code-voorbeelden.
        `;

        try {
            const response = await generateWithAI(`${systemInstruction}\n\nVRAAG: ${prompt}`, { isJson: false });
            return { success: true, advice: response };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    /**
     * Gathers deep context about a specific site.
     */
    async getSiteContext(siteId) {
        const sitePath = path.join(this.sitesDir, siteId);
        if (!fs.existsSync(sitePath)) return "Site niet gevonden.";

        try {
            const config = JSON.parse(fs.readFileSync(path.join(sitePath, 'athena-config.json'), 'utf8'));
            const settings = JSON.parse(fs.readFileSync(path.join(sitePath, 'src/data/site_settings.json'), 'utf8'));
            
            // Resolve blueprint
            const [track, typeName] = config.siteType.includes('/') ? config.siteType.split('/') : ['docked', config.siteType];
            const blueprintPath = path.join(this.sitetypesDir, track, typeName, 'blueprint', `${typeName}.json`);
            let blueprint = {};
            if (fs.existsSync(blueprintPath)) {
                blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));
            }

            return JSON.stringify({
                projectName: config.projectName,
                siteType: config.siteType,
                siteModel: config.siteModel,
                settings: settings[0] || settings,
                data_structure: blueprint.data_structure?.map(t => t.table_name) || []
            }, null, 2);
        } catch (e) {
            return "Fout bij laden van site context: " + e.message;
        }
    }
}
