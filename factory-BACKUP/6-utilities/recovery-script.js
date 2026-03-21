import fs from 'fs';
import path from 'path';

/**
 * 🆘 Athena v8.8 Syntax Recovery Script
 * Herstelt de foutieve '( || "")' syntax geïntroduceerd door de vorige v7 run.
 */

const ROOT = process.cwd();
const TARGET_DIRS = [
    path.join(ROOT, '3-sitetypes'),
    path.resolve(ROOT, '../sites')
];

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // De specifieke foutieve string opzoeken en herstellen naar een veilige fallback
    const brokenPattern = /\( \|\| ""\)/g;
    
    if (brokenPattern.test(content)) {
        // We herstellen het naar een veilige variabele-check of een lege string
        // In dit geval is het beter om de hele onClick handler iets robuuster te maken
        content = content.replace(brokenPattern, '("" || "")');
        
        // Of nog beter: we zoeken het hele onClick blok en maken het werkend
        content = content.replace(/const target = document\.getElementById\(("" || "")\.replace\("#", ""\)\);/g, 
                                  'const target = null; // Autorepair: Link target was missing');

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
            if (file !== 'node_modules' && file !== '.git') walk(fullPath);
        } else if (file.endsWith('.jsx')) {
            if (fixFile(fullPath)) {
                console.log(`🩹 Repaired: ${fullPath.replace(ROOT, '')}`);
            }
        }
    });
}

console.log("🛠️ Starting Syntax Recovery...");
TARGET_DIRS.forEach(dir => walk(dir));
console.log("✨ Recovery complete!");
