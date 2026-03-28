const fs = require('fs');
const path = require('path');

const sitesDir = './';
const sites = fs.readdirSync(sitesDir).filter(f => {
    try {
        return fs.statSync(path.join(sitesDir, f)).isDirectory() && fs.existsSync(path.join(sitesDir, f, 'src/App.jsx'));
    } catch(e) { return false; }
});

const results = [];

sites.forEach(site => {
    const sitePath = path.join(sitesDir, site);
    const appPath = path.join(sitePath, 'src/App.jsx');
    const sectionPath = path.join(sitePath, 'src/components/Section.jsx');
    const mediaPath = path.join(sitePath, 'src/components/EditableMedia.jsx');

    const result = { site, hasGap: false, imageStatus: 'unknown', structure: 'unknown' };

    if (fs.existsSync(appPath)) {
        const appContent = fs.readFileSync(appPath, 'utf8');
        if (appContent.includes('80px')) result.hasGap = true;
        if (appContent.includes('content-top-offset')) result.structure = 'v8.8+ Modular';
    }

    if (fs.existsSync(sectionPath)) {
        const sectionContent = fs.readFileSync(sectionPath, 'utf8');
        if (sectionContent.includes('getImageUrl')) {
            if (sectionContent.includes('BASE_URL') && sectionContent.includes('/images/')) {
                result.imageStatus = 'standard-v8.1';
            } else {
                result.imageStatus = 'legacy-manual';
            }
        }
    }

    if (fs.existsSync(mediaPath)) {
        const mediaContent = fs.readFileSync(mediaPath, 'utf8');
        if (mediaContent.includes('BASE_URL') && mediaContent.includes('pathPrefix')) {
            result.imageStatus = 'media-component-v8.1';
        } else {
            result.imageStatus = 'media-component-legacy';
        }
    }

    results.push(result);
});

console.log(JSON.stringify(results, null, 2));
