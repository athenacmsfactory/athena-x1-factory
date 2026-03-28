const fs = require('fs');
const path = require('path');

const sitesDir = './';
const sites = fs.readdirSync(sitesDir).filter(f => {
    try {
        return fs.statSync(path.join(sitesDir, f)).isDirectory() && fs.existsSync(path.join(sitesDir, f, 'src/App.jsx'));
    } catch(e) { return false; }
});

const ROBUST_GET_IMAGE_URL = `  const getImageUrl = (url) => {
    if (!url) return '';
    if (typeof url === 'object') url = url.text || url.url || '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = import.meta.env.BASE_URL || '/';
    if (url.startsWith(base) && base !== '/') return url;
    const isRootPublic = url.startsWith('./') || url.endsWith('.svg') || url.endsWith('.ico') || url === 'site-logo.svg' || url === 'athena-icon.svg';
    const hasImagesPrefix = url.includes('/images/') || url.startsWith('images/');
    const pathPrefix = (isRootPublic || hasImagesPrefix) ? '' : 'images/';
    return (base + pathPrefix + url.replace('./', '')).replace(new RegExp('/+', 'g'), '/');
  };`;

const ROBUST_EDITABLE_MEDIA = `import React from 'react';

export default function EditableMedia({ src, alt, className, cmsBind, ...props }) {
  const isDev = import.meta.env.DEV;

  let finalPath = src;
  if (typeof src === 'string' && src && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith('data:')) {
    const isRootPublic = src.startsWith('./') || src.endsWith('.svg') || src.endsWith('.ico') || src === 'site-logo.svg' || src === 'athena-icon.svg';
    const pathPrefix = isRootPublic ? '' : 'images/';
    finalPath = \`\${import.meta.env.BASE_URL}\${pathPrefix}\${src.replace('./', '')}\`.replace(/\\/+/g, '/');
  }
  const finalSrc = finalPath;

  const isVideo = src && (src.endsWith('.mp4') || src.endsWith('.webm'));

  const renderMedia = () => {
    if (isVideo) return <video src={finalSrc} className={className} autoPlay muted loop playsInline {...props} />;
    if (!src) return <div className={\`bg-slate-200 flex items-center justify-center text-slate-400 \${className}\`}>🖼️</div>;
    return <img src={finalSrc} alt={alt} className={className} {...props} />;
  };

  if (!isDev) return renderMedia();

  const dockBind = cmsBind ? JSON.stringify({
    file: cmsBind.file,
    index: cmsBind.index || 0,
    key: cmsBind.key
  }) : null;

  return (
    <div
      className={\`relative group \${className} cursor-pointer hover:ring-2 hover:ring-blue-400/40 rounded-sm transition-all duration-200\`}
      data-dock-bind={dockBind}
      data-dock-type="media"
    >
      {renderMedia()}
    </div>
  );
}`;

console.log(`🚀 Starting Factory-Wide Patch on ${sites.length} sites...`);

sites.forEach(site => {
    const sitePath = path.join(sitesDir, site);
    
    // 1. Patch App.jsx (The Gap)
    const appPath = path.join(sitePath, 'src/App.jsx');
    if (fs.existsSync(appPath)) {
        let content = fs.readFileSync(appPath, 'utf8');
        if (content.includes('80px')) {
            content = content.replace(/80px/g, '0px');
            fs.writeFileSync(appPath, content);
            console.log(`✅ [${site}] App.jsx: Fixed 80px gap.`);
        }
    }

    // 2. Patch Section.jsx (Images & Bindings)
    const sectionPath = path.join(sitePath, 'src/components/Section.jsx');
    if (fs.existsSync(sectionPath)) {
        let content = fs.readFileSync(sectionPath, 'utf8');
        let modified = false;

        // Injected getImageUrl if missing or update it
        if (!content.includes('getImageUrl')) {
            content = content.replace('const Section = ({ data }) => {', `const Section = ({ data }) => {\n${ROBUST_GET_IMAGE_URL}`);
            modified = true;
        } else {
            // Force update existing getImageUrl
            const startIdx = content.indexOf('const getImageUrl = (url) => {');
            if (startIdx !== -1) {
                const endIdx = content.indexOf('};', startIdx) + 2;
                content = content.slice(0, startIdx) + ROBUST_GET_IMAGE_URL + content.slice(endIdx);
                modified = true;
            }
        }

        // Wrap src={...} in getImageUrl() if not already, but skip if it already contains it
        content = content.replace(/src=\{\s*(?!getImageUrl)([^}]+)\s*\}/g, 'src={getImageUrl($1)}');
        
        // CLEAN AND REBUILD BINDINGS: Fixes nested ${} and un-interpolated property keys
        const varWhitelist = ['sectionName', 'index', 'idx', 'item', 'itemKey', 'imgKey', 'titleKey', 'textKey', 'linkKey', 'iconKey', 'categoryKey', 'tk', 'k', 'tag'];
        
        // Step 1: Unwrap EVERYTHING to start from a clean slate
        content = content.replace(/data-dock-bind=\{\s*([\`\"'])(.*?)\1\s*\}/g, (match, quote, inner) => {
            const cleanInner = inner.replace(/\$\{([^}]+)\}/g, '$1');
            
            // Step 2: Wrap only allowed variables using word boundaries
            const rebuiltInner = cleanInner.replace(/\b([a-zA-Z_]\w*)\b/g, (word) => {
                if (varWhitelist.includes(word)) return '${' + word + '}';
                return word;
            });
            
            modified = true;
            return `data-dock-bind={\`${rebuiltInner}\`}`;
        });

        if (modified || content.includes('getImageUrl')) {
            fs.writeFileSync(sectionPath, content);
            console.log(`✅ [${site}] Section.jsx: Fixed images & bindings.`);
        }
    }

    // 3. Patch EditableMedia.jsx
    const mediaPath = path.join(sitePath, 'src/components/EditableMedia.jsx');
    if (fs.existsSync(mediaPath)) {
        fs.writeFileSync(mediaPath, ROBUST_EDITABLE_MEDIA);
        console.log(`✅ [${site}] EditableMedia.jsx: Upgraded to v8.1.`);
    }
});

console.log('✨ Factory-Wide Patch Complete!');
