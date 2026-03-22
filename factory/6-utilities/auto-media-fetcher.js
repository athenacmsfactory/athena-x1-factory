import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

async function autoHealImages() {
    const reportPath = path.join(ROOT, 'output/SITES_IMAGE_AUDIT.md');
    if (!fs.existsSync(reportPath)) {
        console.error("❌ No audit report found at output/SITES_IMAGE_AUDIT.md. Run bulk-image-audit.js first.");
        return;
    }

    const reportContent = fs.readFileSync(reportPath, 'utf8');
    const lines = reportContent.split('\n');
    
    const siteRows = lines.filter(l => l.startsWith('| ❌') || l.startsWith('| ⚠️'))
        .map(row => {
            const parts = row.split('|').map(p => p.trim());
            return {
                siteName: parts[2],
                brokenCount: parseInt(parts[3], 10)
            };
        })
        .sort((a, b) => a.brokenCount - b.brokenCount);

    console.log(`🚀 Starting Auto-Heal for ${siteRows.length} sites (Reliable Placeholder Strategy)...\n`);

    for (const { siteName } of siteRows) {
        const sitePath = path.join(ROOT, 'sites', siteName);
        const dataDirs = [path.join(sitePath, 'src/data'), path.join(sitePath, 'public/data')];
        const imgDir = fs.existsSync(path.join(sitePath, 'public/images')) 
            ? path.join(sitePath, 'public/images') 
            : path.join(sitePath, 'public');

        if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

        console.log(`\n📂 Healing ${siteName}...`);

        const brokenImages = new Map();

        // 1. Scan for broken links and context
        for (const dataDir of dataDirs) {
            if (!fs.existsSync(dataDir)) continue;
            const scanDir = (dir) => {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) scanDir(fullPath);
                    else if (entry.name.endsWith('.json')) {
                        try {
                            const content = fs.readFileSync(fullPath, 'utf8');
                            // Use same greedy regex as audit script
                            const matches = content.match(/[a-zA-Z0-9\-_./%]+\.(jpg|jpeg|png|gif|svg|webp)/gi);
                            if (matches) {
                                matches.forEach(val => {
                                    let imgFile = val;
                                    // Sanitize URL filenames early
                                    if (imgFile.includes('://')) {
                                        try { imgFile = path.basename(new URL(imgFile).pathname); } catch(e) {}
                                    } else if (imgFile.includes('/')) {
                                        // Keep internal relative paths if they exist
                                    }
                                    
                                    if (!fs.existsSync(path.join(imgDir, imgFile))) {
                                        let keyword = path.basename(imgFile).split('.')[0].replace(/[-_]/g, ' ');
                                        brokenImages.set(imgFile, keyword);
                                    }
                                });
                            }
                        } catch (e) {}
                    }
                }
            };
            scanDir(dataDir);
        }

        console.log(`   Found ${brokenImages.size} missing images.`);

        // 2. Download placeholders
        for (const [fileName, keyword] of brokenImages) {
            const targetPath = path.join(imgDir, fileName);
            if (fs.existsSync(targetPath)) continue;

            const cleanKeyword = keyword.substring(0, 50).replace(/[^a-zA-Z0-9]/g, ',');
            
            // Randomly pick between loremflickr and picsum
            const usePicsum = Math.random() > 0.5;
            const downloadUrl = usePicsum 
                ? `https://picsum.photos/1200/800?random=${Math.floor(Math.random() * 1000)}` 
                : `https://loremflickr.com/1200/800/${cleanKeyword}`;

            console.log(`   📥 Placeholder for: ${fileName} (${usePicsum ? 'Picsum' : 'Flickr'}: "${keyword}")`);
            
            try {
                const res = await fetch(downloadUrl);
                if (res.ok) {
                    const buffer = Buffer.from(await res.arrayBuffer());
                    // Ensure subdirectory exists
                    const parentDir = path.dirname(targetPath);
                    if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
                    
                    fs.writeFileSync(targetPath, buffer);
                    console.log(`      ✅ Saved.`);
                } else {
                    throw new Error(`HTTP ${res.status}`);
                }
                // Small delay to be nice, but less than pollinations
                await new Promise(r => setTimeout(r, 500));
            } catch (e) {
                console.error(`      ❌ Failed ${fileName}: ${e.message}`);
                // Ultimate fallback: simple SVG or tiny placeholder
                if (fileName.includes('logo') || fileName.includes('icon')) {
                    const svg = `<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#3B82F6"/><text x="50%" y="50%" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">${fileName.substring(0,15)}</text></svg>`;
                    fs.writeFileSync(targetPath, svg);
                    console.log(`      🎨 Created SVG fallback.`);
                }
            }
        }
    }

    console.log("\n✨ All sites healed with placeholders!");
}

autoHealImages().catch(console.error);
