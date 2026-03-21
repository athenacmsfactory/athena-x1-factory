/**
 * LanguageController.js
 * @description Manages internationalization (i18n) and multi-language data mapping.
 */

import fs from 'fs';
import path from 'path';
import { generateWithAI } from '../core/ai-engine.js';

export class LanguageController {
    constructor(configManager) {
        this.configManager = configManager;
        this.sitesDir = configManager.get('paths.sites');
    }

    /**
     * Translates a project to a new target language using AI.
     */
    async translateProject(siteId, targetLang = "fr") {
        console.log(`🌍 AI Translator: Translating ${siteId} to ${targetLang}...`);
        const sitePath = path.join(this.sitesDir, siteId);
        const dataDir = path.join(sitePath, 'src/data');
        
        if (!fs.existsSync(dataDir)) throw new Error("Data directory not found.");

        const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && !f.includes('_'));
        const results = [];

        for (const file of files) {
            const filePath = path.join(dataDir, file);
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            const systemInstruction = `
                Je bent 'Athena Translator'. Vertaal de volgende website-data naar het ${targetLang}.
                REGEER UITSLUITEND MET HET VERTAALDE JSON OBJECT.
                Behoud de originele structuur en keys exact.
            `;

            try {
                const translated = await generateWithAI(`${systemInstruction}\n\nDATA: ${JSON.stringify(content)}`, { isJson: true });
                if (translated) {
                    const baseName = file.replace('.json', '');
                    fs.writeFileSync(path.join(dataDir, `${baseName}_${targetLang}.json`), JSON.stringify(translated, null, 2));
                    results.push(file);
                }
            } catch (e) {
                console.error(`❌ Translation failed for ${file}:`, e.message);
            }
        }

        return { success: true, translatedFiles: results };
    }

    /**
     * Gets configured languages from athena-config.json
     */
    getConfig(siteId) {
        const configPath = path.join(this.sitesDir, siteId, 'athena-config.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return config.languages || ['nl'];
        }
        return ['nl'];
    }

    /**
     * Merges primary and translated data into a single object for Google Sheets sync.
     * Example: titel + titel_fr
     */
    getMergedDataForSheet(siteId, tableName) {
        const sitePath = path.join(this.sitesDir, siteId);
        const dataDir = path.join(sitePath, 'src/data');
        const primaryFile = path.join(dataDir, `${tableName}.json`);
        
        if (!fs.existsSync(primaryFile)) return null;

        const languages = this.getConfig(siteId).filter(l => l !== 'nl');
        const primaryData = JSON.parse(fs.readFileSync(primaryFile, 'utf8'));

        if (!Array.isArray(primaryData)) return primaryData; // Skip non-array files for now

        const merged = primaryData.map((item, index) => {
            const newItem = { ...item };
            languages.forEach(lang => {
                const langFile = path.join(dataDir, `${tableName}_${lang}.json`);
                if (fs.existsSync(langFile)) {
                    const langData = JSON.parse(fs.readFileSync(langFile, 'utf8'));
                    if (langData[index]) {
                        Object.entries(langData[index]).forEach(([key, value]) => {
                            newItem[`${key}_${lang}`] = value;
                        });
                    }
                }
            });
            return newItem;
        });

        return merged;
    }
}
