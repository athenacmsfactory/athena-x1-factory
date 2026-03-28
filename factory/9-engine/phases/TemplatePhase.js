import fs from 'fs';
import path from 'path';
import BasePhase from './BasePhase.js';

export default class TemplatePhase extends BasePhase {
    constructor() {
        super('Template');
    }

    async execute(ctx) {
        this.log(`Copying boilerplate to ${ctx.projectDir}...`);
        
        const boilerplateDir = path.join(ctx.libraryRoot, 'boilerplate');
        
        // Skip src/components (handled by ComponentPhase)
        fs.cpSync(boilerplateDir, ctx.projectDir, { 
            recursive: true,
            filter: (src) => !src.includes('src/components')
        });

        // Replace placeholders in index.html and vite.config.js
        ['index.html', 'vite.config.js'].forEach(file => {
            const p = path.join(ctx.projectDir, file);
            let content = fs.readFileSync(p, 'utf8');
            content = content.replace(/{{PROJECT_NAME}}/g, ctx.projectName);
            // Voor nu poort 6454 als default
            content = content.replace(/{{PORT}}/g, '6454');
            fs.writeFileSync(p, content);
        });
    }
}
