import fs from 'fs';
import path from 'path';
import BasePhase from './BasePhase.js';

export default class InitializePhase extends BasePhase {
    constructor() {
        super('Initialize');
    }

    async execute(ctx) {
        this.log(`Initializing project directories for ${ctx.projectName}...`);
        
        const dirs = [
            ctx.projectDir,
            path.join(ctx.projectDir, 'src/data'),
            path.join(ctx.projectDir, 'src/components'),
            path.join(ctx.projectDir, 'public/images')
        ];

        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.log(`Created: ${dir}`);
            }
        });
    }
}
