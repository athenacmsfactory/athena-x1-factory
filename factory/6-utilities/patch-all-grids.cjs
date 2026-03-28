
const fs = require('fs');
const path = require('path');

const SITES_DIR = '/home/kareltestspecial/0-IT/3-DEV/y1/y/werkplaats';

function patchFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Replace Grid containers with Flex centering
    const gridPattern = /className=\{`([^`]*?)grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-(\d+)([^`]*?)`\}/g;
    const gridPatternLiteral = /className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-(\d+)"/g;

    const newContainerClass = (match, p1, p2, p3) => {
        changed = true;
        return `className={\`${p1}flex flex-wrap justify-center gap-${p2}${p3}\`}`;
    };

    const newContainerLiteral = (match, p1) => {
        changed = true;
        return `className="flex flex-wrap justify-center gap-${p1}"`;
    };

    content = content.replace(gridPattern, newContainerClass);
    content = content.replace(gridPatternLiteral, newContainerLiteral);

    // 2. Patch individual items (articles/divs) to have flexible width
    // This is trickier since we don't know the exact class, but we look for common patterns in Section.jsx
    
    // Pattern for common Athena card-like items inside maps
    const itemPattern = /className=\{`([^`]*?)card group reveal flex ([^`]*?)`\}/g;
    content = content.replace(itemPattern, (match, p1, p2) => {
        if (match.includes('w-full')) return match; // Already patched
        changed = true;
        return `className={\`${p1}card group reveal flex ${p2} w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)]\`}`;
    });

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Patched: ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file === 'components') {
                const componentFiles = fs.readdirSync(fullPath);
                for (const cf of componentFiles) {
                    if (cf === 'Section.jsx' || cf.endsWith('Section.jsx')) {
                        patchFile(path.join(fullPath, cf));
                    }
                }
            } else {
                walk(fullPath);
            }
        }
    }
}

console.log('🚀 Starting Athena Grid Centering Patch...');
walk(SITES_DIR);
console.log('✨ Patching complete.');
