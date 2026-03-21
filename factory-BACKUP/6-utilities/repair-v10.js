import fs from 'fs';
import path from 'path';

/**
 * 🩹 Athena v8.8 Ultra-Robust Button & Label Repair (v10)
 * Herstelt lege labels {}, foute onClick handlers en ontbrekende variabelen.
 */

const ROOT = process.cwd();
const TARGET_DIRS = [
    path.join(ROOT, '3-sitetypes'),
    path.resolve(ROOT, '../sites')
];

function repairFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Herstel lege buttons/links: {} -> {item.label || "..."}
    // We proberen de variabele te raden op basis van de binding
    const brokenButton = /<button([^>]*?)>{}<\/button>/g;
    if (brokenButton.test(content)) {
        content = content.replace(brokenButton, (match, attrs) => {
            const bindMatch = attrs.match(/data-dock-bind={?\`?([^}\`"]+)/);
            let labelVar = "item.label || item.titel || 'Klik hier'";
            if (bindMatch) {
                const parts = bindMatch[1].split('.');
                const key = parts[parts.length - 1];
                if (key.includes('label')) labelVar = `item.${key}`;
                if (key.includes('titel')) labelVar = `item.${key}`;
            }
            // Veiligheids-fallback: als we geen item context hebben, gebruiken we een string
            if (content.includes('headerContent')) labelVar = "headerContent.cta_label || 'Contact'";
            
            return `<button${attrs}>{${labelVar}}</button>`;
        });
        modified = true;
    }

    // 2. Herstel kapotte onClick handlers ( || "")
    const brokenOnClick = /document\.getElementById\(\("" \|\| ""\)\.replace\("#", ""\)\)/g;
    if (brokenOnClick.test(content)) {
        content = content.replace(brokenOnClick, 'document.getElementById("contact")'); // Redelijk veilige default voor Athena
        modified = true;
    }

    // 3. Herstel foute binding literals (sectionName.0...) -> template literals
    const brokenBind = /data-dock-bind="sectionName\.0\.([^"]+)"/g;
    if (brokenBind.test(content)) {
        content = content.replace(brokenBind, (match, key) => {
            return `data-dock-bind={\`sectionName.0.${key}\`}`;
        });
        modified = true;
    }

    // 4. Specifieke fix voor de Footer SVG fouten
    const svgFout = /<\/svg>\s*<span data-dock-type="text" data-dock-bind="site_settings\.0\.titel">{}<\/span>\s*<\/svg>/g;
    if (svgFout.test(content)) {
        content = content.replace(svgFout, '</svg>');
        modified = true;
    }

    if (modified) {
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
            if (repairFile(fullPath)) {
                console.log(`✅ Repaired: ${fullPath.replace(ROOT, '')}`);
            }
        }
    });
}

console.log("🛠️ Starting v10 Ultra-Repair...");
TARGET_DIRS.forEach(dir => walk(dir));
console.log("✨ All sites should be compileable again!");
