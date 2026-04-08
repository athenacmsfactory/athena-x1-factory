import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { BasePhase } from './BasePhase.js';
import { provisionSheet } from '../../auto-sheet-provisioner.js';
import { LogoGenerator } from '../../lib/logo-generator.js';
import { ThemeEngine } from '../../lib/theme-engine.js';

export class DataPhase extends BasePhase {
    constructor() {
        super('Data');
    }

    async execute(ctx) {
        this.log('Generating data structures...');
        const dataDir = path.join(ctx.projectDir, 'src/data');

        // 1. Provisioning
        if (ctx.config.autoSheet) {
            try {
                const sheetData = await provisionSheet(ctx.config.projectName, ctx.config.clientEmail);
                fs.writeFileSync(path.join(ctx.projectDir, 'project-settings/url-sheet.json'), JSON.stringify({ basis: { editUrl: sheetData.editUrl, exportUrl: sheetData.exportUrl } }, null, 2));
            } catch (e) { this.log(`⚠️ Auto-Sheet failed: ${e.message}`); }
        }

        // 2. Base Configs
        fs.writeFileSync(path.join(ctx.projectDir, 'athena-config.json'), JSON.stringify({ ...ctx.config, safeName: ctx.safeName, generatedAt: new Date() }, null, 2));
        fs.writeFileSync(path.join(dataDir, 'schema.json'), JSON.stringify(ctx.blueprint, null, 2));

        // 3. Logo
        const primaryColor = ctx.blueprint.design_system?.colors?.primary || '#3b82f6';
        ctx.logoFile = LogoGenerator.saveToProject(ctx.projectDir, ctx.config.projectName, primaryColor, ctx.config.siteType);

        // 4. Blueprint Tables
        if (ctx.blueprint.data_structure) {
            ctx.blueprint.data_structure.forEach(t => {
                const p = path.join(dataDir, `${t.table_name.toLowerCase()}.json`);
                if (!fs.existsSync(p)) {
                    let initialData = [];
                    
                    // Special behavior for 'basis' table: Always ensure 1 default row
                    if (t.table_name.toLowerCase() === 'basis' || t.table_name.toLowerCase() === 'instellingen') {
                        const defaultRow = {};
                        t.columns.forEach(col => {
                            const name = typeof col === 'object' ? col.name : col;
                            defaultRow[name] = ""; // Default empty
                        });

                        // Standard fallbacks for basis
                        defaultRow.config_id = "1";
                        defaultRow.site_naam = ctx.discovery?.meta?.company_name || ctx.config.projectName;
                        defaultRow.hero_header = ctx.discovery?.strategy?.tagline || `Welkom bij ${defaultRow.site_naam}`;
                        
                        // Payment Key Injection
                        if (defaultRow.hasOwnProperty('stripe_publishable_key')) {
                            defaultRow.stripe_publishable_key = process.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
                        }
                        if (defaultRow.hasOwnProperty('mollie_api_key')) {
                            defaultRow.mollie_api_key = process.env.VITE_MOLLIE_API_KEY || "";
                        }

                        initialData.push(defaultRow);
                    }
                    
                    fs.writeFileSync(p, JSON.stringify(initialData, null, 2));
                }
            });
            fs.writeFileSync(path.join(dataDir, 'section_order.json'), JSON.stringify(ctx.blueprint.data_structure.map(t => t.table_name.toLowerCase()), null, 2));
        }

        // 5. System JSONs
        ['site_settings.json', 'display_config.json', 'style_bindings.json', 'layout_settings.json', 'section_settings.json'].forEach(f => {
            const p = path.join(dataDir, f);
            if (!fs.existsSync(p)) {
                const initialSettings = { 
                    site_name: ctx.discovery?.meta?.company_name || ctx.config.projectName,
                    tagline: ctx.discovery?.strategy?.tagline || ""
                };
                if (f === 'site_settings.json') initialSettings.site_logo_image = ctx.logoFile;
                fs.writeFileSync(p, JSON.stringify(initialSettings, null, 2));
            }
        });

        // 6. Style Config
        const styleConfigPath = path.join(dataDir, 'style_config.json');
        if (!fs.existsSync(styleConfigPath)) {
            const themeConfig = ThemeEngine.generate(ctx.blueprint);
            fs.writeFileSync(styleConfigPath, JSON.stringify(themeConfig, null, 2));
            this.log('🎨 Theme Engine: Generated style_config.json');
        }

        // 7. Input Sync
        this.syncInputData(ctx);
    }

    syncInputData(ctx) {
        const projectInputBase = (ctx.config.sourceProject || ctx.config.projectName).replace('-site', '');
        const jsonDir = path.join(ctx.configManager.get('paths.input'), projectInputBase, 'json-data');
        const tsvDir = path.join(ctx.configManager.get('paths.input'), projectInputBase, 'tsv-data');

        if (fs.existsSync(jsonDir) && fs.readdirSync(jsonDir).some(f => f.endsWith('.json'))) {
            fs.cpSync(jsonDir, path.join(ctx.projectDir, 'src/data'), { recursive: true });
        } else if (fs.existsSync(tsvDir) && fs.readdirSync(tsvDir).some(f => f.endsWith('.tsv'))) {
            try {
                const scriptPath = path.join(ctx.configManager.get('paths.engine'), 'sync-tsv-to-json.js');
                execSync(`"${process.execPath}" "${scriptPath}" "${projectInputBase}" "${ctx.safeName}"`, {
                    cwd: ctx.configManager.get('paths.factory'),
                    stdio: 'ignore'
                });
            } catch (e) { }
        }
    }
}
