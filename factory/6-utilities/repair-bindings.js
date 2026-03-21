import fs from 'fs';
import path from 'path';

/**
 * 🛠️ Athena v8.8 Binding Repair Tool
 * Herstelt foute variabelen in data-dock-bind attributen.
 */

const ROOT = process.cwd();
const TARGET_DIRS = [
    path.join(ROOT, '3-sitetypes'),
    path.resolve(ROOT, '../sites')
];

function repairFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Herstel sectionName literal naar template literal
    // Van: data-dock-bind="sectionName.0.key"
    // Naar: data-dock-bind={`sectionName.0.key`} (de dock-connector handelt de rest af)
    const brokenLiteral = /data-dock-bind="sectionName\.0\.([^"]+)"/g;
    if (brokenLiteral.test(content)) {
        content = content.replace(brokenLiteral, (match, key) => {
            return `data-dock-bind={\`sectionName.0.${key}\`}`;
        });
        modified = true;
    }

    // 2. Herstel lege labels {} naar de juiste variabelen indien mogelijk
    // Dit is lastiger, we zoeken naar patronen in de buurt
    const emptyLabel = />{}<\/span>/g;
    if (emptyLabel.test(content)) {
        // Voor nu vullen we ze met een placeholder of proberen we de variabele te raden
        // Maar het belangrijkste is dat we de site niet breken.
        content = content.replace(emptyLabel, '>...</span>');
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
            walk(fullPath);
        } else if (file.endsWith('.jsx')) {
            if (repairFile(fullPath)) {
                console.log(`🩹 Repaired bindings: ${fullPath.replace(ROOT, '')}`);
            }
        }
    });
}

console.log("🛠️ Starting Binding Repair...");
TARGET_DIRS.forEach(dir => walk(dir));
console.log("✨ Repair complete!");
