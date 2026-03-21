import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { BasePhase } from './BasePhase.js';
import { QualityChecker } from '../../lib/quality-check.js';
import { DataAggregator } from '../../logic/data-aggregator.js';

export class FinalizePhase extends BasePhase {
    constructor() {
        super('Finalize');
    }

    async execute(ctx) {
        this.log('Finalizing project configuration...');

        // 1. Data Aggregation (NEW)
        DataAggregator.aggregate(ctx.projectDir);

        // 2. package.json
        const pkg = {
            name: ctx.safeName,
            type: "module",
            scripts: {
                "fetch-data": "node fetch-data.js",
                "dev": "vite",
                "build": "vite build"
            },
            dependencies: {
                "react": "^19.0.0",
                "react-dom": "^19.0.0",
                "react-router-dom": "^6.20.0",
                "csvtojson": "^2.0.10",
                "@heroicons/react": "^2.2.0",
                "lucide-react": "^0.300.0"
            },
            devDependencies: {
                "@tailwindcss/vite": "^4.0.0",
                "tailwindcss": "^4.0.0",
                "vite": "^6.0.0",
                "@vitejs/plugin-react": "^4.0.0",
                "dotenv": "^17.2.3"
            }
        };
        fs.writeFileSync(path.join(ctx.projectDir, 'package.json'), JSON.stringify(pkg, null, 2));

        // 2. Vite Config & Ports
        this.setupViteConfig(ctx);

        // 3. Client Instructions & Readme
        this.generateInstructions(ctx);
        this.generateReadme(ctx);

        // 4. Git (Monorepo check)
        this.setupGit(ctx);

        // 5. SEO
        await this.generateSEO(ctx);

        // 6. Quality Check
        QualityChecker.check(ctx.projectDir);
    }

    setupViteConfig(ctx) {
        const viteTplPath = path.join(ctx.tplRoot, 'config/vite.config.js');
        const viteTpl = fs.readFileSync(viteTplPath, 'utf8');

        const registryPath = path.join(ctx.factoryRoot, 'config/site-ports.json');
        let portMap = {};
        if (fs.existsSync(registryPath)) {
            try { portMap = JSON.parse(fs.readFileSync(registryPath, 'utf8')); }
            catch (e) { }
        }

        let port = portMap[ctx.safeName];
        if (!port) {
            do {
                port = 5001 + Math.floor(Math.random() * 1499);
            } while (port === 6000 || Object.values(portMap).includes(port));
            portMap[ctx.safeName] = port;
            try { fs.writeFileSync(registryPath, JSON.stringify(portMap, null, 4)); } catch (e) { }
        }

        const finalViteConfig = viteTpl
            .replace(/\{\{\s*BASE_PATH\s*\}\}/g, './')
            .replace(/\{\{\s*PORT\s*\}\}/g, port.toString());

        fs.writeFileSync(path.join(ctx.projectDir, 'vite.config.js'), finalViteConfig);
    }

    generateInstructions(ctx) {
        const templatePath = path.join(ctx.configManager.get('paths.templates'), 'docs/client-manual.md');
        if (fs.existsSync(templatePath)) {
            let content = fs.readFileSync(templatePath, 'utf8');
            let dynamic = "";
            (ctx.blueprint.data_structure || []).forEach(table => {
                dynamic += `### Tabblad: \`${table.table_name}\`\n\n| Kolomnaam | Beschrijving |\n| :--- | :--- |\n`;
                (table.columns || []).forEach(col => {
                    const name = typeof col === 'object' ? col.name : col;
                    const desc = typeof col === 'object' ? (col.description || "Geen beschrijving.") : "Geen beschrijving.";
                    dynamic += `| \`${name}\` | ${desc} |\n`;
                });
                dynamic += `\n`;
            });
            content = content.replace(/{{PROJECT_NAME}}/g, ctx.config.projectName)
                .replace(/{{BLUEPRINT_NAME}}/g, ctx.blueprint.blueprint_name)
                .replace(/{{DYNAMIC_CONTENT}}/g, dynamic);
            fs.writeFileSync(path.join(ctx.projectDir, 'HANDLEIDING_BEHEER.md'), content);
        }
    }

    generateReadme(ctx) {
        const ORG = ctx.configManager.get('github.org') || ctx.configManager.get('github.user') || "athena-cms";
        fs.writeFileSync(path.join(ctx.projectDir, 'README.md'), `https://${ORG}.github.io/${ctx.safeName}`);
    }

    setupGit(ctx) {
        try {
            let isInsideRepo = false;
            try {
                execSync('git rev-parse --is-inside-work-tree', { cwd: path.dirname(ctx.projectDir), stdio: 'ignore' });
                isInsideRepo = true;
            } catch (e) { }

            if (!isInsideRepo) {
                execSync('git init', { cwd: ctx.projectDir, stdio: 'ignore' });
                execSync('git add .', { cwd: ctx.projectDir, stdio: 'ignore' });
                execSync('git commit -m "feat: initial Athena build"', { cwd: ctx.projectDir, stdio: 'ignore' });
            }
        } catch (e) { }
    }

    async generateSEO(ctx) {
        const domain = `https://${ctx.config.projectName}.netlify.app`;
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
        fs.writeFileSync(path.join(ctx.projectDir, 'public/sitemap.xml'), sitemap);
        fs.writeFileSync(path.join(ctx.projectDir, 'public/robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${domain}/sitemap.xml`);
    }
}
