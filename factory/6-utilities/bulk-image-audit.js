import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const SITES_DIR = path.join(ROOT, 'sites');

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|svg|webp)$/i;

async function auditAllSites() {
    const sites = fs.readdirSync(SITES_DIR).filter(f => 
        fs.statSync(path.join(SITES_DIR, f)).isDirectory() && !f.startsWith('.') && f !== 'node_modules'
    );

    console.log(`🔍 Starting Bulk Image Audit for ${sites.length} sites...\n`);

    const globalReport = [];

    for (const site of sites) {
        const sitePath = path.join(SITES_DIR, site);
        const report = {
            site,
            brokenLinks: [],
            totalImages: 0,
            status: '✅'
        };

        // Determine data and public directories
        const dataDirs = [
            path.join(sitePath, 'src/data'),
            path.join(sitePath, 'public/data')
        ];

        const publicDirs = [
            path.join(sitePath, 'public/images'),
            path.join(sitePath, 'public')
        ];

        const usedImages = new Set();

        // 1. Scan JSON files for image references
        for (const dataDir of dataDirs) {
            if (!fs.existsSync(dataDir)) continue;

            // Recursive scan for JSON files
            const scanDir = (dir) => {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        scanDir(fullPath);
                    } else if (entry.name.endsWith('.json')) {
                        try {
                            const content = fs.readFileSync(fullPath, 'utf8');
                            // Look for strings ending in image extensions
                            const matches = content.match(/[a-zA-Z0-9\-_.]+\.(jpg|jpeg|png|gif|svg|webp)/gi);
                            if (matches) {
                                matches.forEach(img => usedImages.add(img.toLowerCase()));
                            }
                        } catch (e) {
                            console.warn(`      ⚠️ Could not read ${entry.name} in ${site}`);
                        }
                    }
                }
            };
            scanDir(dataDir);
        }

        report.totalImages = usedImages.size;

        // 2. Scan physical files across all public directories
        const physicalFiles = new Set();
        for (const pubDir of publicDirs) {
            if (!fs.existsSync(pubDir)) continue;
            
            const scanPub = (dir) => {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory() && entry.name !== 'data' && entry.name !== 'node_modules') {
                        scanPub(fullPath);
                    } else if (IMAGE_EXTENSIONS.test(entry.name)) {
                        physicalFiles.add(entry.name.toLowerCase());
                    }
                }
            };
            scanPub(pubDir);
        }

        // 3. Compare
        report.brokenLinks = Array.from(usedImages).filter(f => !physicalFiles.has(f));
        
        if (report.brokenLinks.length > 0) {
            report.status = '❌';
            console.log(`❌ ${site.padEnd(40)} | Broken: ${report.brokenLinks.length} / Total: ${report.totalImages}`);
        } else {
            console.log(`✅ ${site.padEnd(40)} | Total: ${report.totalImages} images OK`);
        }

        globalReport.push(report);
    }

    // Generate Markdown Report
    const timestamp = new Date().toLocaleString();
    let md = `# Athena Global Image Audit Report\n\nGenerated: ${timestamp}\n\n`;
    md += `| Status | Site | Broken | Total | Missing Files |\n`;
    md += `| :---: | :--- | :---: | :---: | :--- |\n`;

    globalReport.sort((a, b) => b.brokenLinks.length - a.brokenLinks.length).forEach(r => {
        md += `| ${r.status} | ${r.site} | ${r.brokenLinks.length} | ${r.totalImages} | ${r.brokenLinks.slice(0, 5).join(', ')}${r.brokenLinks.length > 5 ? '...' : ''} |\n`;
    });

    const reportPath = path.join(ROOT, 'output/SITES_IMAGE_AUDIT.md');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, md);

    console.log(`\n✅ Audit complete. Detailed report saved to: output/SITES_IMAGE_AUDIT.md`);
}

auditAllSites().catch(console.error);
