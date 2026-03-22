import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../../');
const SITES_DIR = path.join(ROOT_DIR, 'sites');
const TEMPLATES_COMPONENTS_DIR = path.join(ROOT_DIR, 'factory/2-templates/shared/components');

const COMPONENTS_TO_UPGRADE = [
    'GenericSection.jsx',
    'Hero.jsx',
    'AboutSection.jsx',
    'Team.jsx',
    'Testimonials.jsx',
    'CTA.jsx',
    'Header.jsx',
    'ProductGrid.jsx'
];

const PREREQUISITE_COMPONENTS = [
    'EditableMedia.jsx',
    'EditableText.jsx',
    'EditableLink.jsx'
];

async function runMigration() {
    console.log('🚀 Starting Global Image & Dock Fix Migration...');
    
    if (!fs.existsSync(SITES_DIR)) {
        console.error('❌ Sites directory not found!');
        process.exit(1);
    }

    const sites = fs.readdirSync(SITES_DIR).filter(f => fs.statSync(path.join(SITES_DIR, f)).isDirectory());
    console.log(`📂 Found ${sites.length} sites to audit.`);

    let upgradeCount = 0;
    let siteCount = 0;

    for (const site of sites) {
        const sitePath = path.join(SITES_DIR, site);
        const componentsPath = path.join(sitePath, 'src/components');
        
        if (!fs.existsSync(componentsPath)) {
            // console.log(`⏩ Skipping ${site} (no src/components)`);
            continue;
        }

        siteCount++;
        let siteUpgraded = false;

        // 1. Ensure Prerequisites
        for (const comp of PREREQUISITE_COMPONENTS) {
            const dest = path.join(componentsPath, comp);
            const src = path.join(TEMPLATES_COMPONENTS_DIR, comp);
            
            if (fs.existsSync(src)) {
                // Always overwrite prerequisites to ensure latest logic
                fs.copyFileSync(src, dest);
            }
        }

        // 2. Upgrade Components if they are "Legacy" or missing latest standard
        for (const comp of COMPONENTS_TO_UPGRADE) {
            const dest = path.join(componentsPath, comp);
            const src = path.join(TEMPLATES_COMPONENTS_DIR, comp);

            if (fs.existsSync(dest) && fs.existsSync(src)) {
                const currentContent = fs.readFileSync(dest, 'utf8');
                
                // Aggressive Detection logic:
                // - Contains <img AND (src={item[ or src={hero. or src={getImageUrl)
                // - OR uses literal data-dock-bind strings for indices (missing ${index})
                const hasLegacyImg = currentContent.includes('<img') && 
                                   (currentContent.includes('src={item[') || 
                                    currentContent.includes('src={hero.') || 
                                    currentContent.includes('src={info.') || 
                                    currentContent.includes('src={getImageUrl'));
                
                const hasLiteralBind = currentContent.includes('data-dock-bind="') && 
                                     (currentContent.match(/\.0\./g) || []).length > 2; // Heuristic for literal indices

                const missingEditableMedia = !currentContent.includes('EditableMedia') && 
                                           (currentContent.includes('img') || currentContent.includes('foto') || currentContent.includes('afbeelding'));

                if (hasLegacyImg || hasLiteralBind || missingEditableMedia) {
                    fs.copyFileSync(src, dest);
                    siteUpgraded = true;
                    upgradeCount++;
                }
            }
        }

        // 3. Special case for Section.jsx (Multi-Section)
        const sectionJsx = path.join(componentsPath, 'Section.jsx');
        if (fs.existsSync(sectionJsx)) {
            let content = fs.readFileSync(sectionJsx, 'utf8');
            let originalContent = content;

            // Fix img src (add getImageUrl)
            // Pattern: <img src={hero[imgKey] || ...} or <img src={img}
            content = content.replace(/<img\s+src=\{((?:hero|item|info)\[imgKey\]|img|foto|afbeelding)([^}]*)\}/g, (match, p1, p2) => {
                if (match.includes('getImageUrl')) return match;
                return `<img src={getImageUrl(${p1}${p2})}`;
            });

            // Pattern: data-dock-bind={`sectionName.0.titel`} -> data-dock-bind={`${sectionName}.0.titel`}
            content = content.replace(/data-dock-bind=\{`sectionName\.0\./g, 'data-dock-bind={`${sectionName}.0.');
            // Pattern: data-dock-bind={`sectionName.${index}.imgKey`} -> data-dock-bind={`${sectionName}.${index}.${imgKey}`}
            content = content.replace(/data-dock-bind=\{`sectionName\.\$\{index\}\.imgKey`\}/g, 'data-dock-bind={`${sectionName}.${index}.${imgKey}`}');
            
            // Fix broken dynamic field binds in grids/lists if possible
            // e.g. data-dock-bind={`sectionName.${index}.${item.afbeelding}`} -> should use the variable or a generic key
            // This is safer to leave if it's too specific, but we've fixed the indices.
            content = content.replace(/data-dock-bind=\{`sectionName\.\$\{index\}/g, 'data-dock-bind={`${sectionName}.${index}');

            // Ensure getImageUrl is present
            if (content.includes('getImageUrl') && !content.includes('const getImageUrl')) {
                const getImageUrlFn = `
  const getImageUrl = (url) => {
    if (!url) return '';
    if (typeof url === 'object') url = url.text || url.url || '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = import.meta.env.BASE_URL || '/';
    return (base + '/images/' + url).replace(new RegExp('/+', 'g'), '/');
  };
`;
                // Inject after function start
                content = content.replace(/const Section = \(\{ data \}\) => \{/, `const Section = ({ data }) => {${getImageUrlFn}`);
                // Handle different arrow function styles
                if (content === originalContent) {
                   content = content.replace(/const Section = \(props\) => \{/, `const Section = (props) => {${getImageUrlFn}`);
                }
            }

            if (content !== originalContent) {
                fs.writeFileSync(sectionJsx, content);
                siteUpgraded = true;
                upgradeCount++;
            }
        }

        if (siteUpgraded) {
            // console.log(`✅ Site upgraded: ${site}`);
        }
    }

    console.log('\n--- Migration Results ---');
    console.log(`✅ Total Sites Audited: ${siteCount}`);
    console.log(`✨ Total Components Upgraded: ${upgradeCount}`);
    console.log('🚀 Migration Completed successfully.');
}

runMigration().catch(err => {
    console.error('❌ Migration failed:', err);
});
