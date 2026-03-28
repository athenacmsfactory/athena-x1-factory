/**
 * 🚜 Athena 3.0 Vault Forklift (v4)
 * Moves sites between Factory (athena-y) and Vault (athena-vault-v8-1).
 * Handles (De)hydration and Symlink Materialization automatically.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const ROOT = path.resolve(__dirname, '../../..'); 
const FACTORY_SITES = path.join(ROOT, 'sites');
const VAULT_ROOT = path.join(ROOT, 'athena-vault-v8-1');
const VAULT_SITES = path.join(VAULT_ROOT, 'sites');

function dehydrate(sitePath) {
    console.log(`🌵 Dehydrating... (removing node_modules & dist)`);
    const targets = ['node_modules', 'dist', '.git'];
    targets.forEach(t => {
        const p = path.join(sitePath, t);
        if (fs.existsSync(p)) {
            execSync(`rm -rf "${p}"`);
            console.log(`  ✅ Removed ${t}`);
        }
    });
}

/**
 * Converts symlinks to real files.
 * MUST be run while the site is still in the Factory!
 */
function materialize(sitePath) {
    console.log(`💎 Materializing symlinks...`);
    try {
        const files = execSync(`find "${sitePath}" -type l`).toString().split('\n').filter(Boolean);
        
        files.forEach(linkPath => {
            try {
                // Determine absolute path of the target while still in factory
                const targetPath = fs.readlinkSync(linkPath);
                const absoluteTarget = path.resolve(path.dirname(linkPath), targetPath);
                
                if (fs.existsSync(absoluteTarget)) {
                    fs.unlinkSync(linkPath);
                    fs.copyFileSync(absoluteTarget, linkPath);
                    console.log(`  ✅ Materialized: ${path.relative(sitePath, linkPath)}`);
                } else {
                    console.warn(`  ⚠️ Target not found for ${linkPath}: ${absoluteTarget}`);
                }
            } catch (e) {
                console.warn(`  ⚠️ Failed to materialize ${linkPath}: ${e.message}`);
            }
        });
    } catch (e) {
        console.log("  ℹ️ No symlinks found to materialize.");
    }
}

function hydrate(sitePath) {
    console.log(`💧 Hydrating... (running pnpm install)`);
    try {
        execSync('pnpm install --no-frozen-lockfile', { cwd: sitePath, stdio: 'inherit' });
        console.log(`  ✅ Hydration complete.`);
    } catch (e) {
        console.error(`  ❌ Hydration failed: ${e.message}`);
    }
}

async function run() {
    const mode = process.argv[2]; 
    const siteName = process.argv[3];

    if (!mode || !siteName) {
        console.error("❌ Usage: node vault-forklift.js <--to-vault|--from-vault> <site-name>");
        process.exit(1);
    }

    if (mode === '--to-vault') {
        const source = path.join(FACTORY_SITES, siteName);
        const dest = path.join(VAULT_SITES, siteName);

        if (!fs.existsSync(source)) {
            console.error(`❌ Site '${siteName}' not found in Factory (${source}).`);
            process.exit(1);
        }

        console.log(`\n🚜 FORKLIFT: [FACTORY] -> [VAULT] ('${siteName}')`);
        
        // 1. Materialize FIRST (while paths to shared/ are valid)
        materialize(source);

        // 2. Dehydrate
        dehydrate(source);

        // 3. Ensure vault exists
        if (!fs.existsSync(VAULT_SITES)) fs.mkdirSync(VAULT_SITES, { recursive: true });
        
        // 4. Move the folder
        if (fs.existsSync(dest)) {
            console.log(`  ⚠️ Destination already exists in Vault. Overwriting...`);
            execSync(`rm -rf "${dest}"`);
        }
        execSync(`mv "${source}" "${dest}"`);
        
        // 5. Hardening: Freeze the site for production
        const configPath = path.join(dest, 'vite.config.js');
        if (fs.existsSync(configPath)) {
            let content = fs.readFileSync(configPath, 'utf8');
            const pluginRegex = /let athenaEditorPlugin = null;[\s\S]*?if\s*\(isDev\)\s*\{[\s\S]*?\}[\s\S]*?\}/;
            content = content.replace(pluginRegex, 'let athenaEditorPlugin = null; // [Athena 3.0 Vault Hardened]');
            const baseRegex = /base:\s*(process\.env\.NODE_ENV === 'production' \? '.*?' : '\/')|base:\s*'.*?'/;
            content = content.replace(baseRegex, `base: '/${siteName}/'`);
            fs.writeFileSync(configPath, content);
            console.log(`  🔒 Hardened vite.config.js`);
        }

        // 5b. Update index.html paths
        const indexPath = path.join(dest, 'index.html');
        if (fs.existsSync(indexPath)) {
            let content = fs.readFileSync(indexPath, 'utf8');
            // Vervang oude legacy paden door nieuwe athenified paden
            const sourceLegacy = siteName.replace('-ath', '');
            const pathRegex = new RegExp(`/${sourceLegacy}/`, 'g');
            content = content.replace(pathRegex, `/${siteName}/`);
            
            // Fix icon path as well
            content = content.replace(/href="\/vite\.svg"/g, `href="/${siteName}/vite.svg"`);
            
            fs.writeFileSync(indexPath, content);
            console.log(`  🔗 Updated index.html asset paths`);
        }
        
        // 6. Ledger update in Vault
        try {
            execSync(`git add . && git commit -m "🚜 Parked site: ${siteName}"`, { cwd: VAULT_ROOT });
            console.log(`  📝 Vault ledger updated.`);
        } catch (e) {}

        console.log(`\n🎉 Site '${siteName}' is now safely parked in the Vault.`);

    } else if (mode === '--from-vault') {
        const source = path.join(VAULT_SITES, siteName);
        const dest = path.join(FACTORY_SITES, siteName);

        if (!fs.existsSync(source)) {
            console.error(`❌ Site '${siteName}' not found in Vault.`);
            process.exit(1);
        }

        console.log(`\n🚜 FORKLIFT: [VAULT] -> [FACTORY] ('${siteName}')`);
        
        if (!fs.existsSync(FACTORY_SITES)) fs.mkdirSync(FACTORY_SITES, { recursive: true });
        
        execSync(`mv "${source}" "${dest}"`);
        
        // Hydrate in factory
        hydrate(dest);

        // Ledger update in Vault (removal)
        try {
            execSync(`git add . && git commit -m "🚜 Unparked site: ${siteName}"`, { cwd: VAULT_ROOT });
            console.log(`  📝 Vault ledger updated.`);
        } catch (e) {}

        console.log(`\n🎉 Site '${siteName}' is back in the Factory and ready for work.`);
    }
}

run();
