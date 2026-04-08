import fs from 'fs';
import path from 'path';
import { BasePhase } from './BasePhase.js';

export class BoilerplatePhase extends BasePhase {
    constructor() {
        super('Boilerplate');
    }

    async execute(ctx) {
        this.log('Copying base project structures...');

        // 1. Public Folder
        [ctx.paths.globalShared, path.join(ctx.paths.trackBoilerplate, 'shared')].forEach(base => {
            const src = path.join(base, 'public');
            if (fs.existsSync(src)) {
                fs.cpSync(src, path.join(ctx.projectDir, 'public'), { recursive: true });

                // Transform manifest and sw if they exist
                ['manifest.json', 'sw.js'].forEach(f => {
                    const p = path.join(ctx.projectDir, 'public', f);
                    if (fs.existsSync(p)) {
                        fs.writeFileSync(p, ctx.engine.transform(fs.readFileSync(p, 'utf8'), f));
                    }
                });
            }
        });

        // 2. Base Logic
        ['logic/fetch-data.js', 'logic/mapper.js', 'config/index.html', 'config/project.gitignore', 'config/deploy.yml'].forEach(src => {
            const srcPath = path.join(ctx.tplRoot, src);
            if (fs.existsSync(srcPath)) {
                const dest = src.includes('/') ? src.split('/').pop() : src;
                const dPath = src === 'config/deploy.yml' ? '.github/workflows/deploy.yml' : (src === 'config/project.gitignore' ? '.gitignore' : dest);
                fs.writeFileSync(path.join(ctx.projectDir, dPath), ctx.engine.transform(fs.readFileSync(srcPath, 'utf8'), src));
            }
        });

        // 3. Core React Files
        this.copyCoreFile(ctx, 'App.jsx');
        this.copyCoreFile(ctx, 'index.css');
        this.copyCoreFile(ctx, 'main.jsx');

        // 4. Copy CSS Themes
        const cssSrc = path.join(ctx.paths.trackBoilerplate, 'css');
        if (fs.existsSync(cssSrc)) {
            fs.cpSync(cssSrc, path.join(ctx.projectDir, 'src/css'), { recursive: true });
        }
    }

    copyCoreFile(ctx, fileName) {
        let src = [
            path.join(ctx.paths.sourceLayout, fileName), 
            path.join(ctx.paths.fallbackLayout, fileName), 
            path.join(ctx.paths.modelBoilerplate, fileName)
        ].find(fs.existsSync);
        
        if (!src) return;
        
        let content = fs.readFileSync(src, 'utf8');
        
        if (fileName === 'main.jsx') content = this.injectDataLoading(ctx, content);
        if (fileName === 'App.jsx' && ctx.engine.flags.isWebshop && ctx.config.siteModel === 'SPA') {
            content = this.transformWebshopApp(content);
        }

        // Fix CSS paths for v7.6.2 structure
        if (fileName === 'index.css') {
            content = content.replace('@import "../css/', '@import "./css/');
        }
        if (fileName.endsWith('.jsx')) {
            content = content.replace(/import '\.\/(?!index)([a-z-]+)\.css'/g, "import './css/$1.css'");
        }

        fs.writeFileSync(path.join(ctx.projectDir, 'src', fileName), ctx.engine.transform(content, fileName));
    }

    injectDataLoading(ctx, content) {
        const logic = `
    const dataModules = import.meta.glob('./data/*.json', { eager: true });
    const getData = (name) => {
        const key = Object.keys(dataModules).find(k => k.toLowerCase().endsWith(\`/\${name.toLowerCase()}.json\`));
        return key ? dataModules[key].default : null;
    };
    data['section_order'] = getData('section_order') || [];
    data['header'] = getData('header') || {};
    data['hero'] = getData('hero') || {};
    data['footer'] = getData('footer') || {};
    data['site_settings'] = getData('site_settings') || {};
    data['display_config'] = getData('display_config') || { sections: {} };
    data['layout_settings'] = getData('layout_settings') || {};
    for (const sectionName of data['section_order']) {
        const sectionData = getData(sectionName);
        data[sectionName] = sectionData ? (Array.isArray(sectionData) ? sectionData : [sectionData]) : [];
    }
    if (window.athenaScan) window.athenaScan(data);`;

        const styleFile = ctx.config.styleName.toLowerCase().endsWith('.css') ? ctx.config.styleName : `${ctx.config.styleName}.css`;
        return content.replace('{{DATA_LOADING_LOGIC}}', logic).replace('./style-import.css', `./${styleFile}`);
    }

    transformWebshopApp(content) {
        // Keeping current legacy string-based replacement for now
        return `import React from 'react';\nimport { HashRouter as Router, Routes, Route } from 'react-router-dom';\nimport Header from './components/Header';\nimport Section from './components/Section';\nimport Footer from './components/Footer';\nimport Checkout from './components/Checkout';\nimport CartOverlay from './components/CartOverlay';\nimport { CartProvider } from './components/CartContext';\nconst Layout = ({ data, children }) => (\n<div className=\"min-h-screen bg-[var(--color-background)]\">\n<Header data={data} />\n<main className=\"pt-20\">{children}</main>\n<Footer data={data} />\n<CartOverlay />\n</div>\n);\nconst App = ({ data }) => (\n<CartProvider>\n<Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>\n<Routes>\n<Route path=\"/\" element={<Layout data={data}><Section data={data} /></Layout>} />\n<Route path=\"/checkout\" element={<Layout data={data}><Checkout /></Layout>} />\n</Routes>\n</Router>\n</CartProvider>\n);\nexport default App;`;
    }
}
