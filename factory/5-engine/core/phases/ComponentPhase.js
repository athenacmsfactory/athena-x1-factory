import fs from 'fs';
import path from 'path';
import { BasePhase } from './BasePhase.js';
import { generateSectionComponent } from '../../logic/standard-layout-generator.js';

export class ComponentPhase extends BasePhase {
    constructor() {
        super('Component');
    }

    async execute(ctx) {
        this.log('Assembling UI components...');
        this.assembleComponents(ctx);
        this.generateSpecialComponents(ctx);
    }

    assembleComponents(ctx) {
        const essential = [
            'EditableImage.jsx', 'EditableMedia.jsx', 'EditableText.jsx', 'EditableLink.jsx',
            'CartContext.jsx', 'CartOverlay.jsx', 'Checkout.jsx', 'RepeaterControls.jsx',
            'Header.jsx', 'Footer.jsx', 'SectionToolbar.jsx', 'MetadataConfigModal.jsx', 'AboutSection.jsx',
            'StyleContext.jsx', 'DisplayConfigContext.jsx',
            'Hero.jsx', 'Testimonials.jsx', 'Team.jsx', 'FAQ.jsx', 'CTA.jsx', 'ProductGrid.jsx', 'GenericSection.jsx', 'StyleInjector.jsx'
        ];
        
        essential.forEach(comp => {
            let src = [
                path.join(ctx.paths.modelBoilerplate, 'components', comp),
                path.join(ctx.paths.trackBoilerplate, 'shared/components', comp),
                path.join(ctx.paths.globalShared, 'components', comp),
                path.join(ctx.tplRoot, 'components', comp)
            ].find(fs.existsSync);
            
            if (src) {
                fs.writeFileSync(
                    path.join(ctx.projectDir, 'src/components', comp), 
                    ctx.engine.transform(fs.readFileSync(src, 'utf8'), comp)
                );
            }
        });

        // Copy custom components from sitetype
        const customCompDir = path.join(ctx.paths.sourceLayout, 'components');
        if (fs.existsSync(customCompDir)) {
            const customFiles = fs.readdirSync(customCompDir).filter(f => f.endsWith('.jsx'));
            customFiles.forEach(comp => {
                const src = path.join(customCompDir, comp);
                fs.writeFileSync(
                    path.join(ctx.projectDir, 'src/components', comp), 
                    ctx.engine.transform(fs.readFileSync(src, 'utf8'), comp)
                );
            });
        }

        // Shared UI components (flat copy)
        [path.join(ctx.paths.globalShared, 'components/ui'), path.join(ctx.paths.trackBoilerplate, 'shared/components/ui')].forEach(src => {
            if (fs.existsSync(src)) fs.cpSync(src, path.join(ctx.projectDir, 'src/components/ui'), { recursive: true });
        });

        // Special: dock-connector.js (only for docked track)
        if (ctx.editorStrategy === 'docked') {
            const connSrc = path.join(ctx.paths.trackBoilerplate, 'shared/public/dock-connector.js');
            if (fs.existsSync(connSrc)) {
                fs.copyFileSync(connSrc, path.join(ctx.projectDir, 'src/dock-connector.js'));
            }
        }
    }

    generateSpecialComponents(ctx) {
        try {
            const customSectionSrc = [
                path.join(ctx.paths.sourceLayout, 'components/Section.jsx'),
                path.join(ctx.paths.sourceLayout, 'Section.jsx')
            ].find(fs.existsSync);

            if (customSectionSrc) {
                this.log(`🎨 Using sitetype-specific Section.jsx`);
                fs.writeFileSync(
                    path.join(ctx.projectDir, 'src/components/Section.jsx'),
                    ctx.engine.transform(fs.readFileSync(customSectionSrc, 'utf8'), 'Section.jsx')
                );
            } else {
                const code = generateSectionComponent(ctx.blueprint, ctx.editorStrategy);
                fs.writeFileSync(path.join(ctx.projectDir, 'src/components/Section.jsx'), code);
            }
        } catch (e) { this.log(`⚠️ Failed to generate Section.jsx: ${e.message}`); }

        // Local CSS File
        const styleFileName = ctx.config.styleName.endsWith('.css') ? ctx.config.styleName : `${ctx.config.styleName}.css`;
        const styleSrc = path.join(ctx.tplRoot, 'boilerplate/docked/css', styleFileName);
        if (fs.existsSync(styleSrc)) fs.copyFileSync(styleSrc, path.join(ctx.projectDir, 'src', styleFileName));
    }
}
