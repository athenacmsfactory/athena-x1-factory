import fs from 'fs';
import path from 'path';
import BasePhase from './BasePhase.js';

export default class FinalizePhase extends BasePhase {
    constructor() {
        super('Finalize');
    }

    async execute(ctx) {
        this.log(`Finalizing project ${ctx.projectName}...`);
        
        const dataDir = path.join(ctx.projectDir, 'src/data');
        const aggregated = {};

        // Consolidatie naar all_data.json
        const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'all_data.json');
        files.forEach(file => {
            const key = file.replace('.json', '');
            aggregated[key] = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
        });

        fs.writeFileSync(path.join(dataDir, 'all_data.json'), JSON.stringify(aggregated, null, 2));
        this.log(`Aggregated ${files.length} data files into all_data.json`);

        // Kopieer site-logo/icon
        const iconSrc = path.join(ctx.engineRoot, '../athena-icon.svg');
        if (fs.existsSync(iconSrc)) {
            fs.copyFileSync(iconSrc, path.join(ctx.projectDir, 'public/athena-icon.svg'));
            this.log('Copied athena-icon.svg to public/');
        }
        
        // Dummy project package.json
        const pkg = {
            name: ctx.safeName,
            private: true,
            version: "0.0.0",
            type: "module",
            scripts: {
                "dev": "vite",
                "build": "vite build",
                "preview": "vite preview"
            },
            dependencies: {
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
                "react-router-dom": "^6.14.2"
            },
            devDependencies: {
                "@types/react": "^18.2.15",
                "@types/react-dom": "^18.2.7",
                "@vitejs/plugin-react": "^4.0.3",
                "vite": "^6.4.1"
            }
        };
        fs.writeFileSync(path.join(ctx.projectDir, 'package.json'), JSON.stringify(pkg, null, 2));
    }
}
