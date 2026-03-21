import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SITES_DIR = path.resolve(ROOT, '../sites');

function fixFooter(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Herstel de foute SVG sluitingen en gedupliceerde spans
    // We zoeken naar het specifieke patroon dat we in chocolade-shop zagen
    if (content.includes('</svg>') && content.includes('data-dock-bind="site_settings.0.titel">{}</span>')) {
        console.log(`🩹 Repairing corrupted Footer: ${filePath}`);
        
        // We proberen de foute blokken te verwijderen en te herstellen naar iets zinvols
        // Dit is een heuristische fix voor het specifieke regex-falen
        content = content.replace(/<\/svg>\s*<span data-dock-type="text" data-dock-bind="site_settings\.0\.titel">{}<\/span>\s*<\/svg>/g, '</svg>');
        content = content.replace(/<\/svg>\s*<div className="text-sm">\s*<span data-dock-type="text" data-dock-bind="site_settings\.0\.titel">{}<\/span>\s*<\/svg>/g, '</svg>');
        
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file === 'Footer.jsx') {
            fixFooter(fullPath);
        }
    });
}

console.log("🛠️ Starting Footer Repair...");
walk(SITES_DIR);
console.log("✨ Repair complete!");
