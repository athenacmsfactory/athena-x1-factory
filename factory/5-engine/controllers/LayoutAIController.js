/**
 * LayoutAIController.js
 * @description Generates section redesigns and layout optimizations using AI.
 */

import fs from 'fs';
import path from 'path';
import { generateWithAI } from '../core/ai-engine.js';

export class LayoutAIController {
    constructor(configManager) {
        this.configManager = configManager;
        this.sitesDir = configManager.get('paths.sites');
    }

    /**
     * Generates a new layout design for a section.
     */
    async generateRedesign(siteId, sectionName, goal = "make it more modern and spacious") {
        console.log(`🎨 AI Designer: Redesigning ${sectionName} for ${siteId}...`);
        
        const sitePath = path.join(this.sitesDir, siteId);
        if (!fs.existsSync(sitePath)) throw new Error("Site niet gevonden.");

        try {
            // Load current data for context
            const dataPath = path.join(sitePath, 'src/data', `${sectionName}.json`);
            const settingsPath = path.join(sitePath, 'src/data/section_settings.json');
            
            const sectionData = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath, 'utf8')) : [];
            const currentSettings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, 'utf8'))[sectionName] || {} : {};

            const systemInstruction = `
                Je bent 'Athena Design AI'. Je optimaliseert React/Tailwind layouts.
                DOEL: ${goal}
                HUIDIGE DATA: ${JSON.stringify(sectionData)}
                HUIDIGE SETTINGS: ${JSON.stringify(currentSettings)}

                REGEER UITSLUITEND MET EEN JSON OBJECT dat de nieuwe 'section_settings' bevat voor deze sectie.
                Mogelijke velden: backgroundColor, textColor, padding, borderRadius, alignment, fontSize, fontWeight, hidden.
                
                VOORBEELD:
                {
                    "backgroundColor": "#f8fafc",
                    "padding": "py-24",
                    "alignment": "center",
                    "borderRadius": "rounded-3xl"
                }
            `;

            const newSettings = await generateWithAI(systemInstruction, { isJson: true });
            return { success: true, settings: newSettings };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    /**
     * Generates an A/B test with two distinct layout variants.
     */
    async generateABTest(siteId, sectionName) {
        console.log(`🧪 AI Designer: Creating A/B Test for ${sectionName}...`);
        
        try {
            const varA = await this.generateRedesign(siteId, sectionName, "Variant A: Focus on clarity and trust");
            const varB = await this.generateRedesign(siteId, sectionName, "Variant B: Focus on urgency and energy");

            if (varA.success && varB.success) {
                const settingsPath = path.join(this.sitesDir, siteId, 'src/data/section_settings.json');
                const allSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                
                allSettings[sectionName] = {
                    ...allSettings[sectionName],
                    ab_test: {
                        active: true,
                        variants: {
                            A: varA.settings,
                            B: varB.settings
                        },
                        current: 'A'
                    }
                };

                fs.writeFileSync(settingsPath, JSON.stringify(allSettings, null, 2));
                return { success: true, message: "A/B Test gecreëerd.", variants: { A: varA.settings, B: varB.settings } };
            }
            throw new Error("Kon varianten niet genereren.");
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    /**
     * Suggests a mapping between data columns and component fields.
     */
    async suggestMapping(siteId, tableName) {
        console.log(`🧭 AI Architect: Suggesting mapping for ${tableName} in ${siteId}...`);
        
        const sitePath = path.join(this.sitesDir, siteId);
        const dataPath = path.join(sitePath, 'src/data', `${tableName}.json`);
        
        if (!fs.existsSync(dataPath)) throw new Error("Data bestand niet gevonden.");

        try {
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            const sample = data[0] || {};
            const columns = Object.keys(sample);

            const systemInstruction = `
                Je bent 'Athena Mapping AI'. Je koppelt data-kolommen aan UI componenten.
                TABEL: ${tableName}
                KOLOMMEN: ${columns.join(', ')}
                SAMPLE DATA: ${JSON.stringify(sample)}

                REGEER UITSLUITEND MET EEN JSON OBJECT dat de optimale mapping beschrijft.
                Formaat: { "field_name": "column_name" }
                Gereed voor: title, subtitle, content, image, price, date, link.
            `;

            const mapping = await generateWithAI(systemInstruction, { isJson: true });
            return { success: true, mapping };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
}
