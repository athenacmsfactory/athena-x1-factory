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
            try {
                aggregated[key] = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
            } catch (e) {
                this.log(`⚠️ Warning: Failed to parse ${file}: ${e.message}`);
            }
        });

        fs.writeFileSync(path.join(dataDir, 'all_data.json'), JSON.stringify(aggregated, null, 2));
        this.log(`Aggregated ${files.length} data files into all_data.json`);

        // Kopieer site-logo/icon
        const iconSrc = path.join(ctx.engineRoot, '../athena-icon.svg');
        if (fs.existsSync(iconSrc)) {
            fs.copyFileSync(iconSrc, path.join(ctx.projectDir, 'public/athena-icon.svg'));
            this.log('Copied athena-icon.svg to public/');
        }
        
        // 🔱 v9.0 Modern Lego package.json (Tailwind v4 & React 19 Ready)
        const pkg = {
            name: ctx.safeName,
            private: true,
            version: "1.0.0",
            type: "module",
            scripts: {
                "dev": "vite",
                "build": "vite build",
                "preview": "vite preview"
            },
            dependencies: {
                "react": "^19.0.0",
                "react-dom": "^19.0.0",
                "react-router-dom": "^7.0.0",
                "lucide-react": "^0.475.0",
                "@heroicons/react": "^2.2.0"
            },
            devDependencies: {
                "vite": "^6.0.0",
                "@vitejs/plugin-react": "^4.3.0",
                "tailwindcss": "^4.0.0",
                "@tailwindcss/vite": "^4.0.0",
                "dotenv": "^17.3.1"
            }
        };
        fs.writeFileSync(path.join(ctx.projectDir, 'package.json'), JSON.stringify(pkg, null, 2));
        this.log('Generated modern package.json with Tailwind v4 support.');
    }
}
