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
                    
                    // --- v10.1: 1-1-1 Standard Initialization ---

                    // 1. Header Initialization
                    if (t.table_name.toLowerCase() === 'header') {
                        initialData = [{
                            site_name: ctx.discovery?.meta?.company_name || ctx.config.projectName,
                            site_logo: ctx.logoFile || "athena-icon.svg",
                            nav_links: [
                                { label: "Home", url: "/" },
                                { label: "Producten", url: "#producten" }
                            ]
                        }];
                    }
                    
                    // 2. Hero Initialization
                    if (t.table_name.toLowerCase() === 'hero') {
                        initialData = [{
                            hero_header: ctx.discovery?.strategy?.tagline || `Welkom bij ${ctx.config.projectName}`,
                            hero_tagline: "Wij leveren kwalitatieve oplossingen voor uw dagelijkse uitdagingen.",
                            hero_image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
                            cta_text: "Ontdek Meer",
                            cta_url: "#producten"
                        }];
                    }

                    // 3. Footer Initialization
                    if (t.table_name.toLowerCase() === 'footer') {
                        initialData = [{
                            footer_info: "Gespecialiseerd in maatwerk oplossingen en persoonlijke service.",
                            contact_email: "info@example.com",
                            contact_locatie: "België",
                            customer_service_links: [
                                { label: "Verzending", url: "#" },
                                { label: "Privacy Policy", url: "#" }
                            ],
                            social_links: [
                                { platform: "x-twitter", url: "#" },
                                { platform: "instagram", url: "#" }
                            ]
                        }];
                    }

                    // 4. Legacy Basis handling (for non-migrated types)
                    if (t.table_name.toLowerCase() === 'basis' || t.table_name.toLowerCase() === 'instellingen') {
                        const defaultRow = {};
                        t.columns.forEach(col => {
                            const name = typeof col === 'object' ? col.name : col;
                            defaultRow[name] = "";
                        });
                        defaultRow.config_id = "1";
                        defaultRow.site_naam = ctx.discovery?.meta?.company_name || ctx.config.projectName;
                        defaultRow.hero_header = ctx.discovery?.strategy?.tagline || `Welkom bij ${defaultRow.site_naam}`;
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

        // 8. Final Hybrid Aggregation (Build all_data.json)
        try {
            const { DataAggregator } = await import('../../logic/data-aggregator.js');
            DataAggregator.aggregate(ctx.projectDir);
            this.log('✅ 1-1-1 Aggregator: Generated all_data.json');
        } catch (e) {
            this.log(`⚠️ Aggregator failed: ${e.message}`);
        }
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
