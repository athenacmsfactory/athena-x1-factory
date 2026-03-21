import fs from 'fs';
import path from 'path';
import { BasePhase } from './BasePhase.js';
import { Validator } from '../../lib/validator.js';
import { TransformationEngine } from '../TransformationEngine.js';

export class InitializePhase extends BasePhase {
    constructor() {
        super('Initialize');
    }

    async execute(ctx) {
        this.log(`Setting up directories for ${ctx.safeName}...`);
        
        // 1. Init Dirs
        ['src/components/ui', 'src/data', 'project-settings', 'public/images', '.github/workflows'].forEach(d => {
            fs.mkdirSync(path.join(ctx.projectDir, d), { recursive: true });
        });

        // 2. Resolve Paths & Blueprint
        const { siteType, layoutName, siteModel } = ctx.config;
        ctx.editorStrategy = fs.existsSync(path.join(ctx.configManager.get('paths.sitetypes'), 'docked', siteType)) ? 'docked' : 'autonomous';
        ctx.siteTypePath = path.join(ctx.configManager.get('paths.sitetypes'), ctx.editorStrategy, siteType);
        
        const blueprintPath = path.join(ctx.siteTypePath, 'blueprint', path.basename(ctx.config.blueprintFile));
        ctx.blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));

        // Blueprint Migration
        if (!ctx.blueprint.version || ctx.blueprint.version < '2.0') {
            this.log(`📦 Blueprint migrated to v2.0`);
            ctx.blueprint.version = '2.0';
            if (!ctx.blueprint.design_system) {
                ctx.blueprint.design_system = {
                    colors: { primary: '#0f172a', secondary: '#64748b', accent: '#3b82f6', background: '#ffffff', surface: '#f8fafc', text: '#1e293b' },
                    font_sans: "'Inter', ui-sans-serif, system-ui, sans-serif",
                    font_serif: "'Playfair Display', ui-serif, Georgia, serif",
                    radius: '1rem'
                };
            }
        }

        // Validation
        const valResult = Validator.validateBlueprint(ctx.blueprint);
        if (!valResult.valid) {
            valResult.errors.forEach(e => console.error(`   - ${e}`));
            throw new Error("Invalid Blueprint");
        }

        // 3. Load Discovery Dossier (Optional)
        const projectInputBase = (ctx.config.sourceProject || ctx.config.projectName).replace('-site', '');
        const discoveryPath = path.join(ctx.configManager.get('paths.input'), projectInputBase, 'discovery.json');
        if (fs.existsSync(discoveryPath)) {
            try {
                ctx.discovery = JSON.parse(fs.readFileSync(discoveryPath, 'utf8'));
                this.log(`Loaded strategic discovery from input/${projectInputBase}/discovery.json`);
            } catch (e) {
                this.log(`⚠️ Failed to parse discovery.json: ${e.message}`);
            }
        }

        ctx.paths = {
            sourceLayout: path.join(ctx.siteTypePath, 'web', layoutName),
            fallbackLayout: path.join(ctx.siteTypePath, 'web', 'standard'),
            trackBoilerplate: path.join(ctx.tplRoot, 'boilerplate', ctx.editorStrategy),
            modelBoilerplate: path.join(ctx.tplRoot, 'boilerplate', ctx.editorStrategy, siteModel),
            globalShared: path.join(ctx.tplRoot, 'shared')
        };

        ctx.engine = new TransformationEngine({
            variables: { 
                PROJECT_NAME: ctx.config.projectName, 
                SITE_TYPE_NAME: siteType, 
                LAYOUT_NAME: layoutName, 
                STYLE_NAME: ctx.config.styleName, 
                PRIMARY_TABLE_NAME: ctx.blueprint.data_structure?.[0]?.table_name || 'basis' 
            },
            flags: {
                isWebshop: !!(ctx.blueprint.features || {}).ecommerce,
                isDocked: ctx.editorStrategy === 'docked'
            }
        });
    }
}
