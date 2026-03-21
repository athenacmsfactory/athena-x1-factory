import fs from 'fs';
import path from 'path';

/**
 * 🚀 Athena v8.8 Component Modernizer (v7 - Total Annihilation)
 */

const ROOT = process.cwd();
const TARGET_DIRS = [
    path.join(ROOT, '3-sitetypes'),
    path.resolve(ROOT, '../sites')
];

function modernizeFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Helper om props te extraheren
    const getProp = (attrStr, name) => {
        const regex = new RegExp(`${name}=(?:{([\s\S]*?)}|["']([\s\S]*?)["'])`);
        const m = attrStr.match(regex);
        if (!m) return null;
        return (m[1] || m[2]).trim();
    };

    // 1. Regex voor componenten met CHILDREN (bijv. <EditableLink>Label</EditableLink>)
    const childrenRegex = /<Editable(Text|Link|Media)([\s\S]*?)>([\s\S]*?)<\/Editable\1>/g;
    if (childrenRegex.test(content)) {
        content = content.replace(childrenRegex, (match, type, attrStr, children) => {
            const className = getProp(attrStr, 'className') || '';
            const tagName = getProp(attrStr, 'tagName') || (type === 'Text' ? 'span' : (type === 'Media' ? 'img' : 'a'));
            const url = getProp(attrStr, 'url') || '';
            const src = getProp(attrStr, 'src') || '';

            // Binding
            let file, index, key;
            const cmsBind = getProp(attrStr, 'cmsBind');
            if (cmsBind) {
                const f = cmsBind.match(/file:\s*(?:['"]([^'"]+)['"]|([^,}\s]+))/);
                const i = cmsBind.match(/index:\s*(\d+|[^,}\s]+)/);
                const k = cmsBind.match(/key:\s*(?:['"]([^'"]+)['"]|([^,}\s]+))/);
                file = f ? (f[1] || f[2]) : 'unknown';
                index = i ? i[1] : '0';
                key = k ? (k[1] || k[2]) : 'unknown';
            } else {
                file = getProp(attrStr, 'table') || 'site_settings';
                index = getProp(attrStr, 'id') || '0';
                key = getProp(attrStr, 'field') || 'titel';
            }

            let bindAttr = (file.includes('Key') || isNaN(index)) ? `{\`${file.toLowerCase()}.\${${index}}.\${${key}}\`}` : `"${file}.${index}.${key}"`;
            const classAttr = className ? `className="${className}" ` : '';

            if (type === 'Text') {
                return `<${tagName} ${classAttr}data-dock-type="text" data-dock-bind=${bindAttr}>${children}</${tagName}>`;
            } else if (type === 'Link') {
                const isBtn = attrStr.includes('as="button"') || className.includes('btn') || className.includes('button');
                const tag = isBtn ? 'button' : 'a';
                const hrefAttr = isBtn ? '' : `href={${url || '"#"'}} `;
                const onClick = isBtn ? `onClick={(e) => { if (e.shiftKey) return; const target = document.getElementById((${url} || "").replace("#", "")); if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); } }} ` : '';
                return `<${tag} ${hrefAttr}${classAttr}${onClick}data-dock-type="link" data-dock-bind=${bindAttr}>${children}</${tag}>`;
            }
            return match;
        });
        modified = true;
    }

    // 2. Herhaal de self-closing regex (van v6) voor de zekerheid
    const selfClosingRegex = /<Editable(Text|Link|Media)([\s\S]*?)\/>/g;
    if (selfClosingRegex.test(content)) {
        content = content.replace(selfClosingRegex, (match, type, attrStr) => {
            const className = getProp(attrStr, 'className') || '';
            const tagName = getProp(attrStr, 'tagName') || (type === 'Text' ? 'span' : (type === 'Media' ? 'img' : 'a'));
            const value = getProp(attrStr, 'value') || getProp(attrStr, 'label') || '';
            const src = getProp(attrStr, 'src') || '';
            const url = getProp(attrStr, 'url') || '';

            let file, index, key;
            const cmsBind = getProp(attrStr, 'cmsBind');
            if (cmsBind) {
                const f = cmsBind.match(/file:\s*(?:['"]([^'"]+)['"]|([^,}\s]+))/);
                const i = cmsBind.match(/index:\s*(\d+|[^,}\s]+)/);
                const k = cmsBind.match(/key:\s*(?:['"]([^'"]+)['"]|([^,}\s]+))/);
                file = f ? (f[1] || f[2]) : 'unknown';
                index = i ? i[1] : '0';
                key = k ? (k[1] || k[2]) : 'unknown';
            } else {
                file = getProp(attrStr, 'table') || 'site_settings';
                index = getProp(attrStr, 'id') || '0';
                key = getProp(attrStr, 'field') || 'titel';
            }

            let bindAttr = (file.includes('Key') || isNaN(index)) ? `{\`${file.toLowerCase()}.\${${index}}.\${${key}}\`}` : `"${file}.${index}.${key}"`;
            const classAttr = className ? `className="${className}" ` : '';

            if (type === 'Text') {
                return `<${tagName} ${classAttr}data-dock-type="text" data-dock-bind=${bindAttr}>{${value}}</${tagName}>`;
            } else if (type === 'Media') {
                return `<img src={${src}} ${classAttr}data-dock-type="media" data-dock-bind=${bindAttr} />`;
            } else if (type === 'Link') {
                const isBtn = attrStr.includes('as="button"') || className.includes('btn') || className.includes('button');
                const tag = isBtn ? 'button' : 'a';
                const hrefAttr = isBtn ? '' : `href={${url || '"#"'}} `;
                const onClick = isBtn ? `onClick={(e) => { if (e.shiftKey) return; const target = document.getElementById((${url} || "").replace("#", "")); if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); } }} ` : '';
                return `<${tag} ${hrefAttr}${classAttr}${onClick}data-dock-type="link" data-dock-bind=${bindAttr}>{${value}}</${tag}>`;
            }
            return match;
        });
        modified = true;
    }

    // 3. Remove old imports
    if (modified) {
        content = content.replace(/import\s+Editable(Text|Link|Media)\s+from\s+['"][^'"]+['"];?\n?/g, '');
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
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') walk(fullPath);
        } else if (file.endsWith('.jsx') && !file.includes('Editable')) {
            modernizeFile(fullPath);
        }
    });
}

console.log("🛠️ Starting v8.8 Component Modernization (v7 Total Annihilation)...");
TARGET_DIRS.forEach(dir => walk(dir));
console.log("✨ Modernization complete!");
