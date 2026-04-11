/**
 * storage-audit-deep.js
 * @description Provides a detailed breakdown of disk usage per site, including node_modules, dist, and .git.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../..');

const SITES_DIR = path.join(root, 'athena/sites');
const VAULT_DIR = path.join(root, 'vault');

function getDirSize(p) {
    if (!fs.existsSync(p)) return 0;
    try {
        const out = execSync(`du -sm "${p}"`).toString();
        return parseInt(out.split('\t')[0]);
    } catch (e) { return 0; }
}

async function audit() {
    const results = [];
    const dirs = [
        { path: SITES_DIR, label: 'WORKSHOP' },
        { path: VAULT_DIR, label: 'VAULT' }
    ];

    console.log(`🔍 Deep Storage Audit gestart op ${new Date().toLocaleString()}...\n`);

    for (const d of dirs) {
        if (!fs.existsSync(d.path)) continue;
        
        const sites = fs.readdirSync(d.path).filter(f => 
            fs.statSync(path.join(d.path, f)).isDirectory() && !f.startsWith('.')
        );

        for (const site of sites) {
            const sp = path.join(d.path, site);
            const total = getDirSize(sp);
            const nodeModules = getDirSize(path.join(sp, 'node_modules'));
            const git = getDirSize(path.join(sp, '.git'));
            const dist = getDirSize(path.join(sp, 'dist'));
            const build = getDirSize(path.join(sp, 'build'));
            const temp = getDirSize(path.join(sp, 'src/data-temp'));

            results.push({
                site,
                location: d.label,
                totalMB: total,
                breakdown: {
                    node_modules: nodeModules,
                    git: git,
                    dist: dist + build,
                    temp: temp,
                    src: total - (nodeModules + git + dist + build + temp)
                }
            });
        }
    }

    // Sort by total size
    results.sort((a, b) => b.totalMB - a.totalMB);

    console.table(results.map(r => ({
        Site: `${r.site} (${r.location})`,
        "Totaal (MB)": r.totalMB,
        "NodeModules": r.breakdown.node_modules,
        "Git": r.breakdown.git,
        "Build/Dist": r.breakdown.dist,
        "Temp": r.breakdown.temp
    })));

    const grandTotal = results.reduce((sum, r) => sum + r.totalMB, 0);
    console.log(`\n📊 Totale ruimte in beheer door Athena: ${grandTotal} MB`);

    return { 
        success: true, 
        results,
        grandTotalMB: grandTotal
    };
}

audit().catch(console.error);
