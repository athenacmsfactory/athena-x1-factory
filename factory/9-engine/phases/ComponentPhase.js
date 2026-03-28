import fs from 'fs';
import path from 'path';
import BasePhase from './BasePhase.js';
import { LegoLibrary } from '../lib/LegoRegistry.js';

export default class ComponentPhase extends BasePhase {
    constructor() {
        super('Component');
    }

    async execute(ctx) {
        this.log(`Assembling Lego components...`);
        
        // 1. Copy mandatory pieces
        const pieces = [
            { cat: 'headers', id: 'standard', target: 'Header.jsx' },
            { cat: 'footers', id: 'standard', target: 'Footer.jsx' },
            { cat: 'heros', id: 'standard', target: 'Hero.jsx' }
        ];

        pieces.forEach(p => {
            const piece = LegoLibrary[p.cat].find(x => x.id === p.id);
            const src = path.join(ctx.libraryRoot, piece.path);
            const dest = path.join(ctx.projectDir, 'src/components', p.target);
            fs.copyFileSync(src, dest);
            this.log(`  -> Installed Lego Piece: ${p.cat}/${p.id} as ${p.target}`);
        });

        // Copy v9.0 Dock Connector Bridge & Utils
        const dockSrc = path.join(ctx.libraryRoot, 'boilerplate/src/components/DockConnector.jsx');
        const dockDest = path.join(ctx.projectDir, 'src/components/DockConnector.jsx');
        if (fs.existsSync(dockSrc)) {
            fs.copyFileSync(dockSrc, dockDest);
            this.log(`  -> Installed Lego Bridge: DockConnector.jsx`);
        }

        const utilsSrc = path.join(ctx.libraryRoot, 'boilerplate/src/lib/LegoUtils.jsx');
        const utilsDestDir = path.join(ctx.projectDir, 'src/lib');
        if (!fs.existsSync(utilsDestDir)) fs.mkdirSync(utilsDestDir, { recursive: true });
        if (fs.existsSync(utilsSrc)) {
            fs.copyFileSync(utilsSrc, path.join(utilsDestDir, 'LegoUtils.jsx'));
            this.log(`  -> Installed Lego Utils: LegoUtils.jsx`);
        }

        // 2. Build Section.jsx based on section_order.json
        this.generateSectionComponent(ctx);
    }

    generateSectionComponent(ctx) {
        const orderPath = path.join(ctx.projectDir, 'src/data/section_order.json');
        const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));

        // v9.0 Dynamic Mapping (Prefers direct match or falls back to generic)
        const sectionMap = {
            'hero': { component: 'Hero', file: 'Hero.jsx', libraryPath: 'heros/Standard.jsx' },
            'over_ons': { component: 'About', file: 'About.jsx', libraryPath: 'sections/About.jsx' },
            'features': { component: 'Features', file: 'Features.jsx', libraryPath: 'sections/Features.jsx' },
            'testimonials': { component: 'Testimonials', file: 'Testimonials.jsx', libraryPath: 'sections/Testimonials.jsx' },
            'contact': { component: 'Contact', file: 'Contact.jsx', libraryPath: 'sections/Contact.jsx' }
        };

        const activeSections = order.filter(s => sectionMap[s] || fs.existsSync(path.join(ctx.libraryRoot, `sections/${s.charAt(0).toUpperCase() + s.slice(1)}.jsx`)));
        
        let imports = `import React from 'react';\n`;
        activeSections.forEach(s => {
            let info = sectionMap[s];
            if (!info) {
                // Auto-detect from library
                const compName = s.charAt(0).toUpperCase() + s.slice(1);
                info = { component: compName, file: `${compName}.jsx`, libraryPath: `sections/${compName}.jsx` };
            }

            imports += `import ${info.component} from './${info.component}';\n`;
            
            const src = path.join(ctx.libraryRoot, info.libraryPath);
            const dest = path.join(ctx.projectDir, 'src/components', info.file);
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
                this.log(`  -> Installed Lego Section Piece: ${s} as ${info.file}`);
            }
        });

        let renderLoop = activeSections.map(s => {
            const info = sectionMap[s] || { component: s.charAt(0).toUpperCase() + s.slice(1) };
            return `      <div data-dock-section="${s}">
        <${info.component} data={data.${s}} sectionName="${s}" />
      </div>`;
        }).join('\n');

        const code = `
${imports}

function Section({ data }) {
  if (!data) return <div className="p-20 text-center font-bold text-slate-400">Loading data...</div>;

  return (
    <div className="sections-wrapper">
${renderLoop || '      {/* No active sections found */}'}
    </div>
  );
}

export default Section;
`;
        fs.writeFileSync(path.join(ctx.projectDir, 'src/components/Section.jsx'), code);
        this.log('Generated dynamic Section.jsx with data-dock-section tagging.');
    }
}
